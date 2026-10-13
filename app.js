let tasks = [];
let courses = [];

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

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.textContent = task.text;
    taskList.append(li);
  });
}

async function loadTasks() {
  tasks = await api("/api/tugas");
  render();
}

loadTasks().catch(error => {
  statusBox.textContent = error.message;
});