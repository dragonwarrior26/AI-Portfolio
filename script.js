/* script.js */

document.addEventListener('DOMContentLoaded', () => {

    // --- Neural Network Background Animation ---
    const canvas = document.getElementById('bg-animation');
    const ctx = canvas.getContext('2d');

    let particlesArray;

    // Resize Canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        // Method to draw individual particle
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // Method to update particle position
        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        // Number of particles based on screen area
        let numberOfParticles = (canvas.height * canvas.width) / 9000;

        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.4) - 0.2; // Slow floating speed
            let directionY = (Math.random() * 0.4) - 0.2;
            let color = '#2ea043'; // Matching the green accent

            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Check if particles are close enough to draw a line between them
    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                    ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));

                // Connection distance
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = 'rgba(88, 166, 255,' + opacityValue + ')'; // Accent Blue lines
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    // Resize event
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });

    init();
    animate();

    // --- End Animation Code ---

    // Typewriter Effect for Hero (Previous Logic)
    const terminalOutput = document.getElementById('terminal-content');

    async function typeLine(text, isCommand = false) {
        const line = document.createElement('div');
        line.className = 'command-line';

        if (isCommand) {
            const prompt = document.createElement('span');
            prompt.className = 'prompt';
            prompt.innerHTML = 'aayush@system:~$';
            line.appendChild(prompt);
        } else {
            line.style.color = 'var(--text-secondary)';
        }

        const content = document.createElement('span');
        content.className = 'output';
        line.appendChild(content);

        terminalOutput.appendChild(line);

        for (let i = 0; i < text.length; i++) {
            content.textContent += text[i];
            await new Promise(r => setTimeout(r, 30 + Math.random() * 20));
        }

        await new Promise(r => setTimeout(r, 300));
    }

    async function runTerminalSequence() {
        terminalOutput.innerHTML = '';

        await typeLine("git fetch --all", true);
        await typeLine("Fetching origin...", false);
        await typeLine("introduction.py loaded", false);

        await typeLine("python3 introduction.py", true);

        const introLines = [
            "Hello, I'm Aayush Sharma.",
            "PM specializing in SaaS & AI.",
            "Currently implementing GenAI @ Northwestern."
        ];

        for (const msg of introLines) {
            const msgLine = document.createElement('div');
            msgLine.className = 'command-line';
            msgLine.innerHTML = `<span class="prompt">></span> <span class="output text-green">${msg}</span>`;
            terminalOutput.appendChild(msgLine);
            await new Promise(r => setTimeout(r, 600));
        }

        const endLine = document.createElement('div');
        endLine.className = 'command-line';
        endLine.innerHTML = `<span class="prompt">aayush@system:~$</span><span class="cursor"></span>`;
        terminalOutput.appendChild(endLine);
    }

    runTerminalSequence();

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    // --- V2 Sprint 1: Telemetry Logic ---

    // 1. Live Time Status
    function updateTime() {
        const timeDisplay = document.getElementById('time-display');
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Kolkata' // IST
        });
        if (timeDisplay) timeDisplay.textContent = `IST: ${timeString}`;
    }

    // Update every second
    setInterval(updateTime, 1000);
    updateTime(); // Initial call

    // 2. GitHub Heatmap Generator (Real Data)
    async function generateHeatmap() {
        const heatmapGrid = document.getElementById('github-heatmap');
        if (!heatmapGrid) return;

        heatmapGrid.innerHTML = ''; // Clear simulated data

        const username = 'dragonwarrior26';
        const apiUrl = `https://github-contributions-api.jogruber.de/v4/${username}?y=last`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!data || !data.contributions) throw new Error('No data');

            // The API returns all days for the year. We need the last 364 days (52 weeks * 7)
            // Or just render what we have.
            // The grid expects columns of 7 days (rows).
            // This API returns a flat array? No, `contributions` is array of objects.

            // Let's take the last 364 entries to fill our grid perfectly
            const contributions = data.contributions.slice(-364);

            contributions.forEach(day => {
                const cell = document.createElement('div');
                cell.className = 'heatmap-cell';

                // Map count to level (GitHub logic approx)
                let level = 0;
                if (day.count > 0) level = 1;
                if (day.count >= 3) level = 2;
                if (day.count >= 6) level = 3;
                if (day.count >= 10) level = 4;

                cell.classList.add(`level-${level}`);
                cell.title = `${day.date}: ${day.count} contributions`;

                heatmapGrid.appendChild(cell);
            });

            // If less than 364 days, fill with empty cells to keep grid shape (optional)

        } catch (error) {
            console.error('GitHub Fetch Error:', error);
            // Fallback to simulation if API fails
            const cell = document.createElement('div');
            cell.style.color = 'var(--accent-red)';
            cell.innerText = "Error loading GitHub Data";
            heatmapGrid.appendChild(cell);
        }
    }

    generateHeatmap();


    // --- V2 Sprint 2: Gemini Chat Widget Logic ---
    const chatWidget = document.getElementById('chat-widget');
    const chatTrigger = document.getElementById('chat-trigger');
    const closeChat = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');

    // Config: API Key (Provided by Admin)
    // WARNING: Exposing this in a public repo is insecure. 
    // Ideally, use a backend proxy. For now, we will use a placeholder.
    const GEMINI_API_KEY = "";

    // 1. Toggle Chat Window
    function toggleChat() {
        chatWidget.classList.toggle('hidden');
        if (!chatWidget.classList.contains('hidden')) {
            chatInput.focus();
        }
    }

    if (chatTrigger) chatTrigger.addEventListener('click', toggleChat);
    if (closeChat) closeChat.addEventListener('click', toggleChat);

    // 2. Add Message to Chat
    function addMessage(text, isUser = false) {
        if (!chatMessages) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

        if (isUser) {
            msgDiv.innerHTML = text; // User msg is plain text usually
        } else {
            msgDiv.innerHTML = `<span class="prompt">Insight@System:~$</span> ${text}`;
        }

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 3. Handle Sending (Real API via Proxy)
    async function handleSend() {
        if (!chatInput) return;
        const text = chatInput.value.trim();
        if (!text) return;

        // User Message
        addMessage(text, true);
        chatInput.value = '';

        // Bot "Thinking"
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message bot-message';
        thinkingDiv.id = 'thinking-indicator';
        thinkingDiv.innerHTML = `<span class="prompt">Insight@System:~$</span> Processing... <span class="cursor"></span>`;
        chatMessages.appendChild(thinkingDiv);

        try {
            // Call the Netlify Function (Proxy)
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();

            thinkingDiv.remove();

            if (response.ok && data.reply) {
                // Success Response
                addMessage(data.reply);
            } else {
                // Error Response
                console.error("API Error:", data);
                // DEBUG: Show actual error in UI
                const debugMsg = data.error || data.body || "Unknown Backend Error";
                addMessage(`System Error: ${debugMsg} (Status: ${response.status})`);
            }

        } catch (err) {
            thinkingDiv.remove();
            console.error("Network Error:", err);
            addMessage(`Error: ${err.message}`);
        }
    }

    if (sendBtn) sendBtn.addEventListener('click', handleSend);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

    // --- V2 Sprint 3: Neural Playground Logic ---

    // Note: This is an artistic simulation, not a real TensorFlow trainer
    // It visualizes the *concept* of training dynamics.

    class NeuralVisualizer {
        constructor() {
            this.canvas = document.getElementById('neural-canvas');
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.resize();

            // UI Controls
            this.lrSlider = document.getElementById('lr-slider');
            this.batchSlider = document.getElementById('batch-slider');
            this.trainBtn = document.getElementById('train-btn');
            this.resetBtn = document.getElementById('reset-btn');

            // Displays
            this.lrVal = document.getElementById('lr-val');
            this.epochVal = document.getElementById('epoch-val');
            this.batchVal = document.getElementById('batch-val');
            this.lossVal = document.getElementById('loss-val');
            this.accVal = document.getElementById('acc-val');
            this.epochProgress = document.getElementById('epoch-progress');

            // State
            this.isTraining = false;
            this.epoch = 0;
            this.maxEpochs = 100;
            this.nodes = [];
            this.weights = [];
            this.layers = [3, 5, 4, 2]; // Start simple
            this.loss = 1.8;
            this.accuracy = 0.1;

            this.initListeners();
            this.initNetwork();
            this.animate();
        }

        resize() {
            if (!this.canvas.parentElement) return;
            this.width = this.canvas.parentElement.offsetWidth;
            this.height = this.canvas.parentElement.offsetHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.initNetwork(); // Re-center
        }

        initListeners() {
            window.addEventListener('resize', () => this.resize());

            this.lrSlider.addEventListener('input', (e) => {
                this.lrVal.innerText = e.target.value;
            });

            this.batchSlider.addEventListener('input', (e) => {
                this.batchVal.innerText = e.target.value;
            });

            this.trainBtn.addEventListener('click', () => {
                this.isTraining = !this.isTraining;
                this.trainBtn.innerHTML = this.isTraining ?
                    '<i class="fa-solid fa-pause"></i> Pause' :
                    '<i class="fa-solid fa-play"></i> Train';
                this.trainBtn.classList.toggle('start');
            });

            this.resetBtn.addEventListener('click', () => {
                this.isTraining = false;
                this.trainBtn.innerHTML = '<i class="fa-solid fa-play"></i> Train';
                this.trainBtn.classList.add('start');
                this.epoch = 0;
                this.loss = 1.8;
                this.accuracy = 0.1;
                this.updateUI();
                this.initNetwork();
            });

            // Layer Toggles
            document.querySelectorAll('.toggle-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    const depth = parseInt(e.target.dataset.layers);
                    this.layers = depth === 1 ? [3, 6, 6, 4, 2] : [3, 5, 2];
                    this.initNetwork();
                });
            });
        }

        initNetwork() {
            this.nodes = [];
            this.weights = [];

            const layerSpacing = this.width / (this.layers.length + 1);

            this.layers.forEach((nodeCount, layerIndex) => {
                const layerX = layerSpacing * (layerIndex + 1);
                const nodeSpacing = this.height / (nodeCount + 1);

                for (let i = 0; i < nodeCount; i++) {
                    this.nodes.push({
                        x: layerX,
                        y: nodeSpacing * (i + 1),
                        layer: layerIndex,
                        value: Math.random(),
                        activation: 0
                    });
                }
            });

            // Create connections (Weights)
            for (let i = 0; i < this.nodes.length; i++) {
                const source = this.nodes[i];
                for (let j = 0; j < this.nodes.length; j++) {
                    const target = this.nodes[j];
                    if (target.layer === source.layer + 1) {
                        this.weights.push({
                            source: source,
                            target: target,
                            value: Math.random() * 2 - 1, // -1 to 1
                            strength: 0
                        });
                    }
                }
            }
        }

        updateUI() {
            this.epochVal.innerText = this.epoch;
            this.lossVal.innerText = this.loss.toFixed(3);
            this.accVal.innerText = (this.accuracy * 100).toFixed(1) + '%';
            this.epochProgress.style.width = (this.epoch / this.maxEpochs * 100) + '%';
        }

        step() {
            if (!this.isTraining || this.epoch >= this.maxEpochs) return;

            const lr = parseFloat(this.lrSlider.value);

            // Simulate progression
            this.epoch++;
            this.loss = Math.max(0.05, this.loss * (0.99 - (lr * 0.1)));
            this.accuracy = Math.min(0.98, this.accuracy + (lr * 0.05));

            // Add some jitter to weights based on LR
            this.weights.forEach(w => {
                w.strength += (Math.random() - 0.5) * lr * 5;
                w.strength = Math.max(0, Math.min(1, Math.abs(w.value) + w.strength)); // Clamp
            });

            // "Fire" neurons
            this.nodes.forEach(n => {
                n.activation = Math.random() > 0.5 ? 1 : 0; // Visual flicker
            });

            this.updateUI();

            if (this.epoch === this.maxEpochs) {
                this.isTraining = false;
                this.trainBtn.innerHTML = '<i class="fa-solid fa-check"></i> Done';
            }
        }

        draw() {
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Draw Weights
            this.weights.forEach(w => {
                // Dynamic opacity based on training
                const opacity = 0.1 + (this.isTraining ? Math.random() * 0.3 : 0.1) + w.strength * 0.5;

                this.ctx.beginPath();
                this.ctx.moveTo(w.source.x, w.source.y);
                this.ctx.lineTo(w.target.x, w.target.y);
                this.ctx.strokeStyle = `rgba(56, 139, 253, ${opacity})`; // Blue
                this.ctx.lineWidth = 1 + w.strength;
                this.ctx.stroke();
            });

            // Draw Nodes
            this.nodes.forEach(n => {
                this.ctx.beginPath();
                this.ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
                this.ctx.fillStyle = '#0d1117';
                this.ctx.fill();

                // firing effect
                const fire = this.isTraining && Math.random() > 0.8;
                this.ctx.strokeStyle = fire ? '#2ea043' : '#8b949e'; // Green if firing
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                if (fire) {
                    this.ctx.beginPath();
                    this.ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
                    this.ctx.strokeStyle = 'rgba(46, 160, 67, 0.4)';
                    this.ctx.stroke();
                }
            });
        }

        animate() {
            if (this.isTraining) {
                // Throttle simulation speed
                if (Math.random() > 0.8) this.step();
            }
            this.draw();
            requestAnimationFrame(() => this.animate());
        }
    }

    // Init Playground
    new NeuralVisualizer();
});

