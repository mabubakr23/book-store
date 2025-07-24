import { PrismaClient, ActionType } from "@prisma/client";
import { evaluateAndReplenishStock } from "../helper/evaluateAndRestck.helper";
import { initiateDelayedReminder } from "../helper/delayReminder.helper";
import { ServiceResponse } from "../types";

const prisma = new PrismaClient();

export const handleBorrowBook = async (
  userEmail: string,
  bookId: string
): Promise<ServiceResponse> => {
  try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return { status: 404, body: { error: "Book not found" } };
    if (book.currentCopies < 1)
      return { status: 400, body: { error: "No available copies" } };

    const existing = await prisma.userBook.findFirst({
      where: { userEmail, bookId, actionType: ActionType.BORROW },
    });
    if (existing) return { status: 400, body: { error: "Already borrowed" } };

    const totalBorrowed = await prisma.userBook.count({ where: { userEmail,actionType: ActionType.BORROW } });
    if (totalBorrowed >= 3)
      return { status: 400, body: { error: "Limit 3 books" } };

    await prisma.$transaction([
      prisma.book.update({
        where: { id: bookId },
        data: { currentCopies: { decrement: 1 } },
      }),
      prisma.bookAction.create({
        data: { userEmail, bookId, actionType: ActionType.BORROW },
      }),
      prisma.userBook.create({
        data: { userEmail, bookId, actionType: ActionType.BORROW, quantity: 1 },
      }),
      prisma.wallet.update({
        where: { id: 1 },
        data: {
          balance: { increment: book.borrowPrice },
          transactions: {
            create: {
              type: "CREDIT",
              amount: book.borrowPrice,
              reason: `User borrowed ${book.title}`,
            },
          },
        },
      }),
    ]);

    await evaluateAndReplenishStock(bookId);
    await initiateDelayedReminder(userEmail, bookId);

    return { status: 200, body: { message: "Book borrowed successfully" } };
  } catch (err) {
    console.error(err);
    return { status: 500, body: { error: "Error during borrowing" } };
  }
};

export const handleReturnBook = async (
  userEmail: string,
  bookId: string
): Promise<ServiceResponse> => {
  try {
    const userBook = await prisma.userBook.findFirst({
      where: { userEmail, bookId, actionType: ActionType.BORROW },
    });
    if (!userBook) return { status: 404, body: { error: "Book not borrowed" } };

    await prisma.$transaction([
      prisma.book.update({
        where: { id: bookId },
        data: { currentCopies: { increment: 1 } },
      }),
      prisma.userBook.delete({ where: { id: userBook.id } }),
      prisma.bookAction.create({
        data: { userEmail, bookId, actionType: ActionType.RETURN },
      }),
    ]);

    return { status: 200, body: { message: "Book returned successfully" } };
  } catch (err) {
    console.error(err);
    return { status: 500, body: { error: "Error during return" } };
  }
};

export const handleBuyBook = async (
  userEmail: string,
  bookId: string
): Promise<ServiceResponse> => {
  try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });

    if (!book) return { status: 404, body: { error: "Book not found" } };
    if (book.currentCopies < 1)
      return { status: 400, body: { error: "Out of stock" } };

    const userBooks = await prisma.userBook.findMany({
      where: { userEmail, actionType: ActionType.BUY },
    });

    const sameBook = userBooks.find((b) => b.bookId == bookId);
    const totalBought = userBooks.reduce((acc, b) => acc + b.quantity, 0);

    if (sameBook && sameBook.quantity >= 2)
      return { status: 400, body: { error: "Max 2 copies per book" } };
    if (totalBought >= 10)
      return { status: 400, body: { error: "Max 10 total books" } };

    const txs = [
      prisma.book.update({
        where: { id: bookId },
        data: { currentCopies: { decrement: 1 } },
      }),
      prisma.bookAction.create({
        data: { userEmail, bookId, actionType: ActionType.BUY },
      }),
      prisma.wallet.update({
        where: { id: 1 },
        data: {
          balance: { increment: book.sellPrice },
          transactions: {
            create: {
              type: "CREDIT",
              amount: book.sellPrice,
              reason: `User bought "${book.title}"`,
            },
          },
        },
      }),
    ];

    if (sameBook) {
      txs.push(
        prisma.userBook.update({
          where: { id: sameBook.id },
          data: { quantity: { increment: 1 } },
        })
      );
    } else {
      txs.push(
        prisma.userBook.create({
          data: { userEmail, bookId, actionType: ActionType.BUY, quantity: 1 },
        })
      );
    }

    await prisma.$transaction(txs);
    await evaluateAndReplenishStock(bookId);

    return { status: 200, body: { message: "Book purchased successfully" } };
  } catch (err) {
    console.error(err);
    return { status: 500, body: { error: "Error during purchase" } };
  }
};
