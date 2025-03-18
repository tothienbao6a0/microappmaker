import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Replace UUID with a simple ID generator since we don't have the package
const generateId = () => Math.random().toString(36).substring(2, 15);

export type WidgetSize = 'small' | 'medium' | 'large';

export interface MicroApp {
  id: string;
  name: string;
  description: string;
  icon: string; // URL or emoji
  code: string;
  config?: Record<string, any>;
  createdAt: number;
}

export interface Widget {
  id: string;
  appId: string; // Reference to the MicroApp
  name: string;
  size: WidgetSize;
  position: {
    x: number;
    y: number;
  };
}

interface AppState {
  microApps: MicroApp[];
  widgets: Widget[];
  currentScreen: 'dashboard' | 'appMenu';
  isEditMode: boolean;
  isChatOpen: boolean;
  
  // Navigation
  setCurrentScreen: (screen: 'dashboard' | 'appMenu') => void;
  
  // MicroApp actions
  addMicroApp: (app: Omit<MicroApp, 'id' | 'createdAt'>) => void;
  updateMicroApp: (id: string, updates: Partial<MicroApp>) => void;
  removeMicroApp: (id: string) => void;
  
  // Widget actions
  addWidget: (widget: Omit<Widget, 'id'>) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, position: { x: number; y: number }) => void;
  resizeWidget: (id: string, size: WidgetSize) => void;
  
  // UI state
  toggleEditMode: () => void;
  toggleChat: () => void;
  
  // New action
  clearWidgets: () => void;
  clearApps: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      microApps: [],
      widgets: [],
      currentScreen: 'dashboard',
      isEditMode: false,
      isChatOpen: false,
      
      setCurrentScreen: (screen) =>
        set({ currentScreen: screen }),
      
      addMicroApp: (app) =>
        set((state) => ({
          microApps: [
            ...state.microApps,
            {
              ...app,
              id: generateId(),
              createdAt: Date.now()
            }
          ]
        })),
        
      updateMicroApp: (id, updates) =>
        set((state) => ({
          microApps: state.microApps.map((app) =>
            app.id === id ? { ...app, ...updates } : app
          )
        })),
        
      removeMicroApp: (id) =>
        set((state) => ({
          microApps: state.microApps.filter((app) => app.id !== id),
          // Also remove any widgets using this app
          widgets: state.widgets.filter((widget) => widget.appId !== id)
        })),
      
      addWidget: (widget) =>
        set((state) => ({
          widgets: [
            ...state.widgets,
            {
              ...widget,
              id: generateId()
            }
          ]
        })),
        
      updateWidget: (id, updates) =>
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, ...updates } : widget
          )
        })),
        
      removeWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((widget) => widget.id !== id)
        })),
        
      moveWidget: (id, position) =>
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, position } : widget
          )
        })),
        
      resizeWidget: (id, size) =>
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, size } : widget
          )
        })),
        
      toggleEditMode: () =>
        set((state) => ({ isEditMode: !state.isEditMode })),
        
      toggleChat: () =>
        set((state) => ({ isChatOpen: !state.isChatOpen })),
      
      clearWidgets: () =>
        set((state) => ({
          widgets: []
        })),
      
      clearApps: () =>
        set((state) => ({
          microApps: [],
          widgets: [] // Also clear widgets since they depend on apps
        })),
    }),
    {
      name: 'appgenius-storage',
    }
  )
); 