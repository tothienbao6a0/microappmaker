import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Settings from './components/Settings';
import './index.css';

// Render the main app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Expose a function to render the Settings component
window.renderSettings = function() {
  const settingsRoot = document.getElementById('settings-root');
  if (settingsRoot) {
    ReactDOM.createRoot(settingsRoot).render(
      <React.StrictMode>
        <Settings />
      </React.StrictMode>
    );
  }
};

// Add the renderSettings function to the window object
declare global {
  interface Window {
    renderSettings: () => void;
  }
} 