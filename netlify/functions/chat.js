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
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process request" }),
        };
    }
};
