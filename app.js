(() => {
  const storageKey = "todo-items";
  const listEl = document.getElementById("todo-list");
  const formEl = document.getElementById("todo-form");
  const inputEl = document.getElementById("todo-input");
  const counterEl = document.getElementById("todo-counter");
  const filterButtons = Array.from(
    document.querySelectorAll("[data-filter]")
  );
  const clearBtn = document.getElementById("clear-completed");

  let todos = loadTodos();
  let filter = "all";

  render();

  formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = inputEl.value.trim();
    if (!text) {
      return;
    }

    todos = [
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: Date.now(),
      },
      ...todos,
    ];

    saveTodos();
    inputEl.value = "";
    render();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      filter = button.dataset.filter;
      render();
    });
  });

  clearBtn.addEventListener("click", () => {
    const hasCompleted = todos.some((todo) => todo.completed);
    if (!hasCompleted) {
      return;
    }
    todos = todos.filter((todo) => !todo.completed);
    saveTodos();
    render();
  });

  function render() {
    listEl.innerHTML = "";
    const filtered = getFilteredTodos();

    if (filtered.length === 0) {
      const emptyEl = document.createElement("li");
      emptyEl.className = "todo-item empty";
      emptyEl.textContent = "暂时没有待办事项，快去添加吧！";
      listEl.appendChild(emptyEl);
    } else {
      filtered.forEach((todo) => {
        listEl.appendChild(createTodoItem(todo));
      });
    }

    const activeCount = todos.filter((todo) => !todo.completed).length;
    const total = todos.length;
    counterEl.textContent =
      total === 0 ? "0 项" : `${activeCount} / ${total} 未完成`;
    clearBtn.disabled = todos.every((todo) => !todo.completed);
  }

  function createTodoItem(todo) {
    const li = document.createElement("li");
    li.className = `todo-item${todo.completed ? " completed" : ""}`;
    li.dataset.id = todo.id;

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "todo-toggle";
    toggleBtn.type = "button";
    toggleBtn.innerHTML = "<span></span>";
    toggleBtn.addEventListener("click", () => toggleTodo(todo.id));

    const textEl = document.createElement("div");
    textEl.className = "todo-text";
    textEl.textContent = todo.text;

    const actionsEl = document.createElement("div");
    actionsEl.className = "todo-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn";
    editBtn.textContent = "编辑";
    editBtn.addEventListener("click", () => editTodo(todo.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn danger";
    deleteBtn.textContent = "删除";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    actionsEl.append(editBtn, deleteBtn);
    li.append(toggleBtn, textEl, actionsEl);

    return li;
  }

  function toggleTodo(id) {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    render();
  }

  function editTodo(id) {
    const todo = todos.find((item) => item.id === id);
    if (!todo) {
      return;
    }
    const newText = prompt("修改待办内容：", todo.text);
    if (typeof newText !== "string") {
      return;
    }
    const trimmed = newText.trim();
    if (!trimmed || trimmed === todo.text) {
      return;
    }
    todos = todos.map((item) =>
      item.id === id ? { ...item, text: trimmed } : item
    );
    saveTodos();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
    saveTodos();
    render();
  }

  function getFilteredTodos() {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }

  function saveTodos() {
    localStorage.setItem(storageKey, JSON.stringify(todos));
  }

  function loadTodos() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .filter(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.text === "string" &&
            typeof item.completed === "boolean"
        )
        .map((item) => ({
          id: item.id,
          text: item.text,
          completed: item.completed,
          createdAt: item.createdAt || Date.now(),
        }))
        .sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  }
})();
