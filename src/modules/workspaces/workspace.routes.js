import { Router } from "express";
import * as WorkspaceController from "./workspace.controller.js";
import { authMiddleware } from "../auth/auth.middleware.js";

const router = Router();

// All workspace routes require authentication

// Route to create a new workspace
router.post("/", authMiddleware, WorkspaceController.createWorkspace);

// Route to get all workspaces for the authenticated user
router.get("/", authMiddleware, WorkspaceController.getWorkspaces);

// Route to update workspace name
router.put("/:workspaceId", authMiddleware, WorkspaceController.updateWorkspace);

// Route to delete workspace
router.delete("/:workspaceId", authMiddleware, WorkspaceController.deleteWorkspace);

// Route to invite member to workspace
router.post("/:workspaceId/members", authMiddleware, WorkspaceController.inviteMember);

router.delete("/:workspaceId/members/:memberId", authMiddleware, WorkspaceController.removeMember);

router.put("/:workspaceId/members/:memberId/role", authMiddleware, WorkspaceController.updateMemberRole);

export default router;