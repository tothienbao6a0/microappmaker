import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { Button } from './ui/button';
import { X, Send, Loader2, Sparkles, Bot, User, Settings as SettingsIcon } from 'lucide-react';
import generateMicroApp, { hasApiKey } from '@/lib/llmService';
import { defaultApps } from '@/lib/defaultApps';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIChat: React.FC = () => {
  const { isChatOpen, toggleChat, addMicroApp, addWidget, setCurrentScreen, toggleSettings } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: hasApiKey() 
        ? 'Hi! I can help you create custom apps for your dashboard. What would you like to build today?' 
        : 'Hi! I can help you create apps for your dashboard. For full customization, add your OpenAI API key in settings.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingApp, setIsGeneratingApp] = useState(false);
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if the message is asking to create an app
      const userInput = input.toLowerCase();
      const isAppRequest = 
        userInput.includes('create') || 
        userInput.includes('make') || 
        userInput.includes('build') ||
        userInput.includes('generate') ||
        userInput.includes('add') ||
        userInput.includes('weather') ||
        userInput.includes('calculator') ||
        userInput.includes('todo') ||
        userInput.includes('url') ||
        userInput.includes('notes');
      
      if (isAppRequest) {
        // Add initial response
        setMessages((prev) => [
          ...prev, 
          { 
            role: 'assistant', 
            content: hasApiKey()
              ? 'I can create that for you! Let me generate the app...'
              : 'I can create a basic version for you. For fully custom apps, add your OpenAI API key in settings.'
          }
        ]);
        
        // Generate the app
        setIsGeneratingApp(true);
        
        try {
          const newApp = await generateMicroApp(input);
          
          // Add the app to the store
          addMicroApp(newApp);
          
          // Add widget
          addWidget({
            id: `widget-${newApp.id}`,
            appId: newApp.id,
            name: newApp.name,
            size: 'medium', // or 'small'/'large' based on your preference
            position: { x: 0, y: 0 } // Initial position
          });
          
          // Add success message
          setMessages((prev) => [
            ...prev, 
            { 
              role: 'assistant', 
              content: `I've created "${newApp.name}" and added it to your app library! You can now add it to your dashboard.${
                !hasApiKey() ? ' For more advanced custom apps, add your OpenAI API key in settings.' : ''
              }`
            }
          ]);
        } catch (error: any) {
          console.error('Error generating app:', error);
          
          // Add error message
          setMessages((prev) => [
            ...prev, 
            { 
              role: 'assistant', 
              content: error.message || 'Sorry, I encountered an error while generating your app. Please try again with a different request.' 
            }
          ]);
        } finally {
          setIsGeneratingApp(false);
        }
      } else if (userInput.includes('api') && userInput.includes('key')) {
        // Handle API key related questions
        setMessages((prev) => [
          ...prev, 
          { 
            role: 'assistant', 
            content: 'You can add your OpenAI API key in the settings. This will enable fully custom app generation based on your requests.'
          }
        ]);
        
        // Add a button to open settings
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'Would you like to open settings now to add your API key?'
            }
          ]);
        }, 500);
      } else {
        // Generic response for non-app requests
        setMessages((prev) => [
          ...prev, 
          { 
            role: 'assistant', 
            content: 'I can help you create custom apps for your dashboard. Try asking me to create a weather widget, calculator, todo list, or URL launcher!' 
          }
        ]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message
      setMessages((prev) => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle viewing app library
  const handleViewLibrary = () => {
    setCurrentScreen('appMenu');
    toggleChat();
  };
  
  // Handle opening settings - navigate to settings page
  const handleOpenSettings = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event propagation
    
    // Close chat
    toggleChat();
    
    // Navigate to settings page
    window.location.href = '/settings';
  };

  const handleAddDefaultApp = (appId: string) => {
    const app = defaultApps.find(app => app.id === appId);
    if (app) {
      addMicroApp(app);
      addWidget({
        id: `widget-${app.id}`,
        appId: app.id,
        name: app.name,
        size: 'medium', // or 'small'/'large' based on your preference
        position: { x: 0, y: 0 } // Initial position
      });
      setCurrentScreen('dashboard');
      toggleChat(); // Close chat after adding the app
    }
  };

  return (
    <AnimatePresence>
      {isChatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 right-4 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-card border border-border rounded-xl shadow-lg overflow-hidden flex flex-col z-50"
        >
          {/* Chat header */}
          <div className="p-3 border-b bg-card flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-medium text-sm">AI App Generator</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleOpenSettings}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                aria-label="Open settings"
              >
                <SettingsIcon size={16} />
              </button>
              <button
                onClick={toggleChat}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="flex items-start gap-2 max-w-[85%]">
                  {message.role === 'assistant' && (
                    <div className="bg-primary/10 p-1.5 rounded-full h-8 w-8 flex items-center justify-center mt-1">
                      <Bot size={16} className="text-primary" />
                    </div>
                  )}
                  <div 
                    className={`rounded-2xl p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-muted text-foreground rounded-tl-none'
                    }`}
                  >
                    {message.content}
                    
                    {/* Show loading indicator for app generation */}
                    {index === messages.length - 1 && 
                     message.role === 'assistant' && 
                     isGeneratingApp && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                        <span className="text-xs text-muted-foreground">Generating app...</span>
                      </div>
                    )}
                    
                    {/* Show view library button after app generation */}
                    {index === messages.length - 1 && 
                     message.role === 'assistant' && 
                     message.content.includes('added it to your app library') && (
                      <button
                        onClick={handleViewLibrary}
                        className="mt-2 px-3 py-1.5 bg-primary/10 text-primary text-xs rounded-md hover:bg-primary/20 transition-colors"
                      >
                        View App Library
                      </button>
                    )}
                    
                    {/* Show settings button for API key messages */}
                    {index === messages.length - 1 && 
                     message.role === 'assistant' && 
                     message.content.includes('Would you like to open settings') && (
                      <button
                        onClick={handleOpenSettings}
                        className="mt-2 px-3 py-1.5 bg-primary/10 text-primary text-xs rounded-md hover:bg-primary/20 transition-colors"
                      >
                        Open Settings
                      </button>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="bg-primary p-1.5 rounded-full h-8 w-8 flex items-center justify-center mt-1">
                      <User size={16} className="text-primary-foreground" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggested prompts */}
          <div className="p-4 border-t bg-card">
            <h4 className="text-sm font-medium mb-2">Try these default apps:</h4>
            <div className="flex flex-wrap gap-2">
              {defaultApps.map(app => (
                <Button key={app.id} onClick={() => handleAddDefaultApp(app.id)} className="text-xs bg-muted hover:bg-muted/80 transition-colors">
                  {app.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Chat input */}
          <div className="p-3 border-t bg-card">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me to create an app..."
                className="flex-1 p-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-8 w-8"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              {hasApiKey() 
                ? 'Try: "Create a weather widget for New York" or "Make a calculator"'
                : 'Try: "Create a weather widget" or add your OpenAI API key for custom apps'}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChat;