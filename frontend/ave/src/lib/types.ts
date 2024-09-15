export interface Coin {
  name: string;
  price: number;
  marketCap: number;
  liquidityAdded: boolean;
}

export interface Trade {
  coinName: string;
  amount: number;
  price: number;
  isBuy: boolean;
  timestamp: string;
}

export interface SimulatorState {
  balance: number;
  popularCoins: string[];
  recentTrades: string[];
}