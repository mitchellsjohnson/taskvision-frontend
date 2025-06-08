import { useAuth0 } from "@auth0/auth0-react";
import React, { useState } from "react";

interface Task {
  TaskId: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  UserId: string;
}

interface TaskFormProps {
  onTaskCreated: (newTask: Task) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title) {
      setError("Title is required.");
      return;
    }

    try {
      const accessToken = await getAccessTokenSilently();
      const response = await fetch(
        `${process.env.REACT_APP_API_SERVER_URL}/api/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ title, description }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const newTask = await response.json();
      onTaskCreated(newTask);
      setTitle("");
      setDescription("");
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred while creating the task.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h3>Create a New Task</h3>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button type="submit">Create Task</button>
    </form>
  );
};
