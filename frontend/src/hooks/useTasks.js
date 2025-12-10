import { useState, useEffect } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../api/tasks';

export const useTasks = (workspaceId, projectId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks for project
  const fetchTasks = async () => {
    if (!workspaceId || !projectId) return;

    try {
      setLoading(true);
      const data = await getTasks(workspaceId, projectId);
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when workspaceId or projectId changes
  useEffect(() => {
    fetchTasks();
  }, [workspaceId, projectId]);

  // Create new task
  const addTask = async (taskData) => {
    try {
      const newTask = await createTask(workspaceId, projectId, taskData);
      setTasks([...tasks, newTask]);
      return newTask;
    } catch (err) {
      throw new Error(err.message || 'Failed to create task');
    }
  };

  // Update existing task
  const editTask = async (taskId, taskData) => {
    try {
      const updated = await updateTask(workspaceId, projectId, taskId, taskData);
      setTasks(tasks.map(t => t.id === taskId ? updated : t));
      return updated;
    } catch (err) {
      throw new Error(err.message || 'Failed to update task');
    }
  };

  // Delete task
  const removeTask = async (taskId) => {
    try {
      await deleteTask(workspaceId, projectId, taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      throw new Error(err.message || 'Failed to delete task');
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    editTask,
    removeTask,
  };
};
