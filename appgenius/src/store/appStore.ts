import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Replace UUID with a simple ID generator since we don't have the package
const generateId = () => Math.random().toString(36).substring(2, 15);

export type WidgetSize = 'small' | 'medium' | 'large';

export interface Position {
  x: number;
  y: number;
}

export interface Widget {
  id: string;
  appId: string;
  name?: string; // Make name optional to maintain compatibility
  size: WidgetSize;
  position: Position;
}

export interface MicroApp {
  id: string;
  name: string;
  description: string;
  icon: string; // URL or emoji
  code: string;
  config: any;
  createdAt: string;
}

export type Screen = 'dashboard' | 'appMenu' | 'appDetails' | 'settings';

interface AppState {
  microApps: MicroApp[];
  widgets: Widget[];
  currentScreen: Screen;
  isEditMode: boolean;
  isChatOpen: boolean;
  isSettingsOpen: boolean;
  selectedAppId: string | null;
  
  // Navigation
  setCurrentScreen: (screen: Screen) => void;
  
  // MicroApp actions
  addMicroApp: (app: MicroApp) => void;
  updateMicroApp: (id: string, app: Partial<MicroApp>) => void;
  removeMicroApp: (id: string) => void;
  
  // Widget actions
  addWidget: (widget: Widget) => void;
  updateWidget: (id: string, widget: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, position: { x: number; y: number }) => void;
  resizeWidget: (id: string, size: WidgetSize) => void;
  
  // UI state
  toggleEditMode: () => void;
  toggleChat: () => void;
  toggleSettings: () => void;
  
  // New action
  clearWidgets: () => void;
  clearApps: () => void;
  setSelectedAppId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      microApps: [],
      widgets: [],
      currentScreen: 'dashboard',
      isEditMode: false,
      isChatOpen: false,
      isSettingsOpen: false,
      selectedAppId: null,
      
      setCurrentScreen: (screen) => {
        console.log('setCurrentScreen called with:', screen);
        set((state) => {
          console.log('Current screen before update:', state.currentScreen);
          console.log('Setting screen to:', screen);
          return { currentScreen: screen };
        });
      },
      
      addMicroApp: (app) =>
        set((state) => ({
          microApps: [
            ...state.microApps,
            app
          ]
        })),
        
      updateMicroApp: (id, app) =>
        set((state) => ({
          microApps: state.microApps.map((a) =>
            a.id === id ? { ...a, ...app } : a
          )
        })),
        
      removeMicroApp: (id) =>
        set((state) => ({
          microApps: state.microApps.filter((a) => a.id !== id),
          // Also remove any widgets using this app
          widgets: state.widgets.filter((widget) => widget.appId !== id)
        })),
      
      addWidget: (widget: Widget) => {
        const { widgets, layout = [] } = get();
        
        // Create a layout item for the new widget
        const newLayoutItem = {
          i: widget.id,
          x: 0, // Start at the left
          y: 0, // Start at the top and let grid layout handle positioning
          w: widget.size === 'small' ? 4 : widget.size === 'medium' ? 6 : 12,
          h: widget.size === 'small' ? 2 : widget.size === 'medium' ? 3 : 4,
        };
        
        // Add the widget and update the layout
        set({
          widgets: [...widgets, widget],
          layout: [newLayoutItem, ...layout] // Add new widget at the beginning
        });
        
        // Force a layout save to localStorage
        localStorage.setItem('dashboard-layout', JSON.stringify([newLayoutItem, ...layout]));
        
        console.log('Widget added with layout:', newLayoutItem);
      },
        
      updateWidget: (id, widget) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...widget } : w
          )
        })),
        
      removeWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id)
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
        
      toggleSettings: () => {
        console.log('toggleSettings called in store');
        set((state) => {
          console.log('Current isSettingsOpen:', state.isSettingsOpen);
          console.log('Setting to:', !state.isSettingsOpen);
          return { isSettingsOpen: !state.isSettingsOpen };
        });
      },
      
      clearWidgets: () =>
        set((state) => ({
          widgets: []
        })),
      
      clearApps: () =>
        set((state) => ({
          microApps: [],
          widgets: [] // Also clear widgets since they depend on apps
        })),
      
      setSelectedAppId: (id) => set({ selectedAppId: id })
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        microApps: state.microApps,
        widgets: state.widgets,
        // Don't persist layout - we'll handle that separately
      }),
    }
  )
); 