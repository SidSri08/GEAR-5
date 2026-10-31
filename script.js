
// GEAR 5 - Productivity Engine

let xp = Number(localStorage.getItem("gearXP")) || 0;
let berries = Number(localStorage.getItem("gearBerries")) || 0;

let tasks = JSON.parse(localStorage.getItem("gearTasks") || "[]");

let habits = JSON.parse(localStorage.getItem("gearHabits") || "null") || [
    { id: 1, name: "📚 Study for 30 minutes", done: false },
    { id: 2, name: "💧 Drink enough water", done: false },
    { id: 3, name: "🏃 Move your body", done: false }
];

// Save all data
function saveData() {
    localStorage.setItem("gearXP", xp);
    localStorage.setItem("gearBerries", berries);
    localStorage.setItem("gearTasks", JSON.stringify(tasks));
    localStorage.setItem("gearHabits", JSON.stringify(habits));
}

// Update dashboard
function updateStats() {
    document.getElementById("xp").textContent = xp + " XP";
    document.getElementById("berries").textContent = berries;
    document.getElementById("level").textContent = Math.floor(xp / 100) + 1;
    document.getElementById("taskCount").textContent = tasks.length + " missions";
}

// Render tasks
function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks.forEach((task, index) => {
        const item = document.createElement("div");
        item.className = "task";

        const name = document.createElement("span");
        name.textContent = task.text;

        if (task.done) name.className = "completed";

        const complete = document.createElement("button");
        complete.textContent = task.done ? "Completed ✓" : "Complete";
        complete.disabled = task.done;

        complete.onclick = () => {
            if (!task.done) {
                task.done = true;
                xp += 20;
                berries += 10;
                saveData();
                renderTasks();
                updateStats();
            }
        };

        const remove = document.createElement("button");
        remove.textContent = "✕";

        remove.onclick = () => {
            tasks.splice(index, 1);
            saveData();
            renderTasks();
            updateStats();
        };

        item.append(name, complete, remove);
        list.appendChild(item);
    });

    updateStats();
}

// Add a new task
document.getElementById("addBtn").addEventListener("click", () => {
    const input = document.getElementById("taskInput");
    const text = input.value.trim();

    if (!text) return;

    tasks.push({ text, done: false });
    input.value = "";

    saveData();
    renderTasks();
});

// Gemma AI Mission Planner
document.getElementById("planBtn").addEventListener("click", async () => {
    const goal = document.getElementById("goal").value.trim();
    const result = document.getElementById("aiResult");
    const button = document.getElementById("planBtn");

    if (!goal) {
        result.textContent = "Please enter your goal first!";
        return;
    }

    button.disabled = true;
    button.textContent = "⚡ Gemma is planning...";
    result.textContent = "Your AI companion is creating your missions...";

    try {
        const response = await fetch("/api/plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ goal })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "AI planning failed");
        }

        data.tasks.forEach(task => {
            tasks.push({
                text: task.title + " (" + task.minutes + " min)",
                done: false
            });
        });

        saveData();
        renderTasks();

        result.textContent = "🏴‍☠️ Gemma created " + data.tasks.length + " missions!";

    } catch (error) {
        result.textContent = "Error: " + error.message;

    } finally {
        button.disabled = false;
        button.textContent = "✨ Generate my missions";
    }
});

// Render all habits
function renderHabits() {
    const list = document.getElementById("habitList");
    list.innerHTML = "";

    habits.forEach((habit, index) => {
        const item = document.createElement("div");
        item.className = "habit";

        const name = document.createElement("span");
        name.textContent = habit.name;

        if (habit.done) {
            name.className = "completed";
        }

        const complete = document.createElement("button");
        complete.className = "primary";
        complete.textContent = habit.done ? "Completed ✓" : "Complete +10 XP";
        complete.disabled = habit.done;

        complete.onclick = () => {
            if (habit.done) return;

            habit.done = true;
            xp += 10;

            saveData();
            renderHabits();
            updateStats();
        };

        const remove = document.createElement("button");
        remove.textContent = "✕";

        remove.onclick = () => {
            habits.splice(index, 1);
            saveData();
            renderHabits();
        };

        item.append(name, complete, remove);
        list.appendChild(item);
    });
}

// Add a custom habit
document.getElementById("addHabitBtn").addEventListener("click", () => {
    const input = document.getElementById("habitInput");
    const name = input.value.trim();

    if (!name) return;

    habits.push({
        id: Date.now(),
        name: name,
        done: false
    });

    input.value = "";

    saveData();
    renderHabits();
});

// Allow Enter key to add habits
document.getElementById("habitInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        document.getElementById("addHabitBtn").click();
    }
});

// Initial page rendering
renderTasks();
renderHabits();
updateStats();
