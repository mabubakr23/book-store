import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import app from "../src/app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Transaction Flow Tests", () => {
  const memberEmail = "member@example.com";
  let availableBookId: string;
  let unavailableBookId: string;

  beforeAll(async () => {
    // Clean old test actions first
    await prisma.bookAction.deleteMany({
      where: {
        book: {
          title: {
            startsWith: "Sample",
          },
        },
      },
    });

    // Clean test books
    await prisma.book.deleteMany({
      where: {
        title: {
          startsWith: "Sample",
        },
      },
    });

    // Add a book with available copies
    const available = await prisma.book.create({
      data: {
        title: "Sample Available Book",
        authorList: ["Author A"],
        genreList: ["Fiction"],
        sellPrice: 30,
        stockPrice: 20,
        borrowPrice: 10,
        publishedYear: 2021,
        pageCount: 200,
        publisher: "Sample House",
        isbn: uuidv4(),
        currentCopies: 2,
        initialStock: 2,
      },
    });

    // Add a book with zero copies
    const unavailable = await prisma.book.create({
      data: {
        title: "Sample Unavailable Book",
        authorList: ["Author B"],
        genreList: ["Fiction"],
        sellPrice: 30,
        stockPrice: 20,
        borrowPrice: 10,
        publishedYear: 2021,
        pageCount: 200,
        publisher: "Sample House",
        isbn: uuidv4(),
        currentCopies: 0,
        initialStock: 0,
      },
    });

    availableBookId = available.id;
    unavailableBookId = unavailable.id;
  });

  it("should let a user borrow a book successfully", async () => {
    const res = await request(app)
      .post(`/transactions/borrow/${availableBookId}`)
      .set("x-user-email", memberEmail);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Book borrowed successfully");
  });

  it("should allow the user to return the borrowed book", async () => {
    const res = await request(app)
      .post(`/transactions/return/${availableBookId}`)
      .set("x-user-email", memberEmail);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Book returned successfully");
  });

  it("should not allow borrowing if the book is out of stock", async () => {
    const res = await request(app)
      .post(`/transactions/borrow/${unavailableBookId}`)
      .set("x-user-email", memberEmail);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No available copies");
  });

  afterAll(async () => {
    await prisma.bookAction.deleteMany({
      where: {
        book: {
          title: {
            startsWith: "Sample",
          },
        },
      },
    });

    await prisma.book.deleteMany({
      where: {
        title: {
          startsWith: "Sample",
        },
      },
    });

    await prisma.$disconnect();
  });
});
