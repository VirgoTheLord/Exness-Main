"use client";
import React from "react";
import { usePrices } from "../hooks/usePrices";

const PricesTable = () => {
  const prices = usePrices();

  return (
    <div className="p-4">
      <table className="w-full border-collapse border border-gray-700 text-sm text-white">
        <thead className="bg-gray-900">
          <tr>
            <th className="border border-gray-700 px-4 py-2 text-left">
              Symbol
            </th>
            <th className="border border-gray-700 px-4 py-2 text-left">Ask</th>
            <th className="border border-gray-700 px-4 py-2 text-left">Bid</th>
            <th className="border border-gray-700 px-4 py-2 text-left">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(prices).map(([symbol, { ask, bid, status }]) => (
            <tr key={symbol} className="odd:bg-gray-800 even:bg-gray-700">
              <td className="border border-gray-700 px-4 py-2">{symbol}</td>
              <td className="border border-gray-700 px-4 py-2">
                {ask.toFixed(2)}
              </td>
              <td className="border border-gray-700 px-4 py-2">
                {bid.toFixed(2)}
              </td>
              <td
                className={`border border-gray-700 px-4 py-2 font-bold ${
                  status === "up" ? "text-green-400" : "text-red-400"
                }`}
              >
                {status.toUpperCase()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PricesTable;
