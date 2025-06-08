import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { PageLayout } from "../components/page-layout";
import { TaskForm } from "../components/task-form";
import { UpdateTaskForm } from "../components/update-task-form";
import "../styles/components/task-page.css";

interface Task {
  TaskId: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const TasksPage: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.TaskId === updatedTask.TaskId ? updatedTask : task
      )
    );
    setEditingTaskId(null);
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const accessToken = await getAccessTokenSilently();
      const response = await fetch(
        `${process.env.REACT_APP_API_SERVER_URL}/api/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.TaskId !== taskId)
      );
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred while deleting the task.");
      }
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        const response = await fetch(
          `${process.env.REACT_APP_API_SERVER_URL}/api/tasks`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data: Task[] = await response.json();
        setTasks(data);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred while fetching tasks.");
        }
      }
    };

    fetchTasks();
  }, [getAccessTokenSilently]);

  return (
    <PageLayout>
      <div className="content-layout">
        <h1 id="page-title" className="content__title">
          Tasks
        </h1>
        <div className="content__body">
          <TaskForm onTaskCreated={handleTaskCreated} />
          <hr />
          {error && (
            <div className="error-message">Error fetching tasks: {error}</div>
          )}
          {tasks.length > 0 ? (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.TaskId}>
                  {editingTaskId === task.TaskId ? (
                    <UpdateTaskForm
                      task={task}
                      onTaskUpdated={handleTaskUpdated}
                      onCancel={() => setEditingTaskId(null)}
                    />
                  ) : (
                    <>
                      <h2>{task.title}</h2>
                      <p>{task.description}</p>
                      <small>
                        Created: {new Date(task.createdAt).toLocaleString()}
                      </small>
                      <div className="task-actions">
                        <button
                          className="button-update"
                          onClick={() => setEditingTaskId(task.TaskId)}
                        >
                          Update
                        </button>
                        <button
                          className="button-delete"
                          onClick={() => handleDelete(task.TaskId)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No tasks found. Create one!</p>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
