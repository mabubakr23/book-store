import express from "express";
import dotenv from "dotenv";
dotenv.config();
import adminRoutes from "./routes/admin";
import transactionRoutes from "./routes/transaction.routes";

const app = express();
app.use(express.json());

app.use("/admin", adminRoutes);

app.use("/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.send("App is running ");
});

export default app;
