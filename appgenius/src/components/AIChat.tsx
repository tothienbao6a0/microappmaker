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
          : input.toLowerCase().includes('notepad')
            ? 'notepad'
            : input.toLowerCase().includes('calculator')
              ? 'calculator'
              : 'url-launcher';
      
      // Create a response message
      const appName = appType === 'weather' 
        ? 'Weather App' 
        : appType === 'latex-generator'
          ? 'LaTeX Generator'
          : appType === 'notepad'
            ? 'Notepad'
            : appType === 'calculator'
              ? 'Calculator'
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
            : appType === 'notepad'
              ? '📋'
              : appType === 'calculator'
                ? '🧮'
                : '🔗',
        code: getAppCode(appType),
        config: getAppConfig(appType, input),
        size: appType === 'calculator' 
          ? { w: 2, h: 4 }
          : undefined
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
      case 'weather':
        return `
          function WeatherApp({ config }) {
            const [city, setCity] = React.useState(config?.city || 'New York');
            const [weather, setWeather] = React.useState(null);
            const [loading, setLoading] = React.useState(true);
            const [error, setError] = React.useState('');
            
            React.useEffect(() => {
              // Simulate fetching weather data
              setLoading(true);
              setTimeout(() => {
                try {
                  // Generate random weather data for demo
                  const temp = Math.floor(Math.random() * 30) + 10; // 10-40°C
                  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Stormy'][Math.floor(Math.random() * 5)];
                  const humidity = Math.floor(Math.random() * 50) + 30; // 30-80%
                  const windSpeed = Math.floor(Math.random() * 20) + 5; // 5-25 km/h
                  
                  setWeather({
                    city: city,
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
              }, 1000);
            }, [city]);
            
            const handleCityChange = (e) => {
              setCity(e.target.value);
            };
            
            const handleSubmit = (e) => {
              e.preventDefault();
              // Trigger the useEffect by forcing a re-render
              setCity(city);
            };
            
            const getWeatherIcon = (condition) => {
              switch(condition) {
                case 'Sunny': return '☀️';
                case 'Cloudy': return '☁️';
                case 'Rainy': return '🌧️';
                case 'Partly Cloudy': return '⛅';
                case 'Stormy': return '⛈️';
                default: return '��️';
              }
            };
            
            return (
              <div className="h-full flex flex-col p-4 bg-gradient-to-b from-blue-50 to-white">
                <h3 className="text-lg font-medium mb-3">Weather App</h3>
                
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={city}
                      onChange={handleCityChange}
                      placeholder="Enter city name"
                      className="flex-1 p-2 text-sm border border-gray-300 rounded-md"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                    >
                      Search
                    </button>
                  </div>
                </form>
                
                {loading && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                
                {error && !loading && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                )}
                
                {weather && !loading && !error && (
                  <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-6xl mb-4">{getWeatherIcon(weather.conditions)}</div>
                    <h2 className="text-2xl font-bold mb-1">{weather.city}</h2>
                    <p className="text-gray-500 mb-4">{weather.date}</p>
                    
                    <div className="text-4xl font-bold text-blue-600 mb-4">
                      {weather.temp}°C
                    </div>
                    
                    <p className="text-lg mb-6">{weather.conditions}</p>
                    
                    <div className="w-full grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-md text-center">
                        <p className="text-gray-500 text-sm">Humidity</p>
                        <p className="font-medium">{weather.humidity}%</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md text-center">
                        <p className="text-gray-500 text-sm">Wind</p>
                        <p className="font-medium">{weather.windSpeed} km/h</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }
        `;
        
      case 'url-launcher':
        return `
          function URLLauncher({ config }) {
            const [url, setUrl] = React.useState(config?.url || 'https://example.com');
            const [title, setTitle] = React.useState('');
            const [favicon, setFavicon] = React.useState('');
            const [loading, setLoading] = React.useState(true);
            const [error, setError] = React.useState('');
            
            React.useEffect(() => {
              // In a real app, we would fetch the title and favicon
              // For this demo, we'll simulate it
              setLoading(true);
              setTimeout(() => {
                try {
                  // Extract domain for the title
                  const domain = new URL(url).hostname.replace('www.', '');
                  setTitle(domain.charAt(0).toUpperCase() + domain.slice(1));
                  
                  // Set a placeholder favicon
                  setFavicon(\`https://www.google.com/s2/favicons?domain=\${url}&sz=64\`);
                  
                  setLoading(false);
                } catch (err) {
                  setError('Invalid URL');
                  setLoading(false);
                }
              }, 1000);
            }, [url]);
            
            const handleUrlChange = (e) => {
              setUrl(e.target.value);
            };
            
            const handleSubmit = (e) => {
              e.preventDefault();
              // Validate URL
              try {
                new URL(url);
                // Trigger the useEffect
                setUrl(url);
              } catch (err) {
                setError('Please enter a valid URL');
              }
            };
            
            const handleOpenUrl = () => {
              try {
                window.open(url, '_blank');
              } catch (err) {
                setError('Failed to open URL');
              }
            };
            
            return (
              <div className="h-full flex flex-col p-4 bg-gradient-to-b from-gray-50 to-white">
                <h3 className="text-lg font-medium mb-3">URL Launcher</h3>
                
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={handleUrlChange}
                      placeholder="Enter URL"
                      className="flex-1 p-2 text-sm border border-gray-300 rounded-md"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                    >
                      Go
                    </button>
                  </div>
                </form>
                
                {loading && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                
                {error && !loading && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                )}
                
                {!error && !loading && (
                  <div 
                    className="flex-1 flex flex-col items-center justify-center bg-blue-50 rounded-lg p-6 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={handleOpenUrl}
                  >
                    {favicon && (
                      <img 
                        src={favicon} 
                        alt={title} 
                        className="w-16 h-16 mb-4 rounded-md"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/64?text=' + title.charAt(0).toUpperCase();
                        }}
                      />
                    )}
                    
                    <h4 className="text-xl font-medium text-center">{title}</h4>
                    <p className="text-sm text-gray-500 mb-4 text-center">{url}</p>
                    
                    <button
                      className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenUrl();
                      }}
                    >
                      Open Website
                    </button>
                  </div>
                )}
              </div>
            );
          }
        `;
        
      case 'latex-generator':
        return `
          function LaTeXGenerator({ config }) {
            const [formula, setFormula] = React.useState(config?.initialFormula || '\\\\sum_{i=1}^{n} i = \\\\frac{n(n+1)}{2}');
            const [rendered, setRendered] = React.useState('');
            const [error, setError] = React.useState('');
            
            React.useEffect(() => {
              // In a real app, we would use a LaTeX rendering library
              // For this demo, we'll use a placeholder image
              try {
                const encodedFormula = encodeURIComponent(formula);
                setRendered(\`https://latex.codecogs.com/png.latex?\\\\dpi{300}\\\\bg_white\\\\large \${encodedFormula}\`);
                setError('');
              } catch (err) {
                setError('Failed to render LaTeX');
              }
            }, [formula]);
            
            const handleFormulaChange = (e) => {
              setFormula(e.target.value);
            };
            
            return (
              <div className="h-full flex flex-col p-4 bg-white">
                <h3 className="text-lg font-medium mb-3">LaTeX Generator</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter LaTeX Formula
                  </label>
                  <textarea
                    value={formula}
                    onChange={handleFormulaChange}
                    placeholder="Enter LaTeX formula..."
                    className="w-full p-2 text-sm border border-gray-300 rounded-md h-24 font-mono"
                  />
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Rendered Formula:</p>
                  {rendered && (
                    <img 
                      src={rendered} 
                      alt="LaTeX Formula" 
                      className="max-w-full max-h-40 object-contain bg-white p-2 rounded-md shadow-sm"
                      onError={() => setError('Failed to render LaTeX')}
                    />
                  )}
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  <p>Tips:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Use \\\\frac{a}{b} for fractions</li>
                    <li>Use ^{'{exponent}'} for superscripts</li>
                    <li>Use _{'{subscript}'} for subscripts</li>
                    <li>Use \\\\sum, \\\\int for summation and integrals</li>
                  </ul>
                </div>
              </div>
            );
          }
        `;
        
      case 'notepad':
        return `
          function Notepad({ config }) {
            const [text, setText] = React.useState(config?.initialText || '');
            const [saved, setSaved] = React.useState(true);
            
            // Auto-save when text changes
            React.useEffect(() => {
              if (text !== config?.initialText) {
                setSaved(false);
                const timer = setTimeout(() => {
                  // In a real app, this would save to a database or localStorage
                  console.log('Auto-saving note:', text);
                  setSaved(true);
                }, 1000);
                
                return () => clearTimeout(timer);
              }
            }, [text, config?.initialText]);
            
            const handleTextChange = (e) => {
              setText(e.target.value);
            };
            
            return (
              <div className="h-full flex flex-col p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Notepad</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {saved ? 'Saved' : 'Saving...'}
                  </span>
                </div>
                
                <textarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Type your notes here..."
                  className="flex-1 p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <div className="flex justify-between mt-3 text-xs text-gray-500">
                  <span>{text.length} characters</span>
                  <span>{text.split(/\\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            );
          }
        `;
        
      case 'calculator':
        return `
          function Calculator({ config }) {
            const [display, setDisplay] = React.useState('0');
            const [equation, setEquation] = React.useState('');
            const [prevValue, setPrevValue] = React.useState(null);
            const [waitingForOperand, setWaitingForOperand] = React.useState(false);
            const [operator, setOperator] = React.useState(null);
            
            const clearAll = () => {
              setDisplay('0');
              setEquation('');
              setPrevValue(null);
              setWaitingForOperand(false);
              setOperator(null);
            };
            
            const clearDisplay = () => {
              setDisplay('0');
            };
            
            const toggleSign = () => {
              const newValue = parseFloat(display) * -1;
              setDisplay(String(newValue));
            };
            
            const inputPercent = () => {
              const currentValue = parseFloat(display);
              const newValue = currentValue / 100;
              setDisplay(String(newValue));
            };
            
            const inputDot = () => {
              if (!/\\./.test(display)) {
                setDisplay(display + '.');
                setWaitingForOperand(false);
              }
            };
            
            const inputDigit = (digit) => {
              if (waitingForOperand) {
                setDisplay(String(digit));
                setWaitingForOperand(false);
              } else {
                setDisplay(display === '0' ? String(digit) : display + digit);
              }
            };
            
            const performOperation = (nextOperator) => {
              const inputValue = parseFloat(display);
              
              if (prevValue == null) {
                setPrevValue(inputValue);
              } else if (operator) {
                const currentValue = prevValue || 0;
                let newValue = 0;
                
                switch (operator) {
                  case '+':
                    newValue = currentValue + inputValue;
                    break;
                  case '-':
                    newValue = currentValue - inputValue;
                    break;
                  case '×':
                    newValue = currentValue * inputValue;
                    break;
                  case '÷':
                    newValue = currentValue / inputValue;
                    break;
                  default:
                    break;
                }
                
                setPrevValue(newValue);
                setDisplay(String(newValue));
              }
              
              setWaitingForOperand(true);
              setOperator(nextOperator);
              setEquation(nextOperator === '=' ? '' : \`\${display} \${nextOperator} \`);
            };
            
            // Use a ref to measure and adjust the container height if needed
            const containerRef = React.useRef(null);
            
            // Effect to ensure the calculator has enough height
            React.useEffect(() => {
              if (containerRef.current) {
                const container = containerRef.current;
                const parentHeight = container.parentElement.clientHeight;
                
                // If parent container is too small, set a fixed height
                if (parentHeight < 450) {
                  container.style.height = '450px';
                  container.style.minHeight = '450px';
                  container.style.overflow = 'auto';
                }
              }
            }, []);
            
            return (
              <div ref={containerRef} className="h-full flex flex-col p-3 bg-white" style={{ minHeight: '450px' }}>
                <h3 className="text-lg font-medium mb-2">Calculator</h3>
                
                <div className="mb-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                  <div className="text-xs text-gray-500 h-4 text-right overflow-hidden">{equation}</div>
                  <div className="text-xl font-bold text-right mt-1 text-gray-900 overflow-hidden text-ellipsis">{display}</div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 flex-1" style={{ minHeight: '350px' }}>
                  <button 
                    onClick={clearAll}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-md transition-colors"
                  >
                    AC
                  </button>
                  <button 
                    onClick={clearDisplay}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-md transition-colors"
                  >
                    C
                  </button>
                  <button 
                    onClick={toggleSign}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-md transition-colors"
                  >
                    ±
                  </button>
                  <button 
                    onClick={() => performOperation('÷')}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-3 rounded-md transition-colors"
                  >
                    ÷
                  </button>
                  
                  <button 
                    onClick={() => inputDigit(7)}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 rounded-md border border-gray-200 transition-colors"
                  >
                    7
                  </button>
                  <button 
                    onClick={() => inputDigit(8)}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 rounded-md border border-gray-200 transition-colors"
                  >
                    8
                  </button>
                  <button 
                    onClick={() => inputDigit(9)}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 rounded-md border border-gray-200 transition-colors"
                  >
                    9
                  </button>
                  <button 
                    onClick={() => performOperation('×')}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-3 rounded-md transition-colors"
                  >
                    ×
                  </button>
                  
                  <button 
                    onClick={() => inputDigit(4)}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 rounded-md border border-gray-200 transition-colors"
                  >
                    4
                  </button>
                  <button 
                    onClick={() => inputDigit(5)}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 rounded-md border border-gray-200 transition-colors"
                  >
                    5
                  </button>
                  <button 
                    onClick={() => inputDigit(6)}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 rounded-md border border-gray-200 transition-colors"
                  >
                    6
                  </button>
                  <button 
                    onClick={() => performOperation('-')}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-3 rounded-md transition-colors"
                  >
                    -
                  </button>
                  
                  <button 
                    onClick={() => inputDigit(1)}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 rounded-md border border-gray-200 transition-colors"
                  >
                    1
                  </button>
                  <button 
                    onClick={() => inputDigit(2)}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 rounded-md border border-gray-200 transition-colors"
                  >
                    2
                  </button>
                  <button 
                    onClick={() => inputDigit(3)}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 rounded-md border border-gray-200 transition-colors"
                  >
                    3
                  </button>
                  <button 
                    onClick={() => performOperation('+')}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-3 rounded-md transition-colors"
                  >
                    +
                  </button>
                  
                  <button 
                    onClick={() => inputDigit(0)}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 rounded-md col-span-2 border border-gray-200 transition-colors"
                  >
                    0
                  </button>
                  <button 
                    onClick={inputDot}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 rounded-md border border-gray-200 transition-colors"
                  >
                    .
                  </button>
                  <button 
                    onClick={() => performOperation('=')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-md transition-colors"
                  >
                    =
                  </button>
                </div>
              </div>
            );
          }
        `;
        
      default:
        return `
          function DefaultApp({ config }) {
            return (
              <div className="h-full flex items-center justify-center">
                <p>App not implemented yet</p>
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
        
      case 'latex-generator':
        // Try to extract a formula from the input
        const formulaMatch = input.match(/latex\s+(?:for|with)\s+(.+)/i);
        return {
          initialFormula: formulaMatch ? formulaMatch[1].trim() : '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}'
        };
        
      case 'notepad':
        // Try to extract initial text from the input
        const textMatch = input.match(/notepad\s+(?:with|containing)\s+["'](.+?)["']/i);
        return {
          initialText: textMatch ? textMatch[1].trim() : ''
        };
        
      case 'calculator':
        // No specific configuration needed for calculator
        return {};
        
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
              Try asking for a "weather app for New York", "notepad", "calculator", or "URL launcher"
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChat;