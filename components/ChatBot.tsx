import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PortfolioItem } from '../types';
import { chatWithBot } from '../services/geminiService';

interface ChatBotProps {
  portfolio: PortfolioItem[];
}

export const ChatBot: React.FC<ChatBotProps> = ({ portfolio }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', text: "Hi! I'm your InvestIQ Assistant. Ask me about your portfolio or basic stock concepts.", sender: 'bot', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Rule-based logic
  const getRuleBasedResponse = (query: string): string | null => {
    const lowerQ = query.toLowerCase();
    
    if (lowerQ.includes('hello') || lowerQ.includes('hi')) return "Hello! How can I help you with your investments today?";
    if (lowerQ.includes('portfolio value')) {
      const total = portfolio.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return `Your total portfolio value is currently $${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`;
    }
    if (lowerQ.includes('best stock')) {
        const best = [...portfolio].sort((a, b) => b.changePercent - a.changePercent)[0];
        if (best) return `Currently, your best performing stock today is ${best.symbol} (${best.name}) with a ${best.changePercent}% increase.`;
        return "You don't have enough stocks to determine the best one yet.";
    }
    if (lowerQ.includes('what is pe ratio')) return "The P/E ratio (Price-to-Earnings) measures a company's current share price relative to its per-share earnings. It helps determine if a stock is overvalued or undervalued.";
    if (lowerQ.includes('market open')) return "The US stock market is generally open from 9:30 AM to 4:00 PM Eastern Time, Monday through Friday.";
    
    return null; // No rule matched
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Check rules first
    const ruleResponse = getRuleBasedResponse(input);
    
    let botText = '';
    if (ruleResponse) {
      botText = ruleResponse;
      await new Promise(r => setTimeout(r, 500)); // Fake delay for realism
    } else {
      // Fallback to Gemini
      const context = `User holds: ${portfolio.map(s => s.symbol).join(', ')}.`;
      botText = await chatWithBot(input, context);
    }

    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), text: botText, sender: 'bot', timestamp: new Date() };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-accent text-white p-4 rounded-full shadow-2xl hover:bg-sky-500 transition-all z-50 flex items-center justify-center w-14 h-14"
      >
        {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-secondary border border-slate-700 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-white">InvestIQ Assistant</h3>
            <span className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-accent text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
               <div className="flex justify-start">
                  <div className="bg-slate-700 p-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-slate-900 border-t border-slate-700">
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent"
                placeholder="Ask about stocks..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-accent text-white p-2 rounded-lg hover:bg-sky-500 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};