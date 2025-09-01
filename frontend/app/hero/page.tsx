"use client";
import React, { useState } from "react";
import Charts from "../components/Charts";
import { useCandles } from "../hooks/useCandles";
import PricesTable from "../components/PricesTable";

const page = () => {
  const [selectedInterval, setSelectedInterval] = useState("1m");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const symbols = ["BTCUSDT", "SOLUSDT", "ETHUSDT"];
  const intervals = ["1m", "5m", "10m", "30m"];

  const candles = useCandles(symbol, selectedInterval);

  return (
    <div className="bg-black w-screen min-h-screen">
      <div className="h-15 bg-neutral-900 flex justify-between items-center px-4">
        <h1 className="text-white text-lg font-semibold">Exness</h1>
      </div>

      <div className="relative">
        <div className="absolute top-2 left-2 flex gap-2 z-10">
          <select
            className="bg-black text-white px-2 py-1 border border-gray-700"
            onChange={(e) => setSelectedInterval(e.target.value)}
          >
            {intervals.map((m) => (
              <option value={m} key={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="bg-black text-white px-2 py-1 border border-gray-700"
            onChange={(e) => setSymbol(e.target.value)}
          >
            {symbols.map((m) => (
              <option value={m} key={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="flex ">
          <div className="w-3/4 pl-2">
            <Charts candles={candles} height={600} />
          </div>
          <div className="w-1/4">
            <PricesTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
