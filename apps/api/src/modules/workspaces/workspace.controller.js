import * as workspaceService from './workspace.service.js';
import * as invitationService from '../invitations/invitation.service.js';

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

/**
 * Handle getting single workspace
 */
export async function getWorkspace(req, res) {
    try {
        const userId = req.user.userId;
        const workspaceId = req.params.workspaceId;
        const result = await workspaceService.getWorkspace(workspaceId, userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Handle workspace update
 */
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

/**
 * Handle workspace deletion
 */
export async function deleteWorkspace(req, res) {
    try {
        const userId = req.user.userId;
        const workspaceId = req.params.workspaceId;
        const result = await workspaceService.deleteWorkspace(workspaceId, userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Handle getting workspace members
 */
export async function getWorkspaceMembers(req, res) {
    try {
        const userId = req.user.userId;
        const workspaceId = req.params.workspaceId;
        const result = await workspaceService.getWorkspaceMembers(workspaceId, userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Handle member invitation
 */
export async function inviteMember(req, res) {
    try {
        const userId = req.user.userId;
        const workspaceId = req.params.workspaceId;
        const result = await workspaceService.inviteMember(workspaceId, userId, req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Handle member removal
 */
export async function removeMember(req, res) {
    try {
        const removerId = req.user.userId;
        const workspaceId = req.params.workspaceId;
        const memberId = req.params.memberId;
        const result = await workspaceService.removeMember(workspaceId, removerId, memberId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Handle member role update
 */
export async function updateMemberRole(req, res) {
    try {
        const updaterId = req.user.userId;
        const workspaceId = req.params.workspaceId;
        const memberId = req.params.memberId;
        const { role } = req.body;
        const result = await workspaceService.updateMemberRole(workspaceId, updaterId, memberId, role);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Get workspace invitations
 */
export async function getWorkspaceInvitations(req, res) {
    try {
        const userId = req.user.userId;
        const workspaceId = req.params.workspaceId;
        const result = await invitationService.getWorkspaceInvitations(workspaceId, userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
