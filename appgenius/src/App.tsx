import React from 'react';
import { useAppStore } from './store/appStore';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AppMenu from './components/AppMenu';
import AppDetails from './components/AppDetails';
import SettingsPage from './components/SettingsPage';
import AIChat from './components/AIChat';
import { Sparkles } from 'lucide-react';
import { Button } from './components/ui/button';

function App() {
  const { currentScreen, isChatOpen, toggleChat } = useAppStore();
  
  console.log('Current screen in App:', currentScreen);
  
  // Check if we should show settings based on URL hash
  const [showSettings, setShowSettings] = React.useState(
    window.location.hash === '#settings' || currentScreen === 'settings'
  );
  
  // Add effect to handle hash-based navigation and screen changes
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'settings') {
        console.log('Hash changed to settings, showing settings page');
        setShowSettings(true);
        useAppStore.setState({ currentScreen: 'settings' });
      } else {
        setShowSettings(false);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Also update when currentScreen changes
    if (currentScreen === 'settings') {
      setShowSettings(true);
    }
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [currentScreen]);
  
  // If showSettings is true, render the settings page
  if (showSettings) {
    console.log('Rendering SettingsPage directly');
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto p-4 pb-20">
            <SettingsPage />
          </div>
        </main>
      </div>
    );
  }
  
  // Otherwise render the normal app
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header with navigation */}
      <Header />
      
      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto p-4 pb-20">
          {currentScreen === 'dashboard' && <Dashboard />}
          {currentScreen === 'appMenu' && <AppMenu />}
          {currentScreen === 'appDetails' && <AppDetails />}
        </div>
      </main>
      
      {/* AI Chat button */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={toggleChat}
          className={`h-12 w-12 rounded-full shadow-lg ${isChatOpen ? 'bg-primary/90 text-primary-foreground' : 'bg-primary text-primary-foreground'}`}
          aria-label="Open AI Chat"
        >
          <Sparkles size={20} />
        </Button>
      </div>
      
      {/* AI Chat component */}
      <AIChat />
    </div>
  );
}

export default App; 