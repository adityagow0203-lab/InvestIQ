import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AppView, ApiLog, SystemStatus, Stock, AdminUserView } from '../types';
import { getSystemStatus } from '../services/dataService';

interface AdminProps {
  setView: (v: AppView) => void;
  availableStocks: Stock[];
  updateStock: (symbol: string, newPrice: number) => void;
}

export const AdminPanel: React.FC<AdminProps> = ({ setView, availableStocks, updateStock }) => {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [status, setStatus] = useState<SystemStatus>(getSystemStatus());
  const [latencyData, setLatencyData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'DATABASE' | 'USERS'>('MONITOR');
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Mock User Data
  const [users, setUsers] = useState<AdminUserView[]>([
    { id: '1', username: 'john_doe', email: 'john@example.com', status: 'ACTIVE', lastLogin: '2023-10-25T10:30:00Z' },
    { id: '2', username: 'jane_smith', email: 'jane@example.com', status: 'ACTIVE', lastLogin: '2023-10-24T14:15:00Z' },
    { id: '3', username: 'trader_x', email: 'x@crypto.com', status: 'SUSPENDED', lastLogin: '2023-09-15T09:00:00Z' },
  ]);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newStatus = getSystemStatus();
      setStatus(newStatus);

      // Simulate log stream
      const endpoints = ['/api/market/quotes', '/api/ai/gen', '/api/auth/verify', '/api/db/sync'];
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const isError = Math.random() > 0.95;
      const isWarning = !isError && Math.random() > 0.85;
      const status = isError ? 'ERROR' : isWarning ? 'WARNING' : 'SUCCESS';
      
      let payload = undefined;
      let errorMessage = undefined;

      // Mock payload generation
      if (endpoint === '/api/market/quotes') {
        payload = JSON.stringify({ symbols: ['AAPL', 'NVDA', 'TSLA'] });
      } else if (endpoint === '/api/ai/gen') {
        payload = JSON.stringify({ prompt: 'Analyze stock performance...', model: 'gemini-2.5-flash' });
      } else if (endpoint === '/api/auth/verify') {
        payload = JSON.stringify({ token: 'eyJhbGciOiJIUzI1Ni...' });
      }

      // Mock error generation
      if (status === 'ERROR') {
        errorMessage = 'Gateway Timeout (504): Upstream service unresponsive at ' + new Date().toISOString();
      } else if (status === 'WARNING') {
        errorMessage = 'Latency threshold exceeded: Response time > 200ms';
      }

      const newLog: ApiLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        endpoint,
        status,
        latency: Math.floor(Math.random() * 200) + 20,
        payload,
        errorMessage
      };

      setLogs(prev => [newLog, ...prev].slice(0, 10));
      
      setLatencyData(prev => {
        const newData = [...prev, { time: new Date().toLocaleTimeString(), latency: newLog.latency }];
        return newData.slice(-20); // Keep last 20 points
      });

    }, 5000); // 5 Seconds update

    return () => clearInterval(interval);
  }, []);

  const handleEditSave = (symbol: string) => {
    const price = parseFloat(editPrice);
    if (!isNaN(price)) {
      updateStock(symbol, price);
    }
    setEditingStock(null);
  };

  const handleResolve = () => {
     // Mock resolving an issue
     const successLog: ApiLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        endpoint: 'SYSTEM_ACTION',
        status: 'SUCCESS',
        latency: 0,
        payload: JSON.stringify({ action: 'RESOLVE_ALERTS', user: 'admin' })
     };
     setLogs(prev => [successLog, ...prev]);
  };

  const toggleUserStatus = (id: string) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u));
  };

  const deleteUser = (id: string) => {
      if(confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
          setUsers(prev => prev.filter(u => u.id !== id));
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200">
      {/* Admin Nav */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <h1 className="text-xl font-bold tracking-tight text-white">InvestIQ <span className="text-slate-500 font-normal">| SysAdmin</span></h1>
        </div>
        <div className="flex items-center space-x-6">
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                <button 
                  onClick={() => setActiveTab('MONITOR')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'MONITOR' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Monitor
                </button>
                <button 
                  onClick={() => setActiveTab('DATABASE')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'DATABASE' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Database
                </button>
                <button 
                  onClick={() => setActiveTab('USERS')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'USERS' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Users
                </button>
            </div>
            <button onClick={() => setView(AppView.LOGIN)} className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1.5 rounded bg-red-500/10">
                LOGOUT
            </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        
        {activeTab === 'MONITOR' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                {/* Key Metrics */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg">
                    <h3 className="text-slate-500 text-xs uppercase tracking-wider mb-4">CPU Load</h3>
                    <div className="flex items-end space-x-2">
                        <span className="text-4xl font-bold text-white">{status.cpu}%</span>
                        <span className="text-xs text-slate-400 mb-1">core utilization</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${status.cpu > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${status.cpu}%`}}></div>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg">
                    <h3 className="text-slate-500 text-xs uppercase tracking-wider mb-4">Active Connections</h3>
                    <div className="flex items-end space-x-2">
                        <span className="text-4xl font-bold text-sky-400">{status.activeConnections.toLocaleString()}</span>
                        <span className="text-xs text-slate-400 mb-1">concurrent users</span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 text-xs rounded border border-sky-500/20">WebSocket: Connected</span>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg">
                    <h3 className="text-slate-500 text-xs uppercase tracking-wider mb-4">Database Health</h3>
                    <div className="flex items-center justify-between">
                         <span className={`text-2xl font-bold ${status.databaseStatus === 'Healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {status.databaseStatus}
                         </span>
                         {status.databaseStatus !== 'Healthy' && (
                             <button onClick={() => setStatus(prev => ({...prev, databaseStatus: 'Healthy'}))} className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded border border-amber-500/30 hover:bg-amber-500/30">
                                 Re-sync
                             </button>
                         )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Last backup: 12m ago</p>
                </div>

                {/* Latency Chart */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-lg min-h-[300px]">
                    <h3 className="text-slate-500 text-xs uppercase tracking-wider mb-4">API Latency (ms)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={latencyData}>
                            <XAxis dataKey="time" hide />
                            <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b'}}
                                itemStyle={{color: '#38bdf8'}}
                            />
                            <Line type="monotone" dataKey="latency" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Logs */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-lg overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-slate-500 text-xs uppercase tracking-wider">Live Logs</h3>
                        <button onClick={handleResolve} className="text-xs text-slate-400 hover:text-white">Clear</button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px] pr-2 custom-scrollbar">
                        {logs.map(log => (
                            <div key={log.id} className="bg-slate-950/50 border border-slate-800 rounded transition-colors hover:border-slate-700">
                                <div 
                                    className="text-xs font-mono p-3 flex justify-between items-center cursor-pointer hover:bg-slate-900/50 select-none"
                                    onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`transform transition-transform duration-200 ${expandedLogId === log.id ? 'rotate-90' : ''}`}>
                                            ▶
                                        </span>
                                        <div>
                                            <span className="text-slate-500 mr-2">{log.timestamp.split('T')[1].split('.')[0]}</span>
                                            <span className="text-slate-300 font-bold">{log.endpoint}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-slate-500 hidden sm:inline">{log.latency}ms</span>
                                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                            log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                            log.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                            'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                            {log.status}
                                        </span>
                                    </div>
                                </div>
                                
                                {expandedLogId === log.id && (
                                    <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-xs font-mono text-slate-400 animate-fade-in">
                                        <div className="grid grid-cols-1 gap-3">
                                            {log.payload && (
                                                <div>
                                                    <span className="text-sky-500/70 uppercase text-[10px] tracking-wider font-bold block mb-1">Request Payload</span>
                                                    <div className="bg-slate-900 p-2 rounded border border-slate-800 overflow-x-auto">
                                                        <code className="text-sky-300 break-all">{log.payload}</code>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {log.errorMessage && (
                                                <div>
                                                    <span className="text-red-500/70 uppercase text-[10px] tracking-wider font-bold block mb-1">Error Stack Trace</span>
                                                    <div className="bg-red-950/10 p-2 rounded border border-red-900/30 overflow-x-auto">
                                                        <code className="text-red-400 break-all">{log.errorMessage}</code>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center pt-2 border-t border-slate-800/50 mt-1 text-[10px] text-slate-600">
                                                <span>Transaction ID: {log.id}</span>
                                                <span>Timestamp: {log.timestamp}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'DATABASE' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-white">Stock Database</h2>
                        <p className="text-sm text-slate-400">Directly modify market data. Changes reflect instantly for users.</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-3 py-2 rounded">
                        ⚠ Admin Write Access Enabled
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-950 text-xs uppercase text-slate-500 font-semibold">
                            <tr>
                                <th className="p-4 border-b border-slate-800">Symbol</th>
                                <th className="p-4 border-b border-slate-800">Company Name</th>
                                <th className="p-4 border-b border-slate-800">Sector</th>
                                <th className="p-4 border-b border-slate-800">Current Price</th>
                                <th className="p-4 border-b border-slate-800 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm">
                            {availableStocks.map(stock => (
                                <tr key={stock.symbol} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-bold text-white">{stock.symbol}</td>
                                    <td className="p-4 text-slate-300">{stock.name}</td>
                                    <td className="p-4 text-slate-400">
                                        <span className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs">
                                            {stock.sector}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-white">
                                        {editingStock === stock.symbol ? (
                                            <input 
                                                autoFocus
                                                type="number" 
                                                className="bg-slate-950 border border-sky-500 rounded px-2 py-1 w-24 text-white focus:outline-none"
                                                value={editPrice}
                                                onChange={(e) => setEditPrice(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleEditSave(stock.symbol);
                                                    if (e.key === 'Escape') setEditingStock(null);
                                                }}
                                            />
                                        ) : (
                                            `$${stock.price.toFixed(2)}`
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        {editingStock === stock.symbol ? (
                                            <div className="space-x-2">
                                                <button onClick={() => handleEditSave(stock.symbol)} className="text-emerald-400 hover:text-emerald-300 font-bold text-xs">SAVE</button>
                                                <button onClick={() => setEditingStock(null)} className="text-slate-500 hover:text-slate-300 text-xs">CANCEL</button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    setEditingStock(stock.symbol);
                                                    setEditPrice(stock.price.toString());
                                                }}
                                                className="text-sky-400 hover:text-sky-300 font-medium text-xs border border-sky-500/30 px-3 py-1 rounded hover:bg-sky-500/10 transition"
                                            >
                                                EDIT
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'USERS' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white">User Management</h2>
                    <p className="text-sm text-slate-400">Manage access control. User asset details are encrypted and hidden from view.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-950 text-xs uppercase text-slate-500 font-semibold">
                            <tr>
                                <th className="p-4 border-b border-slate-800">Username</th>
                                <th className="p-4 border-b border-slate-800">Email</th>
                                <th className="p-4 border-b border-slate-800">Status</th>
                                <th className="p-4 border-b border-slate-800">Last Login</th>
                                <th className="p-4 border-b border-slate-800 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-bold text-white">{u.username}</td>
                                    <td className="p-4 text-slate-300">{u.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400 font-mono text-xs">
                                        {new Date(u.lastLogin).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button 
                                            onClick={() => toggleUserStatus(u.id)}
                                            className="text-xs text-slate-400 hover:text-white underline"
                                        >
                                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                        </button>
                                        <button 
                                            onClick={() => deleteUser(u.id)}
                                            className="text-xs text-red-500 hover:text-red-400 underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};