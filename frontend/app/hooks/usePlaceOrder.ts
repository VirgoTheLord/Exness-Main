import { useState } from "react";
import axios from "axios";

export default function usePlaceOrder(symbol: string) {
  const [leverage, setLeverage] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [type, setType] = useState<"long" | "short">("long");

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `http://localhost:5000/order/trade/${type}`,
        {
          leverage: leverage ? Number(leverage) : 1,
          symbol,
          takeProfit: takeProfit ? Number(takeProfit) : undefined,
          stopLoss: stopLoss ? Number(stopLoss) : undefined,
          quantity,
        },
        {
          headers: {
            token: token,
          },
        }
      );
      console.log("Order response:", response.data);
    } catch (error) {
      console.log(error);
    }
  };
  return {
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
  };
}
