"use client";
import { useEffect, useState } from "react";
import { order } from "../types/Alltypes";
import axios from "axios";
import { log } from "console";

export default function useGetOrders() {
  const [orders, setOrders] = useState<order[]>([]);
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchOrders = async () => {
      const response = await axios.get(
        "http://localhost:5000/order/getOrders",
        {
          headers: {
            token: token,
          },
        }
      );
      setOrders(response.data);
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return {
    orders,
  };
}
