import React, { useState, useEffect } from 'react';
import { AppView, PortfolioItem, Stock } from '../types';
import { INITIAL_STOCKS, getHistoricalPrice } from '../services/dataService';

interface OnboardingProps {
  setView: (view: AppView) => void;
  setPortfolio: (portfolio: PortfolioItem[]) => void;
}

interface DraftItem {
    symbol: string;
    qty: number;
    date: string;
    estimatedPrice: number;
}

export const Onboarding: React.FC<OnboardingProps> = ({ setView, setPortfolio }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [draftPortfolio, setDraftPortfolio] = useState<DraftItem[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  
  // Selection Form State
  const [formQty, setFormQty] = useState(10);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter stocks based on search
  const filteredStocks = INITIAL_STOCKS.filter(s => 
    s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToPortfolio = () => {
      if (!selectedStock) return;
      
      const historicalPrice = getHistoricalPrice(selectedStock.price, formDate);
      
      const newItem: DraftItem = {
          symbol: selectedStock.symbol,
          qty: formQty,
          date: formDate,
          estimatedPrice: historicalPrice
      };

      // Upsert
      setDraftPortfolio(prev => {
          const existing = prev.filter(i => i.symbol !== selectedStock.symbol);
          return [...existing, newItem];
      });

      setSelectedStock(null);
      setFormQty(10);
      setFormDate(new Date().toISOString().split('T')[0]);
  };

  const handleRemove = (symbol: string) => {
      setDraftPortfolio(prev => prev.filter(i => i.symbol !== symbol));
  };

  const handleComplete = () => {
    const portfolio: PortfolioItem[] = [];
    
    draftPortfolio.forEach(draft => {
        const stockData = INITIAL_STOCKS.find(s => s.symbol === draft.symbol);
        if (stockData) {
            portfolio.push({
                ...stockData,
                quantity: draft.qty,
                avgBuyPrice: draft.estimatedPrice,
                dateInvested: draft.date
            });
        }
    });

    setPortfolio(portfolio);
    localStorage.setItem('investiq_portfolio', JSON.stringify(portfolio));
    setView(AppView.DASHBOARD);
  };

  const totalInvested = draftPortfolio.reduce((acc, curr) => acc + (curr.estimatedPrice * curr.qty), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row">
      
      {/* LEFT: Market Browser */}
      <div className="w-full md:w-1/2 p-6 md:p-10 border-r border-slate-800 flex flex-col h-screen overflow-hidden">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Market Explorer</h1>
            <p className="text-slate-400 mt-2">Find assets to add to your tracked portfolio.</p>
        </div>

        <div className="relative mb-6">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input 
                type="text" 
                placeholder="Search by Symbol or Company (e.g. Apple, NVDA)" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-white placeholder-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredStocks.map(stock => {
                const isSelected = draftPortfolio.some(d => d.symbol === stock.symbol);
                return (
                    <div 
                        key={stock.symbol}
                        onClick={() => setSelectedStock(stock)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-slate-800 ${selectedStock?.symbol === stock.symbol ? 'border-sky-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900/30'}`}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center font-bold text-xs text-white">
                                    {stock.symbol[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{stock.symbol}</h3>
                                    <p className="text-xs text-slate-400">{stock.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-mono text-white">${stock.price.toFixed(2)}</p>
                                <span className={`text-xs ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {stock.changePercent}%
                                </span>
                            </div>
                        </div>
                        {isSelected && (
                            <div className="mt-2 text-xs text-sky-400 font-medium flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                In Portfolio
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
      </div>

      {/* RIGHT: Configuration & Summary */}
      <div className="w-full md:w-1/2 bg-slate-900/50 backdrop-blur-xl p-6 md:p-10 flex flex-col h-screen overflow-hidden">
         
         {selectedStock ? (
             <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8 animate-fade-in shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex justify-between">
                    <span>Add {selectedStock.name}</span>
                    <button onClick={() => setSelectedStock(null)} className="text-slate-400 hover:text-white">✕</button>
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label>
                        <input 
                            type="number" 
                            min="1"
                            value={formQty}
                            onChange={(e) => setFormQty(parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-sky-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date Invested</label>
                        <input 
                            type="date" 
                            max={new Date().toISOString().split('T')[0]}
                            value={formDate}
                            onChange={(e) => setFormDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-sky-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="bg-slate-900 rounded p-3 mb-4 text-sm">
                    <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Current Price:</span>
                        <span className="text-white">${selectedStock.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="text-slate-400">Est. Price on Date:</span>
                        <span className="text-sky-400 font-bold">${getHistoricalPrice(selectedStock.price, formDate).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-700 mt-2 pt-2 flex justify-between">
                        <span className="text-slate-300">Total Investment:</span>
                        <span className="text-white font-bold">${(getHistoricalPrice(selectedStock.price, formDate) * formQty).toFixed(2)}</span>
                    </div>
                </div>

                <button 
                    onClick={handleAddToPortfolio}
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-lg transition-colors"
                >
                    Add to Portfolio
                </button>
             </div>
         ) : (
             <div className="mb-8 p-6 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                 Select a stock from the left to configure details
             </div>
         )}

         <div className="flex-1 overflow-hidden flex flex-col">
             <h2 className="text-xl font-bold text-white mb-4">Your Portfolio Preview</h2>
             <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                 {draftPortfolio.length === 0 && (
                     <p className="text-slate-500 text-center mt-10">No assets selected yet.</p>
                 )}
                 {draftPortfolio.map(item => (
                     <div key={item.symbol} className="flex justify-between items-center bg-slate-800 rounded p-3 border border-slate-700">
                         <div>
                             <div className="font-bold text-white">{item.symbol} <span className="text-xs text-slate-400 font-normal">x{item.qty}</span></div>
                             <div className="text-xs text-slate-500">Bought: {item.date} @ ${item.estimatedPrice}</div>
                         </div>
                         <div className="flex items-center gap-4">
                             <div className="text-right">
                                 <div className="text-white font-mono">${(item.estimatedPrice * item.qty).toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                             </div>
                             <button onClick={() => handleRemove(item.symbol)} className="text-red-400 hover:text-red-300">
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                             </button>
                         </div>
                     </div>
                 ))}
             </div>
         </div>

         <div className="mt-6 border-t border-slate-800 pt-6">
             <div className="flex justify-between items-end mb-4">
                 <span className="text-slate-400">Initial Investment</span>
                 <span className="text-3xl font-bold text-white">${totalInvested.toLocaleString()}</span>
             </div>
             <button
              onClick={handleComplete}
              disabled={draftPortfolio.length === 0}
              className="w-full bg-emerald-600 text-white text-lg py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
            >
              Launch Dashboard
            </button>
         </div>

      </div>
    </div>
  );
};