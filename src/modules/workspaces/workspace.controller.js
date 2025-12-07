import * as workspaceService from './workspace.service.js';

/**
 * Handle workspace creation
 */
export async function createWorkspace(req, res) {
    try {
        const userId = req.user.userId;
        const result = await workspaceService.createWorkspace(userId, req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Handle getting user workspaces
 */
export async function getWorkspaces(req, res) {
    try {
        const userId = req.user.userId;
        const result = await workspaceService.getWorkspaces(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}    

export async function updateWorkspace(req, res) {
    try {
        const userId = req.user.userId;
        const workspaceId = req.params.workspaceId;
        const result = await workspaceService.updateWorkspace(workspaceId, userId, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}