import request from "supertest";
import app from "../src/app";

describe("Administrative User-Book Summary Tests", () => {
  const adminHeader = { "x-user-email": "admin@dummy-library.com" };
  const regularUserHeader = { "x-user-email": "user@example.com" };

  describe("User Book Summary", () => {
    it("should retrieve user-wise book transaction summary", async () => {
      const res = await request(app).get("/admin/book/users").set(adminHeader);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();

      const userEmails = Object.keys(res.body);
      expect(userEmails.length).toBeGreaterThan(0);

      userEmails.forEach((email) => {
        const transactions = res.body[email];
        expect(Array.isArray(transactions)).toBe(true);
        expect(transactions.length).toBeGreaterThan(0);
      });
    });

    it("should return valid structure for each user transaction entry", async () => {
      const res = await request(app).get("/admin/book/users").set(adminHeader);

      const userEntries = Object.values(res.body) as any[][];

      userEntries.forEach((records) => {
        records.forEach((entry) => {
          expect(entry).toHaveProperty("bookId");
          expect(entry).toHaveProperty("title");
          expect(entry).toHaveProperty("authors");
          expect(Array.isArray(entry.authors)).toBe(true);
          expect(entry).toHaveProperty("genres");
          expect(Array.isArray(entry.genres)).toBe(true);
          expect(entry).toHaveProperty("type");
          expect(["BORROW", "BUY"]).toContain(entry.type);
          expect(entry).toHaveProperty("quantity");
          expect(entry.quantity).toBeGreaterThan(0);
        });
      });
    });

    it("should deny access to non-admin users", async () => {
      const res = await request(app)
        .get("/admin/book/users")
        .set(regularUserHeader);

      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
    });

    it("should deny access when user email is missing", async () => {
      const res = await request(app).get("/admin/book/users");

      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("Book Activity Logs", () => {
    it("should fetch all activity logs", async () => {
      const res = await request(app)
        .get("/admin/book/logs")
        .set(adminHeader);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((log: any) => {
        expect(log).toHaveProperty("id");
        expect(log).toHaveProperty("userEmail");
        expect(log).toHaveProperty("actionType");
        expect(log).toHaveProperty("createdAt");
        expect(log).toHaveProperty("book");
        expect(log.book).toHaveProperty("title");
      });
    });

    it("should filter activity logs by action type", async () => {
      const res = await request(app)
        .get("/admin/book/logs?type=BORROW")
        .set(adminHeader);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((log: any) => {
        expect(log.actionType).toBe("BORROW");
      });
    });

    it("should handle invalid action type filter", async () => {
      const res = await request(app)
        .get("/admin/book/logs?type=INVALID_TYPE")
        .set(adminHeader);

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
      expect(res.body.error).toContain("Invalid action type provided");
    });

    it("should filter activity logs by book ID", async () => {
      // First get a book ID from the user summary
      const summaryRes = await request(app)
        .get("/admin/book/users")
        .set(adminHeader);
      
      const firstUser = Object.keys(summaryRes.body)[0];
      const firstBook = summaryRes.body[firstUser][0];
      
      const res = await request(app)
        .get(`/admin/book/logs?bookId=${firstBook.bookId}`)
        .set(adminHeader);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((log: any) => {
        expect(log.bookId).toBe(firstBook.bookId);
      });
    });
  });
});
