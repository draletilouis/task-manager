import { useState, useEffect } from "react";
import { getWorkspaces,createWorkspace, updateWorkspace,deleteWorkspace } from "../api/workspaces";
import { set } from "react-hook-form";

export const useWorkspace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            setLoading(true);
            const data = await getWorkspaces();
            setWorkspaces(data);
        } catch (err) {
            setError(err.respoonse?.data?.message || 'Failed to fetch workspaces');
        } finally {
            setLoading(false);
        }
    };

    const addWorkspace = async (workspaceData) => {
        try {
            const newWorkspace = await createWorkspace(workspaceData);
            setWorkspaces((prev) => [...prev, newWorkspace]);
            return newWorkspace;
        }catch (err) {
            setError(err.response?.data?.message || 'Failed to create workspace');
            throw err;
        }
    };
    
    const editWorkspace = async (workspaceId, workspaceData) => {
        try {
            const updatedWorkspace = await updateWorkspace(workspaceId, workspaceData);
            setWorkspaces(workspaces.filter(ws => ws.id !== workspaceId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update workspace');
            throw err;
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
    }