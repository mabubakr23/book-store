import request from "supertest";
import app from "../src/app";

describe("Finance Endpoint Validations", () => {
  const systemAdmin = "admin@dummy-library.com";
  const regularUser = "user@example.com";

  describe("Wallet Balance Endpoints", () => {
    it("should retrieve current wallet stats", async () => {
      const res = await request(app)
        .get("/admin/wallet/balance")
        .set("x-user-email", systemAdmin);

      expect(res.status).toBe(200);
      expect(res.body.balance).toBeDefined();
      expect(typeof res.body.balance).toBe("string");
      expect(parseFloat(res.body.balance)).toBeGreaterThanOrEqual(0);
    });

    it("should deny access to non-admin users", async () => {
      const res = await request(app)
        .get("/admin/wallet/balance")
        .set("x-user-email", regularUser);

      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
    });

    it("should deny access when user email is missing", async () => {
      const res = await request(app).get("/admin/wallet/balance");

      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("Wallet Transactions Endpoints", () => {
    it("should fetch wallet transaction logs", async () => {
      const res = await request(app)
        .get("/admin/wallet/transactions")
        .set("x-user-email", systemAdmin);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.movements)).toBe(true);
      expect(res.body.movements.length).toBeGreaterThan(0);

      res.body.movements.forEach(
        (entry: {
          id: unknown;
          type: string;
          amount: number;
          reason: string;
          createdAt: string;
          walletId: string;
        }) => {
          expect(entry.id).toBeDefined();
          expect(entry.type).toBeDefined();
          expect(entry.amount).toBeDefined();
          expect(typeof entry.amount).toBe("number");
          expect(entry.reason).toBeDefined();
          expect(entry.createdAt).toBeDefined();
          expect(new Date(entry.createdAt).toString()).not.toBe("Invalid Date");
          expect(entry.walletId).toBeDefined();
        }
      );

      const allowedTypes = ["CREDIT", "DEBIT"];
      res.body.movements.forEach((entry: { type: string }) => {
        expect(allowedTypes).toContain(entry.type);
      });
    });

    it("should filter transactions by type", async () => {
      const type = "CREDIT";
      const res = await request(app)
        .get(`/admin/wallet/transactions?type=${type}`)
        .set("x-user-email", systemAdmin);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.movements)).toBe(true);
      res.body.movements.forEach((entry: { type: string }) => {
        expect(entry.type).toBe(type);
      });
    });

    it("should filter transactions by reason", async () => {
      const searchTerm = "book";
      const res = await request(app)
        .get(`/admin/wallet/transactions?reason=${searchTerm}`)
        .set("x-user-email", systemAdmin);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.movements)).toBe(true);
      res.body.movements.forEach((entry: { reason: string }) => {
        expect(entry.reason.toLowerCase()).toContain(searchTerm.toLowerCase());
      });
    });

    it("should handle invalid transaction type filter", async () => {
      const res = await request(app)
        .get("/admin/wallet/transactions?type=INVALID_TYPE")
        .set("x-user-email", systemAdmin);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.movements)).toBe(true);
      expect(res.body.movements.length).toBe(0);
    });

    it("should deny access to non-admin users", async () => {
      const res = await request(app)
        .get("/admin/wallet/transactions")
        .set("x-user-email", regularUser);

      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
    });

    it("should deny access when user email is missing", async () => {
      const res = await request(app).get("/admin/wallet/transactions");

      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
    });
  });
});
