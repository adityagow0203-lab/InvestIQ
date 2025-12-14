import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateStockAnalysis = async (symbol: string, price: number, range: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the stock ${symbol} which is currently trading at $${price}. 
      Provide a brief, professional financial summary for the time range: ${range}. 
      Include potential bullish and bearish indicators. Keep it under 150 words.`,
    });
    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Analysis failed to load due to network or API constraints.";
  }
};

export const generateMarketRecap = async (portfolioSummary: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert financial analyst. 
      The market has just closed. 
      Review this user's portfolio data: ${portfolioSummary}.
      
      Generate a "Daily Market Recap". 
      1. Summarize overall performance.
      2. Highlight the biggest winner and biggest loser.
      3. Provide a brief outlook for tomorrow based on general market sentiment principles.
      Keep it professional, encouraging, and under 200 words.`,
    });
    return response.text || "Daily recap unavailable.";
  } catch (error) {
     return "Unable to generate recap at this time.";
  }
};

export const chatWithBot = async (userQuery: string, contextData: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are InvestIQ Bot, a helpful financial assistant. 
      Context: ${contextData}
      
      User Query: "${userQuery}"
      
      Answer briefly and helpfully. If the user asks for financial advice, give a disclaimer.`,
    });
    return response.text || "I'm not sure how to answer that right now.";
  } catch (error) {
    return "I am currently experiencing connection issues. Please try again later.";
  }
};