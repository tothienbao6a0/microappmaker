import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { Button } from './ui/button';
import { X, Send, Loader2, Sparkles, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIChat: React.FC = () => {
  const { isChatOpen, toggleChat, addMicroApp } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hi! I can help you create custom apps for your dashboard. What would you like to build today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isChatOpen]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // In a real implementation, you would call the OpenAI API here
      // For the MVP, we'll simulate a response
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Generate a mock app based on the input
      const appType = input.toLowerCase().includes('weather') 
        ? 'weather' 
        : input.toLowerCase().includes('latex') 
          ? 'latex-generator'
          : 'url-launcher';
      
      // Add assistant response
      setMessages((prev) => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `I've created a ${appType} microapp based on your request! You can find it in your app library now. You can add it as a widget to your dashboard.` 
        }
      ]);
      
      // Create a new app based on the type
      const newApp = {
        name: `${appType.charAt(0).toUpperCase() + appType.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())}`,
        description: `Generated from prompt: "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"`,
        icon: getAppIcon(appType),
        code: getAppCode(appType),
        config: getAppConfig(appType, input)
      };
      
      // Add the app to the store
      addMicroApp(newApp);
      
    } catch (error) {
      console.error('Error generating app:', error);
      setMessages((prev) => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while creating your app. Please try again.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper functions for app creation
  const getAppIcon = (type: string): string => {
    switch (type) {
      case 'weather':
        return '🌤️';
      case 'latex-generator':
        return '📝';
      case 'url-launcher':
        return '🔗';
      default:
        return '📱';
    }
  };
  
  const getAppCode = (type: string): string => {
    switch (type) {
      case 'url-launcher':
        return `
          function UrlLauncher({ config }) {
            const [url, setUrl] = React.useState(config.url || '');
            const [error, setError] = React.useState('');
            
            const handleLaunch = () => {
              try {
                if (url) {
                  // Format URL properly
                  const formattedUrl = url.startsWith('http') ? url : \`https://\${url}\`;
                  // Use window.open directly
                  window.open(formattedUrl, '_blank');
                }
              } catch (err) {
                setError('Failed to open URL. Please try again.');
                console.error(err);
              }
            };
            
            return (
              <div className="h-full flex flex-col p-3 bg-white text-gray-800">
                <h3 className="text-sm font-medium mb-2">URL Launcher</h3>
                
                <div className="flex-1 flex flex-col">
                  <div className="mb-3">
                    <div className="flex items-center gap-1">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="Enter URL"
                          className="w-full p-2 pr-8 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
                          onKeyDown={(e) => e.key === 'Enter' && handleLaunch()}
                        />
                        <button
                          onClick={handleLaunch}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Launch URL"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="mb-2 p-2 bg-red-100 text-red-600 text-xs rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <div className="mt-auto text-center text-xs text-gray-500">
                    Enter a URL and press Enter or click the launch icon
                  </div>
                </div>
              </div>
            );
          }
        `;
        
      case 'weather':
        return `
          function Weather({ config }) {
            const [city, setCity] = React.useState(config.city || 'New York');
            const [weather, setWeather] = React.useState(null);
            const [loading, setLoading] = React.useState(false);
            const [error, setError] = React.useState('');
            
            // Simulate fetching weather data
            const fetchWeather = React.useCallback(() => {
              setLoading(true);
              setError('');
              
              // Simulate API call
              setTimeout(() => {
                try {
                  // Generate random weather data for demo
                  const temp = Math.floor(Math.random() * 30) + 10; // 10-40°C
                  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Stormy'][Math.floor(Math.random() * 5)];
                  const humidity = Math.floor(Math.random() * 50) + 30; // 30-80%
                  const windSpeed = Math.floor(Math.random() * 20) + 5; // 5-25 km/h
                  
                  setWeather({
                    city,
                    temp,
                    conditions,
                    humidity,
                    windSpeed,
                    date: new Date().toLocaleDateString()
                  });
                  setLoading(false);
                } catch (err) {
                  setError('Failed to fetch weather data');
                  setLoading(false);
                }
              }, [city]);
            
            // Fetch weather on mount and when city changes
            React.useEffect(() => {
              fetchWeather();
            }, [fetchWeather]);
            
            const handleSubmit = (e) => {
              e.preventDefault();
              fetchWeather();
            };
            
            const getWeatherIcon = (condition) => {
              switch(condition) {
                case 'Sunny': return '☀️';
                case 'Cloudy': return '☁️';
                case 'Rainy': return '🌧️';
                case 'Partly Cloudy': return '⛅';
                case 'Stormy': return '⛈️';
                default: return '🌤️';
              }
            };
            
            return (
              <div className="h-full flex flex-col p-3 bg-white text-gray-800">
                <h3 className="text-sm font-medium mb-2">Weather</h3>
                
                <form onSubmit={handleSubmit} className="mb-3">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                      className="flex-1 p-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                    <button
                      type="submit"
                      disabled={loading || !city.trim()}
                      className="p-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? '...' : 'Go'}
                    </button>
                  </div>
                </form>
                
                {error && (
                  <div className="mb-3 p-2 bg-red-100 text-red-600 text-xs rounded-md">
                    {error}
                  </div>
                )}
                
                {weather && !loading && (
                  <div className="flex-1 flex flex-col items-center justify-center bg-blue-50 rounded-md p-3">
                    <div className="text-4xl mb-1">{getWeatherIcon(weather.conditions)}</div>
                    <h4 className="text-lg font-medium text-gray-800">{weather.city}</h4>
                    <p className="text-xs text-gray-500 mb-3">{weather.date}</p>
                    
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {weather.temp}°C
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{weather.conditions}</p>
                    
                    <div className="w-full grid grid-cols-2 gap-2 mt-1">
                      <div className="bg-white p-2 rounded-md text-center shadow-sm">
                        <p className="text-xs text-gray-500">Humidity</p>
                        <p className="font-medium text-sm">{weather.humidity}%</p>
                      </div>
                      <div className="bg-white p-2 rounded-md text-center shadow-sm">
                        <p className="text-xs text-gray-500">Wind</p>
                        <p className="font-medium text-sm">{weather.windSpeed} km/h</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={fetchWeather}
                      className="mt-3 p-1.5 w-full bg-gray-100 text-xs text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                )}
                
                {loading && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            );
          }
        `;
        
      case 'latex-generator':
        return `
          function LatexGenerator({ config }) {
            const [input, setInput] = React.useState('');
            const [latex, setLatex] = React.useState('');
            const [loading, setLoading] = React.useState(false);
            const [error, setError] = React.useState('');
            
            // Function to generate LaTeX from input
            const generateLatex = () => {
              if (!input.trim()) return;
              
              setLoading(true);
              setError('');
              
              // Simulate API call
              setTimeout(() => {
                try {
                  // Simple conversion for demo purposes
                  let result = input;
                  
                  // Replace common patterns with LaTeX equivalents
                  result = result.replace(/\\^2/g, '^{2}');
                  result = result.replace(/sqrt\\(([^)]+)\\)/g, '\\\\sqrt{$1}');
                  result = result.replace(/([a-z])\\^([a-z0-9])/gi, '$1^{$2}');
                  result = result.replace(/([a-z])\\_([a-z0-9])/gi, '$1_{$2}');
                  result = result.replace(/sum from (.*?) to (.*?) of (.*)/i, '\\\\sum_{$1}^{$2} $3');
                  result = result.replace(/integral from (.*?) to (.*?) of (.*)/i, '\\\\int_{$1}^{$2} $3');
                  
                  // Add LaTeX formatting
                  result = '$' + result + '$';
                  
                  setLatex(result);
                  setLoading(false);
                } catch (err) {
                  setError('Failed to generate LaTeX');
                  setLoading(false);
                }
              }, 1000);
            };
            
            const handleSubmit = (e) => {
              e.preventDefault();
              generateLatex();
            };
            
            const examples = [
              'E = mc^2',
              'f(x) = x^2 + 2x + 1',
              'sqrt(x^2 + y^2)',
              'sum from i=1 to n of i^2'
            ];
            
            return (
              <div className="h-full flex flex-col p-3 bg-white text-gray-800">
                <h3 className="text-sm font-medium mb-2">LaTeX Generator</h3>
                
                <form onSubmit={handleSubmit} className="mb-2">
                  <div className="mb-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter mathematical expression"
                      className="w-full p-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 min-h-[60px]"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="w-full p-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate LaTeX'}
                  </button>
                </form>
                
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1.5">
                    Examples:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {examples.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => setInput(example)}
                        className="p-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
                
                {error && (
                  <div className="mb-2 p-2 bg-red-100 text-red-600 text-xs rounded-md">
                    {error}
                  </div>
                )}
                
                {latex && (
                  <div className="mt-auto">
                    <div className="text-xs text-gray-500 mb-1.5">Generated LaTeX:</div>
                    <pre className="bg-gray-50 p-2 rounded-md overflow-x-auto text-xs text-gray-800 border border-gray-200">
                      {latex}
                    </pre>
                  </div>
                )}
              </div>
            );
          }
        `;
        
      default:
        return `
          function DefaultApp({ config }) {
            return (
              <div className="h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-4xl mb-4">👋</div>
                <h3 className="text-xl font-medium text-slate-800 mb-2">Hello World!</h3>
                <p className="text-slate-600 text-center max-w-xs">
                  This is a default app. You can customize it or create a new one using the App Creator.
                </p>
                <div className="mt-6 p-3 bg-white rounded-lg border border-slate-200 shadow-sm w-full max-w-xs">
                  <div className="text-xs font-medium text-slate-500 mb-2">App Info</div>
                  <div className="text-sm text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Type:</span>
                      <span className="font-medium">Default</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Created:</span>
                      <span className="font-medium">${new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Status:</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        `;
    }
  };
  
  const getAppConfig = (type: string, input: string): Record<string, any> => {
    switch (type) {
      case 'url-launcher':
        // Try to extract a URL from the input
        const urlMatch = input.match(/https?:\/\/[^\s]+/);
        return {
          url: urlMatch ? urlMatch[0] : 'https://example.com'
        };
        
      case 'weather':
        // Try to extract a city from the input
        const cityMatch = input.match(/weather\s+(?:for|in)\s+([a-zA-Z\s]+)/i);
        return {
          city: cityMatch ? cityMatch[1].trim() : 'New York'
        };
        
      default:
        return {};
    }
  };
  
  return (
    <AnimatePresence>
      {isChatOpen && (
        <motion.div
          className="fixed right-0 top-0 bottom-0 w-[400px] bg-card border-l border-border shadow-xl flex flex-col z-50"
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Chat header */}
          <div className="p-4 border-b flex items-center justify-between bg-accent/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-medium text-foreground">App Creator</h2>
            </div>
            <button 
              onClick={toggleChat}
              className="p-1.5 rounded-full hover:bg-background/80 transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 rounded-full p-1.5 ${
                    message.role === 'user' 
                      ? 'bg-primary/10' 
                      : 'bg-secondary'
                  }`}>
                    {message.role === 'user' 
                      ? <User size={16} className="text-primary" /> 
                      : <Bot size={16} className="text-primary" />
                    }
                  </div>
                  <div 
                    className={`rounded-2xl p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-muted text-foreground rounded-tl-none'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat input */}
          <div className="p-4 border-t bg-card">
            <div className="flex items-center gap-2 bg-background rounded-full border border-border p-1 pl-4 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Describe the app you want..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="p-2 h-9 w-9 rounded-full"
                size="icon"
                aria-label="Send message"
              >
                {isLoading ? 
                  <Loader2 className="animate-spin" size={18} /> : 
                  <Send size={18} />
                }
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Try asking for a "weather app for New York" or "URL launcher"
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChat;