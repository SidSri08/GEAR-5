
// GEAR 5 - Productivity Engine

let xp = Number(localStorage.getItem("gearXP")) || 0;
let berries = Number(localStorage.getItem("gearBerries")) || 0;
let tasks = JSON.parse(localStorage.getItem("gearTasks") || "[]");

function saveData() {
    localStorage.setItem("gearXP", xp);
    localStorage.setItem("gearBerries", berries);
    localStorage.setItem("gearTasks", JSON.stringify(tasks));
}

function updateStats() {
    document.getElementById("xp").textContent = xp + " XP";
    document.getElementById("berries").textContent = berries;
    document.getElementById("level").textContent = Math.floor(xp / 100) + 1;
    document.getElementById("taskCount").textContent = tasks.length + " missions";
}

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

document.getElementById("addBtn").addEventListener("click", () => {
    const input = document.getElementById("taskInput");
    const text = input.value.trim();

    if (!text) return;

    tasks.push({ text, done: false });
    input.value = "";
    saveData();
    renderTasks();
});

// Temporary planner fallback while we connect Gemma

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
renderTasks();
