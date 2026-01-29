// ============================================
// AURA PREMIUM AI - MAIN APPLICATION
// ============================================

let state = {
    email: "user@example.com",
    plan: "Free Trial",
    remaining: 5,
    total: 5,
    history: [],
    chats: [{ 
        id: 1, 
        title: "Welcome conversation", 
        messages: ["Welcome! You have 5 prompts remaining."] 
    }],
    activeChatId: 1,
    currentPromptForLLM: "",
    optimizeMenuOpen: false
};

const App = {
    // ============================================
    // INITIALIZATION
    // ============================================
    
    init() {
        this.setupListeners();
        this.updateUI();
        this.renderChatHistory();
        this.setupOptimizeMenu();
        console.log("🚀 Aura Premium AI Initialized");
    },

    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    setupListeners() {
        const btn = document.getElementById('send-btn');
        const input = document.getElementById('user-input');
        const optimizeBtn = document.getElementById('optimize-btn');

        // Send message
        btn.onclick = () => this.handleSendMessage();
        
        // Enter key to send
        input.onkeydown = (e) => { 
            if(e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                this.handleSendMessage(); 
            } 
        };
        
        // Optimize prompt button
        optimizeBtn.onclick = (e) => {
            e.stopPropagation();
            this.toggleOptimizeMenu();
        };
        
        // Close optimize menu on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#optimize-btn') && !e.target.closest('.optimize-menu')) {
                this.closeOptimizeMenu();
            }
        });
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.getAttribute('data-tab')));
        });
    },

    setupOptimizeMenu() {
        const menu = document.createElement('div');
        menu.className = 'optimize-menu';
        menu.id = 'optimize-menu';
        
        // Add all optimization options
        Object.entries(PROMPT_TEMPLATES).forEach(([key, template]) => {
            const option = document.createElement('div');
            option.className = 'optimize-option';
            option.innerHTML = `<span>${template.icon}</span> ${template.name} - ${template.description}`;
            option.onclick = (e) => {
                e.stopPropagation();
                this.applyOptimization(key);
            };
            menu.appendChild(option);
        });
        
        document.querySelector('.chat-container').appendChild(menu);
    },

    // ============================================
    // MESSAGE HANDLING
    // ============================================
    
    handleSendMessage() {
        const input = document.getElementById('user-input');
        const val = input.value.trim();
        
        if (!val) return;
        
        if (state.remaining <= 0) { 
            this.openUpgrade(); 
            return; 
        }
        
        this.sendMessage(val);
        input.value = '';
        this.closeOptimizeMenu();
    },

    sendMessage(text) {
        this.appendMessage(text, 'user-message');
        state.remaining--;
        
        const activeChat = state.chats.find(chat => chat.id === state.activeChatId);
        if (activeChat) {
            activeChat.messages.push(text);
            if (activeChat.messages.length === 2) {
                activeChat.title = text.substring(0, 30);
            }
        }

        // ✅ CALL GROQ API (NOT GROK) - USING YOUR GSK KEY
        this.callGroqAPI(text);
    },

    // ============================================
    // MESSAGE RENDERING
    // ============================================
    
    appendMessage(text, type, originalPrompt = "") {
        const box = document.getElementById('chat-box');
        const div = document.createElement('div');
        div.className = `message ${type}`;
        
        // Text Content
        const textNode = document.createElement('div');
        textNode.innerText = text;
        div.appendChild(textNode);

        // Add buttons if AI message
        if (type === 'ai-message') {
            const actions = document.createElement('div');
            actions.className = 'ai-actions';
            
            // Copy button
            const copy = document.createElement('button');
            copy.className = 'msg-action-btn';
            copy.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copy.onclick = () => {
                navigator.clipboard.writeText(text);
                this.notify("Copied to clipboard!");
            };

            // Run in LLM button
            const run = document.createElement('button');
            run.className = 'msg-action-btn';
            run.innerHTML = '<i class="fas fa-rocket"></i> Run';
            run.onclick = () => {
                this.openLLMSelector(text);
            };

            actions.appendChild(copy);
            actions.appendChild(run);
            div.appendChild(actions);
        }

        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    },

    // ============================================
    // GROQ API INTEGRATION (FREE TIER - WORKING)
    // ============================================
    async callGroqAPI(prompt) {
        // VALIDATE CONFIGURATION
        if (!API_CONFIG.groq?.enabled || !API_CONFIG.groq?.apiKey?.trim()) {
            this.notify("⚠️ Grok API not configured. Check assets/env.js");
            return;
        }

        const box = document.getElementById('chat-box');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message';
        loadingDiv.innerHTML = '<div class="loading-spinner"></div> <span style="margin-left: 8px; color: #ff1b6b;">🚀 Grok is thinking...</span>';
        box.appendChild(loadingDiv);
        box.scrollTop = box.scrollHeight;

        try {
            // CONSTRUCT API URL
            const safeModel = API_CONFIG.groq.model || 'llama-3.1-8b-instant';
            const baseUrl = API_CONFIG.groq.baseUrl || 'https://api.groq.com/openai/v1';
            
            // ✅ FIXED: Removed trailing spaces from URL
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions',  {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_CONFIG.groq.apiKey.trim()}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content: "You are OrbitAuras, a premium AI assistant that provides clear, concise, and helpful responses."
                        },
                        {
                            role: "user",
                            content: prompt.trim()
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                    top_p: 0.9,
                    stream: false
                })
            });

            // DETAILED ERROR HANDLING
            if (!response.ok) {
                let errorMsg = `HTTP ${response.status}: `;
                try {
                    const errData = await response.json();
                    errorMsg += errData.error?.message 
                        || errData.error?.type 
                        || JSON.stringify(errData.error);
                } catch {
                    errorMsg += await response.text() || response.statusText;
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            
            // VALIDATE RESPONSE STRUCTURE
            if (!data.choices?.[0]?.message?.content) {
                throw new Error("No valid response from Grok API");
            }

            const grokResponse = data.choices[0].message.content;
            
            // REMOVE LOADING INDICATOR
            if (box.contains(loadingDiv)) box.removeChild(loadingDiv);

            // CREATE RESPONSE ELEMENT (XSS-SAFE)
            const responseDiv = document.createElement('div');
            responseDiv.className = 'message ai-message';
            
            // Sanitize HTML to prevent XSS
            const sanitizeHTML = (str) => {
                const temp = document.createElement('div');
                temp.textContent = str;
                return temp.innerHTML;
            };
            
            // Safe copy payload generation
            const copyPayload = JSON.stringify(grokResponse)
                .replace(/\\/g, '\\\\')
                .replace(/'/g, "\\'");
            
            responseDiv.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="background: linear-gradient(45deg, #ff1b6b, #ff5722); 
                                -webkit-background-clip: text; 
                                background-clip: text; 
                                color: transparent; 
                                font-weight: 700; 
                                margin-right: 6px; font-size: 20px;">🚀</span>
                    <span style="color: #2c3e50; font-weight: 600;">Grok Response</span>
                    <span style="margin-left: 8px; font-size: 11px; color: #ff1b6b; background: rgba(255, 27, 107, 0.1); padding: 2px 6px; border-radius: 4px;">
                        ${safeModel}
                    </span>
                </div>
                <div class="grok-content" style="line-height: 1.6; color: var(--text-primary);">
                    ${sanitizeHTML(grokResponse)}
                </div>
                <div class="ai-actions" style="margin-top: 12px; display: flex; gap: 8px; align-items: center;">
                    <button class="msg-action-btn" 
                            style="background: linear-gradient(45deg, #ff1b6b, #ff5722); color: white; border: none;"
                            onclick='(async () => {
                                try { 
                                    await navigator.clipboard.writeText(${copyPayload}); 
                                    App.notify("✅ Copied to clipboard!");
                                } catch (e) { 
                                    console.error("Copy failed:", e);
                                    alert("Copy failed. Please select text manually.");
                                }
                            })()'>
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="msg-action-btn" 
                            style="background: #2c3e50; color: white; border: none;"
                            onclick='App.callGrokAPI("${prompt.replace(/"/g, '\\"')}")'>
                        <i class="fas fa-redo"></i> Regenerate
                    </button>
                    <span style="font-size: 11px; color: var(--text-muted); margin-left: auto;">
                        ⚡ Powered by Grok
                    </span>
                </div>
            `;
            
            box.appendChild(responseDiv);
            box.scrollTop = box.scrollHeight;
            this.notify("✅ Grok response received!");

        } catch (error) {
            console.error("Grok API Error:", error);
            
            // Clean up loading indicator
            if (box.contains(loadingDiv)) box.removeChild(loadingDiv);
            
            // ERROR DISPLAY
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message ai-message';
            errorDiv.style.borderLeft = '3px solid #ff1b6b';
            
            // Categorize common Grok errors
            let userMessage = error.message;
            if (error.message.includes('invalid_api_key') || error.message.includes('API_KEY_INVALID')) {
                userMessage = "Invalid API key. Verify your Grok API key in assets/env.js";
            } else if (error.message.includes('rate_limit') || error.message.includes('quota')) {
                userMessage = "Rate limit exceeded. Please wait a moment before trying again.";
            } else if (error.message.includes('model_not_found')) {
                userMessage = "Invalid model name. Check API_CONFIG.grok.model";
            } else if (error.message.includes('401')) {
                userMessage = "Authentication failed. Check your API key.";
            } else if (error.message.includes('404')) {
                userMessage = "API endpoint not found. Verify baseUrl configuration.";
            } else if (error.message.includes('500') || error.message.includes('server_error')) {
                userMessage = "Grok server error. Please try again in a few moments.";
            }
            
            errorDiv.innerHTML = `
                <div style="color: #ff1b6b; font-weight: 600; display: flex; align-items: center;">
                    <i class="fas fa-rocket" style="margin-right: 8px;"></i>
                    Grok API Error
                </div>
                <div style="margin-top: 6px; padding: 10px; background: #fff0f3; border-radius: 4px; font-size: 14px; color: #e74c3c;">
                    ${userMessage}
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">
                    <strong>💡 Troubleshooting:</strong><br>
                    • Get API key from: <a href="https://x.ai/api  " target="_blank" style="color:#ff1b6b;text-decoration:underline">x.ai Developer Portal</a><br>
                    • Check rate limits (free tier: typically 60 requests/min)<br>
                    • Verify model compatibility (e.g., grok-beta, grok-vision)<br>
                    • Ensure your prompt is clear and not too long
                </div>
            `;
            
            box.appendChild(errorDiv);
            box.scrollTop = box.scrollHeight;
            this.notify("❌ Grok request failed");
        }
    },

    // ============================================
    // LLM SELECTOR
    // ============================================
    
    openLLMSelector(prompt) {
        state.currentPromptForLLM = prompt;
        const container = document.getElementById('llm-options');
        container.innerHTML = '';
        
        LLM_PROVIDERS.forEach(provider => {
            const btn = document.createElement('button');
            btn.className = 'llm-btn';
            // ✅ FIXED: Removed trailing spaces from URLs
            let url = provider.url;
            if (url) {
                url = url.trim(); // Remove any trailing spaces
            }
            
            btn.innerHTML = `<span style="margin-right: 6px;">${provider.icon}</span> ${provider.name}`;
            
            btn.onclick = () => {
                if (provider.api && provider.name === 'DeepSeek') {
                    // Call DeepSeek API directly
                    this.callDeepSeekAPI(prompt);
                    document.getElementById('llm-modal').style.display = 'none';
                } else if (url) {
                    // Open external URL
                    window.open(url + encodeURIComponent(prompt), '_blank');
                    document.getElementById('llm-modal').style.display = 'none';
                }
            };
            
            container.appendChild(btn);
        });

        document.getElementById('llm-modal').style.display = 'flex';
    },

    // ============================================
    // PROMPT OPTIMIZATION
    // ============================================
    
    toggleOptimizeMenu() {
        const menu = document.getElementById('optimize-menu');
        menu.classList.toggle('active');
    },

    closeOptimizeMenu() {
        const menu = document.getElementById('optimize-menu');
        menu.classList.remove('active');
    },

    applyOptimization(templateKey) {
        const input = document.getElementById('user-input');
        const currentText = input.value.trim();
        
        if (!currentText) {
            this.notify("Please enter a prompt first");
            return;
        }
        
        const template = PROMPT_TEMPLATES[templateKey];
        if (!template) return;
        
        // Show loading
        const originalValue = input.value;
        input.value = 'Optimizing...';
        input.disabled = true;
        
        // Simulate optimization (in real app, call AI API here)
        setTimeout(() => {
            const optimizedPrompt = template.optimize(currentText);
            input.value = optimizedPrompt;
            input.disabled = false;
            this.notify(`✨ Prompt optimized: ${template.name}`);
            this.closeOptimizeMenu();
        }, 500);
    },

    // ============================================
    // UI UPDATES
    // ============================================
    
    updateUI() {
        document.getElementById('display-email').innerText = state.email;
        document.getElementById('display-plan').innerText = state.plan;
        document.getElementById('prompt-badge').innerText = `${state.remaining} Prompts Left`;
        document.getElementById('quota-text').innerText = `${state.remaining}/${state.total}`;
        
        const perc = (state.remaining / state.total) * 100;
        document.getElementById('quota-bar').style.width = `${perc}%`;
        
        // Update profile popup
        document.getElementById('popup-email').innerText = state.email;
        document.getElementById('popup-plan').innerText = state.plan;
        document.getElementById('popup-prompts').innerText = `${state.remaining} of ${state.total}`;
        document.getElementById('remaining-count').innerText = state.remaining;
        document.getElementById('popup-quota-bar').style.width = `${perc}%`;
    },

    // ============================================
    // MODALS & NOTIFICATIONS
    // ============================================
    
    openUpgrade() { 
        document.getElementById('overlay').style.display = 'flex'; 
    },
    
    purchasePlan(amount, name) { 
        state.remaining = amount; 
        state.total = amount; 
        state.plan = name + " Plan"; 
        document.getElementById('overlay').style.display = 'none'; 
        this.updateUI(); 
        this.notify(`✅ ${name} plan activated! ${amount} prompts added.`);
    },
    
    purchasePlanFromProfile(amount, name) { 
        this.purchasePlan(amount, name);
        document.getElementById('profile-popup').style.display = 'none'; 
    },
    
    notify(message) { 
        const toast = document.createElement('div'); 
        toast.className = 'toast'; 
        toast.innerText = message; 
        document.getElementById('toast-container').appendChild(toast); 
        setTimeout(() => toast.remove(), 3000); 
    },
    
    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => 
            btn.classList.toggle('active', btn.dataset.tab === tabId)
        );
        document.querySelectorAll('.tab-pane').forEach(tab => 
            tab.classList.toggle('active', tab.id === `${tabId}-tab`)
        );
    },
    
    // ============================================
    // CHAT HISTORY MANAGEMENT
    // ============================================
    
    deleteChat(id) {
        if(!confirm("Are you sure you want to delete this chat?")) return;
        state.chats = state.chats.filter(chat => chat.id !== id);
        
        if (state.activeChatId === id) {
            if (state.chats.length > 0) {
                this.loadChat(state.chats[0].id);
            } else {
                state.activeChatId = null;
                document.getElementById('chat-box').innerHTML = '<div class="message ai-message">Start a new chat to begin.</div>';
            }
        }
        this.renderChatHistory();
    },

    renderChatHistory() {
        const container = document.getElementById('sidebar-history');
        if (!container) return;
        
        container.innerHTML = '';
        state.chats.forEach(chat => {
            const item = document.createElement('div');
            item.className = `history-item ${chat.id === state.activeChatId ? 'active' : ''}`;
            
            item.innerHTML = `
                <div class="history-text">${chat.title || "New Chat"}</div>
                <button class="delete-btn" onclick="event.stopPropagation(); App.deleteChat(${chat.id})">
                  <i class="fas fa-trash"></i>
                </button>
            `;
            
            item.onclick = (e) => this.loadChat(chat.id);
            container.appendChild(item);
        });
        
        const historyCount = document.getElementById('history-count');
        if (historyCount) {
            historyCount.innerText = `${state.chats.length} chat${state.chats.length !== 1 ? 's' : ''}`;
        }
    },

    loadChat(id) {
        state.activeChatId = id;
        const chat = state.chats.find(c => c.id === id);
        if (!chat) return;
        
        const box = document.getElementById('chat-box');
        box.innerHTML = '';
        
        chat.messages.forEach((msg, i) => {
            const type = i % 2 === 0 ? 'ai-message' : 'user-message';
            const prompt = (type === 'ai-message' && i > 0) ? chat.messages[i-1] : "";
            this.appendMessage(msg, type, prompt);
        });
        
        this.renderChatHistory();
    },

    newChat() {
        const newId = (state.chats.length > 0 ? Math.max(...state.chats.map(c => c.id)) : 0) + 1;
        state.chats.push({ 
            id: newId, 
            title: "New Chat", 
            messages: ["New conversation started."] 
        });
        this.loadChat(newId);
        this.notify("✨ New chat created!");
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function openProfilePopup() { 
    document.getElementById('profile-popup').style.display = 'flex'; 
}

// ============================================
// INITIALIZE APP
// ============================================

App.init();