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

export async function updateWorkspace(workspaceId, userId, data) {
    const { name } = data;

    // Validate workspace name
    if (!name || name.trim().length === 0) {
        throw new Error("Workspace name is required");
    }
    // Update workspace
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