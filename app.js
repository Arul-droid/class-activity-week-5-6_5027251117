let tasks = [];
let courses = [];
let currentFilter = "all";
let loading = false;
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
    li.append(content);
    taskList.append(li);
  });
}

async function loadTasks() {
  if (loading) return;

  loading = true;
  loadError = "";
  render();

  try {
    tasks = await api("/api/tugas");
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