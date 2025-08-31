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
  entryPrice: string;
  margin: number;
  leverage: number;
  liquidationPrice: number;
}
