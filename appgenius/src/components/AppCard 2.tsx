import React from 'react';
import { MicroApp } from '@/store/appStore';
import { useAppStore } from '@/store/appStore';
import { motion } from 'framer-motion';
import { Plus, Info } from 'lucide-react';
import { Button } from './ui/button';

interface AppCardProps {
  app: MicroApp;
}

const AppCard: React.FC<AppCardProps> = ({ app }) => {
  const { addWidget, setCurrentScreen, setSelectedAppId } = useAppStore();
  
  // Handle adding the app to dashboard
  const handleAddToDashboard = () => {
    // Generate a unique ID for the widget
    const widgetId = `widget-${Date.now()}`;
    
    // Add the widget to the dashboard
    addWidget({
      id: widgetId,
      name: app.name,
      appId: app.id,
      size: 'medium',
      position: {
        x: 0,
        y: 0
      }
    });
    
    // Navigate back to dashboard
    setCurrentScreen('dashboard');
  };
  
  // Handle viewing app details
  const handleViewDetails = () => {
    setSelectedAppId(app.id);
    setCurrentScreen('appDetails');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{app.icon}</div>
            <h3 className="font-medium text-foreground truncate">{app.name}</h3>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {app.description}
        </p>
        
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="flex items-center gap-1"
          >
            <Info size={14} />
            <span>Details</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={handleAddToDashboard}
            className="flex items-center gap-1"
          >
            <Plus size={14} />
            <span>Add</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AppCard; 