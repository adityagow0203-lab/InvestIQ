import { Stock, SystemStatus } from '../types';

export const INITIAL_STOCKS: Stock[] = [
  // Technology
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.45, change: 1.25, changePercent: 0.72, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 320.10, change: -2.50, changePercent: -0.78, sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 135.20, change: 0.80, changePercent: 0.59, sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com', price: 145.30, change: 3.10, changePercent: 2.15, sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 460.15, change: 10.20, changePercent: 2.27, sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 240.50, change: -5.40, changePercent: -2.20, sector: 'Automotive' },
  { symbol: 'META', name: 'Meta Platforms', price: 300.20, change: 4.50, changePercent: 1.52, sector: 'Technology' },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 410.10, change: -1.20, changePercent: -0.29, sector: 'Technology' },
  { symbol: 'AMD', name: 'Adv. Micro Devices', price: 105.25, change: 2.10, changePercent: 2.04, sector: 'Technology' },
  { symbol: 'INTC', name: 'Intel Corp.', price: 35.40, change: -0.30, changePercent: -0.84, sector: 'Technology' },
  { symbol: 'CRM', name: 'Salesforce', price: 215.60, change: 1.10, changePercent: 0.51, sector: 'Technology' },
  { symbol: 'ADBE', name: 'Adobe Inc.', price: 520.40, change: 3.50, changePercent: 0.68, sector: 'Technology' },

  // Financial
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 150.10, change: 0.45, changePercent: 0.30, sector: 'Financial' },
  { symbol: 'V', name: 'Visa Inc.', price: 245.80, change: -1.10, changePercent: -0.45, sector: 'Financial' },
  { symbol: 'MA', name: 'Mastercard', price: 405.20, change: -0.90, changePercent: -0.22, sector: 'Financial' },
  { symbol: 'BAC', name: 'Bank of America', price: 28.50, change: 0.15, changePercent: 0.53, sector: 'Financial' },
  { symbol: 'GS', name: 'Goldman Sachs', price: 325.40, change: 1.20, changePercent: 0.37, sector: 'Financial' },

  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 160.20, change: -0.50, changePercent: -0.31, sector: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer Inc.', price: 33.10, change: 0.10, changePercent: 0.30, sector: 'Healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth', price: 480.50, change: 5.20, changePercent: 1.09, sector: 'Healthcare' },
  { symbol: 'LLY', name: 'Eli Lilly', price: 550.30, change: 8.40, changePercent: 1.55, sector: 'Healthcare' },

  // Consumer
  { symbol: 'WMT', name: 'Walmart Inc.', price: 162.40, change: 0.80, changePercent: 0.49, sector: 'Consumer Defensive' },
  { symbol: 'PG', name: 'Procter & Gamble', price: 154.20, change: -0.20, changePercent: -0.13, sector: 'Consumer Defensive' },
  { symbol: 'KO', name: 'Coca-Cola', price: 58.90, change: 0.30, changePercent: 0.51, sector: 'Consumer Defensive' },
  { symbol: 'PEP', name: 'PepsiCo', price: 178.50, change: 0.40, changePercent: 0.22, sector: 'Consumer Defensive' },
  { symbol: 'MCD', name: 'McDonald\'s', price: 280.10, change: -1.50, changePercent: -0.53, sector: 'Consumer Cyclical' },
  { symbol: 'NKE', name: 'Nike Inc.', price: 98.40, change: 1.10, changePercent: 1.13, sector: 'Consumer Cyclical' },

  // Energy & Industrial
  { symbol: 'XOM', name: 'Exxon Mobil', price: 115.30, change: 2.10, changePercent: 1.85, sector: 'Energy' },
  { symbol: 'CVX', name: 'Chevron', price: 165.20, change: 1.80, changePercent: 1.10, sector: 'Energy' },
  { symbol: 'BA', name: 'Boeing', price: 210.50, change: -3.20, changePercent: -1.50, sector: 'Industrial' },
  { symbol: 'CAT', name: 'Caterpillar', price: 275.40, change: 4.10, changePercent: 1.51, sector: 'Industrial' },
  { symbol: 'GE', name: 'General Electric', price: 112.30, change: 0.90, changePercent: 0.81, sector: 'Industrial' },
];

/**
 * Simulates a historical price based on current price and date.
 * Uses a random volatility model to backtrack.
 */
export const getHistoricalPrice = (currentPrice: number, dateStr: string): number => {
  const investDate = new Date(dateStr);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - investDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Market assumption: 10% annual growth with noise
  const annualGrowth = 0.10; 
  const dailyGrowth = annualGrowth / 365;
  const growthFactor = 1 + (dailyGrowth * diffDays);
  
  // Add noise +/- 15% volatility
  const noise = 1 + (Math.random() * 0.3 - 0.15); 
  
  // Backtrack: Past Price = Current / Growth
  let pastPrice = (currentPrice / growthFactor) * noise;
  
  return parseFloat(pastPrice.toFixed(2));
};

/**
 * Simple Linear Regression Algorithm
 * y = mx + b
 */
export const calculateLinearRegression = (data: {date: string, price: number}[]) => {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0, points: [] };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  // We use the index i as X (time) to simplify
  for (let i = 0; i < n; i++) {
    const x = i;
    const y = data[i].price;
    sumX += x;
    sumY += y;
    sumXY += (x * y);
    sumXX += (x * x);
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate regression points
  const points = data.map((d, i) => ({
    ...d,
    trend: parseFloat((slope * i + intercept).toFixed(2))
  }));

  return { slope, intercept, points };
};

export const generateHistoricalData = (basePrice: number, days: number, isPositiveTrend: boolean = Math.random() > 0.5) => {
  const data = [];
  let currentPrice = basePrice * (isPositiveTrend ? 0.9 : 1.1); 
  
  for (let i = 0; i < days; i++) {
    const volatility = basePrice * 0.03;
    const trend = isPositiveTrend ? volatility * 0.1 : -volatility * 0.1;
    const change = (Math.random() - 0.5) * volatility + trend;
    currentPrice += change;
    
    // Ensure we end near the basePrice for the last day to match current price
    if (i > days - 5) {
        currentPrice += (basePrice - currentPrice) * 0.3;
    }

    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      price: parseFloat(currentPrice.toFixed(2)),
    });
  }
  return data;
};

// Simulate real-time price updates
export const getLiveUpdate = (currentPrice: number): number => {
  const change = (Math.random() - 0.5) * (currentPrice * 0.005);
  return parseFloat((currentPrice + change).toFixed(2));
};

export const getSystemStatus = (): SystemStatus => ({
  cpu: Math.floor(Math.random() * 60) + 10,
  memory: Math.floor(Math.random() * 40) + 20,
  activeConnections: Math.floor(Math.random() * 2000) + 500,
  databaseStatus: Math.random() > 0.9 ? 'Degraded' : 'Healthy'
});