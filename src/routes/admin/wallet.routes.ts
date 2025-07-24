import express from "express";
import {
  getWallet,
  getTransactions,
} from "../../controllers/admin.controller";

const router = express.Router();

// fetch wallet balance
router.get("/balance", async (req, res) => {
  try {
    await getWallet(req, res);
  } catch (error) {
    res
      .status(500)
      .send({ error: "An error occurred while fetching the wallet." });
  }
});

//fetch transactions history
router.get("/transactions", async (req, res) => {
  try {
    await getTransactions(req, res);
  } catch (error) {
    res.status(500).send({
      error: "An error occurred while fetching the transactions history.",
    });
  }
});

export default router; 