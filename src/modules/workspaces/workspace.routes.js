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


export default router;