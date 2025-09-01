"use client";
import React from "react";
import useGetOrders from "../hooks/useGetOrders";

const OrdersTable = () => {
  const { orders } = useGetOrders();

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
          </tr>
        </thead>
        <tbody>
          {Array.isArray(orders) && orders.length > 0 ? (
            orders.map((o, i) => (
              <tr key={i}>
                <td>{o.symbol}</td>
                <td>{o.type}</td>
                <td>{o.quantity}</td>
                <td>{o.entryPrice}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No orders yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
