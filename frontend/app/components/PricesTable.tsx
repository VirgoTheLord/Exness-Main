"use client";
import React from "react";
import { usePrices } from "../hooks/usePrices";

const PricesTable = () => {
  const prices = usePrices();

  return (
    <div className="p-4 bg-black ">
      <table className="w-85 border-collapse border border-gray-800 text-sm text-white">
        <thead className="bg-black">
          <tr>
            <th className="border border-gray-800 px-4 py-3 text-left font-semibold text-gray-300">
              Symbol
            </th>
            <th className="border border-gray-800 px-4 py-3 text-left font-semibold text-gray-300">
              Ask
            </th>
            <th className="border border-gray-800 px-4 py-3 text-left font-semibold text-gray-300">
              Bid
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(prices).map(([symbol, { ask, bid, status }]) => (
            <tr
              key={symbol}
              className="bg-black hover:bg-gray-900 transition-colors"
            >
              <td className="border border-gray-800 px-4 py-3 font-medium text-gray-200">
                {symbol.toUpperCase()}
              </td>

              <td
                className={`border border-gray-800 px-4 py-3 font-bold ${
                  status === "up" ? "text-green-400" : "text-red-400"
                }`}
              >
                ${ask?.toFixed(2) ?? "-"}
              </td>

              <td
                className={`border border-gray-800 px-4 py-3 font-bold ${
                  status === "up" ? "text-green-400" : "text-red-400"
                }`}
              >
                ${bid?.toFixed(2) ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PricesTable;
