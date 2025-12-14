import React, { useState, useEffect } from 'react';
import { AppView, User, PortfolioItem, Stock, Transaction, PriceAlert } from './types';
import { Login, Signup } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { PortfolioView, StockDetailView, SummaryView, HistoryView } from './components/Dashboard';
import { ChatBot } from './components/ChatBot';
import { AdminPanel } from './components/Admin';
import { INITIAL_STOCKS, getLiveUpdate } from './services/dataService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [availableStocks, setAvailableStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);
  
  // Alert State
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'info' | 'success'} | null>(null);

  // Load persistence
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('investiq_portfolio');
    if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
    
    const savedTransactions = localStorage.getItem('investiq_transactions');
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));

    const savedAlerts = localStorage.getItem('investiq_alerts');
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
  }, []);

  // Save alerts when changed
  useEffect(() => {
    localStorage.setItem('investiq_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Sync availableStocks updates to portfolio prices
  useEffect(() => {
    setPortfolio(prevPortfolio => {
      return prevPortfolio.map(item => {
        const globalStock = availableStocks.find(s => s.symbol === item.symbol);
        return globalStock ? { ...item, price: globalStock.price, change: globalStock.change, changePercent: globalStock.changePercent } : item;
      });
    });
  }, [availableStocks]);

  // Check Alerts Logic
  useEffect(() => {
      let alertsChanged = false;
      const updatedAlerts = alerts.map(alert => {
          if (!alert.isActive) return alert;

          const stock = availableStocks.find(s => s.symbol === alert.symbol);
          if (!stock) return alert;

          let triggered = false;
          if (alert.condition === 'ABOVE' && stock.price >= alert.targetPrice) {
              triggered = true;
          } else if (alert.condition === 'BELOW' && stock.price <= alert.targetPrice) {
              triggered = true;
          }

          if (triggered) {
              alertsChanged = true;
              setNotification({
                  message: `🔔 Price Alert: ${stock.symbol} is now $${stock.price.toFixed(2)} (${alert.condition === 'ABOVE' ? 'Above' : 'Below'} target of $${alert.targetPrice})`,
                  type: 'success'
              });
              // Auto-hide notification
              setTimeout(() => setNotification(null), 5000);
              return { ...alert, isActive: false }; // Disable alert after trigger
          }
          return alert;
      });

      if (alertsChanged) {
          setAlerts(updatedAlerts);
      }
  }, [availableStocks]); // Runs whenever prices update

  // Handle Portfolio Updates and Generate History
  const handlePortfolioUpdate = (newPortfolio: PortfolioItem[]) => {
      const newTransactions: Transaction[] = [];
      const timestamp = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();

      newPortfolio.forEach(newItem => {
          const oldItem = portfolio.find(p => p.symbol === newItem.symbol);
          if (!oldItem) {
              newTransactions.push({
                  id: Date.now().toString() + newItem.symbol,
                  type: 'BUY',
                  symbol: newItem.symbol,
                  name: newItem.name,
                  quantity: newItem.quantity,
                  price: newItem.price,
                  date: timestamp,
                  total: newItem.quantity * newItem.price
              });
          } else if (newItem.quantity > oldItem.quantity) {
              const diff = newItem.quantity - oldItem.quantity;
              newTransactions.push({
                id: Date.now().toString() + newItem.symbol,
                type: 'BUY',
                symbol: newItem.symbol,
                name: newItem.name,
                quantity: diff,
                price: newItem.price,
                date: timestamp,
                total: diff * newItem.price
            });
          } else if (newItem.quantity < oldItem.quantity) {
              const diff = oldItem.quantity - newItem.quantity;
              newTransactions.push({
                id: Date.now().toString() + newItem.symbol,
                type: 'SELL',
                symbol: newItem.symbol,
                name: newItem.name,
                quantity: diff,
                price: newItem.price,
                date: timestamp,
                total: diff * newItem.price
            });
          }
      });

      portfolio.forEach(oldItem => {
          const exists = newPortfolio.find(p => p.symbol === oldItem.symbol);
          if (!exists) {
               newTransactions.push({
                id: Date.now().toString() + oldItem.symbol,
                type: 'SELL',
                symbol: oldItem.symbol,
                name: oldItem.name,
                quantity: oldItem.quantity,
                price: oldItem.price,
                date: timestamp,
                total: oldItem.quantity * oldItem.price
            });
          }
      });

      if (newTransactions.length > 0) {
          const updatedTransactions = [...transactions, ...newTransactions];
          setTransactions(updatedTransactions);
          localStorage.setItem('investiq_transactions', JSON.stringify(updatedTransactions));
      }

      setPortfolio(newPortfolio);
  };

  // Global Price Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setAvailableStocks(prev => prev.map(stock => ({
            ...stock,
            price: getLiveUpdate(stock.price)
        })));
    }, 5000); // 5s tick
    return () => clearInterval(interval);
  }, []);

  const handleAdminUpdateStock = (symbol: string, newPrice: number) => {
    setAvailableStocks(prev => prev.map(s => 
        s.symbol === symbol ? { ...s, price: newPrice } : s
    ));
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.LOGIN:
        return <Login setView={setCurrentView} setUser={setUser} />;
      case AppView.SIGNUP:
        return <Signup setView={setCurrentView} setUser={setUser} />;
      case AppView.ONBOARDING:
        return <Onboarding setView={setCurrentView} setPortfolio={handlePortfolioUpdate} />;
      case AppView.DASHBOARD:
        return (
          <PortfolioView 
            user={user} 
            setView={setCurrentView} 
            portfolio={portfolio} 
            setPortfolio={handlePortfolioUpdate} 
            selectedStockSymbol={selectedStockSymbol}
            setSelectedStockSymbol={setSelectedStockSymbol}
            alerts={alerts}
            setAlerts={setAlerts}
          />
        );
      case AppView.STOCK_DETAIL:
        return (
          <StockDetailView 
             user={user}
             setView={setCurrentView}
             portfolio={portfolio}
             setPortfolio={handlePortfolioUpdate}
             selectedStockSymbol={selectedStockSymbol}
             setSelectedStockSymbol={setSelectedStockSymbol}
             alerts={alerts}
             setAlerts={setAlerts}
          />
        );
      case AppView.SUMMARY:
        return (
          <SummaryView 
             user={user}
             setView={setCurrentView}
             portfolio={portfolio}
             setPortfolio={handlePortfolioUpdate}
             selectedStockSymbol={selectedStockSymbol}
             setSelectedStockSymbol={setSelectedStockSymbol}
          />
        );
      case AppView.HISTORY:
        return (
          <HistoryView 
            user={user}
            setView={setCurrentView}
            portfolio={portfolio}
            setPortfolio={handlePortfolioUpdate}
            selectedStockSymbol={selectedStockSymbol}
            setSelectedStockSymbol={setSelectedStockSymbol}
            transactions={transactions}
          />
        );
      case AppView.ADMIN:
        return (
            <AdminPanel 
                setView={setCurrentView} 
                availableStocks={availableStocks}
                updateStock={handleAdminUpdateStock}
            />
        );
      default:
        return <Login setView={setCurrentView} setUser={setUser} />;
    }
  };

  return (
    <div className="font-sans text-slate-200 selection:bg-sky-500 selection:text-white">
      {/* Global Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-[60] animate-fade-in-down">
          <div className="bg-slate-900/90 backdrop-blur-md border border-emerald-500/50 shadow-2xl rounded-lg p-4 flex items-center gap-4 max-w-sm">
             <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
             </div>
             <div>
                <h4 className="font-bold text-white text-sm">Market Alert</h4>
                <p className="text-xs text-slate-300">{notification.message}</p>
             </div>
             <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-white">✕</button>
          </div>
        </div>
      )}

      {renderView()}
      
      {(currentView === AppView.DASHBOARD || currentView === AppView.STOCK_DETAIL || currentView === AppView.SUMMARY || currentView === AppView.HISTORY) && (
        <ChatBot portfolio={portfolio} />
      )}
    </div>
  );
};

export default App;