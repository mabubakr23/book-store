import { ActionType } from "@prisma/client";

export type BookActionWithTitle = {
  id: string;
  actionType: ActionType;
  createdAt: Date;
  bookId: string;
  userEmail: string;
  book: {
    title: string;
  };
};
