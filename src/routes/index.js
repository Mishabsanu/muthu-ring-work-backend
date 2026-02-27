import express from "express";
import authRoutes from "./auth.routes.js";
import workRoutes from "./work.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/works", workRoutes);

export default router;
