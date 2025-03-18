import React, { useState } from 'react';
import { useAppStore, MicroApp } from '@/store/appStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit2, Check, Trash2, AppWindow } from 'lucide-react';
import { Button } from './ui/button';
import AppIcon from './AppIcon';

const AppMenu: React.FC = () => {
  const { microApps, setCurrentScreen, toggleChat } = useAppStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };
  
  return (
    <div className="p-6 min-h-screen bg-background">
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentScreen('dashboard')}
              className="rounded-full"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="bg-secondary/30 p-2 rounded-full">
              <AppWindow className="h-5 w-5 text-secondary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">App Library</h1>
            <div className="px-2.5 py-1 bg-secondary/20 rounded-full text-xs font-medium text-secondary-foreground">
              Apps: {microApps.length}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isEditMode && microApps.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1 rounded-full px-4"
              >
                <Trash2 size={16} />
                <span>Clear All</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleEditMode}
              className="flex items-center gap-1 rounded-full px-4 border-secondary/20 hover:border-secondary/50"
            >
              {isEditMode ? (
                <>
                  <Check size={16} className="text-green-500" />
                  <span>Done</span>
                </>
              ) : (
                <>
                  <Edit2 size={16} />
                  <span>Edit</span>
                </>
              )}
            </Button>
            
            <Button
              onClick={toggleChat}
              size="sm"
              className="flex items-center gap-1 rounded-full px-4 bg-secondary hover:bg-secondary/90"
            >
              <Plus size={16} />
              <span>Create App</span>
            </Button>
          </div>
        </div>
        
        {/* Add a visual indicator for the current screen */}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-full">
            <div 
              className="px-4 py-1.5 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              onClick={() => setCurrentScreen('dashboard')}
            >
              Dashboard
            </div>
            <div className="px-4 py-1.5 bg-card rounded-full text-sm font-medium shadow-sm">
              App Library
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto">
        {microApps.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-[60vh] bg-card rounded-xl border border-border shadow-sm"
          >
            <div className="text-5xl mb-4">📱</div>
            <h2 className="text-xl font-medium text-foreground mb-2">Your app library is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md text-center">
              Create your first app by clicking the "Create App" button and describing what you want.
            </p>
            <Button 
              onClick={toggleChat}
              className="rounded-full px-6 py-2 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg"
            >
              <Plus size={16} className="mr-2" />
              Create App
            </Button>
          </motion.div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            {isEditMode && (
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Tap an app to delete it. Click "Done" when finished.
              </p>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {microApps.map((app) => (
                <AppIcon key={app.id} app={app} isEditMode={isEditMode} />
              ))}
            </div>
          </div>
        )}
      </main>
      
      {/* Clear All Apps Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-4 rounded-lg shadow-lg max-w-[90%] w-[350px]">
            <h4 className="font-medium text-foreground mb-2">Delete All Apps</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete all apps from your library? This will also remove any widgets using these apps. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Clear all apps and widgets
                  useAppStore.getState().clearApps();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppMenu; 