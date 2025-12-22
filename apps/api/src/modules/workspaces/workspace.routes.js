import { Router } from "express";
import * as WorkspaceController from "./workspace.controller.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { validate } from "../../shared/middleware/validation.middleware.js";
import {
    createWorkspaceValidation,
    updateWorkspaceValidation,
    workspaceIdValidation,
    inviteMemberValidation,
    removeMemberValidation,
    updateMemberRoleValidation
} from "./workspace.validation.js";

const router = Router();

// All workspace routes require authentication

// Route to create a new workspace
router.post("/", authMiddleware, createWorkspaceValidation, validate, WorkspaceController.createWorkspace);

// Route to get all workspaces for the authenticated user
router.get("/", authMiddleware, WorkspaceController.getWorkspaces);

// Route to get single workspace by ID
router.get("/:workspaceId", authMiddleware, workspaceIdValidation, validate, WorkspaceController.getWorkspace);

// Route to update workspace name
router.put("/:workspaceId", authMiddleware, updateWorkspaceValidation, validate, WorkspaceController.updateWorkspace);

// Route to delete workspace
router.delete("/:workspaceId", authMiddleware, workspaceIdValidation, validate, WorkspaceController.deleteWorkspace);

// Route to get workspace members
router.get("/:workspaceId/members", authMiddleware, workspaceIdValidation, validate, WorkspaceController.getWorkspaceMembers);

// Route to get workspace invitations
router.get("/:workspaceId/invitations", authMiddleware, workspaceIdValidation, validate, WorkspaceController.getWorkspaceInvitations);

// Route to invite member to workspace
router.post("/:workspaceId/members", authMiddleware, inviteMemberValidation, validate, WorkspaceController.inviteMember);

// Route to remove member from workspace
router.delete("/:workspaceId/members/:memberId", authMiddleware, removeMemberValidation, validate, WorkspaceController.removeMember);

// Route to update member role
router.put("/:workspaceId/members/:memberId/role", authMiddleware, updateMemberRoleValidation, validate, WorkspaceController.updateMemberRole);

export default router;