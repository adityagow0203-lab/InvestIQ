import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Line, ComposedChart } from 'recharts';
import { AppView, PortfolioItem, TimeRange, NewsArticle, Stock, Transaction, PriceAlert } from '../types';
import { generateStockAnalysis, generateMarketRecap } from '../services/geminiService';
import { getLiveUpdate, generateHistoricalData, calculateLinearRegression, getMarketNews, getBenchmarkData, INITIAL_STOCKS } from '../services/dataService';

interface DashboardProps {
  user: any;
  setView: (view: AppView) => void;
  portfolio: PortfolioItem[];
  setPortfolio: (p: PortfolioItem[]) => void;
  selectedStockSymbol: string | null;
  setSelectedStockSymbol: (s: string | null) => void;
  transactions?: Transaction[];
  alerts?: PriceAlert[];
  setAlerts?: (alerts: PriceAlert[]) => void;
}

/**
 * ManageAssetsModal: Allows user to add new stocks or adjust quantities of existing stocks directly.
 * Replaces the "Trade" flow with a simpler "Update Portfolio" flow.
 */
const ManageAssetsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    portfolio: PortfolioItem[];
    setPortfolio: (p: PortfolioItem[]) => void;
}> = ({ isOpen, onClose, portfolio, setPortfolio }) => {
    const [search, setSearch] = useState('');
    const [draftPortfolio, setDraftPortfolio] = useState<PortfolioItem[]>([]);

    useEffect(() => {
        if(isOpen) {
            setDraftPortfolio([...portfolio]);
            setSearch('');
        }
    }, [isOpen, portfolio]);

    const filteredStocks = INITIAL_STOCKS.filter(s => 
        s.symbol.toLowerCase().includes(search.toLowerCase()) || 
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddItem = (stock: Stock) => {
        const exists = draftPortfolio.find(p => p.symbol === stock.symbol);
        if(!exists) {
            setDraftPortfolio(prev => [
                ...prev, 
                { ...stock, quantity: 10, avgBuyPrice: stock.price, dateInvested: new Date().toISOString().split('T')[0] }
            ]);
        }
    };

    const updateQuantity = (symbol: string, delta: number) => {
        setDraftPortfolio(prev => prev.map(p => {
            if (p.symbol === symbol) {
                const newQty = Math.max(0, p.quantity + delta);
                return { ...p, quantity: newQty };
            }
            return p;
        }).filter(p => p.quantity > 0)); // Remove if 0
    };

    const handleSave = () => {
        // Logic to diff and create transactions is handled in App.tsx via setPortfolio logic or could be here
        // For simplicity, we just pass the new state up. App.tsx should detect changes for history if implemented there.
        // We will implement simple save here.
        setPortfolio(draftPortfolio);
        localStorage.setItem('investiq_portfolio', JSON.stringify(draftPortfolio));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col h-[80vh]">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Update Portfolio</h2>
                        <p className="text-slate-400 text-sm">Add assets or adjust current holdings.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>
                
                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT: Search */}
                    <div className="w-1/2 border-r border-slate-800 p-4 flex flex-col bg-slate-950/50">
                        <input 
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:outline-none focus:border-sky-500 mb-4"
                            placeholder="Search Market (e.g. AAPL)..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                             {filteredStocks.map(stock => {
                                 const isOwned = draftPortfolio.some(p => p.symbol === stock.symbol);
                                 return (
                                     <div key={stock.symbol} className="flex justify-between items-center p-3 rounded hover:bg-slate-800 border border-transparent hover:border-slate-700 transition">
                                         <div>
                                             <div className="font-bold text-white">{stock.symbol}</div>
                                             <div className="text-xs text-slate-500">{stock.name}</div>
                                         </div>
                                         {isOwned ? (
                                             <span className="text-xs text-emerald-500 font-bold px-2 py-1 bg-emerald-500/10 rounded">Added</span>
                                         ) : (
                                             <button 
                                                onClick={() => handleAddItem(stock)}
                                                className="text-xs bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded"
                                             >
                                                 Add
                                             </button>
                                         )}
                                     </div>
                                 )
                             })}
                        </div>
                    </div>

                    {/* RIGHT: Current List */}
                    <div className="w-1/2 p-4 flex flex-col bg-slate-900">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Current Holdings</h3>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {draftPortfolio.length === 0 && (
                                <div className="text-center text-slate-600 mt-10">Portfolio is empty.</div>
                            )}
                            {draftPortfolio.map(item => (
                                <div key={item.symbol} className="bg-slate-800 p-3 rounded border border-slate-700 flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-white">{item.symbol}</div>
                                        <div className="text-xs text-slate-400">@ ${item.avgBuyPrice.toFixed(2)}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateQuantity(item.symbol, -1)} className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-white">-</button>
                                        <span className="w-8 text-center font-mono text-white font-bold">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.symbol, 1)} className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-white">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800">
                            <button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded shadow-lg">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Nav: React.FC<{setView: (v:AppView)=>void, user: any, active: string, onUpdate: () => void}> = ({setView, user, active, onUpdate}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-40 px-6 py-4 flex justify-between items-center transition-all duration-300">
            <div className="flex items-center space-x-12">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(AppView.DASHBOARD)}>
                <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-sky-500/20">
                    IQ
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">InvestIQ</h1>
            </div>
            
            {/* Desktop Quick Links */}
            <div className="hidden md:flex space-x-1">
                <button 
                    onClick={() => setView(AppView.DASHBOARD)} 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${active === AppView.DASHBOARD ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                    Overview
                </button>
            </div>
            </div>

            <div className="flex items-center space-x-6">
                
                {/* Menu Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 transition"
                    >
                        <span>Menu</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-fade-in-down">
                            <button onClick={() => { setView(AppView.SUMMARY); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-800 text-sm text-slate-300 hover:text-white flex items-center gap-2">
                                <span className="text-sky-500">📊</span> Analysis
                            </button>
                            <button onClick={() => { setView(AppView.HISTORY); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-800 text-sm text-slate-300 hover:text-white flex items-center gap-2">
                                <span className="text-indigo-500">📜</span> History
                            </button>
                            <div className="border-t border-slate-800 my-1"></div>
                            <button onClick={() => { onUpdate(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-800 text-sm text-slate-300 hover:text-white flex items-center gap-2">
                                <span className="text-emerald-500">✏️</span> Update Portfolio
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Account</p>
                    <p className="text-slate-200 text-sm font-medium">{user.username}</p>
                </div>
                <button onClick={() => setView(AppView.LOGIN)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition-colors border border-slate-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
        </nav>
    );
}

export const PortfolioView: React.FC<DashboardProps> = (props) => {
  const [totalValue, setTotalValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [showRecap, setShowRecap] = useState(false);
  const [recapText, setRecapText] = useState("Analyzing market data...");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [showManage, setShowManage] = useState(false);

  useEffect(() => {
    const val = props.portfolio.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const invested = props.portfolio.reduce((acc, curr) => acc + (curr.avgBuyPrice * curr.quantity), 0);
    setTotalValue(val);
    setTotalInvested(invested);
    setNews(getMarketNews());
  }, [props.portfolio]);

  const handleStockClick = (symbol: string) => {
    props.setSelectedStockSymbol(symbol);
    props.setView(AppView.STOCK_DETAIL);
  };

  const handleGenerateRecap = async () => {
      setShowRecap(true);
      const summary = props.portfolio.map(s => `${s.symbol}: Now $${s.price.toFixed(2)} (${s.changePercent}%)`).join(', ');
      const text = await generateMarketRecap(summary);
      setRecapText(text);
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12">
      <Nav setView={props.setView} user={props.user} active={AppView.DASHBOARD} onUpdate={() => setShowManage(true)} />
      
      <ManageAssetsModal 
        isOpen={showManage} 
        onClose={() => setShowManage(false)} 
        portfolio={props.portfolio} 
        setPortfolio={props.setPortfolio}
      />

      {/* Recap Modal */}
      {showRecap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <span className="text-2xl">⚡</span> Daily Market Recap
                      </h2>
                      <button onClick={() => setShowRecap(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <div className="prose prose-invert prose-sm text-slate-300 max-h-[60vh] overflow-y-auto">
                      <p className="whitespace-pre-line">{recapText}</p>
                  </div>
                  <div className="mt-6 text-right">
                      <button onClick={() => setShowRecap(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm">Close</button>
                  </div>
              </div>
          </div>
      )}

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-3">
            {/* Header Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 rounded-2xl p-8 mb-10 shadow-2xl border border-slate-800/50">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Net Equity</p>
                        <div className="flex items-baseline gap-4">
                            <h2 className="text-5xl font-extrabold text-white tracking-tight">
                                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h2>
                        </div>
                    </div>
                    <div className="flex flex-col justify-end items-start md:items-end">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Earnings</p>
                        <div className={`text-2xl font-bold ${totalValue >= totalInvested ? 'text-emerald-400' : 'text-red-400'}`}>
                            {totalValue >= totalInvested ? '+' : '-'}${Math.abs(totalValue - totalInvested).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {((totalValue - totalInvested) / totalInvested * 100).toFixed(2)}% Return
                        </p>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            </div>

            <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-bold text-white tracking-tight">Market Holdings</h3>
                <div className="flex gap-4 items-center">
                    <button onClick={handleGenerateRecap} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 border border-emerald-500/30 px-3 py-1.5 rounded-full bg-emerald-500/10">
                        ⚡ Recap
                    </button>
                    <span className="text-slate-500 text-sm">{props.portfolio.length} Assets</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {props.portfolio.map((stock) => {
                const currentValue = stock.price * stock.quantity;
                const diff = stock.price - stock.avgBuyPrice;
                const isPositive = diff >= 0;
                const totalReturn = (diff * stock.quantity);
                const percent = (diff / stock.avgBuyPrice) * 100;
                
                return (
                <div 
                    key={stock.symbol} 
                    onClick={() => handleStockClick(stock.symbol)}
                    className="group bg-slate-900/50 backdrop-blur-sm rounded-lg p-5 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/5 hover:-translate-y-1"
                >
                    <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 group-hover:bg-slate-700 transition">
                                {stock.symbol[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-white leading-none">{stock.symbol}</h4>
                                <p className="text-slate-500 text-xs mt-1 truncate max-w-[100px]">{stock.name}</p>
                            </div>
                    </div>
                    <div className={`text-right ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        <div className="text-sm font-mono font-medium flex items-center justify-end">
                            {isPositive ? '▲' : '▼'} {Math.abs(percent).toFixed(2)}%
                        </div>
                    </div>
                    </div>
                    <div className="space-y-1">
                    <p className="text-2xl font-bold text-white tracking-tight">${stock.price.toFixed(2)}</p>
                    <div className="flex justify-between text-xs pt-3 border-t border-slate-800/50">
                        <span className="text-slate-500">Vol: {stock.quantity}</span>
                        <span className="text-slate-400 font-medium">Earn: ${totalReturn.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                    </div>
                    <div className="text-[10px] text-slate-600 pt-1 text-right">
                        Since {stock.dateInvested || 'Recent'}
                    </div>
                    </div>
                </div>
                );
            })}
             {/* Add New Stock Card (Shortcut to Update) */}
             <button 
                onClick={() => setShowManage(true)}
                className="group bg-slate-900/30 rounded-lg p-5 border-2 border-dashed border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all flex flex-col items-center justify-center text-slate-500 hover:text-sky-400 min-h-[180px]"
             >
                 <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-sky-500/10 flex items-center justify-center mb-3 transition-colors">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                 </div>
                 <span className="font-bold text-sm">Update Portfolio</span>
             </button>
            </div>
        </div>

        {/* Right Sidebar: News */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800 p-6 h-full max-h-[800px] flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Market Pulse</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {news.map(article => (
                        <div key={article.id} className="group cursor-pointer">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{article.source}</span>
                                <span className="text-[10px] text-slate-600">{article.time}</span>
                            </div>
                            <h4 className="text-sm font-medium text-slate-200 group-hover:text-sky-400 transition-colors leading-snug">
                                {article.title}
                            </h4>
                            <div className={`mt-2 h-0.5 w-full rounded-full ${
                                article.sentiment === 'POSITIVE' ? 'bg-emerald-500/30' : 
                                article.sentiment === 'NEGATIVE' ? 'bg-red-500/30' : 'bg-slate-500/30'
                            }`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export const HistoryView: React.FC<DashboardProps> = (props) => {
    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-12">
            <Nav setView={props.setView} user={props.user} active={AppView.HISTORY} onUpdate={() => {}} />
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Transaction History</h2>
                    <p className="text-slate-400 mt-2">Log of all asset acquisition and adjustments.</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden">
                    {(!props.transactions || props.transactions.length === 0) ? (
                        <div className="p-12 text-center text-slate-500">
                            No transactions recorded yet.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-950 text-xs uppercase text-slate-500 font-semibold">
                                <tr>
                                    <th className="p-4 border-b border-slate-800">Date</th>
                                    <th className="p-4 border-b border-slate-800">Type</th>
                                    <th className="p-4 border-b border-slate-800">Asset</th>
                                    <th className="p-4 border-b border-slate-800 text-right">Quantity</th>
                                    <th className="p-4 border-b border-slate-800 text-right">Price @ Time</th>
                                    <th className="p-4 border-b border-slate-800 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-sm">
                                {props.transactions.slice().reverse().map(t => (
                                    <tr key={t.id} className="hover:bg-slate-800/50">
                                        <td className="p-4 text-slate-400 font-mono text-xs">{t.date}</td>
                                        <td className="p-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                                                t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-white block">{t.symbol}</span>
                                            <span className="text-xs text-slate-500">{t.name}</span>
                                        </td>
                                        <td className="p-4 text-right font-mono text-white">{t.quantity}</td>
                                        <td className="p-4 text-right font-mono text-slate-400">${t.price.toFixed(2)}</td>
                                        <td className="p-4 text-right font-mono text-white font-bold">${t.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export const StockDetailView: React.FC<DashboardProps> = (props) => {
  const stock = props.portfolio.find(s => s.symbol === props.selectedStockSymbol);
  const [analysis, setAnalysis] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [regressionData, setRegressionData] = useState<any>({ slope: 0, points: [] });
  const [showManage, setShowManage] = useState(false);
  const [compareBenchmark, setCompareBenchmark] = useState(false);
  
  // Alert Form State
  const [alertPrice, setAlertPrice] = useState<string>('');
  const [alertCondition, setAlertCondition] = useState<'ABOVE'|'BELOW'>('ABOVE');

  useEffect(() => {
    if (stock) {
      setAlertPrice(stock.price.toFixed(2)); // Default to current price
      const isPositive = stock.change >= 0;
      const data = generateHistoricalData(stock.price, 30, isPositive);
      const reg = calculateLinearRegression(data);
      
      let mergedData = reg.points;

      if (compareBenchmark) {
          const benchmark = getBenchmarkData(30, stock.price); // Scaled for comparison
          mergedData = mergedData.map((point, i) => ({
              ...point,
              benchmark: benchmark[i]?.benchmark
          }));
      }
      
      setChartData(mergedData);
      setRegressionData(reg);
      
      generateStockAnalysis(stock.symbol, stock.price, "1 Month").then(setAnalysis);
    }
  }, [stock, compareBenchmark]);

  if (!stock) return <div className="text-white text-center pt-20">Asset not found in portfolio.</div>;

  const handleCreateAlert = () => {
      if(!props.setAlerts || !props.alerts) return;
      const target = parseFloat(alertPrice);
      if(isNaN(target)) return;

      const newAlert: PriceAlert = {
          id: Date.now().toString(),
          symbol: stock.symbol,
          targetPrice: target,
          condition: alertCondition,
          isActive: true,
          createdAt: new Date().toISOString()
      };
      
      props.setAlerts([...props.alerts, newAlert]);
  };

  const handleDeleteAlert = (id: string) => {
      if(!props.setAlerts || !props.alerts) return;
      props.setAlerts(props.alerts.filter(a => a.id !== id));
  };

  const isPositive = stock.change >= 0;
  const color = isPositive ? '#10b981' : '#f43f5e';
  const myAlerts = props.alerts?.filter(a => a.symbol === stock.symbol && a.isActive) || [];

  return (
     <div className="min-h-screen bg-slate-950 pt-24 pb-12">
       <Nav setView={props.setView} user={props.user} active={AppView.DASHBOARD} onUpdate={() => setShowManage(true)}/>
       
       <ManageAssetsModal 
            isOpen={showManage} 
            onClose={() => setShowManage(false)} 
            portfolio={props.portfolio} 
            setPortfolio={props.setPortfolio}
       />

       <div className="max-w-7xl mx-auto px-6">
         <button onClick={() => props.setView(AppView.DASHBOARD)} className="group mb-8 flex items-center text-slate-400 hover:text-white transition text-sm font-medium">
            <div className="bg-slate-800 p-1.5 rounded mr-2 group-hover:bg-slate-700 border border-slate-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </div>
            Back to Dashboard
         </button>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart Section */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900/50 backdrop-blur rounded-xl p-8 border border-slate-800 shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">{stock.symbol}</h1>
                            <p className="text-slate-400 text-lg">{stock.name}</p>
                            <div className="mt-4 flex gap-3">
                                <span className="px-3 py-1 bg-slate-800 rounded text-xs font-bold text-slate-300 border border-slate-700">{stock.sector}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-bold text-white tracking-tight">${stock.price.toFixed(2)}</h2>
                            <p className={`text-lg font-medium mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent}%)
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4 bg-slate-950/50 p-2 rounded border border-slate-800/50">
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-2">Performance Chart (30D)</div>
                        <label className="flex items-center cursor-pointer">
                            <span className="mr-2 text-xs text-slate-400 font-medium">Compare vs S&P 500</span>
                            <div className="relative">
                                <input type="checkbox" className="sr-only" checked={compareBenchmark} onChange={() => setCompareBenchmark(!compareBenchmark)} />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${compareBenchmark ? 'bg-indigo-600' : 'bg-slate-700'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${compareBenchmark ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                        </label>
                    </div>

                    <div className="h-[350px] w-full relative">
                        {/* Legend */}
                        <div className="absolute top-0 left-2 z-10 text-[10px] flex gap-4 pointer-events-none opacity-70">
                             <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{background: color}}></div>
                                <span className="text-slate-300">{stock.symbol}</span>
                            </div>
                            {compareBenchmark && (
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                    <span className="text-indigo-300">S&P 500 (Idx)</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-0.5 bg-orange-400 border-t border-dashed"></div>
                                <span className="text-orange-400">Trend</span>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#64748b" domain={['auto', 'auto']} tick={{fontSize: 10}} tickLine={false} axisLine={false} dx={-10} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px'}}
                            />
                            {/* Real Price Area */}
                            <Area type="monotone" dataKey="price" stroke={color} strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" name={stock.symbol} />
                            
                            {/* Benchmark Line */}
                            {compareBenchmark && (
                                <Line type="monotone" dataKey="benchmark" stroke="#818cf8" strokeWidth={2} dot={false} name="S&P 500" />
                            )}

                            {/* Regression Line */}
                            <Line type="monotone" dataKey="trend" stroke="#fb923c" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} name="Trend" />
                        </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Side Panel: AI & Stats */}
            <div className="space-y-6">
                
                {/* AI Insight */}
                <div className="bg-slate-900/50 backdrop-blur rounded-xl p-6 border border-slate-800 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-24 h-24 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/></svg>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                         <div className="bg-indigo-500/20 p-2 rounded-lg">
                             <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                         </div>
                         <h3 className="text-lg font-bold text-white">Gemini Analysis</h3>
                    </div>
                    <div className="prose prose-invert prose-sm">
                        <p className="text-slate-300 leading-relaxed text-sm">
                        {analysis || (
                            <span className="flex items-center gap-2 text-slate-500 animate-pulse">
                                <span className="w-2 h-2 bg-slate-500 rounded-full"></span> Generating insights...
                            </span>
                        )}
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-slate-900/50 backdrop-blur rounded-xl border border-slate-800 p-6">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-wider">Position Details</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                            <span className="text-slate-400 text-sm">Quantity</span>
                            <span className="text-white font-mono">{stock.quantity}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                            <span className="text-slate-400 text-sm">Avg Cost (Est.)</span>
                            <span className="text-white font-mono">${stock.avgBuyPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                            <span className="text-slate-400 text-sm">Date Invested</span>
                            <span className="text-white font-mono text-xs">{stock.dateInvested || 'N/A'}</span>
                        </div>
                         <div className="flex justify-between items-center pt-1">
                            <span className="text-slate-400 text-sm">Total Return</span>
                            <span className={`font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isPositive ? '+' : ''}{((stock.price - stock.avgBuyPrice) * stock.quantity).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Price Alerts */}
                <div className="bg-slate-900/50 backdrop-blur rounded-xl border border-slate-800 p-6">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-wider flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        Price Alerts
                    </h4>
                    
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white w-24 focus:border-sky-500 focus:outline-none"
                                placeholder="Price"
                                value={alertPrice}
                                onChange={e => setAlertPrice(e.target.value)}
                            />
                            <select 
                                className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white flex-1 focus:border-sky-500 focus:outline-none"
                                value={alertCondition}
                                onChange={e => setAlertCondition(e.target.value as 'ABOVE' | 'BELOW')}
                            >
                                <option value="ABOVE">Above</option>
                                <option value="BELOW">Below</option>
                            </select>
                            <button 
                                onClick={handleCreateAlert}
                                className="bg-sky-600 hover:bg-sky-500 text-white px-3 rounded font-bold text-sm"
                            >
                                +
                            </button>
                        </div>
                        
                        <div className="space-y-2 mt-4 max-h-[150px] overflow-y-auto custom-scrollbar">
                            {myAlerts.length === 0 && (
                                <p className="text-slate-500 text-xs italic">No active alerts.</p>
                            )}
                            {myAlerts.map(alert => (
                                <div key={alert.id} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800 text-xs">
                                    <span className="text-slate-300">
                                        When price is <strong className={alert.condition === 'ABOVE' ? 'text-emerald-400' : 'text-red-400'}>{alert.condition}</strong> ${alert.targetPrice}
                                    </span>
                                    <button onClick={() => handleDeleteAlert(alert.id)} className="text-slate-500 hover:text-red-400">
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
         </div>
       </div>
     </div>
  );
};

export const SummaryView: React.FC<DashboardProps> = (props) => {
  const [range, setRange] = useState<TimeRange>('1W');
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [isPositiveTrend, setIsPositiveTrend] = useState(true);
  const [showManage, setShowManage] = useState(false);

  useEffect(() => {
    const days = range === '1D' ? 24 : range === '1W' ? 7 : 30;
    const data = [];
    let baseVal = 10000;
    
    // Simulate data where trend might flip based on "random" range selection
    const trendDirection = Math.random() > 0.3 ? 1 : -1; 
    setIsPositiveTrend(trendDirection > 0);

    for(let i=0; i<days; i++) {
        const change = (Math.random() - 0.4) * 0.02 * trendDirection; 
        baseVal = baseVal * (1 + change);
        data.push({
            label: range === '1D' ? `${i}:00` : `D${i+1}`,
            value: Math.floor(baseVal)
        })
    }
    setSummaryData(data);
  }, [range]);
  
  // Dynamic color for Summary Chart
  const color = isPositiveTrend ? '#10b981' : '#f43f5e';

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12">
      <Nav setView={props.setView} user={props.user} active={AppView.SUMMARY} onUpdate={() => setShowManage(true)}/>
      
      <ManageAssetsModal 
            isOpen={showManage} 
            onClose={() => setShowManage(false)} 
            portfolio={props.portfolio} 
            setPortfolio={props.setPortfolio}
       />
      
      <div className="max-w-5xl mx-auto px-6">
         <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white tracking-tight">Portfolio Performance</h2>
            <p className="text-slate-400 mt-2">Historical aggregation and performance metrics</p>
         </div>

         <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800 p-8 shadow-2xl mb-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                     <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Net Growth</p>
                     <h3 className="text-2xl font-bold text-white mt-1">
                         {isPositiveTrend ? '+' : '-'}$1,240.50 
                         <span className={`text-sm font-normal ml-2 ${isPositiveTrend ? 'text-emerald-400' : 'text-red-400'}`}>
                             ({isPositiveTrend ? '+' : '-'}12.4%)
                         </span>
                     </h3>
                </div>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {(['1D', '1W', '1M'] as TimeRange[]).map((r) => (
                        <button 
                        key={r}
                        onClick={() => setRange(r)}
                        className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${range === r ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                        {r}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={summaryData}>
                     <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="label" stroke="#475569" tick={{fontSize: 10}} tickLine={false} axisLine={false} dy={10} />
                     <YAxis stroke="#475569" tick={{fontSize: 10}} tickLine={false} axisLine={false} domain={['auto', 'auto']} dx={-10} />
                     <Tooltip contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff'}} itemStyle={{color: color}} />
                     <Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                   </AreaChart>
                 </ResponsiveContainer>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 backdrop-blur p-6 rounded-xl border border-slate-800">
               <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Top Performer</h4>
               <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">
                     NVDA
                  </div>
                  <div>
                     <p className="text-white font-bold text-lg">NVIDIA Corp.</p>
                     <p className="text-emerald-400 text-sm font-medium">+12.4% All Time</p>
                  </div>
               </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur p-6 rounded-xl border border-slate-800">
               <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Asset Allocation</h4>
               <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Technology</span>
                        <span className="text-slate-500">60%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-sky-500 h-full rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Financial</span>
                        <span className="text-slate-500">40%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{width: '40%'}}></div>
                    </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}