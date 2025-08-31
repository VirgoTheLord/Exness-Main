import { NumericLiteral } from "typescript";

export interface User {
  id: number;
  email: string;
  password: string;
  balance: number;
}

export interface Order {
  orderId: number;
  id: number;
  type: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
  margin?: number;
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
  liquidationPrice?: number;
}

export interface LatestPrices {
  ask: number;
  bid: number;
}
