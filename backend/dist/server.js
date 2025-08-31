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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = __importDefault(require("pg"));
const userRoutes_js_1 = __importDefault(require("./routes/userRoutes.js"));
const orderRoutes_js_1 = __importDefault(require("./routes/orderRoutes.js"));
const { Pool } = pg_1.default;
const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "alwin",
    database: "mydb",
});
const PORT = 5000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/user", userRoutes_js_1.default);
app.use("/order", orderRoutes_js_1.default);
const queries = {
    "1m": "trades_1m",
    "5m": "trades_5m",
    "10m": "trades_10m",
    "30m": "trades_30m",
};
app.get("/candles", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { interval, symbol } = req.query;
    const queryInterval = queries[interval];
    try {
        const response = yield pool.query(`SELECT timestamp,symbol,open_price,close_price,high_price,low_price FROM ${queryInterval} WHERE symbol=$1 ORDER BY timestamp DESC LIMIT 100`, [symbol.toUpperCase()]);
        res.json(response.rows.reverse);
    }
    catch (error) {
        console.log(error);
    }
}));
app.listen(PORT, () => {
    console.log(`Server listening on Port:${PORT}`);
});
