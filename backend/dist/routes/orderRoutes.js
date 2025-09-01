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
const ioredis_1 = __importDefault(require("ioredis"));
const data_1 = require("../data");
const db_1 = require("../config/db");
const redis = new ioredis_1.default();
const redisQ = new ioredis_1.default();
const orderRouter = express_1.default.Router();
const latestPrices = {};
const pushNotification = (userId, message) => {
    const payload = JSON.stringify({ userId, message, timestamp: Date.now() });
    redisQ.lpush("order_notifications", payload);
};
redis.subscribe("trades");
redis.on("message", (channel, message) => {
    var _a, _b, _c, _d;
    if (channel !== "trades")
        return;
    const { symbol, bid, ask } = JSON.parse(message);
    latestPrices[symbol.toUpperCase()] = {
        bid: parseFloat(bid),
        ask: parseFloat(ask),
    };
    for (let i = 0; i < data_1.currentOrders.length;) {
        const order = data_1.currentOrders[i];
        const symbol = order.symbol;
        const askPrice = latestPrices[symbol.toUpperCase()].ask;
        const bidPrice = latestPrices[symbol.toUpperCase()].bid;
        const userInMemory = data_1.users.find((u) => u.id === order.id);
        if (!userInMemory) {
            i++;
            continue;
        }
        if (order.type === "long") {
            if (order.stopLoss && bidPrice <= order.stopLoss) {
                userInMemory.balance +=
                    (order.entryPrice - order.stopLoss) * order.quantity +
                        ((_a = order.margin) !== null && _a !== void 0 ? _a : 0);
                pushNotification(order.id, `Long order stopped out at ${order.stopLoss}`);
                data_1.currentOrders.splice(i, 1);
                continue;
            }
            if (order.takeProfit && bidPrice >= order.takeProfit) {
                userInMemory.balance +=
                    (order.takeProfit - order.entryPrice) * order.quantity +
                        ((_b = order.margin) !== null && _b !== void 0 ? _b : 0);
                pushNotification(order.id, `Long order take profit hit at ${order.takeProfit}`);
                data_1.currentOrders.splice(i, 1);
                continue;
            }
            if (order.liquidationPrice !== undefined &&
                bidPrice <= order.liquidationPrice) {
                console.log(`Order Liquidated ${order.type}`);
                pushNotification(order.id, `Long order liquidated at ${bidPrice}`);
                data_1.currentOrders.splice(i, 1);
                continue;
            }
        }
        else if (order.type === "short") {
            if (order.stopLoss && askPrice >= order.stopLoss) {
                userInMemory.balance +=
                    (order.stopLoss - order.entryPrice) * order.quantity +
                        ((_c = order.margin) !== null && _c !== void 0 ? _c : 0);
                pushNotification(order.id, `Long order stopped out at ${order.stopLoss}`);
                data_1.currentOrders.splice(i, 1);
                continue;
            }
            if (order.takeProfit && askPrice <= order.takeProfit) {
                userInMemory.balance +=
                    (order.entryPrice - order.takeProfit) * order.quantity +
                        ((_d = order.margin) !== null && _d !== void 0 ? _d : 0);
                pushNotification(order.id, `Long order take profit hit at ${order.takeProfit}`);
                data_1.currentOrders.splice(i, 1);
                continue;
            }
            if (order.liquidationPrice !== undefined &&
                askPrice >= order.liquidationPrice) {
                console.log(`Order Liquidated ${order.type}`);
                pushNotification(order.id, `Short order liquidated at ${askPrice}`);
                data_1.currentOrders.splice(i, 1);
                continue;
            }
        }
        i++;
    }
});
orderRouter.post("/trade/:type", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { type } = req.params;
    const { leverage, symbol, stopLoss, takeProfit, quantity } = req.body;
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user.id;
    const user = yield db_1.prisma.user.findUnique({
        where: {
            id: id,
        },
    });
    if (!user) {
        return res.json({ message: "Login to trade" });
    }
    const userBalance = user.balance;
    if (type.toLowerCase() === "long") {
        const buyPrice = latestPrices[symbol.toUpperCase()].ask;
        const valuation = buyPrice * quantity;
        const actualLeverage = leverage !== null && leverage !== void 0 ? leverage : 1;
        const margin = valuation / actualLeverage;
        if (stopLoss && stopLoss >= buyPrice) {
            return res
                .status(400)
                .json({ message: "stop loss cant be greater than the actual price" });
        }
        if (takeProfit && takeProfit <= buyPrice) {
            return res
                .status(400)
                .json({ message: "take profit cant be less than the actual price" });
        }
        if (margin > userBalance) {
            return res.status(400).json({ message: "Insuffiecient funds" });
        }
        //ideally should be using a usable part of balance here and split
        yield db_1.prisma.user.update({
            where: {
                id: id,
            },
            data: {
                balance: { decrement: margin },
            },
        });
        //margin = valuation/leverage
        //pnl = buyprice - entryprice * qty
        //margin = pnl for liquidation
        const liquidate = buyPrice * (1 - 1 / actualLeverage);
        const newOrder = {
            orderId: data_1.currentOrders.length + 1,
            id: user.id,
            type: type,
            symbol: symbol,
            quantity: quantity,
            entryPrice: buyPrice,
            margin: margin,
            leverage: actualLeverage,
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            liquidationPrice: liquidate,
        };
        data_1.currentOrders.push(newOrder);
        return res.json({ message: "Örder Placed", order: newOrder });
    }
    else if (type.toLowerCase() === "short") {
        const sellPrice = latestPrices[symbol.toUpperCase()].bid;
        const valuation = sellPrice * quantity;
        const lev = leverage !== null && leverage !== void 0 ? leverage : 1;
        const margin = valuation / lev;
        if (stopLoss && stopLoss <= sellPrice) {
            return res
                .status(400)
                .json({ message: "stop loss cant be less than the actual price" });
        }
        if (takeProfit && takeProfit >= sellPrice) {
            return res
                .status(400)
                .json({ message: "take profit cant be greater than the actual price" });
        }
        if (margin > userBalance) {
            return res.status(400).json({ message: "Inefficient Funds" });
        }
        yield db_1.prisma.user.update({
            where: {
                id: id,
            },
            data: {
                balance: { decrement: margin },
            },
        });
        const liquidate = sellPrice * (1 + 1 / lev);
        const newOrder = {
            orderId: data_1.currentOrders.length + 1,
            id: user.id,
            type: type,
            symbol: symbol,
            quantity: quantity,
            entryPrice: sellPrice,
            margin: margin,
            leverage: lev,
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            liquidationPrice: liquidate,
        };
        data_1.currentOrders.push(newOrder);
        return res.json({ message: "Order Placed", order: newOrder });
    }
}));
orderRouter.post("/close/:type", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { type } = req.params;
    const orderId = Number(req.body.orderId);
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user.id;
    const user = yield db_1.prisma.user.findUnique({
        where: {
            id: id,
        },
    });
    if (!user) {
        return res.status(400).json({ message: "User no no balance" });
    }
    const order = data_1.currentOrders.find((f) => f.orderId === orderId);
    if (!order) {
        return res.status(400).json({ message: "No order present to close" });
    }
    if (type.toLowerCase() === "long") {
        const currentSellingPrice = latestPrices[order.symbol.toUpperCase()].bid;
        const pnl = (currentSellingPrice - order.entryPrice) * order.quantity;
        yield db_1.prisma.user.update({
            where: {
                id: id,
            },
            data: {
                balance: { decrement: pnl + ((_b = order.margin) !== null && _b !== void 0 ? _b : 0) },
            },
        });
        const orderIndex = data_1.currentOrders.findIndex((f) => f.orderId === orderId);
        if (orderIndex !== -1) {
            data_1.currentOrders.splice(orderIndex, 1);
        }
        return res.json({ message: "order closed" });
    }
    else if (type.toLowerCase() === "short") {
        const currentBuyingPrice = latestPrices[order.symbol.toUpperCase()].ask;
        const pnl = (order.entryPrice - currentBuyingPrice) * order.quantity;
        yield db_1.prisma.user.update({
            where: {
                id: id,
            },
            data: {
                balance: { decrement: pnl + ((_c = order.margin) !== null && _c !== void 0 ? _c : 0) },
            },
        });
        const orderIndex = data_1.currentOrders.findIndex((f) => f.orderId === orderId);
        if (orderIndex !== -1) {
            data_1.currentOrders.splice(orderIndex, 1);
        }
        return res.json({ message: "order closed" });
    }
}));
orderRouter.get("/getOrders", (req, res) => {
    var _a;
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user.id;
    const userOrders = data_1.currentOrders.filter((f) => f.id === id);
    return res.json(userOrders);
});
exports.default = orderRouter;
