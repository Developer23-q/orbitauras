// ============================================
// ORBITAURAS - FIREBASE CONFIGURATION
// ============================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

// Initialize Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase initialized successfully");
        
        // Initialize Analytics (optional)
        if (typeof firebase.analytics === 'function') {
            firebase.analytics();
            console.log("📊 Firebase Analytics enabled");
        }
    } else {
        console.log("ℹ️ Firebase already initialized");
    }
} catch (error) {
    console.error("❌ Firebase initialization error:", error);
    alert("Failed to initialize Firebase. Please check console for details.");
}

// Export Firebase Auth instance
const auth = firebase.auth();

console.log("🚀 OrbitAuras Firebase Config Loaded");