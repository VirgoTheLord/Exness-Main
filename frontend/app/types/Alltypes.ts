export interface candles {
  timestamp: string;
  open_price: string;
  high_price: string;
  low_price: string;
  close_price: string;
  symbol: string;
}
export interface prices {
  ask: number;
  bid: number;
  status: "up" | "down";
}

export interface order {
  orderId: number;
  id: number;
  type: string;
  symbol: string;
  entryPrice: number;
  quantity: number;
  margin?: number;
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
  liquidationPrice?: number;
}
