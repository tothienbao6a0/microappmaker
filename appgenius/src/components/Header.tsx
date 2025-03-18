import React from 'react';
import { useAppStore } from '@/store/appStore';
import { Button } from './ui/button';
import { Settings, Grid, Apps, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const Header: React.FC = () => {
  const { currentScreen, setCurrentScreen, selectedAppId } = useAppStore();
  
  // Handle navigation - explicitly define the type for each screen
  const navigateToDashboard = () => {
    setCurrentScreen('dashboard');
  };
  
  const navigateToAppMenu = () => {
    setCurrentScreen('appMenu');
  };
  
  // Determine title based on current screen
  const getTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'Dashboard';
      case 'appMenu':
        return 'App Library';
      case 'appDetails':
        return 'App Details';
      case 'settings':
        return 'Settings';
      default:
        return 'AppGenius';
    }
  };
  
  // Handle back button
  const handleBack = () => {
    // If we're in app details, go back to app menu
    if (currentScreen === 'appDetails') {
      setCurrentScreen('appMenu');
    } else {
      // Otherwise go back to dashboard
      setCurrentScreen('dashboard');
    }
  };
  
  return (
    <header className="bg-background border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left side - Title and back button */}
        <div className="flex items-center gap-2">
          {/* Show back button on non-dashboard screens */}
          {currentScreen !== 'dashboard' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 mr-1"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </Button>
          )}
          
          <h1 className="text-xl font-bold">{getTitle()}</h1>
        </div>
        
        {/* Right side - Navigation */}
        <div className="flex items-center gap-2">
          {/* Only show these navigation buttons when not in settings */}
          {currentScreen !== 'settings' && (
            <>
              <Button
                variant={currentScreen === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={navigateToDashboard}
                className="flex items-center gap-1"
              >
                <Grid size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              
              <Button
                variant={currentScreen === 'appMenu' ? 'default' : 'ghost'}
                size="sm"
                onClick={navigateToAppMenu}
                className="flex items-center gap-1"
              >
                <Apps size={16} />
                <span className="hidden sm:inline">Apps</span>
              </Button>
            </>
          )}
          
          {/* Settings button - use Next.js Link */}
          <Link 
            href="/settings"
            className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-muted"
          >
            <Settings size={16} />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 