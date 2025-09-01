"use client";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

interface candles {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
}
interface prices {
  ask: number;
  bid: number;
  status: "up" | "down";
}

interface order {
  orderId: number;
  id: number;
  type: string;
  entryPrice: number;
  quantity: number;
  margin?: number;
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
  liquidationPrice?: number;
}

const page = () => {
  const [candles, setCandles] = useState<candles[]>([]);
  const [selectedInterval, setSelectedInterval] = useState("1m");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const symbols = ["BTCUSDT", "SOLUSDT", "ETHUSDT"];
  const intervals = ["1m", "5m", "10m", "30m"];
  const [prices, setPrices] = useState<Record<string, prices>>({
    BTCUSDT: { ask: 0, bid: 0, status: "up" },
    SOLUSDT: { ask: 0, bid: 0, status: "up" },
    ETHUSDT: { ask: 0, bid: 0, status: "up" },
  });

  const pricesRef = useRef<Record<string, prices>>({});
  useEffect(() => {
    const fetchCandles = async () => {
      const response = await axios.get(`http://localhost:5000/candles`, {
        params: {
          interval: selectedInterval,
          symbol: symbol,
        },
      });
      setCandles(response.data);
    };
    fetchCandles();

    const intervalId = setInterval(() => fetchCandles(), 10000);
    return () => {
      clearInterval(intervalId);
    };
  }, [symbol, selectedInterval]);

  useEffect(() => {
    const wss = new WebSocket("ws://localhost:4000");
    wss.onopen = () => {
      console.log("WebSocket connected");
    };

    wss.onmessage = (event) => {
      const { symbol, ask, bid } = JSON.parse(event.data);
      setPrices((prev) => {
        const prevData = pricesRef.current[symbol];
        const prevAsk: number = prevData.ask;

        const status: "up" | "down" =
          prevAsk > ask
            ? "up"
            : prevAsk < bid
            ? "down"
            : prevData.status ?? "up";

        pricesRef.current[symbol] = { ask, bid, status };

        return {
          ...prev,
          [symbol]: { ask, bid, status },
        };
      });
    };
    wss.onclose = () => {
      console.log("Websocket disconnected");
    };

    return () => {
      wss.close();
    };
  }, []);

  return (
    <div>
      <select
        name=""
        id=""
        onChange={(e) => setSelectedInterval(e.target.value)}
      >
        {intervals.map((m) => (
          <option value={m} key={m}>
            {m}
          </option>
        ))}
      </select>
      <select name="" id="" onChange={(e) => setSymbol(e.target.value)}>
        {symbols.map((m) => (
          <option value={m} key={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
};

export default page;
