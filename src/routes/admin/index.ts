import express from "express";
import bookRoutes from "./book.routes";
import walletRoutes from "./wallet.routes";
import healthRoutes from "./health.routes";
import { adminCheck } from "../../middlewares/adminAuth";

const router = express.Router();

// Apply admin authentication middleware to all admin routes
router.use(adminCheck);

router.use("/book", bookRoutes);
router.use("/wallet", walletRoutes);
router.use("/health", healthRoutes);

export default router; 