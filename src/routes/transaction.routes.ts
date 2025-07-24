import express from "express";
import {
  borrowBookController,
  returnBookController,
  buyBookController,
} from "../controllers/transaction.controller";

const apiRouter = express.Router();

//borrow book
apiRouter.post("/borrow/:itemId", async (req, res) => {
  try {
    await borrowBookController(req, res);
  } catch (err) {
    res.status(500).send({
      error: "Server error occurred during book loan process.",
    });
  }
});

//return book
apiRouter.post("/return/:itemId", async (req, res) => {
  try {
    await returnBookController(req, res);
  } catch (err) {
    res.status(500).send({
      error: "Server error occurred during book return process.",
    });
  }
});

//buy book
apiRouter.post("/purchase/:itemId", async (req, res) => {
  try {
    await buyBookController(req, res);
  } catch (err) {
    res.status(500).send({
      error: "Server error occurred during book purchase process.",
    });
  }
});

export default apiRouter;
