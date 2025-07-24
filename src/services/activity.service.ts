import { PrismaClient, ActionType } from "@prisma/client";
import { BookActionWithTitle, UserBookSummary } from "../types";

const dbClient = new PrismaClient();

export const fetchBookActivityLogs = async (
  bookId?: string,
  type?: string
): Promise<BookActionWithTitle[]> => {
  let validatedType: ActionType | undefined;

  if (type) {
    const upper = type.toUpperCase();
    if (Object.values(ActionType).includes(upper as ActionType)) {
      validatedType = upper as ActionType;
    } else {
      throw new Error(
        `Invalid action type provided. please use [ ${Object.values(
          ActionType
        )}]`
      );
    }
  }

  return dbClient.bookAction.findMany({
    where: {
      ...(bookId ? { bookId } : {}),
      ...(validatedType ? { actionType: validatedType } : {}),
    },
    include: {
      book: {
        select: { title: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const summarizeUserHoldings = async (): Promise<UserBookSummary> => {
  const userInventory = await dbClient.userBook.findMany({
    include: {
      book: true,
    },
  });

  return userInventory.reduce((summary, entry) => {
    const email = entry.userEmail;
    if (!summary[email]) summary[email] = [];

    summary[email].push({
      type: entry.actionType,
      quantity: entry.quantity,
      bookId: entry.book.id,
      title: entry.book.title,
      authors: entry.book.authorList,
      genres: entry.book.genreList,
    });

    return summary;
  }, {} as Record<string, any[]>);
};
