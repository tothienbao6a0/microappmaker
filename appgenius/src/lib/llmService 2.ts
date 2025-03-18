// Updated LLM Service to use backend proxy

import { MicroApp } from '@/store/appStore';
import { useAppStore } from '@/store/appStore';

// Define the types of apps that can be generated
export type AppType = 'widget' | 'launcher';

// Configuration options for different app types
export interface AppConfig {
  [key: string]: any;
}

// Interface for the LLM response
interface LLMResponse {
  appType: AppType;
  name: string;
  description: string;
  icon: string;
  code: string;
  config: AppConfig;
}

// Generate a simple UUID without external dependencies
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// API URL - use environment variable or default to localhost in development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Get API key from local storage - no longer needed for direct API calls
// but kept for checking if user has set up their account
export const hasApiKey = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('openai-api-key') !== null;
};

// Save API key to local storage - for user account setup indication only
export const saveApiKey = (key: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('openai-api-key', key);
};

// Clear API key
export const clearApiKey = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('openai-api-key');
};

// Call backend API to generate app code
const callBackendAPI = async (prompt: string): Promise<LLMResponse> => {
  try {
    // Get the API key from localStorage
    const apiKey = localStorage.getItem('openai-api-key');
    
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    const response = await fetch(`${API_URL}/api/generate-app`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt,
        apiKey // Send the API key with the request
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate app');
    }
    
    const data = await response.json();
    
    // Extract the content from the OpenAI response
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    try {
      // The content might be wrapped in ```json and ``` markers
      const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) || 
                        content.match(/```\n([\s\S]*)\n```/) || 
                        [null, content];
      
      const jsonContent = jsonMatch[1] || content;
      return JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      throw new Error('Failed to parse app data');
    }
  } catch (error) {
    console.error('Error calling backend API:', error);
    throw error;
  }
};

// Function to generate a micro app
async function generateMicroApp(prompt: string): Promise<MicroApp | null> {
  try {
    const response = await fetch(`${API_URL}/api/generate-app`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, apiKey: localStorage.getItem('openai-api-key') })
    });

    if (!response.ok) {
      console.error('Failed to generate app:', response.statusText);
      return null;
    }

    const data: LLMResponse = await response.json();

    // Check if the response is empty or missing fields
    if (!data || !data.code || !data.name || !data.description) {
      console.error('Invalid app data:', data);
      return null;
    }

    // Create the micro app
    const microApp: MicroApp = {
      id: generateUUID(),
      name: data.name.trim(),
      description: data.description.trim(),
      icon: data.icon || '📱', // Default icon if none provided
      code: data.code.trim(),
      config: data.config || {},
      createdAt: new Date().toISOString()
    };

    return microApp;
  } catch (error) {
    console.error('Error generating micro app:', error);
    return null;
  }
}

export default generateMicroApp;

// Function to get a demo app when no API key is provided
const getDemoApp = (prompt: string): MicroApp => {
  // Determine which demo app to return based on the prompt
  const lowerPrompt = prompt.toLowerCase();
  
  // Weather app
  if (lowerPrompt.includes('weather')) {
    return {
      id: generateUUID(),
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
  }
  
  // Todo list app
  if (lowerPrompt.includes('todo') || lowerPrompt.includes('task') || lowerPrompt.includes('list')) {
    return {
      id: generateUUID(),
      name: 'Todo List',
      description: 'Keep track of your tasks',
      icon: '📝',
      code: `function TodoList({ config }) {
        const [tasks, setTasks] = React.useState([
          { id: 1, text: 'Learn React', completed: true },
          { id: 2, text: 'Build a widget', completed: false },
          { id: 3, text: 'Deploy app', completed: false }
        ]);
        const [newTask, setNewTask] = React.useState('');
        
        const addTask = () => {
          if (!newTask.trim()) return;
          
          setTasks([
            ...tasks,
            {
              id: Date.now(),
              text: newTask,
              completed: false
            }
          ]);
          setNewTask('');
        };
        
        const toggleTask = (id) => {
          setTasks(tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
          ));
        };
        
        const deleteTask = (id) => {
          setTasks(tasks.filter(task => task.id !== id));
        };
        
        return (
          <div className="h-full flex flex-col p-3 bg-white text-gray-800">
            <h3 className="text-sm font-medium mb-2">Todo List</h3>
            
            <div className="mb-3">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new task"
                  className="flex-1 p-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
                <button
                  onClick={addTask}
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  disabled={!newTask.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-4">
                  No tasks yet. Add one above!
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {tasks.map(task => (
                    <li key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="h-4 w-4 text-blue-500 rounded focus:ring-blue-400"
                      />
                      <span className={\`flex-1 text-sm \${task.completed ? 'line-through text-gray-400' : ''}\`}>
                        {task.text}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      }`,
      config: {},
      createdAt: new Date().toISOString()
    };
  }
  
  // Add a world clock to the demo apps
  if (lowerPrompt.includes('clock') || lowerPrompt.includes('time')) {
    return {
      id: generateUUID(),
      name: 'World Clock',
      description: 'Shows the current time in different time zones',
      icon: '🕒',
      code: `function WorldClock({ config }) {
        const [time, setTime] = React.useState(new Date());
        const [selectedTimezone, setSelectedTimezone] = React.useState('local');
        const [timezones, setTimezones] = React.useState([
          { id: 'local', name: 'Local Time', offset: 0 },
          { id: 'utc', name: 'UTC', offset: 0 },
          { id: 'est', name: 'New York (EST)', offset: -5 },
          { id: 'pst', name: 'Los Angeles (PST)', offset: -8 },
          { id: 'jst', name: 'Tokyo (JST)', offset: 9 },
          { id: 'cet', name: 'Paris (CET)', offset: 1 },
        ]);
        
        React.useEffect(() => {
          const interval = setInterval(() => {
            setTime(new Date());
          }, 1000);
          
          return () => clearInterval(interval);
        }, []);
        
        const getTimeInTimezone = (date, timezoneOffset) => {
          if (selectedTimezone === 'local') {
            return date.toLocaleTimeString();
          }
          
          if (selectedTimezone === 'utc') {
            return date.toISOString().substr(11, 8);
          }
          
          const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
          const targetTime = new Date(utcTime + (3600000 * timezoneOffset));
          return targetTime.toLocaleTimeString();
        };
        
        const selectedZone = timezones.find(tz => tz.id === selectedTimezone) || timezones[0];
        
        return (
          <div style={{ 
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '1rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>World Clock</h3>
              <select 
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                style={{
                  padding: '0.25rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                {timezones.map(tz => (
                  <option key={tz.id} value={tz.id}>{tz.name}</option>
                ))}
              </select>
            </div>
            
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.05em'
              }}>
                {getTimeInTimezone(time, selectedZone.offset)}
              </div>
              <div style={{
                marginTop: '0.5rem',
                color: '#666',
                fontSize: '0.9rem'
              }}>
                {selectedZone.name}
              </div>
              <div style={{
                marginTop: '1rem',
                fontSize: '0.8rem',
                color: '#888'
              }}>
                {time.toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        );
      }`,
      config: {},
      createdAt: new Date().toISOString()
    };
  }
  
  // Default calculator app
  return {
    id: generateUUID(),
    name: 'Calculator',
    description: 'Simple calculator widget',
    icon: '🧮',
    code: `function Calculator({ config }) {
      const [display, setDisplay] = React.useState('0');
      const [operation, setOperation] = React.useState(null);
      const [prevValue, setPrevValue] = React.useState(null);
      const [resetDisplay, setResetDisplay] = React.useState(false);
      
      const handleNumberClick = (num) => {
        if (display === '0' || resetDisplay) {
          setDisplay(num.toString());
          setResetDisplay(false);
        } else {
          setDisplay(display + num);
        }
      };
      
      const handleOperationClick = (op) => {
        setOperation(op);
        setPrevValue(parseFloat(display));
        setResetDisplay(true);
      };
      
      const handleEquals = () => {
        if (!operation || prevValue === null) return;
        
        const currentValue = parseFloat(display);
        let result;
        
        switch (operation) {
          case '+':
            result = prevValue + currentValue;
            break;
          case '-':
            result = prevValue - currentValue;
            break;
          case '×':
            result = prevValue * currentValue;
            break;
          case '÷':
            result = prevValue / currentValue;
            break;
          default:
            return;
        }
        
        setDisplay(result.toString());
        setOperation(null);
        setPrevValue(null);
      };
      
      const handleClear = () => {
        setDisplay('0');
        setOperation(null);
        setPrevValue(null);
        setResetDisplay(false);
      };
      
      return (
        <div className="h-full flex flex-col bg-gray-900 p-2 rounded-lg">
          <div className="bg-gray-800 text-white text-right p-2 rounded mb-2 overflow-hidden">
            <div className="text-gray-400 text-xs h-4">
              {prevValue !== null ? \`\${prevValue} \${operation}\` : ''}
            </div>
            <div className="text-xl font-medium truncate">{display}</div>
          </div>
          
          <div className="grid grid-cols-4 gap-1 flex-1">
            <button onClick={handleClear} className="bg-gray-700 text-white rounded hover:bg-gray-600">C</button>
            <button className="bg-gray-700 text-white rounded hover:bg-gray-600">±</button>
            <button className="bg-gray-700 text-white rounded hover:bg-gray-600">%</button>
            <button onClick={() => handleOperationClick('÷')} className="bg-amber-500 text-white rounded hover:bg-amber-400">÷</button>
            
            <button onClick={() => handleNumberClick(7)} className="bg-gray-800 text-white rounded hover:bg-gray-700">7</button>
            <button onClick={() => handleNumberClick(8)} className="bg-gray-800 text-white rounded hover:bg-gray-700">8</button>
            <button onClick={() => handleNumberClick(9)} className="bg-gray-800 text-white rounded hover:bg-gray-700">9</button>
            <button onClick={() => handleOperationClick('×')} className="bg-amber-500 text-white rounded hover:bg-amber-400">×</button>
            
            <button onClick={() => handleNumberClick(4)} className="bg-gray-800 text-white rounded hover:bg-gray-700">4</button>
            <button onClick={() => handleNumberClick(5)} className="bg-gray-800 text-white rounded hover:bg-gray-700">5</button>
            <button onClick={() => handleNumberClick(6)} className="bg-gray-800 text-white rounded hover:bg-gray-700">6</button>
            <button onClick={() => handleOperationClick('-')} className="bg-amber-500 text-white rounded hover:bg-amber-400">-</button>
            
            <button onClick={() => handleNumberClick(1)} className="bg-gray-800 text-white rounded hover:bg-gray-700">1</button>
            <button onClick={() => handleNumberClick(2)} className="bg-gray-800 text-white rounded hover:bg-gray-700">2</button>
            <button onClick={() => handleNumberClick(3)} className="bg-gray-800 text-white rounded hover:bg-gray-700">3</button>
            <button onClick={() => handleOperationClick('+')} className="bg-amber-500 text-white rounded hover:bg-amber-400">+</button>
            
            <button onClick={() => handleNumberClick(0)} className="bg-gray-800 text-white rounded hover:bg-gray-700 col-span-2">0</button>
            <button onClick={() => setDisplay(display.includes('.') ? display : display + '.')} className="bg-gray-800 text-white rounded hover:bg-gray-700">.</button>
            <button onClick={handleEquals} className="bg-amber-500 text-white rounded hover:bg-amber-400">=</button>
          </div>
        </div>
      );
    }`,
    config: {},
    createdAt: new Date().toISOString()
  };
};

// Add a test function to create a simple working widget
export function createTestWidget(): MicroApp {
  return {
    id: generateUUID(),
    name: 'Test Clock',
    description: 'A simple test clock widget',
    icon: '🧪',
    code: `function TestClock({ config }) {
      const [time, setTime] = React.useState(new Date());
      
      React.useEffect(() => {
        const interval = setInterval(() => {
          setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
      }, []);
      
      return (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Test Clock</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {time.toLocaleTimeString()}
          </div>
        </div>
      );
    }`,
    config: {},
    createdAt: new Date().toISOString()
  };
}

// Make the test widget function globally accessible
if (typeof window !== 'undefined') {
  (window as any).createTestWidget = createTestWidget;
  (window as any).useAppStore = useAppStore;
} 