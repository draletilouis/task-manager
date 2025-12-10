import { useState, useEffect } from 'react';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} from '../api/projects';

export const useProjects = (workspaceId) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects for workspace
  const fetchProjects = async () => {
    if (!workspaceId) return;

    try {
      setLoading(true);
      const data = await getProjects(workspaceId);
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when workspaceId changes
  useEffect(() => {
    fetchProjects();
  }, [workspaceId]);

  // Create new project
  const addProject = async (projectData) => {
    try {
      const newProject = await createProject(workspaceId, projectData);
      setProjects([...projects, newProject]);
      return newProject;
    } catch (err) {
      throw new Error(err.message || 'Failed to create project');
    }
  };

  // Update existing project
  const editProject = async (projectId, projectData) => {
    try {
      const updated = await updateProject(workspaceId, projectId, projectData);
      setProjects(projects.map(p => p.id === projectId ? updated : p));
      return updated;
    } catch (err) {
      throw new Error(err.message || 'Failed to update project');
    }
  };

  // Delete project
  const removeProject = async (projectId) => {
    try {
      await deleteProject(workspaceId, projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      throw new Error(err.message || 'Failed to delete project');
    }
  };

  return {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    editProject,
    removeProject,
  };
};
