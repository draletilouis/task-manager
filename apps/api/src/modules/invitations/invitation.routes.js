import express from 'express';
import * as invitationController from './invitation.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

/**
 * Public route - Get invitation details by token
 * This allows users to view invitation before logging in
 */
router.get('/:token', invitationController.getInvitation);

/**
 * Protected routes - require authentication
 */

// Get current user's pending invitations
router.get('/me/pending', authMiddleware, invitationController.getMyInvitations);

// Accept invitation
router.post('/:token/accept', authMiddleware, invitationController.acceptInvitation);

// Decline invitation (can be done without auth, but auth is optional)
router.post('/:token/decline', invitationController.declineInvitation);

// Cancel invitation (workspace admin/owner only)
router.delete('/:invitationId', authMiddleware, invitationController.cancelInvitation);

export default router;
