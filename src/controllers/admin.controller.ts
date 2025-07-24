import { Request, Response } from "express";
import { searchBooks, getBookByIdService } from "../services/bookFetch.service";
import {
  fetchLedgerActivity,
  retrieveAccountBalance,
} from "../services/wallet.service";
import {
  summarizeUserHoldings,
  fetchBookActivityLogs,
} from "../services/activity.service";
import { redis } from "../services/redis.service";
import { emailQueue, restockQueue } from "../services/queue.service";

export const getBooks = async (req: Request, res: Response) => {
  const search = req.query.search?.toString().trim().toLowerCase() || "";
  const limit = req.query.limit ? parseInt(req.query.limit.toString()) : undefined;
  const page = req.query.page ? parseInt(req.query.page.toString()) : undefined;
  const getAll = req.query.getAll === 'true';
  const genres = req.query.genres?.toString().split(',').map(g => g.trim()) || [];

  try {
    const result = await searchBooks(search, { limit, page, getAll, genres });
    res.json({
      books: result.books,
      pagination: {
        total: result.total,
        page: page || 1,
        limit: limit || 50,
        totalPages: Math.ceil(result.total / (limit || 50))
      }
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      error: "Search failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getBookById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const book = await getBookByIdService(id);

    if (!book) return res.status(404).json({ error: "Book not found" });

    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const getWallet = async (req: Request, res: Response) => {
  try {
    const wallet = await retrieveAccountBalance();

    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { type, reason } = req.query;
    const logs = await fetchLedgerActivity(
      type?.toString(),
      reason?.toString()
    );

    if (!logs) {
      return res
        .status(404)
        .json({ error: "Transactions not found not found" });
    }
    res.json({ movements: logs });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const bookLogsHandler = async (req: Request, res: Response) => {
  try {
    const { bookId, type } = req.query;
    const actions = await fetchBookActivityLogs(
      bookId?.toString(),
      type?.toString()
    );
    res.json(actions);
  } catch (error) {
    console.error("Activity fetch error:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

export const userLibrarySummaryHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const summary = await summarizeUserHoldings();
    res.json(summary);
  } catch (err) {
    console.error("Summary generation error:", err);
    res.status(500).json({ error: "Unable to generate user library summary" });
  }
};

export const checkRedisHealth = async (req: Request, res: Response) => {
  try {
    // Test Redis connection
    await redis.ping();
    
    // Test Redis write
    await redis.set('test_key', 'test_value');
    const testValue = await redis.get('test_key');
    await redis.del('test_key');

    res.json({
      status: 'healthy',
      message: 'Redis connection is working',
      test: {
        ping: 'PONG',
        write: testValue === 'test_value'
      }
    });
  } catch (error) {
    console.error('Redis health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: 'Redis connection failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const checkQueueStatus = async (req: Request, res: Response) => {
  try {
    const [emailJobs, restockJobs] = await Promise.all([
      emailQueue.getJobCounts(),
      restockQueue.getJobCounts()
    ]);

    const emailQueueStatus = await emailQueue.getJobCounts();
    const restockQueueStatus = await restockQueue.getJobCounts();

    res.json({
      emailQueue: {
        waiting: emailQueueStatus.waiting,
        active: emailQueueStatus.active,
        completed: emailQueueStatus.completed,
        failed: emailQueueStatus.failed,
        delayed: emailQueueStatus.delayed
      },
      restockQueue: {
        waiting: restockQueueStatus.waiting,
        active: restockQueueStatus.active,
        completed: restockQueueStatus.completed,
        failed: restockQueueStatus.failed,
        delayed: restockQueueStatus.delayed
      }
    });
  } catch (error) {
    console.error("Queue status check error:", error);
    res.status(500).json({
      error: "Failed to check queue status",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
