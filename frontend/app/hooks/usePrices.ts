import { useEffect, useRef, useState } from "react";
import { prices } from "../types/Alltypes";

export const usePrices = () => {
  const [prices, setPrices] = useState<Record<string, prices>>({
    BTCUSDT: { ask: 0, bid: 0, status: "up" },
    SOLUSDT: { ask: 0, bid: 0, status: "up" },
    ETHUSDT: { ask: 0, bid: 0, status: "up" },
  });
  const pricesRef = useRef<Record<string, prices>>({});

  useEffect(() => {
    const wss = new WebSocket("ws://localhost:4000");
    wss.onopen = () => {
      console.log("WebSocket connected");
    };

    wss.onmessage = (event) => {
      const { symbol, ask, bid } = JSON.parse(event.data);
      setPrices((prev) => {
        const prevData = pricesRef.current[symbol];
        if (!prevData) {
          const status: "up" | "down" = "up";
          pricesRef.current[symbol] = { ask, bid, status };

          return {
            ...prev,
            [symbol]: { ask, bid, status },
          };
        }
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
  return prices;
};
