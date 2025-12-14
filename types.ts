export enum AppView {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  STOCK_DETAIL = 'STOCK_DETAIL',
  SUMMARY = 'SUMMARY',
  ADMIN = 'ADMIN'
}

export interface User {
  username: string;
  email: string;
  isAdmin?: boolean;
}

export interface AdminUserView {
  id: string;
  username: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED';
  lastLogin: string;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
}

export interface PortfolioItem extends Stock {
  quantity: number;
  avgBuyPrice: number;
  dateInvested: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  endpoint: string;
  status: 'SUCCESS' | 'ERROR' | 'WARNING';
  latency: number;
  payload?: string;
  errorMessage?: string;
}

export interface SystemStatus {
  cpu: number;
  memory: number;
  activeConnections: number;
  databaseStatus: 'Healthy' | 'Degraded' | 'Maintenance';
}

export type TimeRange = '1D' | '1W' | '1M';