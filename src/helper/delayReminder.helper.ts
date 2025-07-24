import { PrismaClient } from "@prisma/client";
import { sendMail as dispatchEmail } from "../common/nodemailer";

const dbClient = new PrismaClient();

/**
 * Triggers a reminder email after 3 days if a user hasn't returned a book.
 */
export const initiateDelayedReminder = async (
  userContact: string,
  itemIdentifier: string
): Promise<void> => {
  const reminderDelay = 3 * 24 * 60 * 60 * 1000; // 3 days in ms

  setTimeout(async () => {
    const loanStatus = await dbClient.userBook.findFirst({
      where: {
        userEmail: userContact,
        bookId: itemIdentifier,
      },
    });

    if (loanStatus) {
      const itemDetails = await dbClient.book.findUnique({
        where: { id: itemIdentifier },
      });

      if (itemDetails) {
        await dispatchEmail(
          userContact,
          `Reminder: Return "${itemDetails.title}"`,
          `Hello,\n\nOur records show that you are still in possession of "${itemDetails.title}". Please ensure its return within the borrowing period to avoid any restrictions.\n\nThank you.`
        );

        console.log(`[REMINDER SENT] Email delivered to: ${userContact}`);
      }
    }
  }, reminderDelay);
};
