"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";


// Define Task type
interface Task {
  id: string;
  title: string;
}

const API_URL = "http://localhost:5001"; // or your backend port

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    let socket: Socket;

    const fetchTasks = async () => {
      const res = await axios.get<Task[]>(`${API_URL}/api/tasks`);
      setTasks(res.data);
    };

    fetchTasks();

    socket = io(API_URL);

    socket.on("tasksUpdated", (data: Task[]) => {
      setTasks(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const addTask = async (): Promise<void> => {
    if (!title.trim()) return;

    await axios.post(`${API_URL}/api/tasks`, { title });
    setTitle("");
  };

  const updateTask = async (id: string): Promise<void> => {
    const newTitle = prompt("Enter new title:");
    if (newTitle) {
      await axios.put(`${API_URL}/api/tasks/${id}`, {
        title: newTitle,
      });
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    if (confirm("Delete this task?")) {
      await axios.delete(`${API_URL}/api/tasks/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white shadow p-6 rounded">
        <h1 className="text-2xl font-bold mb-4">Real-Time Tasks</h1>

        <div className="flex mb-4">
          <input
            type="text"
            className="border p-2 flex-1 rounded"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            placeholder="New task"
          />
          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-4 rounded ml-2"
          >
            Add
          </button>
        </div>

        <ul>
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center p-2 border-b"
            >
              <span>{task.title}</span>
              <div>
                <button
                  onClick={() => updateTask(task.id)}
                  className="text-green-500 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}