import React, { useState, useEffect } from 'react';
import { AppView, User, PortfolioItem, Stock } from './types';
import { Login, Signup } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { PortfolioView, StockDetailView, SummaryView } from './components/Dashboard';
import { ChatBot } from './components/ChatBot';
import { AdminPanel } from './components/Admin';
import { INITIAL_STOCKS, getLiveUpdate } from './services/dataService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [availableStocks, setAvailableStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);

  // Load persistence for user portfolio
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('investiq_portfolio');
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
  }, []);

  // Sync availableStocks updates to portfolio prices
  useEffect(() => {
    setPortfolio(prevPortfolio => {
      return prevPortfolio.map(item => {
        const globalStock = availableStocks.find(s => s.symbol === item.symbol);
        return globalStock ? { ...item, price: globalStock.price, change: globalStock.change, changePercent: globalStock.changePercent } : item;
      });
    });
  }, [availableStocks]);

  // Global Price Simulation (Ticks for both Admin and User if active)
  useEffect(() => {
    const interval = setInterval(() => {
        setAvailableStocks(prev => prev.map(stock => ({
            ...stock,
            price: getLiveUpdate(stock.price)
        })));
    }, 5000); // 5s tick
    return () => clearInterval(interval);
  }, []);

  // Admin function to manually update stock
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
        return <Onboarding setView={setCurrentView} setPortfolio={setPortfolio} />;
      case AppView.DASHBOARD:
        return (
          <PortfolioView 
            user={user} 
            setView={setCurrentView} 
            portfolio={portfolio} 
            setPortfolio={setPortfolio} 
            selectedStockSymbol={selectedStockSymbol}
            setSelectedStockSymbol={setSelectedStockSymbol}
          />
        );
      case AppView.STOCK_DETAIL:
        return (
          <StockDetailView 
             user={user}
             setView={setCurrentView}
             portfolio={portfolio}
             setPortfolio={setPortfolio}
             selectedStockSymbol={selectedStockSymbol}
             setSelectedStockSymbol={setSelectedStockSymbol}
          />
        );
      case AppView.SUMMARY:
        return (
          <SummaryView 
             user={user}
             setView={setCurrentView}
             portfolio={portfolio}
             setPortfolio={setPortfolio}
             selectedStockSymbol={selectedStockSymbol}
             setSelectedStockSymbol={setSelectedStockSymbol}
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
      {renderView()}
      {/* Show Chatbot only on authenticated main views */}
      {(currentView === AppView.DASHBOARD || currentView === AppView.STOCK_DETAIL || currentView === AppView.SUMMARY) && (
        <ChatBot portfolio={portfolio} />
      )}
    </div>
  );
};

export default App;