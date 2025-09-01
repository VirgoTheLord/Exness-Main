import { useEffect, useState } from "react";
import { candles } from "../types/Alltypes";
import axios from "axios";

export const useCandles = (symbol: string, interval: string) => {
  const [candles, setCandles] = useState<candles[]>([]);

  useEffect(() => {
    const fetchCandles = async () => {
      const response = await axios.get(`http://localhost:5000/candles`, {
        params: {
          interval: interval,
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
  }, [symbol, interval]);
  return candles;
};
