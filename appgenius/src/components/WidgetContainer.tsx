import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, Widget, MicroApp } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { X, GripVertical, Maximize2, Minimize2, Trash2 } from 'lucide-react';

interface WidgetContainerProps {
  widget: Widget;
  app: MicroApp;
  isEditing?: boolean;
  onDeleteDrop?: (widgetId: string) => void;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({ 
  widget, 
  app, 
  isEditing = false,
  onDeleteDrop
}) => {
  const { removeWidget, resizeWidget } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Function to cycle through sizes
  const cycleSize = () => {
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(widget.size);
    const nextIndex = (currentIndex + 1) % sizes.length;
    resizeWidget(widget.id, sizes[nextIndex]);
  };
  
  // Create a blob URL for the widget code
  useEffect(() => {
    if (!iframeRef.current) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { margin: 0; padding: 0; overflow: hidden; font-family: system-ui, -apple-system, sans-serif; }
            #root { width: 100%; height: 100vh; }
            
            /* Custom scrollbar */
            ::-webkit-scrollbar { width: 6px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 3px; }
            ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${app.code}
            
            // Render the app with its configuration
            const AppComponent = ${app.name.replace(/\s+/g, '')}; // Convert name to component name
            ReactDOM.render(
              <AppComponent config={${JSON.stringify(app.config || {})}} />,
              document.getElementById('root')
            );
          </script>
        </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    iframeRef.current.src = url;
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [app.code, app.config, app.name]);
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent) => {
    if (isEditing) {
      e.dataTransfer.setData('widgetId', widget.id);
      e.dataTransfer.effectAllowed = 'move';
      
      // Create a ghost image for dragging
      const ghostElement = document.createElement('div');
      ghostElement.style.width = '100px';
      ghostElement.style.height = '100px';
      ghostElement.style.background = 'rgba(0,0,0,0.2)';
      ghostElement.style.borderRadius = '8px';
      document.body.appendChild(ghostElement);
      
      e.dataTransfer.setDragImage(ghostElement, 50, 50);
      
      setTimeout(() => {
        document.body.removeChild(ghostElement);
      }, 0);
    }
  };
  
  return (
    <div 
      className="flex flex-col w-full h-full"
      draggable={isEditing}
      onDragStart={handleDragStart}
    >
      {/* Widget title and controls */}
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-sm font-medium text-foreground truncate">{widget.name}</h3>
        
        {/* Controls that show on hover */}
        <div 
          className={cn(
            "flex items-center gap-1.5 transition-opacity",
            isHovered && !isEditing ? "opacity-100" : "opacity-0"
          )}
        >
          {isHovered && !isEditing && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                cycleSize();
              }}
              className="p-1.5 bg-background border border-border text-muted-foreground hover:text-foreground rounded-full transition-colors shadow-sm"
              title={`Resize to ${widget.size === 'small' ? 'medium' : widget.size === 'medium' ? 'large' : 'small'}`}
            >
              {widget.size === 'small' ? (
                <Maximize2 size={14} />
              ) : widget.size === 'large' ? (
                <Minimize2 size={14} />
              ) : (
                <Maximize2 size={14} />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Widget card */}
      <motion.div
        className={cn(
          'relative rounded-xl overflow-hidden bg-card border border-border shadow-sm transition-all hover:shadow-md flex-1',
          isEditing ? 'cursor-move' : ''
        )}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Widget content */}
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
          title={widget.name}
          style={{ pointerEvents: isEditing ? 'none' : 'auto' }}
        />
        
        {/* Edit mode handle for moving widgets */}
        {isEditing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 cursor-move">
            <div className="bg-white/30 p-2 rounded-full shadow-md">
              <GripVertical className="text-white drop-shadow-md" />
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Widget description tooltip */}
      {isHovered && !isEditing && app.description && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-2 rounded-md backdrop-blur-sm"
        >
          {app.description}
        </motion.div>
      )}
    </div>
  );
};

export default WidgetContainer; 