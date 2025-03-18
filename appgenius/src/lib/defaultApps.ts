import { MicroApp } from '@/store/appStore';

export const defaultApps: MicroApp[] = [
  {
    id: 'weather-widget',
    name: 'Weather Widget',
    description: 'Shows current weather conditions',
    icon: '🌤️',
    code: `function WeatherWidget({ config }) {
      return (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <h3>Weather Widget</h3>
          <p>Weather data for your location.</p>
        </div>
      );
    }`,
    config: {},
    createdAt: new Date().toISOString()
  },
  {
    id: 'url-launcher',
    name: 'URL Launcher',
    description: 'Launches a specified URL',
    icon: '🔗',
    code: `function URLLauncher({ config }) {
      return (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <h3>URL Launcher</h3>
          <a href={config.url} target="_blank" rel="noopener noreferrer">
            Open URL
          </a>
        </div>
      );
    }`,
    config: { url: 'https://example.com' },
    createdAt: new Date().toISOString()
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'A simple calculator',
    icon: '🧮',
    code: `function Calculator({ config }) {
      return (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <h3>Calculator</h3>
          <p>Simple calculator functionality.</p>
        </div>
      );
    }`,
    config: {},
    createdAt: new Date().toISOString()
  }
]; 