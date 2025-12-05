import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Mount route modules
app.use("/auth", authRoutes);

export default app;