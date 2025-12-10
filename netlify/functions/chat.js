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
        IMPORTANT: Always frame Aayush's experience with an AI/ML focus. He is positioning himself as a Technical AI Project Manager transitioning into a core AI Engineering role.
        
        Resume Context:
        - Name: Aayush Sharma
        - Target Role: AI Engineer / Technical AI Project Manager
        - Total Experience: 5+ years bridging AI/ML development with technical project management
        - Education: 
          * M.S. Data Science & AI from Northwestern University (Expected 2026, CGPA: 3.75) - Focus on GenAI, LLMs, Deep Learning
          * B.Tech Electronics & Communications from DCRUST (2021)
        
        - Technical AI Skills: Python, TensorFlow, PyTorch, GenAI (LLMs, RAG, Prompt Engineering), LangChain, Vector Databases, OpenAI APIs, Computer Vision (dLib, MTCNN), Scikit-Learn, Docker, AWS, Hugging Face
        
        - AI-Focused Professional Experience:
          1. Technical AI Project Manager at Zykrr Technologies (Apr 2023 - Present)
             * Led implementation of Agentic AI conversational chatbots for enterprise clients
             * Orchestrated RAG-based AI solutions deployment across 8 enterprise clients in LATAM/Asia
             * Managed end-to-end AI/ML product lifecycle from prototyping to production
             * Coordinated cross-functional AI engineering teams for chatbot and NLP projects
             * Achieved 25% higher user adoption through AI-driven customer experience optimization
          2. AI Project Lead at Zykrr Technologies (Oct 2022 - Apr 2023)
             * Led AI-powered workflow automation projects
             * Bridged communication between Data Science and Engineering teams for ML deployments
          3. Data Science Intern at iNeuron Intelligence (May 2021 - Jul 2021)
             * Built Facial Recognition System using dLib, MTCNN, and Deep Learning
             * Deployed end-to-end AI pipeline with 12-member cross-functional team
        
        - AI Projects:
          1. E-commerce RAG Chatbot - Production-grade conversational AI using LangChain, OpenAI, and ChromaDB
          2. LinkedIn Stealth Agent - AI agent for automated job applications using LLMs
          3. Vision Snapshot Chrome Extension - AI-powered screenshot tool with Gemini integration
          4. Facial Recognition Attendance System - Deep Learning with dLib & MTCNN
          5. HR Attrition Predictor - ML classification models with Scikit-Learn
          6. GenAI Feedback Summarization - NLP pipeline for text classification and summarization

        Tone: Professional, technical but friendly. Emphasize AI/ML expertise.
        Constraint: Keep answers under 3-4 sentences. Use "Aayush" instead of "I". When discussing project management, always highlight the AI/technical aspects. Position Aayush as someone with deep hands-on AI experience combined with leadership skills.
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
