import express from "express";
import {
  getBooks,
  getBookById,
  bookLogsHandler,
  userLibrarySummaryHandler,
} from "../../controllers/admin.controller";

const router = express.Router();

// fetch all books
router.get("/", async (req, res) => {
  try {
    await getBooks(req, res);
  } catch (error) {
    res.status(500).send({
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while searching the books.",
    });
  }
});

// fetch books logs
router.get("/logs", async (req, res) => {
  try {
    await bookLogsHandler(req, res);
  } catch (error) {
    res.status(500).send({
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching the details.",
    });
  }
});

// fetch users library summary
router.get("/users", async (req, res) => {
  try {
    await userLibrarySummaryHandler(req, res);
  } catch (error) {
    res.status(500).send({
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching the details.",
    });
  }
});

// fetch books by id
router.get("/:id", async (req, res) => {
  try {
    await getBookById(req, res);
  } catch (error) {
    res
      .status(500)
      .send({ error: "An error occurred while getting the book detail." });
  }
});

export default router; 