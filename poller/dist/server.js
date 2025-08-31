"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const pg_1 = __importDefault(require("pg"));
const { Pool } = pg_1.default;
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
const redis = new ioredis_1.default();
const updates = [];
const query = `INSERT INTO trades (time,price,quantity,is_buyer_maker,symbol) VALUES (to_timestamp($1/1000.0),$2,$3,$4,$5)`;
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    const batch = updates.splice(0, updates.length);
    console.log(batch.length);
    for (const update of batch) {
        const { trade } = update;
        yield pool.query(query, [trade.T, trade.p, trade.q, trade.m, trade.s]);
    }
}), 10000);
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
            const updatedTrade = Object.assign(Object.assign({}, trade), { ask, bid, symbol });
            updates.push({ trade: updatedTrade });
            redis.publish("trades", JSON.stringify(updatedTrade));
        }
    }
    catch (error) {
        console.log(error);
    }
};
binanceWs.onclose = () => {
    console.log("Binance Disconnected");
};
