
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const counter = document.querySelector("#counter");
const clearDoneBtn = document.querySelector("#clear-done");
const filterButtons = document.querySelectorAll(".filter-btn");


let tasks = [];
let currentFilter = "all"; // "all" | "todo" | "done"


function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
     try {
    const stored = localStorage.getItem("tasks");
    tasks = stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("Erro ao carregar tarefas:", err);
    tasks = [];
  }
}

function generateId() {
  return Date.now(); 
}

function getFilteredTasks() {
  if (currentFilter === "todo") return tasks.filter((t) => !t.done);
  if (currentFilter === "done") return tasks.filter((t) => t.done);
  return tasks;
}

function updateCounter() {
  const pending = tasks.filter((t) => !t.done).length;
  counter.innerText = `${pending} pendente${pending === 1 ? "" : "s"}`;
}


function createTaskElement(task) {

    const li = document.createElement("li");
  li.className = "task";
  li.dataset.id = task.id;

  if (task.done) li.classList.add("done");

  // Texto
  const span = document.createElement("span");
  span.className = "task-text";
  span.innerText = task.text;

  // Ações
  const actions = document.createElement("div");
  actions.className = "actions";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "action-btn";
  toggleBtn.dataset.action = "toggle";
  toggleBtn.type = "button";
  toggleBtn.innerText = task.done ? "↩" : "✓";

  const editBtn = document.createElement("button");
  editBtn.className = "action-btn";
  editBtn.dataset.action = "edit";
  editBtn.type = "button";
  editBtn.innerText = "✎";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "action-btn";
  deleteBtn.dataset.action = "delete";
  deleteBtn.type = "button";
  deleteBtn.innerText = "🗑";

  actions.append(toggleBtn, editBtn, deleteBtn);
  li.append(span, actions);

  return li;

}

function renderTasks() {

  list.innerHTML = "";

  const filtered = getFilteredTasks();

  filtered.forEach((task) => {
    const li = createTaskElement(task);
    list.appendChild(li);
  });

  updateCounter();
}

function addTask(text) {
   const value = (text ?? "").trim();
  if (!value) return false;

  const newTask = {
    id: generateId(),
    text: value,
    done: false,
  };

  tasks.unshift(newTask);

  saveTasks();
  renderTasks();

  return true;
}
function startEditingTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const li = list.querySelector(`.task[data-id="${id}"]`);
  if (!li) return;

  
  if (li.classList.contains("editing")) return;

  li.classList.add("editing");

  const span = li.querySelector(".task-text");


  const inputEdit = document.createElement("input");
  inputEdit.type = "text";
  inputEdit.className = "task-edit";
  inputEdit.value = task.text;

  
  li.replaceChild(inputEdit, span);

 
  inputEdit.focus();
  inputEdit.setSelectionRange(inputEdit.value.length, inputEdit.value.length);

  function finish(save) {
    const newValue = (inputEdit.value ?? "").trim();

    
    if (!save) {
      renderTasks();
      return;
    }

   
    if (!newValue) {
      renderTasks();
      return;
    }

  
    task.text = newValue;
    saveTasks();
    renderTasks();
  }

 
  inputEdit.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });

  inputEdit.addEventListener("blur", () => {
    finish(true);
  });
}


function toggleTask(id) {
 const task = tasks.find((t) => t.id === id);
  if (!task) return;

  task.done = !task.done;

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);

  saveTasks();
  renderTasks();
}

function editTask(id) {
    startEditingTask(id);
}

function clearDoneTasks() {
    tasks = tasks.filter((t) => !t.done);

  saveTasks();
  renderTasks();
}


function setFilter(filterValue) {
  currentFilter = filterValue;

  filterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filterValue);
  });

  renderTasks();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = input.value.trim();
  addTask(text);

  input.value = "";
  input.focus();
});

list.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const li = btn.closest(".task");
  if (!li) return;

  const id = Number(li.dataset.id);

  if (action === "toggle") toggleTask(id);
  if (action === "edit") editTask(id);
  if (action === "delete") deleteTask(id);
});

list.addEventListener("dblclick", (e) => {
  const span = e.target.closest(".task-text");
  if (!span) return;

  const li = span.closest(".task");
  if (!li) return;

  const id = Number(li.dataset.id);
  startEditingTask(id);
});


filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setFilter(btn.dataset.filter);
  });
});

clearDoneBtn.addEventListener("click", () => {
  clearDoneTasks();
});

function init() {
  loadTasks();
  renderTasks();
}

init();
