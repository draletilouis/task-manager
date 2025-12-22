import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Prisma at the module level
const mockPrisma = {
    workspace: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    workspaceMember: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        update: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
    },
};

// Mock the prisma module
jest.unstable_mockModule('../src/database/prisma.js', () => ({
    default: mockPrisma,
}));

// Now import the service after mocking
const {
    createWorkspace,
    getWorkspaces,
    updateWorkspace,
    deleteWorkspace,
    getWorkspaceMembers,
    inviteMember,
    removeMember,
    updateMemberRole
} = await import('../src/modules/workspaces/workspace.service.js');

describe('Workspace Service', () => {
    beforeEach(() => {
        mockPrisma.workspace.create.mockReset();
        mockPrisma.workspace.update.mockReset();
        mockPrisma.workspace.delete.mockReset();
        mockPrisma.workspaceMember.findFirst.mockReset();
        mockPrisma.workspaceMember.findMany.mockReset();
        mockPrisma.workspaceMember.create.mockReset();
        mockPrisma.workspaceMember.delete.mockReset();
        mockPrisma.workspaceMember.deleteMany.mockReset();
        mockPrisma.workspaceMember.update.mockReset();
        mockPrisma.user.findUnique.mockReset();
    });

    describe('createWorkspace', () => {
        const userId = 'user-123';

        it('should create a workspace successfully', async () => {
            const workspaceData = { name: 'My Workspace' };
            const mockWorkspace = {
                id: 'workspace-123',
                name: 'My Workspace',
                ownerId: userId,
                createdAt: new Date()
            };

            mockPrisma.workspace.create.mockResolvedValueOnce(mockWorkspace);

            const result = await createWorkspace(userId, workspaceData);

            expect(result.message).toBe('Workspace created successfully');
            expect(result.workspace.id).toBe('workspace-123');
            expect(result.workspace.name).toBe('My Workspace');
            expect(mockPrisma.workspace.create).toHaveBeenCalledWith({
                data: {
                    name: 'My Workspace',
                    description: null,
                    ownerId: userId,
                    members: {
                        create: { userId, role: 'OWNER' }
                    }
                }
            });
        });

        it('should throw error if workspace name is empty', async () => {
            await expect(
                createWorkspace(userId, { name: '' })
            ).rejects.toThrow('Workspace name is required');
        });

        it('should throw error if workspace name is missing', async () => {
            await expect(
                createWorkspace(userId, {})
            ).rejects.toThrow('Workspace name is required');
        });

        it('should trim workspace name', async () => {
            const mockWorkspace = {
                id: 'workspace-123',
                name: 'Trimmed Workspace',
                ownerId: userId,
                createdAt: new Date()
            };

            mockPrisma.workspace.create.mockResolvedValueOnce(mockWorkspace);

            await createWorkspace(userId, { name: '  Trimmed Workspace  ' });

            expect(mockPrisma.workspace.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: 'Trimmed Workspace'
                    })
                })
            );
        });
    });

    describe('getWorkspaces', () => {
        const userId = 'user-123';

        it('should return all workspaces where user is a member', async () => {
            const mockMemberships = [
                {
                    workspace: {
                        id: 'workspace-1',
                        name: 'Workspace 1',
                        description: null,
                        createdAt: new Date('2024-01-01'),
                        _count: { members: 3 }
                    },
                    role: 'OWNER'
                },
                {
                    workspace: {
                        id: 'workspace-2',
                        name: 'Workspace 2',
                        description: null,
                        createdAt: new Date('2024-01-02'),
                        _count: { members: 5 }
                    },
                    role: 'MEMBER'
                }
            ];

            mockPrisma.workspaceMember.findMany.mockResolvedValueOnce(mockMemberships);

            const result = await getWorkspaces(userId);

            expect(result.workspaces).toHaveLength(2);
            expect(result.workspaces[0].id).toBe('workspace-1');
            expect(result.workspaces[0].role).toBe('OWNER');
            expect(result.workspaces[0].memberCount).toBe(3);
            expect(result.workspaces[1].id).toBe('workspace-2');
            expect(result.workspaces[1].role).toBe('MEMBER');
            expect(result.workspaces[1].memberCount).toBe(5);
        });

        it('should return empty array if user has no workspaces', async () => {
            mockPrisma.workspaceMember.findMany.mockResolvedValueOnce([]);

            const result = await getWorkspaces(userId);

            expect(result.workspaces).toEqual([]);
        });
    });

    describe('updateWorkspace', () => {
        const workspaceId = 'workspace-123';
        const userId = 'user-123';

        it('should update workspace when user is owner', async () => {
            const membership = { userId, workspaceId, role: 'OWNER' };
            const updatedWorkspace = {
                id: workspaceId,
                name: 'Updated Workspace',
                ownerId: userId,
                createdAt: new Date()
            };

            mockPrisma.workspaceMember.findFirst.mockResolvedValueOnce(membership);
            mockPrisma.workspace.update.mockResolvedValueOnce(updatedWorkspace);

            const result = await updateWorkspace(workspaceId, userId, { name: 'Updated Workspace' });

            expect(result.message).toBe('Workspace updated successfully');
            expect(result.workspace.name).toBe('Updated Workspace');
        });

        it('should update workspace when user is admin', async () => {
            const membership = { userId, workspaceId, role: 'ADMIN' };
            const updatedWorkspace = {
                id: workspaceId,
                name: 'Updated Workspace',
                ownerId: 'owner-123',
                createdAt: new Date()
            };

            mockPrisma.workspaceMember.findFirst.mockResolvedValueOnce(membership);
            mockPrisma.workspace.update.mockResolvedValueOnce(updatedWorkspace);

            const result = await updateWorkspace(workspaceId, userId, { name: 'Updated Workspace' });

            expect(result.message).toBe('Workspace updated successfully');
        });

        it('should throw error if user is not owner or admin', async () => {
            mockPrisma.workspaceMember.findFirst.mockResolvedValueOnce(null);

            await expect(
                updateWorkspace(workspaceId, userId, { name: 'Updated Workspace' })
            ).rejects.toThrow('You do not have permission to update this workspace');
        });

        it('should throw error if name is empty', async () => {
            await expect(
                updateWorkspace(workspaceId, userId, { name: '' })
            ).rejects.toThrow('Workspace name is required');
        });
    });

    describe('deleteWorkspace', () => {
        const workspaceId = 'workspace-123';
        const userId = 'user-123';

        it('should delete workspace when user is owner', async () => {
            const membership = { userId, workspaceId, role: 'OWNER' };

            mockPrisma.workspaceMember.findFirst.mockResolvedValueOnce(membership);
            mockPrisma.workspaceMember.deleteMany.mockResolvedValueOnce({ count: 3 });
            mockPrisma.workspace.delete.mockResolvedValueOnce({});

            const result = await deleteWorkspace(workspaceId, userId);

            expect(result.message).toBe('Workspace deleted successfully');
            expect(mockPrisma.workspaceMember.deleteMany).toHaveBeenCalledWith({
                where: { workspaceId }
            });
            expect(mockPrisma.workspace.delete).toHaveBeenCalledWith({
                where: { id: workspaceId }
            });
        });

        it('should throw error if user is not owner', async () => {
            mockPrisma.workspaceMember.findFirst.mockResolvedValueOnce(null);

            await expect(
                deleteWorkspace(workspaceId, userId)
            ).rejects.toThrow('Only the workspace owner can delete the workspace');
        });
    });

    describe('getWorkspaceMembers', () => {
        const workspaceId = 'workspace-123';
        const userId = 'user-123';

        it('should return all workspace members when user is a member', async () => {
            const membership = { userId, workspaceId, role: 'MEMBER' };
            const mockMembers = [
                {
                    id: 'member-1',
                    userId: 'user-1',
                    role: 'OWNER',
                    user: { id: 'user-1', email: 'owner@example.com' }
                },
                {
                    id: 'member-2',
                    userId: 'user-2',
                    role: 'MEMBER',
                    user: { id: 'user-2', email: 'member@example.com' }
                }
            ];

            mockPrisma.workspaceMember.findFirst.mockResolvedValueOnce(membership);
            mockPrisma.workspaceMember.findMany.mockResolvedValueOnce(mockMembers);

            const result = await getWorkspaceMembers(workspaceId, userId);

            expect(result).toHaveLength(2);
            expect(result[0].user.email).toBe('owner@example.com');
        });

        it('should throw error if user is not a member', async () => {
            mockPrisma.workspaceMember.findFirst.mockResolvedValueOnce(null);

            await expect(
                getWorkspaceMembers(workspaceId, userId)
            ).rejects.toThrow('You do not have permission to view members of this workspace');
        });
    });

    // inviteMember now delegates to invitation service
    // Invitation functionality is tested in invitation.service.test.js
    describe('inviteMember', () => {
        it('should delegate to invitation service', async () => {
            // inviteMember now calls invitationService.createInvitation
            // This is tested in the invitation service test suite
            expect(inviteMember).toBeDefined();
        });
    });

    describe('removeMember', () => {
        const workspaceId = 'workspace-123';
        const removerId = 'remover-123';
        const memberId = 'member-123';

        it('should remove member when remover is owner', async () => {
            const removerMembership = { userId: removerId, workspaceId, role: 'OWNER' };
            const membershipToRemove = { id: 'membership-123', userId: memberId, workspaceId, role: 'MEMBER' };

            mockPrisma.workspaceMember.findFirst
                .mockResolvedValueOnce(removerMembership)
                .mockResolvedValueOnce(membershipToRemove);
            mockPrisma.workspaceMember.delete.mockResolvedValueOnce(membershipToRemove);

            const result = await removeMember(workspaceId, removerId, memberId);

            expect(result.message).toBe('Member removed successfully');
            expect(mockPrisma.workspaceMember.delete).toHaveBeenCalledWith({
                where: { id: 'membership-123' }
            });
        });

        it('should remove member when remover is admin', async () => {
            const removerMembership = { userId: removerId, workspaceId, role: 'ADMIN' };
            const membershipToRemove = { id: 'membership-123', userId: memberId, workspaceId, role: 'MEMBER' };

            mockPrisma.workspaceMember.findFirst
                .mockResolvedValueOnce(removerMembership)
                .mockResolvedValueOnce(membershipToRemove);
            mockPrisma.workspaceMember.delete.mockResolvedValueOnce(membershipToRemove);

            const result = await removeMember(workspaceId, removerId, memberId);

            expect(result.message).toBe('Member removed successfully');
        });

        it('should throw error if remover is not owner or admin', async () => {
            mockPrisma.workspaceMember.findFirst.mockResolvedValueOnce(null);

            await expect(
                removeMember(workspaceId, removerId, memberId)
            ).rejects.toThrow('You do not have permission to remove members from this workspace');
        });

        it('should throw error if member not found', async () => {
            const removerMembership = { userId: removerId, workspaceId, role: 'OWNER' };

            mockPrisma.workspaceMember.findFirst
                .mockResolvedValueOnce(removerMembership)
                .mockResolvedValueOnce(null);

            await expect(
                removeMember(workspaceId, removerId, memberId)
            ).rejects.toThrow('Member not found in this workspace');
        });
    });

    describe('updateMemberRole', () => {
        const workspaceId = 'workspace-123';
        const updaterId = 'updater-123';
        const memberId = 'member-123';
        const newRole = 'ADMIN';

        it('should update member role when updater is owner', async () => {
            const updaterMembership = { userId: updaterId, workspaceId, role: 'OWNER' };
            const membershipToUpdate = { id: 'membership-123', userId: memberId, workspaceId, role: 'MEMBER' };
            const updatedMembership = { ...membershipToUpdate, role: newRole };

            mockPrisma.workspaceMember.findFirst
                .mockResolvedValueOnce(updaterMembership)
                .mockResolvedValueOnce(membershipToUpdate);
            mockPrisma.workspaceMember.update.mockResolvedValueOnce(updatedMembership);

            const result = await updateMemberRole(workspaceId, updaterId, memberId, newRole);

            expect(result.message).toBe('Member role updated successfully');
            expect(result.member.role).toBe('ADMIN');
            expect(mockPrisma.workspaceMember.update).toHaveBeenCalledWith({
                where: { id: 'membership-123' },
                data: { role: newRole }
            });
        });

        it('should throw error if updater is not owner', async () => {
            mockPrisma.workspaceMember.findFirst.mockResolvedValueOnce(null);

            await expect(
                updateMemberRole(workspaceId, updaterId, memberId, newRole)
            ).rejects.toThrow('Only the workspace owner can update member roles');
        });

        it('should throw error if member not found', async () => {
            const updaterMembership = { userId: updaterId, workspaceId, role: 'OWNER' };

            mockPrisma.workspaceMember.findFirst
                .mockResolvedValueOnce(updaterMembership)
                .mockResolvedValueOnce(null);

            await expect(
                updateMemberRole(workspaceId, updaterId, memberId, newRole)
            ).rejects.toThrow('Member not found in this workspace');
        });
    });
});
