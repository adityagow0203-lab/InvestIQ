import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Line, ComposedChart } from 'recharts';
import { AppView, PortfolioItem, TimeRange } from '../types';
import { generateStockAnalysis, generateMarketRecap } from '../services/geminiService';
import { getLiveUpdate, generateHistoricalData, calculateLinearRegression } from '../services/dataService';

interface DashboardProps {
  user: any;
  setView: (view: AppView) => void;
  portfolio: PortfolioItem[];
  setPortfolio: (p: PortfolioItem[]) => void;
  selectedStockSymbol: string | null;
  setSelectedStockSymbol: (s: string | null) => void;
}

const Nav: React.FC<{setView: (v:AppView)=>void, user: any, active: string, onRecap: () => void}> = ({setView, user, active, onRecap}) => (
  <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-40 px-6 py-4 flex justify-between items-center transition-all duration-300">
    <div className="flex items-center space-x-12">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(AppView.DASHBOARD)}>
          <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-sky-500/20">
            IQ
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">InvestIQ</h1>
      </div>
      <div className="hidden md:flex space-x-1">
        <button 
            onClick={() => setView(AppView.DASHBOARD)} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${active === AppView.DASHBOARD ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
        >
            Portfolio
        </button>
        <button 
            onClick={() => setView(AppView.SUMMARY)} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${active === AppView.SUMMARY ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
        >
            Analysis
        </button>
      </div>
    </div>
    <div className="flex items-center space-x-6">
      <button 
        onClick={onRecap}
        className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105"
      >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
          Daily Recap
      </button>

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

export const PortfolioView: React.FC<DashboardProps> = (props) => {
  const [totalValue, setTotalValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [showRecap, setShowRecap] = useState(false);
  const [recapText, setRecapText] = useState("Analyzing market data...");

  useEffect(() => {
    const val = props.portfolio.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const invested = props.portfolio.reduce((acc, curr) => acc + (curr.avgBuyPrice * curr.quantity), 0);
    setTotalValue(val);
    setTotalInvested(invested);
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
      <Nav setView={props.setView} user={props.user} active={AppView.DASHBOARD} onRecap={handleGenerateRecap} />
      
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

      <div className="max-w-7xl mx-auto px-6">
        
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
            <span className="text-slate-500 text-sm">{props.portfolio.length} Assets</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

  useEffect(() => {
    if (stock) {
      const isPositive = stock.change >= 0;
      const data = generateHistoricalData(stock.price, 30, isPositive);
      const reg = calculateLinearRegression(data);
      
      setChartData(reg.points);
      setRegressionData(reg);
      
      generateStockAnalysis(stock.symbol, stock.price, "1 Month").then(setAnalysis);
    }
  }, [stock]);

  if (!stock) return <div className="text-white text-center pt-20">Asset not found in portfolio.</div>;

  const isPositive = stock.change >= 0;
  const color = isPositive ? '#10b981' : '#ef4444';

  return (
     <div className="min-h-screen bg-slate-950 pt-24 pb-12">
       <Nav setView={props.setView} user={props.user} active={AppView.DASHBOARD} onRecap={() => {}} />
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
                    <div className="flex justify-between items-start mb-8">
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
                    
                    <div className="h-[350px] w-full relative">
                        {/* Legend for Regression */}
                        <div className="absolute top-0 right-0 z-10 text-xs flex gap-4">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-0.5 bg-orange-400 border-t border-dashed"></div>
                                <span className="text-orange-400">Regression Trend (Slope: {regressionData.slope.toFixed(2)})</span>
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
                                itemStyle={{color: color}}
                            />
                            {/* Real Price Area */}
                            <Area type="monotone" dataKey="price" stroke={color} strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                            {/* Regression Line */}
                            <Line type="monotone" dataKey="trend" stroke="#fb923c" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />
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
            </div>
         </div>
       </div>
     </div>
  );
};

export const SummaryView: React.FC<DashboardProps> = (props) => {
  const [range, setRange] = useState<TimeRange>('1W');
  const [summaryData, setSummaryData] = useState<any[]>([]);

  useEffect(() => {
    const days = range === '1D' ? 24 : range === '1W' ? 7 : 30;
    const data = [];
    let baseVal = 10000;
    // Ensure graph always looks positive for demo, or realistic
    for(let i=0; i<days; i++) {
        const change = (Math.random() - 0.4) * 0.02; // Slight upward bias
        baseVal = baseVal * (1 + change);
        data.push({
            label: range === '1D' ? `${i}:00` : `D${i+1}`,
            value: Math.floor(baseVal)
        })
    }
    setSummaryData(data);
  }, [range]);

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12">
      <Nav setView={props.setView} user={props.user} active={AppView.SUMMARY} onRecap={() => {}} />
      <div className="max-w-5xl mx-auto px-6">
         <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white tracking-tight">Portfolio Performance</h2>
            <p className="text-slate-400 mt-2">Historical aggregation and performance metrics</p>
         </div>

         <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800 p-8 shadow-2xl mb-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                     <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Net Growth</p>
                     <h3 className="text-2xl font-bold text-white mt-1">+$1,240.50 <span className="text-sm font-normal text-emerald-400">(+12.4%)</span></h3>
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
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="label" stroke="#475569" tick={{fontSize: 10}} tickLine={false} axisLine={false} dy={10} />
                     <YAxis stroke="#475569" tick={{fontSize: 10}} tickLine={false} axisLine={false} domain={['auto', 'auto']} dx={-10} />
                     <Tooltip contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff'}} itemStyle={{color: '#38bdf8'}} />
                     <Area type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
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