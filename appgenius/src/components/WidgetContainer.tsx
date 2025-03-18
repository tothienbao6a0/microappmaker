import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, Widget, MicroApp } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { X, GripVertical, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Function to cycle through sizes
  const cycleSize = () => {
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(widget.size);
    const nextIndex = (currentIndex + 1) % sizes.length;
    resizeWidget(widget.id, sizes[nextIndex]);
  };
  
  // Reset error state when app changes
  useEffect(() => {
    setHasError(false);
  }, [app.id, app.code]);
  
  // Create the widget content with error handling
  const createWidgetContent = () => {
    try {
      // Create a safe wrapper around the app code
      const safeAppCode = `
        try {
          ${app.code}
          
          // Render the component with error handling
          function SafeAppWrapper(props) {
            try {
              // First try to find the component name from a function declaration
              let componentName = null;
              const functionMatch = /function\\s+([A-Za-z0-9_]+)\\s*\\(/g.exec(props.code);
              if (functionMatch && functionMatch[1]) {
                componentName = functionMatch[1];
              }
              
              // If no match, use a default name
              if (!componentName) {
                componentName = 'App';
                // Define a fallback component if needed
                window.App = function App(props) {
                  return React.createElement('div', null, 'Component could not be identified');
                };
              }
              
              // Get the component from the window object
              const AppComponent = window[componentName];
              if (typeof AppComponent !== 'function') {
                throw new Error('Component ' + componentName + ' is not a function');
              }
              
              return React.createElement(AppComponent, { config: props.config });
            } catch (error) {
              console.error('Error rendering component:', error);
              return React.createElement(
                'div',
                { style: { padding: '1rem', color: 'red' } },
                [
                  React.createElement('h3', { key: 'title' }, 'Error Rendering App'),
                  React.createElement('p', { key: 'message' }, error.message)
                ]
              );
            }
          }
          
          // Extract component name from the code
          const componentNameMatch = /function\\s+([A-Za-z0-9_]+)\\s*\\(/g.exec(props.code);
          const componentName = componentNameMatch ? componentNameMatch[1] : 'App';
          
          ReactDOM.render(
            React.createElement(SafeAppWrapper, { 
              componentName: componentName,
              config: ${JSON.stringify(app.config || {})},
              code: props.code
            }),
            document.getElementById('app-root')
          );
        } catch (error) {
          document.getElementById('app-root').innerHTML = 
            '<div style="padding: 1rem; color: red;">' +
            '<h3>Error Loading App</h3>' +
            '<p>' + error.message + '</p>' +
            '</div>';
        }
      `;
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
          <style>
            body, html { 
              margin: 0; 
              padding: 0; 
              height: 100%; 
              font-family: system-ui, -apple-system, sans-serif;
            }
            #app-root {
              height: 100%;
              overflow: auto;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div id="app-root"></div>
          <script>
            const props = {
              code: \`${app.code.replace(/`/g, '\\`')}\`,
              config: ${JSON.stringify(app.config || {})}
            };
            ${safeAppCode}
          </script>
        </body>
        </html>
      `;
    } catch (error) {
      setHasError(true);
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              margin: 0; 
              padding: 1rem; 
              font-family: system-ui, -apple-system, sans-serif;
              color: red;
            }
          </style>
        </head>
        <body>
          <h3>Error Creating Widget</h3>
          <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        </body>
        </html>
      `;
    }
  };
  
  // Create a blob URL for the widget code
  useEffect(() => {
    if (!iframeRef.current) return;
    
    const html = createWidgetContent();
    
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
    <div className="p-4 bg-white shadow-md rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{app.name}</h3>
        {isEditing && (
          <Button
            onClick={() => onDeleteDrop(widget.id)}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </Button>
        )}
      </div>
      <div className="text-sm text-gray-600 mb-4">{app.description}</div>
      <div className="widget-content">
        <iframe
          ref={iframeRef}
          title={app.name}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default WidgetContainer; 