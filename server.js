// server.js - DevPilot AI Backend for Mobile Development
const express = require('express');
const cors = require('cors');

// Gemini API Key
const GEMINI_API_KEY = 'AIzaSyCURz7A2o4Eb0iZa_rGxP5Rxgb5zL3oUkA';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for mobile testing
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.static('.')); // Serve files from current directory

// DevPilot AI System Prompt
const DEVPILOT_SYSTEM_PROMPT = `
You are DevPilot AI, an expert coding assistant. You generate clean, modern, bug-free web code.

RULES:
- Return ONLY working HTML/CSS/JavaScript code
- Use modern CSS (Flexbox, Grid, Variables)
- Make components responsive and accessible
- Include hover effects and animations
- Use semantic HTML5 elements
- No explanations, just pure code
- Ensure all code is complete and runnable

Focus on creating beautiful, professional components that work perfectly.
`;

// Gemini API function
async function callGeminiAPI(prompt) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 2048,
      },
    });

    const enhancedPrompt = `${DEVPILOT_SYSTEM_PROMPT}\n\nUser Request: ${prompt}`;
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    
    return cleanCode(response.text());
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate code');
  }
}

// Clean generated code
function cleanCode(code) {
  // Remove markdown code blocks
  code = code.replace(/```(?:html|css|javascript|js)?\n/g, '');
  code = code.replace(/```\n?$/g, '');
  
  // Remove explanatory text
  code = code.trim();
  
  return code;
}

// Main API endpoint
app.post('/api/generate', async (req, res) => {
  console.log('📝 Code generation request received');
  
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Please provide a valid prompt',
        code: 'INVALID_PROMPT'
      });
    }

    console.log(`🤖 Generating code for: "${prompt}"`);

    // Generate code with Gemini
    const generatedCode = await callGeminiAPI(prompt);

    console.log('✅ Code generated successfully');

    res.json({
      code: generatedCode,
      timestamp: new Date().toISOString(),
      status: 'success'
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    res.status(500).json({
      error: 'Failed to generate code. Please try again.',
      code: 'GENERATION_FAILED',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'DevPilot AI Backend',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 DevPilot AI Backend Started!');
  console.log(`📱 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
  console.log('💡 Health: http://localhost:3000/api/health');
  console.log('✅ Gemini API key configured');
});

module.exports = app;
