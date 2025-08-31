import Redis from "ioredis";
import pkg from "pg";

const { Pool } = pkg;
const markets = ["btusdt", "ethusdt", "solusdt"];
const streams = markets.map((m) => `${m}@trade`).join("/");
const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "alwin",
  database: "mydb",
});

const binanceWs = new WebSocket(url);
const redis = new Redis();

const updates: any[] = [];

const query = `INSERT INTO trades (time,price,quantity,is_buyer_maker,symbol) VALUES (to_timestamp($1/1000.0),$2,$3,$4,$5)`;

setInterval(async () => {
  const batch = updates.splice(0, updates.length);
  console.log(batch.length);

  for (const update of batch) {
    const { trade } = update;

    await pool.query(query, [trade.T, trade.p, trade.q, trade.m, trade.s]);
  }
}, 10000);

binanceWs.onopen = () => {
  console.log("Binance Connected");
};

binanceWs.onmessage = (event) => {
  const message = JSON.parse(event.data);
  try {
    if (message.stream && message.data) {
      const trade = message.data;
      const price = trade.p;
      const symbol = trade.s;

      const spread = 0.025;
      const ask = price * (1 + 1 / spread);
      const bid = price * (1 - 1 / spread);

      const updatedTrade = { ...trade, ask, bid, symbol };
      updates.push({ trade: updatedTrade });
      redis.publish("trades", JSON.stringify(updatedTrade));
    }
  } catch (error) {
    console.log(error);
  }
};

binanceWs.onclose = () => {
  console.log("Binance Disconnected");
};
