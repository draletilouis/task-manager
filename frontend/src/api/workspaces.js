import apiClient from "./client";

// Fetch all workspaces for current user
export const getWorkspaces = async () => {
  try {
    const response = await apiClient.get("/workspaces");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch workspaces");
  }
};

// Create new workspace
export const createWorkspace = async (workspaceData) => {
  try {
    const response = await apiClient.post("/workspaces", workspaceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create workspace");
  }
};

// Update workspace details
export const updateWorkspace = async (workspaceId, workspaceData) => {
  try {
    const response = await apiClient.put(`/workspaces/${workspaceId}`, workspaceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update workspace");
  }
};

// Delete workspace
export const deleteWorkspace = async (workspaceId) => {
  try {
    const response = await apiClient.delete(`/workspaces/${workspaceId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete workspace");
  }
};

// Get workspace members
export const getWorkspaceMembers = async (workspaceId) => {
  try {
    const response = await apiClient.get(`/workspaces/${workspaceId}/members`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch members");
  }
};

// Add member to workspace
export const addWorkspaceMember = async (workspaceId, memberData) => {
  try {
    const response = await apiClient.post(
      `/workspaces/${workspaceId}/members`,
      memberData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to add member");
  }
};

// Remove member from workspace
export const removeWorkspaceMember = async (workspaceId, memberId) => {
  try {
    const response = await apiClient.delete(
      `/workspaces/${workspaceId}/members/${memberId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to remove member");
  }
};