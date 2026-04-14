const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { tasks } = require("./data");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// Get all tasks
app.get("/api/tasks", (req, res) => {
    res.json(tasks);
});

// Create task
app.post("/api/tasks", (req, res) => {
    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({ message: "Title is required" });
    }

    const newTask = { id: Date.now(), title };
    tasks.push(newTask);

    io.emit("tasksUpdated", tasks);
    res.status(201).json(newTask);
});

// Update task
app.put("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const task = tasks.find(t => t.id === Number(id));

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    task.title = title;
    io.emit("tasksUpdated", tasks);

    res.json(task);
});

// Delete task
app.delete("/api/tasks/:id", (req, res) => {
    const { id } = req.params;

    const index = tasks.findIndex(t => t.id === Number(id));

    if (index === -1) {
        return res.status(404).json({ message: "Task not found" });
    }

    tasks.splice(index, 1);
    io.emit("tasksUpdated", tasks);

    res.json({ message: "Deleted successfully" });
});

// Socket
io.on("connection", socket => {
    console.log("Client connected:", socket.id);

    socket.emit("tasksUpdated", tasks);
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);