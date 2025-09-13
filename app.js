const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000; // Fixed port for local testing

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize Gemini API with your hardcoded key
const genAI = new GoogleGenerativeAI('AIzaSyCURz7A2o4Eb0iZa_rGxP5Rxgb5zL3oUkA'); // Paste your full key here
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Endpoint to generate code
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // System message: Define the AI's role and instructions
        const systemMessage = `
You are DevPilot AI, a futuristic coding assistant designed to help developers build web projects quickly. 
Your primary role is to generate clean, functional, and efficient code based on user requests.
Focus on HTML, CSS, and JavaScript (embed CSS/JS in HTML where appropriate).
Key guidelines:
- Output ONLY the code—no explanations, comments, or additional text.
- Make code professional, bug-free, and user-friendly.
- If the request is unclear, generate a simple, logical implementation.
- Support modern web features like responsiveness and interactivity.
`;

        // Combine system message with user prompt
        const fullPrompt = `${systemMessage}\nUser request: ${prompt}`;

        const result = await model.generateContent(fullPrompt);
        const code = result.response.text().trim(); // Extract the generated code

        res.json({ code });
    } catch (error) {
        console.error('Gemini API error:', error);
        res.status(500).json({ error: 'Failed to generate code' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
