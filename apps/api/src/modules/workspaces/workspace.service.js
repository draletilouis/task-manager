import prisma from "../../database/prisma.js";
import * as invitationService from "../invitations/invitation.service.js";

/**
 * Create a new workspace
 * User becomes the owner automatically
 */
export async function createWorkspace(userId, data) {
    const {name, description} = data;

    // Validate workspace name
    if (!name||name.trim().length === 0) {
        throw new Error("Workspace name is required");
    }

    // Create workspace and add user as owner
    const workspace = await prisma.workspace.create({
        data: {
            name: name.trim(),
            description: description?.trim() || null,
            ownerId: userId,
            members: {
                create: { userId: userId,
                role: 'OWNER'  },
            },
        },
    });

    return {
        message: "Workspace created successfully",
        workspace:{
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            ownerId: workspace.ownerId,
            createdAt: workspace.createdAt,
        }
    };

}

/**
 * Get all workspaces where user is a member
 */
export async function getWorkspaces(userId) {
    const memberships = await prisma.workspaceMember.findMany({
        where: { userId: userId },
        include: {
            workspace: {
                include: {
                    _count: {
                        select: { members: true }
                    }
                }
            },
        },
    });

    const workspaces = memberships.map((membership) => ({
        id: membership.workspace.id,
        name: membership.workspace.name,
        description: membership.workspace.description,
        role: membership.role,
        memberCount: membership.workspace._count.members,
        createdAt: membership.workspace.createdAt,
    }));

    return {workspaces}
}

/**
 * Get single workspace by ID
 */
export async function getWorkspace(workspaceId, userId) {
    // Check if user is a member of the workspace
    const membership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: workspaceId,
            userId: userId
        },
        include: {
            workspace: {
                include: {
                    _count: {
                        select: { members: true, projects: true }
                    }
                }
            }
        }
    });

    if (!membership) {
        throw new Error("You do not have access to this workspace");
    }

    return {
        workspace: {
            id: membership.workspace.id,
            name: membership.workspace.name,
            description: membership.workspace.description,
            role: membership.role,
            memberCount: membership.workspace._count.members,
            projectCount: membership.workspace._count.projects,
            createdAt: membership.workspace.createdAt,
        }
    };
}

/**
 * Update workspace name and description
 * Only admins and owners can update
 */
export async function updateWorkspace(workspaceId, userId, data) {
    const { name, description } = data;

    // Validate workspace name
    if (!name || name.trim().length === 0) {
        throw new Error("Workspace name is required");
    }

    // Check if user has admin or owner role
    const membership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: workspaceId,
            userId: userId,
            role: { in: ['OWNER', 'ADMIN'] }
        }
    });

    if (!membership) {
        throw new Error("You do not have permission to update this workspace");
    }

    // Update workspace
    const workspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
            name: name.trim(),
            description: description?.trim() || null
        },
    });

    return {
        message: "Workspace updated successfully",
        workspace: {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            ownerId: workspace.ownerId,
            createdAt: workspace.createdAt,
        }
    };
}

/**
 * Delete workspace
 * Only the owner can delete
 */
export async function deleteWorkspace(workspaceId, userId) {
    // Check if user is the owner
    const membership = await prisma.workspaceMember.findFirst({
        where: {
                workspaceId: workspaceId,
                userId: userId,
                role: 'OWNER'  }
    });

    if (!membership) {
        throw new Error("Only the workspace owner can delete the workspace");
    }

    // Delete all workspace members first
    await prisma.workspaceMember.deleteMany({
        where: { workspaceId: workspaceId }
    });

    // Delete workspace
    await prisma.workspace.delete({
        where: { id: workspaceId },
    });

    return { message: "Workspace deleted successfully" };
}

/**
 * Get all members of a workspace
 */
export async function getWorkspaceMembers(workspaceId, userId) {
    // Check if user is a member of the workspace
    const membership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: workspaceId,
            userId: userId
        }
    });

    if (!membership) {
        throw new Error("You do not have permission to view members of this workspace");
    }

    // Get all members of the workspace
    const members = await prisma.workspaceMember.findMany({
        where: {
            workspaceId: workspaceId
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true
                }
            }
        }
    });

    return members;
}

/**
 * Invite a member to workspace
 * Only admins and owners can invite
 * Now uses the invitation system instead of adding members directly
 */
export async function inviteMember(workspaceId, inviterId, data) {
    // Delegate to the invitation service
    return invitationService.createInvitation(workspaceId, inviterId, data);
}

export async function removeMember(workspaceId, removerId, memberId) {
    // Check if remover has admin or owner role
    const removerMembership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: workspaceId,
            userId: removerId,
            role: { in: ['OWNER', 'ADMIN'] }
        }
    });

    if (!removerMembership) {
        throw new Error("You do not have permission to remove members from this workspace");
    }
    // Check if member exists
    const membership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: workspaceId,
            userId: memberId
        }
    });
    if (!membership) {
        throw new Error("Member not found in this workspace");
    }
    // Remove member
    await prisma.workspaceMember.delete({
        where: { id: membership.id }
    });
    return { message: "Member removed successfully" };
}

export async function updateMemberRole(workspaceId, updaterId, memberId, role) {
    // Check if updater has owner role
    const updaterMembership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: workspaceId,
            userId: updaterId,
            role: 'OWNER'
        }
    });

    if (!updaterMembership) {
        throw new Error("Only the workspace owner can update member roles");
    }
    // Check if member exists
    const membership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: workspaceId,
            userId: memberId
        }
    });

    if (!membership) {
        throw new Error("Member not found in this workspace");
    }
    // Update member role
    const updatedMembership = await prisma.workspaceMember.update({
        where: { id: membership.id },
        data: { role: role }
    });
    return {
        message: "Member role updated successfully",
        member: {
            id: updatedMembership.id,
            userId: updatedMembership.userId,
            role: updatedMembership.role
        }
    };
}