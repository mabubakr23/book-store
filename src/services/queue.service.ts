import Queue from 'bull';
import { PrismaClient } from '@prisma/client';
import { sendMail } from '../common/nodemailer';

const prisma = new PrismaClient();

// Create queues
export const emailQueue = new Queue('email-notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || 'your_redis_password'
  }
});

export const restockQueue = new Queue('book-restock', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || 'your_redis_password'
  }
});

// Process email jobs
emailQueue.process(async (job) => {
  const { to, subject, body } = job.data;
  try {
    await sendMail(to, subject, body);
    console.log(`[EMAIL SENT] To: ${to}, Subject: ${subject}`);
  } catch (error) {
    console.error('[EMAIL ERROR]', error);
    throw error; // This will trigger Bull's retry mechanism
  }
});

// Process restock jobs
restockQueue.process(async (job) => {
  const { bookId, deficit } = job.data;
  try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new Error('Book not found');

    // Update book stock
    await prisma.book.update({
      where: { id: bookId },
      data: {
        currentCopies: { increment: deficit }
      }
    });

    // Create book action log
    await prisma.bookAction.create({
      data: {
        bookId,
        actionType: 'STOCK',
        userEmail: 'auto-restock@library.system'
      }
    });

    // Update wallet
    const replenishmentCost = book.stockPrice * deficit;
    await prisma.wallet.update({
      where: { id: 1 },
      data: {
        balance: { decrement: replenishmentCost },
        transactions: {
          create: {
            type: 'DEBIT',
            amount: replenishmentCost,
            reason: `Auto-restocked "${book.title}" (${deficit} units)`
          }
        }
      }
    });

    console.log(`[RESTOCK COMPLETE] Book: ${book.title}, Added: ${deficit} copies`);
  } catch (error) {
    console.error('[RESTOCK ERROR]', error);
    throw error;
  }
});

// Error handling for queues
emailQueue.on('error', (error) => {
  console.error('[EMAIL QUEUE ERROR]', error);
});

restockQueue.on('error', (error) => {
  console.error('[RESTOCK QUEUE ERROR]', error);
});

// Add jobs to queues
export const scheduleLowStockNotification = async (book: any) => {
  await emailQueue.add(
    'low-stock-notification',
    {
      to: 'ops@library.org',
      subject: `Replenish Inventory - "${book.title}"`,
      body: `Please initiate restocking for "${book.title}". Only one copy is available.`
    },
    {
      delay: 60 * 60 * 1000, // 1 hour delay
      attempts: 3, // Retry 3 times
      backoff: {
        type: 'exponential',
        delay: 1000 // Start with 1 second delay
      }
    }
  );
};

export const scheduleRestock = async (book: any) => {
  const deficit = book.initialStock - book.currentCopies;
  if (deficit > 0) {
    await restockQueue.add(
      'auto-restock',
      { bookId: book.id, deficit },
      {
        delay: 60 * 60 * 1000, // 1 hour delay
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    );
  }
}; 