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

const defaultQuickLinks = [
  {
    id: "drive",
    name: "Google Drive",
    url: "https://drive.google.com/",
    icon: "📁"
  },
  {
    id: "forms",
    name: "Google Forms",
    url: "https://forms.google.com/",
    icon: "📝"
  },
  {
    id: "canva",
    name: "Canva",
    url: "https://www.canva.com/",
    icon: "🎨"
  },
  {
    id: "github",
    name: "GitHub",
    url: "https://github.com/",
    icon: "💻"
  }
];

let quickLinks =
  JSON.parse(localStorage.getItem("educationHubQuickLinks")) ||
  defaultQuickLinks;

let editingLinkId = null;

const timetableList = document.getElementById("timetableList");
const taskList = document.getElementById("taskList");
const lessonCount = document.getElementById("lessonCount");
const completedCount = document.getElementById("completedCount");
const notesArea = document.getElementById("notesArea");
const saveStatus = document.getElementById("saveStatus");
const installButton = document.getElementById("installButton");
const lessonModal = document.getElementById("lessonModal");
const quickLinksList = document.getElementById("quickLinksList");
const linkModal = document.getElementById("linkModal");
const linkForm = document.getElementById("linkForm");
const linkModalTitle = document.getElementById("linkModalTitle");
const linkNameInput = document.getElementById("linkName");
const linkUrlInput = document.getElementById("linkUrl");
const linkIconInput = document.getElementById("linkIcon");

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

function saveQuickLinks() {
  localStorage.setItem(
    "educationHubQuickLinks",
    JSON.stringify(quickLinks)
  );
}

function createLinkId() {
  return `link-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normaliseUrl(url) {
  const cleanUrl = url.trim();

  if (
    cleanUrl.startsWith("https://") ||
    cleanUrl.startsWith("http://")
  ) {
    return cleanUrl;
  }

  return `https://${cleanUrl}`;
}

function getShortUrl(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function renderQuickLinks() {
  quickLinksList.innerHTML = "";

  if (quickLinks.length === 0) {
    quickLinksList.innerHTML = `
      <p class="resource-text">
        No shortcuts saved yet. Select “Add link” to create your first one.
      </p>
    `;
    return;
  }

  quickLinks.forEach((link) => {
    const linkCard = document.createElement("div");
    linkCard.className = "quick-link-card";

    linkCard.innerHTML = `
      <a
        class="quick-link-main"
        href="${link.url}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="quick-link-icon">${link.icon || "🔗"}</span>

        <span class="quick-link-text">
          <strong>${link.name}</strong>
          <span>${getShortUrl(link.url)}</span>
        </span>
      </a>

      <div class="quick-link-actions">
        <button
          class="link-action-button edit-link-button"
          type="button"
          aria-label="Edit ${link.name}"
          data-link-id="${link.id}"
        >
          ✏
        </button>

        <button
          class="link-action-button link-delete-button delete-link-button"
          type="button"
          aria-label="Delete ${link.name}"
          data-link-id="${link.id}"
        >
          ×
        </button>
      </div>
    `;

    quickLinksList.appendChild(linkCard);
  });

  document.querySelectorAll(".edit-link-button").forEach((button) => {
    button.addEventListener("click", () => {
      openEditLinkModal(button.dataset.linkId);
    });
  });

  document.querySelectorAll(".delete-link-button").forEach((button) => {
    button.addEventListener("click", () => {
      const linkId = button.dataset.linkId;
      const selectedLink = quickLinks.find((link) => link.id === linkId);

      if (!selectedLink) return;

      const confirmed = window.confirm(
        `Delete the link “${selectedLink.name}”?`
      );

      if (!confirmed) return;

      quickLinks = quickLinks.filter((link) => link.id !== linkId);
      saveQuickLinks();
      renderQuickLinks();
    });
  });
}

function openAddLinkModal() {
  editingLinkId = null;
  linkModalTitle.textContent = "Add a quick link";
  linkForm.reset();
  linkIconInput.value = "🔗";
  linkModal.classList.remove("hidden");
  linkNameInput.focus();
}

function openEditLinkModal(linkId) {
  const selectedLink = quickLinks.find((link) => link.id === linkId);

  if (!selectedLink) return;

  editingLinkId = linkId;
  linkModalTitle.textContent = "Edit quick link";
  linkNameInput.value = selectedLink.name;
  linkUrlInput.value = selectedLink.url;
  linkIconInput.value = selectedLink.icon || "🔗";

  linkModal.classList.remove("hidden");
  linkNameInput.focus();
}

function closeLinkModal() {
  linkModal.classList.add("hidden");
  linkForm.reset();
  editingLinkId = null;
}

document.getElementById("addLinkButton").addEventListener("click", () => {
  openAddLinkModal();
});

document.getElementById("closeLinkModalButton").addEventListener("click", () => {
  closeLinkModal();
});

linkModal.addEventListener("click", (event) => {
  if (event.target === linkModal) {
    closeLinkModal();
  }
});

linkForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = linkNameInput.value.trim();
  const url = normaliseUrl(linkUrlInput.value);
  const icon = linkIconInput.value.trim() || "🔗";

  if (!name || !url) return;

  if (editingLinkId) {
    quickLinks = quickLinks.map((link) => {
      if (link.id === editingLinkId) {
        return {
          ...link,
          name,
          url,
          icon
        };
      }

      return link;
    });
  } else {
    quickLinks.unshift({
      id: createLinkId(),
      name,
      url,
      icon
    });
  }

  saveQuickLinks();
  renderQuickLinks();
  closeLinkModal();
});

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
renderQuickLinks();