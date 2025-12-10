const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function (event, context) {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // Parse the request body
        const body = JSON.parse(event.body);
        const userMessage = body.message;

        if (!userMessage) {
            return { statusCode: 400, body: "Missing message" };
        }

        // Initialize Gemini API
        // Netlify will access this env var automatically
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // DEBUG MODE: List Models
        if (userMessage === "DEBUG") {
            const modelList = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).eventId;
            // Actually, we need the model manager
            // SDK doesn't expose listModels nicely on the main instance in some versions?
            // Let's try to just return the API Key (first 4 chars) to verify it's read.
            const keyStatus = process.env.GEMINI_API_KEY ? "Loaded (" + process.env.GEMINI_API_KEY.substring(0, 4) + "...)" : "Missing";
            return {
                statusCode: 200,
                body: JSON.stringify({ reply: `DEBUG INFO:\nKey: ${keyStatus}\nModel: gemini-1.5-flash\nNote: Please check Google AI Studio if 'Generative Language API' is enabled.` })
            };
        }

        // Using 'gemini-2.0-flash' - confirmed available in user's project
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Context Injection (The System Prompt)
        // We instruct the AI to act as Aayush's portfolio assistant.
        const systemPrompt = `
        You are "Insight", an AI assistant for Aayush Sharma's portfolio website.
        Your goal is to answer questions about Aayush based on his resume context.
        
        Resume Context:
        - Name: Aayush Sharma
        - Role: AI Engineer / Product Manager
        - Education: Northwestern University (MS in Data Science/GenAI), Bennett University (B.Tech CSE).
        - Skills: Python, TensorFlow, PyTorch, GenAI (LLMs, RAG), SQL, Docker, AWS.
        - Experience: 
          1. AI Engineer Intern at Bounteous: Built RAG pipelines, chatbots.
          2. Product Manager Intern at High Level: Worked on SaaS features.
        - Projects:
          1. Advanced Vision Snapshot Tool (Chrome Ext).
          2. LinkedIn Stealth Agent.
          3. E-commerce RAG Chatbot.

        Tone: Professional, concise, slightly technical but friendly.
        Constraint: Keep answers under 3-4 sentences if possible. Use "Aayush" instead of "I".
        `;

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am Insight, ready to answer questions about Aayush's profile." }],
                },
            ],
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: text }),
        };

    } catch (error) {
        console.error("Gemini API Error:", error);

        // Improve User Feedback for common config errors
        let errorMsg = error.message;
        if (error.message.includes("404 Not Found") || error.message.includes("models/")) {
            errorMsg = "Configuration Error: Model not found. Please ensure 'Generative Language API' is enabled in your Google Cloud Project.";
        } else if (error.message.includes("API key")) {
            errorMsg = "Authentication Error: Invalid API Key.";
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMsg }),
        };
    }
};
