
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/plan", async (req, res) => {
    try {
        const { goal } = req.body;

        if (!goal || !goal.trim()) {
            return res.status(400).json({ error: "Please enter a goal." });
        }

       const response = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        model: "gemma4:e2b",
        prompt: `You are GEAR 5, an anime-inspired productivity coach.
Break this goal into 3 to 5 small, realistic tasks:
${goal}

Return ONLY valid JSON in this exact format:
{"tasks":[{"title":"Task name","minutes":30,"difficulty":"Easy"}]}`,
        format: "json",
        stream: false
    })
});

if (!response.ok) {
    throw new Error("Ollama returned an error: " + response.status);
}
        const data = await response.json();
const answer = data.response;
const clean = answer.replace(/```json|```/g, "").trim();
const result = JSON.parse(clean);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "AI planning failed. Check that Ollama is running and Gemma is installed."
        });
    }
});

app.listen(PORT, () => {
    console.log(`GEAR 5 running at http://localhost:${PORT}`);
});
