import { useAuth0 } from "@auth0/auth0-react";
import React, { useState } from "react";

interface Task {
  TaskId: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateTaskFormProps {
  task: Task;
  onTaskUpdated: (updatedTask: Task) => void;
  onCancel: () => void;
}

export const UpdateTaskForm: React.FC<UpdateTaskFormProps> = ({
  task,
  onTaskUpdated,
  onCancel,
}) => {
  const { getAccessTokenSilently } = useAuth0();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const accessToken = await getAccessTokenSilently();
      const response = await fetch(
        `${process.env.REACT_APP_API_SERVER_URL}/api/tasks/${task.TaskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ title, description }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();
      onTaskUpdated(updatedTask);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="update-task-form">
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label htmlFor={`update-title-${task.TaskId}`}>Title</label>
        <input
          id={`update-title-${task.TaskId}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor={`update-description-${task.TaskId}`}>Description</label>
        <textarea
          id={`update-description-${task.TaskId}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="form-actions">
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel} className="button-cancel">
          Cancel
        </button>
      </div>
    </form>
  );
};
