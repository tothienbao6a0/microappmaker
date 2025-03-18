// Create a new file for debugging tools
import { useAppStore } from '@/store/appStore';
import { createTestWidget } from './llmService';

// Debug function to add a test widget
export function addTestWidget() {
  const testWidget = createTestWidget();
  const store = useAppStore.getState();
  
  // Add the app
  store.addMicroApp(testWidget);
  
  // Add a widget for this app
  const widgetId = 'test-widget-' + Date.now();
  store.addWidget({
    id: widgetId,
    appId: testWidget.id,
    position: { x: 0, y: 0 },
    size: 'medium'
  });
  
  console.log('Added test widget:', widgetId);
  return widgetId;
}

// Debug function to list all widgets
export function listWidgets() {
  const store = useAppStore.getState();
  const widgets = store.widgets;
  const apps = store.microApps;
  
  console.log(`Found ${widgets.length} widgets:`);
  widgets.forEach(widget => {
    const app = apps.find(a => a.id === widget.appId);
    console.log(`- Widget ${widget.id} (${widget.size}): ${app ? app.name : 'Unknown app'}`);
  });
  
  return widgets;
}

// Debug function to check widget visibility
export function checkWidgetVisibility() {
  const widgets = document.querySelectorAll('.widget-container');
  console.log(`Found ${widgets.length} widget containers in the DOM`);
  
  widgets.forEach((widget, i) => {
    const rect = widget.getBoundingClientRect();
    console.log(`Widget ${i} position:`, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      visible: rect.width > 0 && rect.height > 0
    });
  });
}

// Add a function to reset the dashboard layout
export function resetDashboardLayout() {
  const store = useAppStore.getState();
  const widgets = store.widgets;
  
  // Create a fresh layout
  const newLayout = widgets.map((widget, index) => ({
    i: widget.id,
    x: 0,
    y: index * 4, // Stack widgets vertically
    w: widget.size === 'small' ? 4 : widget.size === 'medium' ? 6 : 12,
    h: widget.size === 'small' ? 2 : widget.size === 'medium' ? 3 : 4,
  }));
  
  // Update the layout in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('dashboard-layout', JSON.stringify(newLayout));
    console.log('Dashboard layout reset. Refresh the page to see changes.');
  }
  
  return newLayout;
}

// Add a function to clear all widgets
export function clearAllWidgets() {
  const store = useAppStore.getState();
  
  // Get all widget IDs
  const widgetIds = store.widgets.map(w => w.id);
  
  // Remove each widget
  widgetIds.forEach(id => {
    store.removeWidget(id);
  });
  
  // Clear the layout
  localStorage.removeItem('dashboard-layout');
  
  console.log('All widgets cleared. Refresh the page to see changes.');
  return true;
}

// Add a function to add a weather widget directly
export function addWeatherWidget() {
  const store = useAppStore.getState();
  
  // Create the weather app
  const weatherApp = {
    id: 'weather-app-' + Date.now(),
    name: 'Weather App',
    description: 'Shows current weather conditions',
    icon: '🌤️',
    code: `function WeatherApp({ config }) {
      const [weather, setWeather] = React.useState(null);
      const [loading, setLoading] = React.useState(true);
      const [error, setError] = React.useState(null);
      const [location, setLocation] = React.useState('New York');
      
      React.useEffect(() => {
        // Simulate weather data
        setLoading(true);
        setTimeout(() => {
          const weatherData = {
            location: location,
            temperature: Math.floor(Math.random() * 30) + 5,
            condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 50) + 30,
            windSpeed: Math.floor(Math.random() * 20) + 5
          };
          setWeather(weatherData);
          setLoading(false);
        }, 1000);
      }, [location]);
      
      const handleLocationChange = (e) => {
        setLocation(e.target.value);
      };
      
      const getWeatherIcon = (condition) => {
        switch(condition) {
          case 'Sunny': return '☀️';
          case 'Cloudy': return '☁️';
          case 'Rainy': return '🌧️';
          case 'Snowy': return '❄️';
          default: return '🌤️';
        }
      };
      
      if (loading) {
        return (
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem' }}>Weather App</h3>
            <p>Loading weather data...</p>
          </div>
        );
      }
      
      if (error) {
        return (
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem' }}>Weather App</h3>
            <p style={{ color: 'red' }}>Error: {error}</p>
          </div>
        );
      }
      
      return (
        <div style={{ padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={location}
              onChange={handleLocationChange}
              placeholder="Enter location"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          
          {weather && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                {getWeatherIcon(weather.condition)}
              </div>
              <h2 style={{ margin: '0', fontSize: '1.5rem' }}>{weather.location}</h2>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                {weather.temperature}°C
              </div>
              <div style={{ marginBottom: '0.5rem' }}>{weather.condition}</div>
              <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.9rem', color: '#666' }}>
                <div>Humidity: {weather.humidity}%</div>
                <div>Wind: {weather.windSpeed} km/h</div>
              </div>
            </div>
          )}
        </div>
      );
    }`,
    config: {},
    createdAt: new Date().toISOString()
  };
  
  // Add the app
  store.addMicroApp(weatherApp);
  
  // Add a widget for this app
  const widgetId = 'weather-widget-' + Date.now();
  store.addWidget({
    id: widgetId,
    appId: weatherApp.id,
    name: 'Weather App',
    position: { x: 0, y: 0 },
    size: 'medium'
  });
  
  // Force a layout update
  const newLayoutItem = {
    i: widgetId,
    x: 0,
    y: 0,
    w: 6,
    h: 3,
  };
  
  // Get existing layout from localStorage or create empty array
  const existingLayout = JSON.parse(localStorage.getItem('dashboard-layout') || '[]');
  const newLayout = [newLayoutItem, ...existingLayout];
  localStorage.setItem('dashboard-layout', JSON.stringify(newLayout));
  
  console.log('Added weather widget:', widgetId);
  alert('Weather widget added! Refresh the page to see it.');
  return widgetId;
}

// Update the global debug tools
if (typeof window !== 'undefined') {
  (window as any).debugTools = {
    addTestWidget,
    listWidgets,
    checkWidgetVisibility,
    resetDashboardLayout,
    clearAllWidgets,
    addWeatherWidget
  };
} 