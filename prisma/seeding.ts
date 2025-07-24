import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, "..", "books.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const books = JSON.parse(rawData);

  await prisma.wallet.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      balance: 100.0,
      isMilestoneSent: false,
    },
  });

  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: {
        title: book.title,
        authorList: book.authors,
        genreList: book.genres,
        sellPrice: book.prices.sell,
        stockPrice: book.prices.stock,
        borrowPrice: book.prices.borrow,
        publishedYear: book.year,
        pageCount: book.pages,
        publisher: book.publisher,
        isbn: book.isbn,
        currentCopies: book.copies,
        initialStock: book.copies,
      },
    });
  }

  console.log("Data seeding is done.");
}

main()
  .catch((e) => {
    console.error("There is an error while seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
