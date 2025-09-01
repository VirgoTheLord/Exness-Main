import express from "express";
import Redis from "ioredis";
import { LatestPrices, Order } from "../types/allTypes";
import { currentOrders, users } from "../data";
import { prisma } from "../config/db";
import { idText } from "typescript";
const redis = new Redis();
const redisQ = new Redis();

const orderRouter = express.Router();
const latestPrices: Record<string, LatestPrices> = {};

const pushNotification = (userId: number, message: string) => {
  const payload = JSON.stringify({ userId, message, timestamp: Date.now() });
  redisQ.lpush("order_notifications", payload);
};

redis.subscribe("trades");
redis.on("message", (channel, message) => {
  if (channel !== "trades") return;

  const { symbol, bid, ask } = JSON.parse(message);
  latestPrices[symbol.toUpperCase()] = {
    bid: parseFloat(bid),
    ask: parseFloat(ask),
  };

  for (let i = 0; i < currentOrders.length; ) {
    const order = currentOrders[i];
    const symbol = order.symbol;
    const askPrice = latestPrices[symbol.toUpperCase()].ask;
    const bidPrice = latestPrices[symbol.toUpperCase()].bid;

    const userInMemory = users.find((u) => u.id === order.id);
    if (!userInMemory) {
      i++;
      continue;
    }

    if (order.type === "long") {
      if (order.stopLoss && bidPrice <= order.stopLoss) {
        userInMemory.balance +=
          (order.entryPrice - order.stopLoss) * order.quantity +
          (order.margin ?? 0);
        pushNotification(
          order.id,
          `Long order stopped out at ${order.stopLoss}`
        );
        currentOrders.splice(i, 1);
        continue;
      }
      if (order.takeProfit && bidPrice >= order.takeProfit) {
        userInMemory.balance +=
          (order.takeProfit - order.entryPrice) * order.quantity +
          (order.margin ?? 0);
        pushNotification(
          order.id,
          `Long order take profit hit at ${order.takeProfit}`
        );
        currentOrders.splice(i, 1);
        continue;
      }
      if (
        order.liquidationPrice !== undefined &&
        bidPrice <= order.liquidationPrice
      ) {
        console.log(`Order Liquidated ${order.type}`);
        pushNotification(order.id, `Long order liquidated at ${bidPrice}`);
        currentOrders.splice(i, 1);
        continue;
      }
    } else if (order.type === "short") {
      if (order.stopLoss && askPrice >= order.stopLoss) {
        userInMemory.balance +=
          (order.stopLoss - order.entryPrice) * order.quantity +
          (order.margin ?? 0);
        pushNotification(
          order.id,
          `Long order stopped out at ${order.stopLoss}`
        );
        currentOrders.splice(i, 1);
        continue;
      }
      if (order.takeProfit && askPrice <= order.takeProfit) {
        userInMemory.balance +=
          (order.entryPrice - order.takeProfit) * order.quantity +
          (order.margin ?? 0);
        pushNotification(
          order.id,
          `Long order take profit hit at ${order.takeProfit}`
        );
        currentOrders.splice(i, 1);
        continue;
      }
      if (
        order.liquidationPrice !== undefined &&
        askPrice >= order.liquidationPrice
      ) {
        console.log(`Order Liquidated ${order.type}`);
        pushNotification(order.id, `Short order liquidated at ${askPrice}`);
        currentOrders.splice(i, 1);
        continue;
      }
    }

    i++;
  }
});

orderRouter.post("/trade/:type", async (req, res) => {
  const { type } = req.params;
  const { leverage, symbol, stopLoss, takeProfit, quantity } = req.body;
  const id = (req as any).user?.user.id;
  const user = await prisma.user.findUnique({
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

    const actualLeverage = leverage ?? 1;
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
    await prisma.user.update({
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

    const newOrder: Order = {
      orderId: currentOrders.length + 1,
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
    currentOrders.push(newOrder);
    return res.json({ message: "Örder Placed", order: newOrder });
  } else if (type.toLowerCase() === "short") {
    const sellPrice = latestPrices[symbol.toUpperCase()].bid;
    const valuation = sellPrice * quantity;

    const lev = leverage ?? 1;
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
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        balance: { decrement: margin },
      },
    });

    const liquidate = sellPrice * (1 + 1 / lev);
    const newOrder: Order = {
      orderId: currentOrders.length + 1,
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

    currentOrders.push(newOrder);
    return res.json({ message: "Order Placed", order: newOrder });
  }
});

orderRouter.post("/close/:type", async (req, res) => {
  const { type } = req.params;
  const orderId = Number(req.body.orderId);
  const id = (req as any).user?.user.id;
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  if (!user) {
    return res.status(400).json({ message: "User no no balance" });
  }
  const order = currentOrders.find((f) => f.orderId === orderId);
  if (!order) {
    return res.status(400).json({ message: "No order present to close" });
  }
  if (type.toLowerCase() === "long") {
    const currentSellingPrice = latestPrices[order.symbol.toUpperCase()].bid;
    const pnl = (currentSellingPrice - order.entryPrice) * order.quantity;
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        balance: { decrement: pnl + (order.margin ?? 0) },
      },
    });
    const orderIndex = currentOrders.findIndex((f) => f.orderId === orderId);
    if (orderIndex !== -1) {
      currentOrders.splice(orderIndex, 1);
    }
    return res.json({ message: "order closed" });
  } else if (type.toLowerCase() === "short") {
    const currentBuyingPrice = latestPrices[order.symbol.toUpperCase()].ask;
    const pnl = (order.entryPrice - currentBuyingPrice) * order.quantity;
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        balance: { decrement: pnl + (order.margin ?? 0) },
      },
    });
    const orderIndex = currentOrders.findIndex((f) => f.orderId === orderId);
    if (orderIndex !== -1) {
      currentOrders.splice(orderIndex, 1);
    }
    return res.json({ message: "order closed" });
  }
});

orderRouter.get("/getOrders", (req, res) => {
  const id = (req as any).user?.user.id;
  const userOrders = currentOrders.filter((f) => f.id === id);

  return res.json(userOrders);
});

export default orderRouter;
