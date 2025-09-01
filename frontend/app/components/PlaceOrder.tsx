"use client";
import React from "react";
import usePlaceOrder from "../hooks/usePlaceOrder";

const PlaceOrderForm = ({ symbol }: { symbol: string }) => {
  const {
    leverage,
    setLeverage,
    stopLoss,
    setStopLoss,
    takeProfit,
    setTakeProfit,
    quantity,
    setQuantity,
    type,
    setType,
    handlePlaceOrder,
  } = usePlaceOrder(symbol);

  return (
    <div className="bg-black text-white p-2 rounded-lg w-85 border border-gray-800">
      <h2 className="text-sm font-semibold mb-2">
        Place Order ({symbol.toUpperCase()})
      </h2>

      <div className="space-y-2 text-xs">
        <div>
          <label className="block mb-1 text-gray-400">Order Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "long" | "short")}
            className="w-full p-1.5 bg-black border border-gray-700 rounded"
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-gray-400">Leverage</label>
          <input
            type="number"
            value={leverage}
            onChange={(e) => setLeverage(e.target.value)}
            className="w-full p-1.5 bg-black border border-gray-700 rounded"
            placeholder="5"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-400">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full p-1.5 bg-black border border-gray-700 rounded"
            placeholder="0.1"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-400">Stop Loss</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="w-full p-1.5 bg-black border border-gray-700 rounded"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-400">Take Profit</label>
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            className="w-full p-1.5 bg-black border border-gray-700 rounded"
            placeholder="Optional"
          />
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        className="mt-3 w-full bg-green-600 hover:bg-green-700 p-1.5 rounded text-sm font-medium"
      >
        Place Order
      </button>
    </div>
  );
};

export default PlaceOrderForm;
