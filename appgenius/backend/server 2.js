const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Endpoint to generate app using OpenAI
app.post('/api/generate-app', async (req, res) => {
  try {
    const { prompt, apiKey } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    // Construct a more focused system prompt
    const systemPrompt = `
      You are an expert React developer who specializes in creating micro-apps and widgets.
      You will be given a request to create a specific type of app or widget.
      
      Your response must be a valid JSON object with the following structure:
      {
        "appType": "widget",
        "name": "Name of the app",
        "description": "Brief description of what the app does",
        "icon": "An emoji that represents the app (e.g., 🕒 for clock)",
        "code": "Complete React functional component code as a string",
        "config": {}
      }
      
      IMPORTANT: The code must be a SINGLE React function component that follows these rules:
      1. Start with: function ComponentName({ config }) {
      2. Use React.useState instead of useState
      3. Use React.useEffect instead of useEffect
      4. Do not use any imports or require statements
      5. Use only inline styles with the style attribute
      6. Keep the component simple and focused on one task
      7. Return a single div as the root element
      
      Example of a valid component:
      
      \`\`\`
      function WorldClock({ config }) {
        const [time, setTime] = React.useState(new Date());
        
        React.useEffect(() => {
          const interval = setInterval(() => {
            setTime(new Date());
          }, 1000);
          return () => clearInterval(interval);
        }, []);
        
        return (
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Current Time</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {time.toLocaleTimeString()}
            </div>
          </div>
        );
      }
      \`\`\`
      
      Keep your response focused on generating ONLY the JSON object with the component code.
    `;
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response?.data || error.message);
    
    // Handle specific OpenAI API errors
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        details: 'The provided OpenAI API key is invalid or has expired.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate app', 
      details: error.response?.data || error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 