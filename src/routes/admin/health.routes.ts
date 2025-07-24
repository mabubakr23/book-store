import express from "express";
import {
  checkRedisHealth,
  checkQueueStatus,
} from "../../controllers/admin.controller";

const router = express.Router();

// Redis health check
router.get("/redis", async (req, res) => {
  try {
    await checkRedisHealth(req, res);
  } catch (error) {
    res.status(500).send({
      error: "Redis health check failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Queue status check
router.get("/queues", async (req, res) => {
  try {
    await checkQueueStatus(req, res);
  } catch (error) {
    res.status(500).send({
      error: "Queue status check failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router; 