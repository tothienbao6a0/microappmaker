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
      
      // Create a response message
      const appName = appType === 'weather' 
        ? 'Weather App' 
        : appType === 'latex-generator'
          ? 'LaTeX Generator'
          : 'URL Launcher';
      
      const responseMessage = { 
        role: 'assistant' as const, 
        content: `I've created a ${appName} for you! You can find it in your app menu.` 
      };
      
      // Add the app to the store
      addMicroApp({
        name: appName,
        description: `A custom ${appName.toLowerCase()} created with AI`,
        icon: appType === 'weather' 
          ? '🌤️' 
          : appType === 'latex-generator'
            ? '📝'
            : '🔗',
        code: getAppCode(appType),
        config: getAppConfig(appType, input)
      });
      
      // Add assistant message
      setMessages((prev) => [...prev, responseMessage]);
    } catch (error) {
      console.error('Error generating app:', error);
      
      // Add error message
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
  
  const getAppCode = (type: string): string => {
    switch (type) {
      case 'url-launcher':
        return `
          function URLLauncher({ config }) {
            const [url, setUrl] = React.useState(config.url || 'https://example.com');
            const [title, setTitle] = React.useState('');
            const [favicon, setFavicon] = React.useState('');
            const [isLoading, setIsLoading] = React.useState(true);
            const [error, setError] = React.useState('');
            
            // Function to extract domain from URL
            const getDomain = (url) => {
              try {
                const domain = new URL(url).hostname;
                return domain;
              } catch (e) {
                return url;
              }
            };
            
            // Function to validate URL
            const isValidUrl = (string) => {
              try {
                new URL(string);
                return true;
              } catch (e) {
                return false;
              }
            };
            
            // Function to load metadata
            const loadMetadata = React.useCallback(() => {
              setIsLoading(true);
              setError('');
              
              // In a real app, we would fetch the title and favicon
              // For this demo, we'll simulate it
              setTimeout(() => {
                try {
                  if (!isValidUrl(url)) {
                    throw new Error('Invalid URL');
                  }
                  
                  const domain = getDomain(url);
                  setTitle(domain);
                  setFavicon(\`https://www.google.com/s2/favicons?domain=\${domain}&sz=64\`);
                  setIsLoading(false);
                } catch (err) {
                  setError('Invalid URL format');
                  setIsLoading(false);
                }
              }, 1000);
            }, [url]);
            
            // Load metadata on mount and when URL changes
            React.useEffect(() => {
              loadMetadata();
            }, [loadMetadata]);
            
            // Handle form submission
            const handleSubmit = (e) => {
              e.preventDefault();
              loadMetadata();
            };
            
            // Handle opening the URL
            const handleOpenUrl = () => {
              if (isValidUrl(url)) {
                window.open(url, '_blank');
              }
            };
            
            return (
              <div className="h-full flex flex-col p-3 bg-white text-gray-800">
                <h3 className="text-sm font-medium mb-2">URL Launcher</h3>
                
                <form onSubmit={handleSubmit} className="mb-3">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Enter URL"
                      className="flex-1 p-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !url.trim()}
                      className="p-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? '...' : 'Go'}
                    </button>
                  </div>
                </form>
                
                {error && (
                  <div className="mb-3 p-2 bg-red-100 text-red-600 text-xs rounded-md">
                    {error}
                  </div>
                )}
                
                {!error && !isLoading && (
                  <div 
                    className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-md p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={handleOpenUrl}
                  >
                    {favicon && (
                      <img 
                        src={favicon} 
                        alt={title} 
                        className="w-16 h-16 mb-3 rounded-md shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/64x64?text=🔗';
                        }}
                      />
                    )}
                    <h4 className="text-lg font-medium text-center">{title}</h4>
                    <p className="text-xs text-gray-500 mt-1 text-center">{url}</p>
                    
                    <button
                      className="mt-4 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Open URL
                    </button>
                  </div>
                )}
                
                {isLoading && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
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
            
            const fetchWeather = React.useCallback(() => {
              setLoading(true);
              setError('');
              
              // Simulate API call with more realistic data
              setTimeout(() => {
                try {
                  // Generate random but realistic weather data for demo
                  const temp = Math.floor(Math.random() * 30) + 10; // 10-40°C
                  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Stormy'][Math.floor(Math.random() * 5)];
                  const humidity = Math.floor(Math.random() * 50) + 30; // 30-80%
                  const windSpeed = Math.floor(Math.random() * 20) + 5; // 5-25 km/h
                  
                  // Create a properly formatted weather object
                  setWeather({
                    city: city.trim(),
                    temp,
                    conditions,
                    humidity,
                    windSpeed,
                    date: new Date().toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })
                  });
                  setLoading(false);
                } catch (err) {
                  console.error('Error generating weather data:', err);
                  setError('Failed to fetch weather data');
                  setLoading(false);
                }
              }, 1000);
            }, [city]);
            
            // Fetch weather on mount and when city changes
            React.useEffect(() => {
              fetchWeather();
            }, [fetchWeather]);
            
            const handleSubmit = (e) => {
              e.preventDefault();
              if (city.trim()) {
                fetchWeather();
              }
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
              <div className="h-full flex flex-col p-3 bg-white text-gray-900">
                <h3 className="text-sm font-medium mb-2">Weather</h3>
                
                <form onSubmit={handleSubmit} className="mb-3">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                      className="flex-1 p-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    <h4 className="text-lg font-medium text-gray-900">{weather.city}</h4>
                    <p className="text-xs text-gray-500 mb-3">{weather.date}</p>
                    
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {weather.temp}°C
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{weather.conditions}</p>
                    
                    <div className="w-full grid grid-cols-2 gap-2 mt-1">
                      <div className="bg-white p-2 rounded-md text-center shadow-sm">
                        <p className="text-xs text-gray-500">Humidity</p>
                        <p className="font-medium text-sm text-gray-900">{weather.humidity}%</p>
                      </div>
                      <div className="bg-white p-2 rounded-md text-center shadow-sm">
                        <p className="text-xs text-gray-500">Wind</p>
                        <p className="font-medium text-sm text-gray-900">{weather.windSpeed} km/h</p>
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
            const [input, setInput] = React.useState(config.initialFormula || '\\\\sum_{i=1}^{n} i = \\\\frac{n(n+1)}{2}');
            const [output, setOutput] = React.useState('');
            const [loading, setLoading] = React.useState(false);
            const [error, setError] = React.useState('');
            
            // Function to generate LaTeX output
            const generateLatex = React.useCallback(() => {
              setLoading(true);
              setError('');
              
              // In a real app, we would call a LaTeX rendering API
              // For this demo, we'll just simulate a delay
              setTimeout(() => {
                try {
                  // For demo purposes, we'll just use the input as the output
                  // In a real app, this would be rendered to an image or SVG
                  setOutput(input);
                  setLoading(false);
                } catch (err) {
                  setError('Failed to generate LaTeX');
                  setLoading(false);
                }
              }, 1000);
            }, [input]);
            
            // Generate LaTeX on mount and when input changes
            React.useEffect(() => {
              generateLatex();
            }, [generateLatex]);
            
            return (
              <div className="h-full flex flex-col p-3 bg-white text-gray-900">
                <h3 className="text-sm font-medium mb-2">LaTeX Generator</h3>
                
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Enter LaTeX Formula</label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter LaTeX formula..."
                  />
                  <button
                    onClick={generateLatex}
                    disabled={loading || !input.trim()}
                    className="mt-2 p-2 w-full bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate'}
                  </button>
                </div>
                
                {error && (
                  <div className="mb-3 p-2 bg-red-100 text-red-600 text-xs rounded-md">
                    {error}
                  </div>
                )}
                
                {output && !loading && (
                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs text-gray-500 mb-1">Result</label>
                    <div className="flex-1 p-3 bg-gray-50 rounded-md border border-gray-200 overflow-auto">
                      <div className="text-center p-4">
                        <div className="text-lg font-mono">{output}</div>
                        <p className="text-xs text-gray-500 mt-2">
                          (In a real app, this would be rendered as an image)
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between">
                      <button
                        onClick={() => {
                          // In a real app, this would copy the rendered image or LaTeX code
                          navigator.clipboard.writeText(output)
                            .then(() => alert('Copied to clipboard!'))
                            .catch(() => alert('Failed to copy'));
                        }}
                        className="p-1.5 bg-gray-100 text-xs text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Copy to Clipboard
                      </button>
                      
                      <button
                        onClick={() => {
                          // In a real app, this would download the rendered image
                          alert('In a real app, this would download the image');
                        }}
                        className="p-1.5 bg-gray-100 text-xs text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Download
                      </button>
                    </div>
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
        
      default:
        return '';
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
        
      case 'latex-generator':
        // Try to extract a formula from the input
        const formulaMatch = input.match(/latex\s+(?:for|with)\s+(.+)/i);
        return {
          initialFormula: formulaMatch ? formulaMatch[1].trim() : '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}'
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
              Try asking for a "weather app for New York" or "URL launcher" or "LaTeX generator"
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChat;