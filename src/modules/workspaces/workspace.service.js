import prisma from "../../database/prisma.js";

/**
 * Create a new workspace
 * User becomes the owner automatically
 */
export async function createWorkspace(userId, data) {
    const {name} = data;

    // Validate workspace name
    if (!name||name.trim().length === 0) {
        throw new Error("Workspace name is required");
    }

    // Create workspace and add user as owner
    const workspace = await prisma.workspace.create({
        data: {
            name: name.trim(),
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
            workspace: true,
        },
    });

    const workspaces = memberships.map((membership) => ({
        id: membership.workspace.id,
        name: membership.workspace.name,
        role: membership.role,
        createdAt: membership.workspace.createdAt,
    }));

    return {workspaces}
}

/**
 * Update workspace name
 * Only admins and owners can update
 */
export async function updateWorkspace(workspaceId, userId, data) {
    const { name } = data;

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
        data: { name: name.trim() },
    });

    return {
        message: "Workspace updated successfully",
        workspace: {
            id: workspace.id,
            name: workspace.name,
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
 * Invite a member to workspace
 * Only admins and owners can invite
 */
export async function inviteMember(workspaceId, inviterId, data) {
    const {email, role = "MEMBER"} = data;

    // Validate email
    if (!email || email.trim().length === 0) {
        throw new Error("Email is required to invite a member");
    }

    // Check if inviter has admin or owner role
    const inviterMembership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: workspaceId,
            userId: inviterId,
            role: {in: ['OWNER', 'ADMIN'] }
        }
    });

    if (!inviterMembership) {
        throw new Error("You do not have permission to invite members to this workspace");
    }

    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email: email.trim() }
    });

    if (!user) {
        throw new Error("User not found with this email");
    }

    // Check if user is already a member
    const existingMembership = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId: workspaceId,
            userId: user.id
        }
    });

    if (existingMembership) {
        throw new Error("User is already a member of this workspace");
    }

    // Add member to workspace
    const membership = await prisma.workspaceMember.create({
        data: {
            workspaceId: workspaceId,
            userId: user.id,
            role: role
        }
    });

    return {
        message: "Member invited successfully",
        member: {
            id: membership.id,
            userId: user.id,
            email: user.email,
            role: membership.role
        }
    };
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

export async function updateMemberRole(workspaceId, updaterId, memberId, newRole) {
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
        data: { role: newRole }
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