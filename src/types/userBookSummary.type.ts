export type UserBookSummary = Record<
  string,
  Array<{
    type: "BORROW" | "BUY";
    quantity: number;
    bookId: string;
    title: string;
    authors: string[];
    genres: string[];
  }>
>;
