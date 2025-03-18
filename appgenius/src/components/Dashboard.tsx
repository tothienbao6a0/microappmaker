import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import WidgetContainer from './WidgetContainer';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Check, Settings, Grid, AppWindow, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const Dashboard: React.FC = () => {
  const { widgets, microApps, isEditMode, toggleEditMode, setCurrentScreen, updateWidget, clearWidgets, removeWidget } = useAppStore();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [layout, setLayout] = useState([]);
  
  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate columns based on screen size
  const getColumnCount = () => {
    if (windowWidth < 640) return 1;
    if (windowWidth < 768) return 2;
    if (windowWidth < 1024) return 3;
    return 4;
  };
  
  const cols = getColumnCount();
  const containerWidth = Math.min(windowWidth - 48, 1200); // 48px for padding
  
  // Convert widgets to layout items for react-grid-layout
  useEffect(() => {
    const initialLayout = widgets.map((widget) => {
      const app = microApps.find(a => a.id === widget.appId);
      if (!app) return null;
      
      const appType = app.name.toLowerCase();
      
      let w = 1; // Default width (1 column)
      let h = 2; // Default height (2 rows)
      
      if (widget.size === 'small') {
        w = 1;
        h = 1;
      } else if (widget.size === 'medium') {
        w = 2;
        h = 2;
      } else if (widget.size === 'large') {
        w = 3;
        h = 3;
      }
      
      return {
        i: widget.id,
        x: widget.position.x,
        y: widget.position.y,
        w,
        h
      };
    }).filter(Boolean);
    
    console.log('Initial layout:', initialLayout);
    setLayout(initialLayout);
  }, [widgets, microApps]);
  
  // Handle layout change
  const handleLayoutChange = (newLayout: any[]) => {
    if (!isEditMode) return;
    
    newLayout.forEach((item) => {
      const widget = widgets.find(w => w.id === item.i);
      if (widget) {
        updateWidget(widget.id, {
          position: {
            x: item.x,
            y: item.y
          }
        });
      }
    });
  };
  
  // Handle widget drop on delete zone
  const handleDeleteDrop = (widgetId: string) => {
    removeWidget(widgetId);
    setIsDraggingOver(false);
  };
  
  // Navigate to settings - use Next.js routing
  const handleOpenSettings = () => {
    console.log('Navigating to settings from Dashboard');
    window.location.href = '/settings';
  };
  
  // Add a useEffect to log layout changes
  useEffect(() => {
    console.log('Layout updated:', layout);
    console.log('Widgets:', widgets);
    
    // Check if widgets are in the layout
    const widgetsInLayout = widgets.filter(widget => 
      layout.some(item => item.i === widget.id)
    );
    
    console.log('Widgets in layout:', widgetsInLayout.length, 'of', widgets.length);
    
    // If there are widgets not in the layout, add them
    const widgetsNotInLayout = widgets.filter(widget => 
      !layout.some(item => item.i === widget.id)
    );
    
    if (widgetsNotInLayout.length > 0) {
      console.log('Adding missing widgets to layout:', widgetsNotInLayout.length);
      
      // Create layout items for missing widgets
      const newLayoutItems = widgetsNotInLayout.map((widget, index) => ({
        i: widget.id,
        x: 0,
        y: Infinity, // Place at the bottom
        w: widget.size === 'small' ? 4 : widget.size === 'medium' ? 6 : 12,
        h: widget.size === 'small' ? 2 : widget.size === 'medium' ? 3 : 4,
      }));
      
      // Update the layout
      handleLayoutChange(newLayoutItems);
    }
  }, [widgets, layout]);
  
  // Force layout to be correct when widgets change
  useEffect(() => {
    if (widgets.length > 0) {
      // Create a fresh layout for all widgets
      const newLayout = widgets.map((widget, index) => ({
        i: widget.id,
        x: 0,
        y: index * 4, // Stack widgets vertically
        w: widget.size === 'small' ? 4 : widget.size === 'medium' ? 6 : 12,
        h: widget.size === 'small' ? 2 : widget.size === 'medium' ? 3 : 4,
      }));
      
      // Update the layout state
      setLayout(newLayout);
      
      // Save to localStorage
      localStorage.setItem('dashboard-layout', JSON.stringify(newLayout));
      
      console.log('Layout reset for all widgets:', newLayout);
    }
  }, [widgets.length]); // Only run when the number of widgets changes
  
  return (
    <div className="min-h-screen bg-background">
      <main className="p-6">
        <header className="max-w-7xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Grid className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <div className="px-2.5 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary">
                Widgets: {widgets.length}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isEditMode && widgets.length > 0 && (
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
                onClick={handleOpenSettings}
                className="flex items-center gap-1 rounded-full px-4 border-primary/20 hover:border-primary/50"
              >
                <Settings size={16} />
                <span>Settings</span>
              </Button>
              
              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={toggleEditMode}
                className="flex items-center gap-1 rounded-full px-4 border-primary/20 hover:border-primary/50"
              >
                {isEditMode ? (
                  <>
                    <Check size={16} />
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
                onClick={() => setCurrentScreen('appMenu')}
                size="sm"
                className="flex items-center gap-1 rounded-full px-4 bg-primary hover:bg-primary/90"
              >
                <AppWindow size={16} />
                <span>App Library</span>
              </Button>
            </div>
          </div>
          
          {/* Add a visual indicator for the current screen */}
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-full">
              <div className="px-4 py-1.5 bg-card rounded-full text-sm font-medium shadow-sm">
                Dashboard
              </div>
              <div 
                className="px-4 py-1.5 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => setCurrentScreen('appMenu')}
              >
                App Library
              </div>
            </div>
          </div>
        </header>
        
        {widgets.length === 0 ? (
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-xl bg-muted/50">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <AppWindow className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-medium mb-2">Your dashboard is empty</h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Add widgets from your app library to customize your dashboard.
              </p>
              <Button
                onClick={() => setCurrentScreen('appMenu')}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Browse App Library</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="relative">
              <GridLayout
                className="layout"
                layout={layout}
                cols={cols}
                rowHeight={150}
                width={containerWidth}
                isDraggable={isEditMode}
                isResizable={false}
                compactType="vertical"
                margin={[16, 16]}
                onLayoutChange={(newLayout) => {
                  console.log('Layout changed:', newLayout);
                  setLayout(newLayout);
                  localStorage.setItem('dashboard-layout', JSON.stringify(newLayout));
                }}
              >
                {widgets.map((widget) => {
                  const app = microApps.find(a => a.id === widget.appId);
                  if (!app) return null;
                  
                  console.log('Rendering widget:', widget.id);
                  return (
                    <div key={widget.id} className="widget-container bg-background border-2 border-primary">
                      <WidgetContainer
                        widget={widget}
                        app={app}
                        isEditing={isEditMode}
                        onDeleteDrop={handleDeleteDrop}
                      />
                    </div>
                  );
                })}
              </GridLayout>
              
              {/* Delete Drop Zone */}
              <AnimatePresence>
                {isEditMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40"
                  >
                    <div 
                      className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-lg ${
                        isDraggingOver 
                          ? 'bg-destructive text-destructive-foreground border-2 border-white' 
                          : 'bg-card border border-border'
                      } transition-all duration-200`}
                      style={{ 
                        width: '200px',
                        height: '100px',
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(true);
                      }}
                      onDragLeave={() => setIsDraggingOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        const widgetId = e.dataTransfer.getData('widgetId');
                        if (widgetId) {
                          handleDeleteDrop(widgetId);
                        }
                      }}
                    >
                      <Trash2 
                        size={isDraggingOver ? 32 : 24} 
                        className={`${isDraggingOver ? 'text-white' : 'text-muted-foreground'} mb-2 transition-all duration-200`} 
                      />
                      <p className={`text-sm font-medium ${isDraggingOver ? 'text-white' : 'text-muted-foreground'}`}>
                        {isDraggingOver ? 'Release to Delete' : 'Drag here to delete'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
      
      {/* Clear Dashboard Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-4 rounded-lg shadow-lg max-w-[90%] w-[350px]">
            <h4 className="font-medium text-foreground mb-2">Clear Dashboard</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to remove all widgets from your dashboard? This action cannot be undone.
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
                  clearWidgets();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 