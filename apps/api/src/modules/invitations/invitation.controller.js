import prisma from '../../database/prisma.js';
import * as invitationService from './invitation.service.js';

/**
 * Get invitation details by token
 * GET /api/invitations/:token
 */
export async function getInvitation(req, res) {
    try {
        const { token } = req.params;
        const result = await invitationService.getInvitationByToken(token);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Accept invitation
 * POST /api/invitations/:token/accept
 */
export async function acceptInvitation(req, res) {
    try {
        const { token } = req.params;
        const userId = req.user.userId; // From auth middleware

        const result = await invitationService.acceptInvitation(token, userId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Decline invitation
 * POST /api/invitations/:token/decline
 */
export async function declineInvitation(req, res) {
    try {
        const { token } = req.params;
        const userId = req.user?.userId; // Optional - can decline without login

        const result = await invitationService.declineInvitation(token, userId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Get pending invitations for current user
 * GET /api/invitations/me
 */
export async function getMyInvitations(req, res) {
    try {
        const userId = req.user.userId;

        // Get user email
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });

        const result = await invitationService.getPendingInvitations(user.email);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Cancel invitation (workspace admin/owner)
 * DELETE /api/invitations/:invitationId
 */
export async function cancelInvitation(req, res) {
    try {
        const { invitationId } = req.params;
        const userId = req.user.userId;

        const result = await invitationService.cancelInvitation(invitationId, userId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
