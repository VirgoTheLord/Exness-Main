"use client";
import React, { useState, useEffect } from "react";
import useGetOrders from "../hooks/useGetOrders";
import { useCloseOrder } from "../hooks/useCloseOrder";
import { order } from "../types/Alltypes";

const OrdersTable = () => {
  const { orders } = useGetOrders();
  const { closeOrder } = useCloseOrder();

  const [localOrders, setLocalOrders] = useState<order[]>([]);

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const handleClose = async (orderId: number, type: "long" | "short") => {
    try {
      await closeOrder(type, orderId);
      setLocalOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    } catch (err) {
      console.error("Failed to close order", err);
    }
  };

  return (
    <div className="bg-black text-white p-4">
      <h2 className="text-lg font-semibold mb-2">Orders</h2>
      <table className="w-full border border-gray-700 text-sm">
        <thead className="bg-neutral-900">
          <tr>
            <th className="border border-gray-700 px-2 py-1">Symbol</th>
            <th className="border border-gray-700 px-2 py-1">Type</th>
            <th className="border border-gray-700 px-2 py-1">Qty</th>
            <th className="border border-gray-700 px-2 py-1">Price</th>
            <th className="border border-gray-700 px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(localOrders) && localOrders.length > 0 ? (
            localOrders.map((o, i) => (
              <tr key={i} className="text-center">
                <td className="border border-gray-700 px-2 py-1">{o.symbol}</td>
                <td className="border border-gray-700 px-2 py-1">{o.type}</td>
                <td className="border border-gray-700 px-2 py-1">
                  {o.quantity}
                </td>
                <td className="border border-gray-700 px-2 py-1">
                  {o.entryPrice}
                </td>
                <td className="border border-gray-700 px-2 py-1">
                  <button
                    onClick={() =>
                      handleClose(o.orderId, o.type as "long" | "short")
                    }
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Close
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-2">
                No orders yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
