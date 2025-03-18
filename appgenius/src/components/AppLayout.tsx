import React from 'react';
import Dashboard from './Dashboard';
import AppMenu from './AppMenu';
import AIChat from './AIChat';
import { useAppStore } from '@/store/appStore';

const AppLayout: React.FC = () => {
  const { isChatOpen, currentScreen } = useAppStore();
  
  return (
    <div className="relative">
      {currentScreen === 'dashboard' ? <Dashboard /> : <AppMenu />}
      <AIChat />
      
      {/* Overlay when chat is open */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => useAppStore.getState().toggleChat()}
        />
      )}
    </div>
  );
};

export default AppLayout; 