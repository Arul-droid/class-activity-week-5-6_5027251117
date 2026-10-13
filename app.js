let tasks = [];
let courses = [];
let currentFilter = "all";
let loading = false;
let submitting = false;
const pendingIds = new Set();
const actionError = document.getElementById("actionError");
const taskForm = document.getElementById("taskForm");
let loadError = "";

const taskList = document.getElementById("task");
const statusBox = document.getElementById("status");

async function api(path, options = {}) {
  const res = await fetch(path, options);

  if (!res.ok) {
    throw new Error(`Request gagal (${res.status}).`);
  }

  return res.status === 204 ? null : res.json();
}

function render() {
    taskForm.querySelectorAll("input, select, button").forEach(control => {
    control.disabled = loading || submitting;});
    taskList.replaceChildren();
    taskList.setAttribute("aria-busy", String(loading));

    document.getElementById("reloadButton").disabled = loading;

    document.querySelectorAll("[data-filter]").forEach(button => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.filter === currentFilter)
    );
  });

  document.getElementById("activeCount").textContent =
    `${tasks.filter(task => !task.completed).length} tugas aktif`;

  statusBox.replaceChildren();

  if (loading) {
    statusBox.textContent = "Memuat tugas dari server…";
    return;
  }

  if (loadError) {
    statusBox.textContent = loadError + " ";

    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = "Coba lagi";
    retry.addEventListener("click", loadTasks);

    statusBox.append(retry);
    return;
  }

  const visible = tasks.filter(task =>
    currentFilter === "all" ||
    (currentFilter === "active" ? !task.completed : task.completed)
  );

  if (!visible.length) {
    statusBox.textContent = tasks.length
      ? "Tidak ada tugas pada filter ini."
      : "Belum ada tugas. Tambahkan tugas pertama kamu.";
  }

  visible.forEach(task => {
    const li = document.createElement("li");

    li.className = task.completed
      ? "task-row completed"
      : "task-row";

    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.text;

    const detail = document.createElement("small");
    const course = courses.find(course => course.id === task.course);

    detail.textContent =
      `${course ? course.name : task.course} · deadline ` +
      `${task.dueDate || "belum ditentukan"}`;

    content.append(title, detail);
    
const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.className = "completeCheckbox";
checkbox.dataset.id = task.id;
checkbox.checked = task.completed;
checkbox.disabled = pendingIds.has(task.id);
checkbox.setAttribute("aria-label", `Tandai selesai: ${task.text}`);

const remove = document.createElement("button");
remove.type = "button";
remove.className = "deleteButton";
remove.dataset.id = task.id;
remove.textContent = "Hapus";
remove.disabled = pendingIds.has(task.id);
remove.setAttribute("aria-label", `Hapus: ${task.text}`);

li.append(checkbox, content, remove);
    taskList.append(li);
  });
}

taskForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (submitting || loading || loadError) return;

  submitting = true;
  actionError.textContent = "";
  render();

  try {
    const task = await api("/api/tugas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: document.getElementById("taskInput").value.trim(),
        course: document.getElementById("courseInput").value,
        dueDate: document.getElementById("dueDateInput").value
      })
    });

    tasks.push(task);
    taskForm.reset();
  } catch (error) {
    actionError.textContent = error.message;
  } finally {
    submitting = false;
    render();
    document.getElementById("taskInput").focus();
  }
});

async function loadTasks() {
  if (loading) return;

  loading = true;
  loadError = "";
  render();

  try {
    tasks = await api("/api/tugas");
    courses = await api("/api/matakuliah");

    const select = document.getElementById("courseInput");
    select.replaceChildren(new Option("Pilih mata kuliah", ""));

    courses.forEach(course => {
    select.add(new Option(course.name, course.id));});
  } catch (error) {
    loadError = error.message;
  } finally {
    loading = false;
    render();
  }
}

document.querySelector(".filters").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  currentFilter = button.dataset.filter;
  render();
});

document.getElementById("reloadButton")
  .addEventListener("click", loadTasks);

document.getElementById("networkMode")
  .addEventListener("change", event => {
    window.__API.setMode(event.target.value);
  });

loadTasks();

loadTasks().catch(error => {
  statusBox.textContent = error.message;
});

// Dua listener pada induk list: tetap bekerja untuk task baru.
async function mutateTask(id, method, completed) {
  if (loading || pendingIds.has(id)) return;

  pendingIds.add(id);
  actionError.textContent = "";
  render();

  try {
    const updated = await api(
      `/api/tugas/${encodeURIComponent(id)}`,
      {
        method,
        ...(method === "PATCH"
          ? {
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ completed })
            }
          : {})
      }
    );

    if (method === "DELETE") {
      tasks = tasks.filter(task => task.id !== id);
    } else {
      tasks = tasks.map(task => task.id === id ? updated : task);
    }
  } catch (error) {
    actionError.textContent = error.message;
  } finally {
    pendingIds.delete(id);
    render();
  }
}

taskList.addEventListener("click", event => {
  const button = event.target.closest(".deleteButton");

  if (button) {
    void mutateTask(button.dataset.id, "DELETE");
  }
});

taskList.addEventListener("change", event => {
  if (event.target.matches(".completeCheckbox")) {
    void mutateTask(
      event.target.dataset.id,
      "PATCH",
      event.target.checked
    );
  }
});