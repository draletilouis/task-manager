import apiClient from "./client";

// Fetch all tasks in project
export const getTasks = async (workspaceId, projectId) => {
  try {
    const response = await apiClient.get(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch tasks");
  }
};

// Create new task
export const createTask = async (workspaceId, projectId, taskData) => {
  try {
    const response = await apiClient.post(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
      taskData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create task");
  }
};

// Update task details
export const updateTask = async (workspaceId, projectId, taskId, taskData) => {
  try {
    const response = await apiClient.put(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
      taskData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update task");
  }
};

// Delete task
export const deleteTask = async (workspaceId, projectId, taskId) => {
  try {
    const response = await apiClient.delete(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete task");
  }
};
