import { Stock, SystemStatus, NewsArticle } from '../types';

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
  { symbol: 'ORCL', name: 'Oracle Corp.', price: 112.50, change: 0.45, changePercent: 0.40, sector: 'Technology' },
  { symbol: 'CSCO', name: 'Cisco Systems', price: 53.20, change: -0.15, changePercent: -0.28, sector: 'Technology' },
  { symbol: 'IBM', name: 'IBM', price: 140.30, change: 0.55, changePercent: 0.39, sector: 'Technology' },
  { symbol: 'UBER', name: 'Uber Technologies', price: 45.60, change: 1.20, changePercent: 2.70, sector: 'Technology' },
  { symbol: 'ABNB', name: 'Airbnb Inc.', price: 125.40, change: -2.10, changePercent: -1.65, sector: 'Technology' },
  { symbol: 'PLTR', name: 'Palantir Tech', price: 15.80, change: 0.40, changePercent: 2.60, sector: 'Technology' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', price: 155.20, change: -3.40, changePercent: -2.14, sector: 'Technology' },

  // Financial
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 150.10, change: 0.45, changePercent: 0.30, sector: 'Financial' },
  { symbol: 'V', name: 'Visa Inc.', price: 245.80, change: -1.10, changePercent: -0.45, sector: 'Financial' },
  { symbol: 'MA', name: 'Mastercard', price: 405.20, change: -0.90, changePercent: -0.22, sector: 'Financial' },
  { symbol: 'BAC', name: 'Bank of America', price: 28.50, change: 0.15, changePercent: 0.53, sector: 'Financial' },
  { symbol: 'GS', name: 'Goldman Sachs', price: 325.40, change: 1.20, changePercent: 0.37, sector: 'Financial' },
  { symbol: 'MS', name: 'Morgan Stanley', price: 85.30, change: 0.60, changePercent: 0.71, sector: 'Financial' },
  { symbol: 'AXP', name: 'American Express', price: 160.50, change: 1.10, changePercent: 0.69, sector: 'Financial' },
  { symbol: 'BLK', name: 'BlackRock', price: 650.20, change: 4.50, changePercent: 0.70, sector: 'Financial' },
  { symbol: 'C', name: 'Citigroup', price: 42.10, change: -0.20, changePercent: -0.47, sector: 'Financial' },
  { symbol: 'PYPL', name: 'PayPal Holdings', price: 58.40, change: -1.20, changePercent: -2.01, sector: 'Financial' },
  { symbol: 'COIN', name: 'Coinbase Global', price: 75.30, change: 3.50, changePercent: 4.87, sector: 'Financial' },

  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 160.20, change: -0.50, changePercent: -0.31, sector: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer Inc.', price: 33.10, change: 0.10, changePercent: 0.30, sector: 'Healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth', price: 480.50, change: 5.20, changePercent: 1.09, sector: 'Healthcare' },
  { symbol: 'LLY', name: 'Eli Lilly', price: 550.30, change: 8.40, changePercent: 1.55, sector: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck & Co.', price: 105.40, change: 0.20, changePercent: 0.19, sector: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', price: 148.20, change: -0.30, changePercent: -0.20, sector: 'Healthcare' },
  { symbol: 'TMO', name: 'Thermo Fisher', price: 510.10, change: 2.50, changePercent: 0.49, sector: 'Healthcare' },
  { symbol: 'MRNA', name: 'Moderna Inc.', price: 95.60, change: -4.20, changePercent: -4.21, sector: 'Healthcare' },

  // Consumer
  { symbol: 'WMT', name: 'Walmart Inc.', price: 162.40, change: 0.80, changePercent: 0.49, sector: 'Consumer Defensive' },
  { symbol: 'PG', name: 'Procter & Gamble', price: 154.20, change: -0.20, changePercent: -0.13, sector: 'Consumer Defensive' },
  { symbol: 'KO', name: 'Coca-Cola', price: 58.90, change: 0.30, changePercent: 0.51, sector: 'Consumer Defensive' },
  { symbol: 'PEP', name: 'PepsiCo', price: 178.50, change: 0.40, changePercent: 0.22, sector: 'Consumer Defensive' },
  { symbol: 'MCD', name: 'McDonald\'s', price: 280.10, change: -1.50, changePercent: -0.53, sector: 'Consumer Cyclical' },
  { symbol: 'NKE', name: 'Nike Inc.', price: 98.40, change: 1.10, changePercent: 1.13, sector: 'Consumer Cyclical' },
  { symbol: 'SBUX', name: 'Starbucks', price: 92.30, change: 0.50, changePercent: 0.54, sector: 'Consumer Cyclical' },
  { symbol: 'TGT', name: 'Target Corp.', price: 110.50, change: -1.80, changePercent: -1.60, sector: 'Consumer Defensive' },
  { symbol: 'COST', name: 'Costco Wholesale', price: 550.40, change: 3.20, changePercent: 0.58, sector: 'Consumer Defensive' },
  { symbol: 'DIS', name: 'Walt Disney', price: 82.50, change: -0.80, changePercent: -0.96, sector: 'Communication Services' },

  // Energy & Industrial
  { symbol: 'XOM', name: 'Exxon Mobil', price: 115.30, change: 2.10, changePercent: 1.85, sector: 'Energy' },
  { symbol: 'CVX', name: 'Chevron', price: 165.20, change: 1.80, changePercent: 1.10, sector: 'Energy' },
  { symbol: 'BA', name: 'Boeing', price: 210.50, change: -3.20, changePercent: -1.50, sector: 'Industrial' },
  { symbol: 'CAT', name: 'Caterpillar', price: 275.40, change: 4.10, changePercent: 1.51, sector: 'Industrial' },
  { symbol: 'GE', name: 'General Electric', price: 112.30, change: 0.90, changePercent: 0.81, sector: 'Industrial' },
  { symbol: 'LMT', name: 'Lockheed Martin', price: 440.20, change: 1.50, changePercent: 0.34, sector: 'Industrial' },
  { symbol: 'UPS', name: 'UPS', price: 155.60, change: -0.50, changePercent: -0.32, sector: 'Industrial' },
];

export const getHistoricalPrice = (currentPrice: number, dateStr: string): number => {
  const investDate = new Date(dateStr);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - investDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const annualGrowth = 0.10; 
  const dailyGrowth = annualGrowth / 365;
  const growthFactor = 1 + (dailyGrowth * diffDays);
  const noise = 1 + (Math.random() * 0.3 - 0.15); 
  
  let pastPrice = (currentPrice / growthFactor) * noise;
  
  return parseFloat(pastPrice.toFixed(2));
};

export const calculateLinearRegression = (data: {date: string, price: number}[]) => {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0, points: [] };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

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

// Generates S&P 500 Index Simulation (normalized to compare with stock price)
export const getBenchmarkData = (days: number, comparisonBasePrice: number) => {
    const data = [];
    let spyPrice = comparisonBasePrice; // Start at same scale for chart visual comparison
    
    // S&P 500 generally has lower volatility but positive drift
    for (let i = 0; i < days; i++) {
        const volatility = spyPrice * 0.012; // Lower volatility
        const trend = volatility * 0.05; // Slight positive bias
        const change = (Math.random() - 0.45) * volatility + trend;
        spyPrice += change;

        data.push({
            date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
            benchmark: parseFloat(spyPrice.toFixed(2))
        });
    }
    return data;
};

export const getMarketNews = (): NewsArticle[] => {
  const headlines = [
      { t: "Fed Signals Potential Rate Cut as Inflation Cools", s: "Bloomberg", sent: "POSITIVE" },
      { t: "Tech Sector Rallies Ahead of Earnings Week", s: "CNBC", sent: "POSITIVE" },
      { t: "Oil Prices Dip Amid Global Supply Concerns", s: "Reuters", sent: "NEGATIVE" },
      { t: "New Regulations Proposed for Crypto Markets", s: "WSJ", sent: "NEUTRAL" },
      { t: "Housing Market Shows Signs of Recovery", s: "MarketWatch", sent: "POSITIVE" },
      { t: "European Markets Close Lower on Manufacturing Data", s: "Financial Times", sent: "NEGATIVE" },
      { t: "Startup Funding Hits 5-Year Low", s: "TechCrunch", sent: "NEGATIVE" },
      { t: "EV Sales Surpass Expectations in Q3", s: "Automotive News", sent: "POSITIVE" },
      { t: "Retail Spending Flat in September", s: "Forbes", sent: "NEUTRAL" },
      { t: "Major Merger Announced in Pharmaceutical Sector", s: "Business Insider", sent: "POSITIVE" }
  ];

  const shuffled = headlines.sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, 6).map((h, i) => ({
      id: i.toString(),
      title: h.t,
      source: h.s,
      time: `${Math.floor(Math.random() * 12) + 1}h ago`,
      sentiment: h.sent as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  }));
};

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