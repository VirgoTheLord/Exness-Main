import express from "express";
import cors from "cors";
import pkg from "pg";
import userRouter from "./routes/userRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

const { Pool } = pkg;
const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "alwin",
  database: "mydb",
});
const PORT = 5000;
const app = express();
app.use(express.json());
app.use(cors());

app.use("/user", userRouter);
app.use("/order", orderRouter);
const queries: Record<string, string> = {
  "1m": "trades_1m",
  "5m": "trades_5m",
  "10m": "trades_10m",
  "30m": "trades_30m",
};

app.get("/candles", async (req, res) => {
  const { interval, symbol } = (req as any).query;
  const queryInterval = queries[interval];
  try {
    const response = await pool.query(
      `SELECT timestamp,symbol,open_price,close_price,high_price,low_price FROM ${queryInterval} WHERE symbol=$1 ORDER BY timestamp DESC LIMIT 100`,
      [symbol.toUpperCase()]
    );
    res.json(response.rows.reverse());
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on Port:${PORT}`);
});
