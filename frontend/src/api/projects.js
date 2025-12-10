import apiClient from "./client";

// Fetch all projects in workspace
export const getProjects = async (workspaceId) => {
  try {
    const response = await apiClient.get(`/workspaces/${workspaceId}/projects`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch projects");
  }
};

// Create new project
export const createProject = async (workspaceId, projectData) => {
  try {
    const response = await apiClient.post(
      `/workspaces/${workspaceId}/projects`,
      projectData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create project");
  }
};

// Update project details
export const updateProject = async (workspaceId, projectId, projectData) => {
  try {
    const response = await apiClient.put(
      `/workspaces/${workspaceId}/projects/${projectId}`,
      projectData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update project");
  }
};

// Delete project
export const deleteProject = async (workspaceId, projectId) => {
  try {
    const response = await apiClient.delete(
      `/workspaces/${workspaceId}/projects/${projectId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete project");
  }
};