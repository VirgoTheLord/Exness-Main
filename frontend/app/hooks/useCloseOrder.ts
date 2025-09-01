"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export const useCloseOrder = () => {
  const [success, setSuccess] = useState<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
  }, []);

  const closeOrder = async (type: "long" | "short", orderId: number) => {
    try {
      setSuccess(null);

      const res = await axios.post(
        `http://localhost:5000/order/close/${type}`,
        { orderId: Number(orderId) },
        {
          headers: {
            token: token,
          },
        }
      );

      setSuccess(res.data.message);
      return res.data;
    } catch (err: any) {
      throw err;
    }
  };

  return { closeOrder, success };
};
