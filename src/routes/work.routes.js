import express from "express";
import {
    createWork,
    getWorks,
    getWorkById,
    updateWork,
    deleteWork,
    getDashboardSummary,
    getReports,
} from "../controllers/work.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect); // All work routes protect

// Note: Ensure specific routes (like /summary/dashboard) are placed BEFORE parameterized routes like /:id
router.get("/summary/dashboard", getDashboardSummary);
router.get("/summary/reports", getReports);

router.route("/")
    .post(createWork)
    .get(getWorks);

router.route("/:id")
    .get(getWorkById)
    .put(updateWork)
    .delete(deleteWork);

export default router;
