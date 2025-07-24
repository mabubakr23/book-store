import { PrismaClient } from "@prisma/client";
import { sendMail as triggerEmail } from "../common/nodemailer";
import { scheduleLowStockNotification, scheduleRestock } from "../services/queue.service";

const db = new PrismaClient();

/**
 * Automatically notifies staff and handles restocking of a book when only 1 copy remains.
 */
export const evaluateAndReplenishStock = async (resourceId: string) => {
  const resource = await db.book.findUnique({ where: { id: resourceId } });
  if (!resource) return;

  if (resource.currentCopies === 1) {
    console.log(`[NOTIFY] Email sent to: ops@library.org`);
    console.log(`Subject: Reorder Needed - "${resource.title}"`);
    console.log(`Body: Inventory low. Only one copy left.`);

    await triggerEmail(
      "ops@library.org",
      `Replenish Inventory - "${resource.title}"`,
      `Please initiate restocking for "${resource.title}". Only one copy is available.`
    );

    // Schedule low stock notification
    await scheduleLowStockNotification(resource);
    
    // Schedule automatic restock
    await scheduleRestock(resource);
  }
};
