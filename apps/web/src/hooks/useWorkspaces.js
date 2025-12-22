import { useState, useEffect } from 'react';
import {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
} from '../api/workspaces';

export const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch workspaces from API
  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await getWorkspaces();
      // API returns { workspaces: [...] }, extract the array
      setWorkspaces(data.workspaces || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Create new workspace
  const addWorkspace = async (workspaceData) => {
    try {
      await createWorkspace(workspaceData);
      // Refetch workspaces to get complete data with memberCount and role
      await fetchWorkspaces();
    } catch (err) {
      throw new Error(err.message || 'Failed to create workspace');
    }
  };

  // Update existing workspace
  const editWorkspace = async (workspaceId, workspaceData) => {
    try {
      await updateWorkspace(workspaceId, workspaceData);
      // Refetch workspaces to get complete data
      await fetchWorkspaces();
    } catch (err) {
      throw new Error(err.message || 'Failed to update workspace');
    }
  };

  // Delete workspace
  const removeWorkspace = async (workspaceId) => {
    try {
      await deleteWorkspace(workspaceId);
      setWorkspaces(workspaces.filter(ws => ws.id !== workspaceId));
    } catch (err) {
      throw new Error(err.message || 'Failed to delete workspace');
    }
  };

  return {
    workspaces,
    loading,
    error,
    fetchWorkspaces,
    addWorkspace,
    editWorkspace,
    removeWorkspace,
  };
};
