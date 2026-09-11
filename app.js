const defaultLessons = [
  {
    time: "8:00–9:00 AM",
    className: "Form 4 Amanah",
    topic: "Islamic Studies: Akhlak"
  },
  {
    time: "10:00–11:00 AM",
    className: "Form 2 Bestari",
    topic: "Sirah: Lessons from Hijrah"
  },
  {
    time: "12:00–1:00 PM",
    className: "Form 5 Cemerlang",
    topic: "Revision: Ibadah and Fiqh"
  }
];

let lessons = JSON.parse(localStorage.getItem("educationHubLessons")) || defaultLessons;
let tasks = JSON.parse(localStorage.getItem("educationHubTasks")) || [];
let deferredPrompt = null;

const timetableList = document.getElementById("timetableList");
const taskList = document.getElementById("taskList");
const lessonCount = document.getElementById("lessonCount");
const completedCount = document.getElementById("completedCount");
const notesArea = document.getElementById("notesArea");
const saveStatus = document.getElementById("saveStatus");
const installButton = document.getElementById("installButton");
const lessonModal = document.getElementById("lessonModal");

function saveLessons() {
  localStorage.setItem("educationHubLessons", JSON.stringify(lessons));
}

function saveTasks() {
  localStorage.setItem("educationHubTasks", JSON.stringify(tasks));
}

function updateDate() {
  const date = new Date();
  document.getElementById("todayDate").textContent = date.toLocaleDateString(
    "en-MY",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );
}

function renderLessons() {
  timetableList.innerHTML = "";

  if (lessons.length === 0) {
    timetableList.innerHTML = `
      <p class="resource-text">
        No lessons have been added yet. Select “Add lesson” to create one.
      </p>
    `;
  }

  lessons.forEach((lesson, index) => {
    const lessonElement = document.createElement("div");
    lessonElement.className = "lesson-item";

    lessonElement.innerHTML = `
      <span class="lesson-time">${lesson.time}</span>
      <div class="lesson-details">
        <strong>${lesson.className}</strong>
        <span>${lesson.topic}</span>
      </div>
      <button class="delete-button" aria-label="Delete lesson" data-index="${index}">
        ×
      </button>
    `;

    timetableList.appendChild(lessonElement);
  });

  lessonCount.textContent = lessons.length;

  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      lessons.splice(index, 1);
      saveLessons();
      renderLessons();
    });
  });
}

function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = `
      <p class="resource-text">
        Your task list is clear. Add a task to begin planning.
      </p>
    `;
  }

  tasks.forEach((task, index) => {
    const taskElement = document.createElement("div");
    taskElement.className = "task-item";

    taskElement.innerHTML = `
      <div class="task-main">
        <input
          type="checkbox"
          data-index="${index}"
          ${task.completed ? "checked" : ""}
          aria-label="Mark task complete"
        >
        <span class="${task.completed ? "completed" : ""}">${task.text}</span>
      </div>
      <button class="delete-button" aria-label="Delete task" data-index="${index}">
        ×
      </button>
    `;

    taskList.appendChild(taskElement);
  });

  const completed = tasks.filter((task) => task.completed).length;
  completedCount.textContent = `${completed} / ${tasks.length}`;

  document.querySelectorAll('.task-main input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const index = Number(checkbox.dataset.index);
      tasks[index].completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });
  });

  document.querySelectorAll(".task-item .delete-button").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });
  });
}

document.getElementById("taskForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const taskInput = document.getElementById("taskInput");
  const taskText = taskInput.value.trim();

  if (!taskText) return;

  tasks.unshift({
    text: taskText,
    completed: false
  });

  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
});

document.getElementById("addLessonButton").addEventListener("click", () => {
  lessonModal.classList.remove("hidden");
  document.getElementById("lessonTime").focus();
});

document.getElementById("closeModalButton").addEventListener("click", () => {
  lessonModal.classList.add("hidden");
});

lessonModal.addEventListener("click", (event) => {
  if (event.target === lessonModal) {
    lessonModal.classList.add("hidden");
  }
});

document.getElementById("lessonForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const time = document.getElementById("lessonTime").value.trim();
  const className = document.getElementById("lessonClass").value.trim();
  const topic = document.getElementById("lessonTopic").value.trim();

  lessons.push({ time, className, topic });
  saveLessons();
  renderLessons();

  event.target.reset();
  lessonModal.classList.add("hidden");
});

notesArea.value = localStorage.getItem("educationHubNotes") || "";

notesArea.addEventListener("input", () => {
  saveStatus.textContent = "Saving...";

  localStorage.setItem("educationHubNotes", notesArea.value);

  window.clearTimeout(window.notesTimer);
  window.notesTimer = window.setTimeout(() => {
    saveStatus.textContent = "Saved";
  }, 500);
});

document.getElementById("calculateButton").addEventListener("click", () => {
  const score = Number(document.getElementById("scoreInput").value);
  const total = Number(document.getElementById("totalInput").value);
  const resultBox = document.getElementById("resultBox");

  if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0 || score < 0) {
    resultBox.textContent = "Please enter a valid score and total marks.";
    return;
  }

  if (score > total) {
    resultBox.textContent = "The score cannot be greater than the total marks.";
    return;
  }

  const percentage = (score / total) * 100;
  let grade = "F";

  if (percentage >= 80) grade = "A";
  else if (percentage >= 70) grade = "B";
  else if (percentage >= 60) grade = "C";
  else if (percentage >= 50) grade = "D";
  else if (percentage >= 40) grade = "E";

  resultBox.innerHTML = `
    Score: ${score} / ${total}<br>
    Percentage: ${percentage.toFixed(1)}%<br>
    Grade: ${grade}
  `;
});

document.getElementById("themeButton").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("educationHubTheme", theme);
});

if (localStorage.getItem("educationHubTheme") === "dark") {
  document.body.classList.add("dark-mode");
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installButton.classList.remove("hidden");
});

installButton.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;

  deferredPrompt = null;
  installButton.classList.add("hidden");
});

window.addEventListener("appinstalled", () => {
  installButton.classList.add("hidden");
  deferredPrompt = null;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

updateDate();
renderLessons();
renderTasks();