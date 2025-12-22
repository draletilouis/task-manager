import crypto from 'crypto';
import prisma from "../../database/prisma.js";
import emailService from "../../shared/services/email.service.js";

/**
 * Create and send workspace invitation
 */
export async function createInvitation(workspaceId, inviterId, data) {
    const { email, role = "MEMBER" } = data;

    // Validate email
    if (!email || email.trim().length === 0) {
        throw new Error("Email is required to invite a member");
    }

    const inviteeEmail = email.toLowerCase().trim();

    // Check if inviter has admin or owner role
    const inviterMembership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: workspaceId,
            userId: inviterId,
            role: { in: ['OWNER', 'ADMIN'] }
        }
    });

    if (!inviterMembership) {
        throw new Error("You do not have permission to invite members to this workspace");
    }

    // Get workspace details
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId }
    });

    if (!workspace) {
        throw new Error("Workspace not found");
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email: inviteeEmail }
    });

    // User must have an account to be invited
    if (!existingUser) {
        throw new Error("User not found. They must create an account before being invited to a workspace.");
    }

    // Check if they're already a member
    const existingMembership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: workspaceId,
            userId: existingUser.id
        }
    });

    if (existingMembership) {
        throw new Error("User is already a member of this workspace");
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.workspaceInvitation.findFirst({
        where: {
            workspaceId: workspaceId,
            inviteeEmail: inviteeEmail,
            status: 'PENDING'
        }
    });

    if (existingInvitation) {
        // Resend the existing invitation email
        const inviter = await prisma.user.findUnique({
            where: { id: inviterId },
            select: { name: true, email: true }
        });

        const invitationUrl = `${process.env.APP_URL || 'http://localhost:5173'}/invitations/accept?token=${existingInvitation.token}`;

        await emailService.sendWorkspaceInvitation(
            inviteeEmail,
            workspace.name,
            inviter.name || inviter.email,
            invitationUrl
        );

        return {
            message: "Invitation resent successfully",
            invitation: {
                id: existingInvitation.id,
                email: inviteeEmail,
                role: existingInvitation.role,
                expiresAt: existingInvitation.expiresAt
            }
        };
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await prisma.workspaceInvitation.create({
        data: {
            workspaceId: workspaceId,
            inviterId: inviterId,
            inviteeEmail: inviteeEmail,
            role: role,
            token: token,
            expiresAt: expiresAt
        }
    });

    // Get inviter information for email
    const inviter = await prisma.user.findUnique({
        where: { id: inviterId },
        select: { name: true, email: true }
    });

    // Send invitation email
    const invitationUrl = `${process.env.APP_URL || 'http://localhost:5173'}/invitations/accept?token=${token}`;

    emailService.sendWorkspaceInvitation(
        inviteeEmail,
        workspace.name,
        inviter.name || inviter.email,
        invitationUrl
    ).catch(error => {
        console.error('Failed to send workspace invitation email:', error);
        // Don't fail the invitation if email fails
    });

    return {
        message: "Invitation sent successfully",
        invitation: {
            id: invitation.id,
            email: inviteeEmail,
            role: invitation.role,
            expiresAt: invitation.expiresAt
        }
    };
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token) {
    if (!token) {
        throw new Error("Invitation token is required");
    }

    const invitation = await prisma.workspaceInvitation.findUnique({
        where: { token: token },
        include: {
            workspace: {
                select: {
                    id: true,
                    name: true,
                    description: true
                }
            },
            inviter: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });

    if (!invitation) {
        throw new Error("Invitation not found");
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
        // Mark as expired
        await prisma.workspaceInvitation.update({
            where: { id: invitation.id },
            data: { status: 'EXPIRED' }
        });
        throw new Error("This invitation has expired");
    }

    // Check if invitation is not pending
    if (invitation.status !== 'PENDING') {
        throw new Error(`This invitation has already been ${invitation.status.toLowerCase()}`);
    }

    return {
        invitation: {
            id: invitation.id,
            workspace: invitation.workspace,
            inviter: invitation.inviter,
            role: invitation.role,
            expiresAt: invitation.expiresAt
        }
    };
}

/**
 * Accept workspace invitation
 */
export async function acceptInvitation(token, userId) {
    if (!token) {
        throw new Error("Invitation token is required");
    }

    if (!userId) {
        throw new Error("User must be logged in to accept invitation");
    }

    // Get invitation
    const invitation = await prisma.workspaceInvitation.findUnique({
        where: { token: token },
        include: {
            workspace: true
        }
    });

    if (!invitation) {
        throw new Error("Invitation not found");
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
        await prisma.workspaceInvitation.update({
            where: { id: invitation.id },
            data: { status: 'EXPIRED' }
        });
        throw new Error("This invitation has expired");
    }

    // Check if invitation is pending
    if (invitation.status !== 'PENDING') {
        throw new Error(`This invitation has already been ${invitation.status.toLowerCase()}`);
    }

    // Get user to verify email matches
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Verify email matches
    if (user.email.toLowerCase() !== invitation.inviteeEmail.toLowerCase()) {
        throw new Error("This invitation was sent to a different email address");
    }

    // Check if user is already a member
    const existingMembership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: invitation.workspaceId,
            userId: userId
        }
    });

    if (existingMembership) {
        // Mark invitation as accepted anyway
        await prisma.workspaceInvitation.update({
            where: { id: invitation.id },
            data: { status: 'ACCEPTED' }
        });
        throw new Error("You are already a member of this workspace");
    }

    // Create workspace membership and update invitation status in a transaction
    const result = await prisma.$transaction(async (tx) => {
        // Create membership
        const membership = await tx.workspaceMember.create({
            data: {
                workspaceId: invitation.workspaceId,
                userId: userId,
                role: invitation.role
            }
        });

        // Update invitation status
        await tx.workspaceInvitation.update({
            where: { id: invitation.id },
            data: { status: 'ACCEPTED' }
        });

        return membership;
    });

    return {
        message: "Invitation accepted successfully",
        workspace: {
            id: invitation.workspace.id,
            name: invitation.workspace.name,
            role: invitation.role
        }
    };
}

/**
 * Decline workspace invitation
 */
export async function declineInvitation(token, userId) {
    if (!token) {
        throw new Error("Invitation token is required");
    }

    // Get invitation
    const invitation = await prisma.workspaceInvitation.findUnique({
        where: { token: token }
    });

    if (!invitation) {
        throw new Error("Invitation not found");
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
        await prisma.workspaceInvitation.update({
            where: { id: invitation.id },
            data: { status: 'EXPIRED' }
        });
        throw new Error("This invitation has expired");
    }

    // Check if invitation is pending
    if (invitation.status !== 'PENDING') {
        throw new Error(`This invitation has already been ${invitation.status.toLowerCase()}`);
    }

    // If user is provided, verify email matches
    if (userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (user && user.email.toLowerCase() !== invitation.inviteeEmail.toLowerCase()) {
            throw new Error("This invitation was sent to a different email address");
        }
    }

    // Update invitation status
    await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'DECLINED' }
    });

    return {
        message: "Invitation declined successfully"
    };
}

/**
 * Get pending invitations for a user by email
 */
export async function getPendingInvitations(email) {
    if (!email) {
        throw new Error("Email is required");
    }

    const invitations = await prisma.workspaceInvitation.findMany({
        where: {
            inviteeEmail: email.toLowerCase(),
            status: 'PENDING',
            expiresAt: {
                gt: new Date() // Only non-expired invitations
            }
        },
        include: {
            workspace: {
                select: {
                    id: true,
                    name: true,
                    description: true
                }
            },
            inviter: {
                select: {
                    name: true,
                    email: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return {
        invitations: invitations.map(inv => ({
            id: inv.id,
            token: inv.token,
            workspace: inv.workspace,
            inviter: inv.inviter,
            role: inv.role,
            expiresAt: inv.expiresAt,
            createdAt: inv.createdAt
        }))
    };
}

/**
 * Cancel invitation (for workspace admins/owners)
 */
export async function cancelInvitation(invitationId, userId) {
    if (!invitationId) {
        throw new Error("Invitation ID is required");
    }

    // Get invitation
    const invitation = await prisma.workspaceInvitation.findUnique({
        where: { id: invitationId }
    });

    if (!invitation) {
        throw new Error("Invitation not found");
    }

    // Check if user has admin or owner role in the workspace
    const membership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: invitation.workspaceId,
            userId: userId,
            role: { in: ['OWNER', 'ADMIN'] }
        }
    });

    if (!membership) {
        throw new Error("You do not have permission to cancel this invitation");
    }

    // Check if invitation is pending
    if (invitation.status !== 'PENDING') {
        throw new Error(`This invitation has already been ${invitation.status.toLowerCase()}`);
    }

    // Update invitation status
    await prisma.workspaceInvitation.update({
        where: { id: invitationId },
        data: { status: 'CANCELLED' }
    });

    return {
        message: "Invitation cancelled successfully"
    };
}

/**
 * Get all invitations for a workspace (for admins/owners)
 */
export async function getWorkspaceInvitations(workspaceId, userId) {
    // Check if user has admin or owner role
    const membership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: workspaceId,
            userId: userId,
            role: { in: ['OWNER', 'ADMIN'] }
        }
    });

    if (!membership) {
        throw new Error("You do not have permission to view invitations for this workspace");
    }

    const invitations = await prisma.workspaceInvitation.findMany({
        where: {
            workspaceId: workspaceId
        },
        include: {
            inviter: {
                select: {
                    name: true,
                    email: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return {
        invitations: invitations.map(inv => ({
            id: inv.id,
            email: inv.inviteeEmail,
            role: inv.role,
            status: inv.status,
            inviter: inv.inviter,
            expiresAt: inv.expiresAt,
            createdAt: inv.createdAt
        }))
    };
}
