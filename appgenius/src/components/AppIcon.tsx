import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, MicroApp } from '@/store/appStore';
import { Plus, X, Settings, Trash2 } from 'lucide-react';

interface AppIconProps {
  app: MicroApp;
  isEditMode?: boolean;
}

const AppIcon: React.FC<AppIconProps> = ({ app, isEditMode = false }) => {
  const { addWidget, removeMicroApp, setCurrentScreen } = useAppStore();
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleAddToWidget = () => {
    // Set intelligent default size based on app type
    let defaultSize: 'small' | 'medium' | 'large';
    const appType = app.name.toLowerCase();
    
    if (appType.includes('url')) {
      defaultSize = 'small'; // URL launchers need minimal space
    } else if (appType.includes('weather')) {
      defaultSize = 'medium'; // Weather widgets need more space for data
    } else if (appType.includes('latex')) {
      defaultSize = 'medium'; // LaTeX generators need space for input and output
    } else {
      defaultSize = 'medium'; // Default for other types
    }
    
    addWidget({
      appId: app.id,
      name: app.name,
      size: defaultSize,
      position: { x: 0, y: 0 }
    });
    setCurrentScreen('dashboard');
  };
  
  const handleLongPress = () => {
    setShowOptions(true);
  };
  
  const handleClick = () => {
    if (isEditMode) {
      setShowDeleteConfirm(true);
    } else {
      handleAddToWidget();
    }
  };
  
  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onContextMenu={(e) => {
        e.preventDefault();
        handleLongPress();
      }}
    >
      {/* App icon */}
      <div 
        className={`flex flex-col items-center ${isEditMode ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br from-secondary/80 to-secondary flex items-center justify-center mb-2 shadow-md ${isEditMode ? 'border-2 border-destructive/50' : ''}`}>
          {app.icon.startsWith('http') ? (
            <img src={app.icon} alt={app.name} className="h-10 w-10" />
          ) : (
            <span className="text-2xl">{app.icon}</span>
          )}
          
          {/* Delete badge in edit mode */}
          {isEditMode && (
            <div className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md">
              <Trash2 size={14} />
            </div>
          )}
          
          {/* Add to dashboard badge when not in edit mode */}
          {!isEditMode && (
            <div className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-1 shadow-md">
              <Plus size={14} />
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-center truncate w-full">{app.name}</span>
        {!isEditMode && (
          <span className="text-xs text-muted-foreground">Tap to add</span>
        )}
      </div>
      
      {/* Options overlay */}
      {showOptions && !isEditMode && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl"
        >
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="p-2 bg-red-500 rounded-full text-white"
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleAddToWidget();
              }}
              className="p-2 bg-primary rounded-full text-white"
            >
              <Plus size={16} />
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
          <div className="bg-card p-4 rounded-lg shadow-lg max-w-[90%] w-[300px]">
            <h4 className="font-medium text-foreground mb-2">Delete App</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete "{app.name}"? This will also remove any widgets using this app.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                  setShowOptions(false);
                }}
                className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeMicroApp(app.id);
                  setShowDeleteConfirm(false);
                  setShowOptions(false);
                }}
                className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Close options when clicking outside */}
      {showOptions && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setShowOptions(false)}
        />
      )}
    </motion.div>
  );
};

export default AppIcon; 