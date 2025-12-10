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
      setWorkspaces(data);
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
      const newWorkspace = await createWorkspace(workspaceData);
      setWorkspaces([...workspaces, newWorkspace]);
      return newWorkspace;
    } catch (err) {
      throw new Error(err.message || 'Failed to create workspace');
    }
  };

  // Update existing workspace
  const editWorkspace = async (workspaceId, workspaceData) => {
    try {
      const updated = await updateWorkspace(workspaceId, workspaceData);
      setWorkspaces(workspaces.map(ws => ws.id === workspaceId ? updated : ws));
      return updated;
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
