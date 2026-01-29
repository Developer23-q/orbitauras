// ============================================
// AURA PREMIUM AI - API CONFIGURATION
// ============================================
// Replace with your actual API keys
// NEVER commit this file to public repositories

const API_CONFIG = {
  // ✅ CORRECTED: Use "groq" (not "grok")
  groq: {
    apiKey: "",
    baseUrl: "https://api.groq.com/openai/v1", // ✅ REMOVED TRAILING SPACES
    model: "llama-3.1-8b-instant",
    enabled: true
  },
  // OpenAI API (for future use)
  openai: {
    apiKey: "YOUR_OPENAI_API_KEY_HERE",
    baseUrl: "https://api.openai.com/v1", // ✅ REMOVED TRAILING SPACES
    model: "gpt-4",
    enabled: false
  },
  
  // Gemini API (for future use)
  gemini: {
    apiKey: "YOUR_GEMINI_API_KEY_HERE",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta", // ✅ REMOVED TRAILING SPACES
    model: "gemini-pro",
    enabled: false
  }
};

// ============================================
// PROMPT OPTIMIZATION TEMPLATES
// ============================================

const PROMPT_TEMPLATES = {
  concise: {
    name: "Ui&UX",
    icon: "✂️",
    description: "Act as a Principal UI/UX Architect. Your objective is to design a high-performance solution for [Insert Project Name]. Based on the collective consensus of 100 industry experts, analyze the [Insert Target User] profile to minimize cognitive load while maximizing conversion efficiency. Applying Nielsen's heuristics and WCAG 2.1 accessibility standards, draft a comprehensive Information Architecture and a User Flow that eliminates friction at [Insert Key Interaction Point]. Your response must detail the visual hierarchy strategy, specific Micro-interactions, and a \"State Transition\" logic for edge cases. Ensure the design language remains cohesive with [Insert Brand/Design System]. Conclude with a \"Stress Test\" analysis, identifying and solving three potential usability bottlenecks before they reach development. Provide the output in a concise, developer-ready format, avoiding generic advice in favor of high-utility, actionable design specifications.",
    optimize: (prompt) => {
      return `Make this prompt more concise while preserving the core intent:\n\n"${prompt}"`;
    }
  },
  
  professional: {
    name: "coder",
    icon: "👔",
    description: "Act as a Principal Software Architect. Your objective is to engineer a production-ready, scalable solution for [Insert Coding Task] using [Insert Language/Framework]. Following the consensus of 100 elite developers, implement this logic using SOLID principles and DRY patterns to ensure maximum maintainability. Prioritize Big O time and space complexity, optimizing for peak performance. You must include robust error handling, input validation, and detailed unit tests covering critical edge cases. Ensure the output is type-safe, follows industry-standard naming conventions, and is modular for easy integration. Before outputting, perform a recursive logic audit to eliminate security vulnerabilities (e.g., injection, overflows) and redundant operations. Provide only the clean, documented source code and a high-level architectural summary. Avoid generic boilerplate; focus on high-utility, efficient execution.",
    optimize: (prompt) => {
      return `Rewrite this prompt in a professional, business-appropriate tone:\n\n"${prompt}"`;
    }
  },
  
  creative: {
    name: "Creative",
    icon: "🎨",
    description: "Enhance creativity and originality",
    optimize: (prompt) => {
      return `Transform this prompt to be more creative, imaginative, and engaging:\n\n"${prompt}"`;
    }
  },
  
  technical: {
    name: "Technical",
    icon: "🔬",
    description: "Add technical depth and precision",
    optimize: (prompt) => {
      return `Enhance this prompt with technical details, precision, and specificity:\n\n"${prompt}"`;
    }
  },
  
  casual: {
    name: "Casual",
    icon: "☕",
    description: "Friendly conversational tone",
    optimize: (prompt) => {
      return `Rewrite this prompt in a friendly, casual, conversational tone:\n\n"${prompt}"`;
    }
  },
  
  detailed: {
    name: "Detailed",
    icon: "🔍",
    description: "Add context and examples",
    optimize: (prompt) => {
      return `Expand this prompt with more context, examples, and detailed instructions:\n\n"${prompt}"`;
    }
  },
  
  structured: {
    name: "Structured",
    icon: "📋",
    description: "Organize with clear format",
    optimize: (prompt) => {
      return `Restructure this prompt with clear sections, bullet points, and organized format:\n\n"${prompt}"`;
    }
  }
};

// ============================================
// LLM PROVIDERS CONFIGURATION
// ============================================

const LLM_PROVIDERS = [
  { 
    name: 'DeepSeek', 
    icon: '🧠', 
    url: null, // Will use API call
    api: true,
    color: '#6c5ce7'
  },

  {
    name: 'Qwen',
    icon: '🤖',
    url: 'https://qwen.ai/?q=', // ✅ REMOVED TRAILING SPACES
    api: false,
    color: '#00b894'
  },
  { 
    name: 'ChatGPT', 
    icon: '💬', 
    url: 'https://chat.openai.com/?q=', // ✅ REMOVED TRAILING SPACES
    api: false
  },
  { 
    name: 'Gemini', 
    icon: '✨', 
    url: 'https://gemini.google.com/app?q=', // ✅ REMOVED TRAILING SPACES
    api: false
  },
  { 
    name: 'Claude', 
    icon: '🤖', 
    url: 'https://claude.ai/new?prompt=', // ✅ REMOVED TRAILING SPACES
    api: false
  },
  { 
    name: 'Perplexity', 
    icon: '❓', 
    url: 'https://www.perplexity.ai/search?q=', // ✅ REMOVED TRAILING SPACES
    api: false
  }
];

// ============================================
// EXPORT CONFIG
// ============================================

window.API_CONFIG = API_CONFIG;
window.PROMPT_TEMPLATES = PROMPT_TEMPLATES;
window.LLM_PROVIDERS = LLM_PROVIDERS;

console.log("✅ API Configuration Loaded");