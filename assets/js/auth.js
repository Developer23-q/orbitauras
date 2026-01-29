// ============================================
// WAIT FOR FIREBASE TO INITIALIZE
// ============================================

function waitForFirebase(callback) {
    if (typeof firebase === 'undefined') {
        console.warn("⚠️ Firebase SDK not loaded. Waiting...");
        setTimeout(() => waitForFirebase(callback), 100);
        return;
    }
    
    if (!firebase.apps.length) {
        console.warn("⚠️ Firebase not initialized. Waiting...");
        setTimeout(() => waitForFirebase(callback), 100);
        return;
    }
    
    console.log("✅ Firebase ready, initializing app...");
    callback();
}

// ============================================
// ORBITAURAS AUTHENTICATION - Firebase Integrated
// ============================================

waitForFirebase(() => {
    
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const switchToSignup = document.getElementById('switchToSignup');
    const formSwitchText = document.getElementById('formSwitchText');
    const customGoogleBtn = document.getElementById('customGoogleBtn');
    const anonymousLink = document.getElementById('anonymousLink');
    const forgotPassword = document.getElementById('forgotPassword');

    // Password toggles
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    const toggleSignupPassword = document.getElementById('toggleSignupPassword');
    const loginPassword = document.getElementById('loginPassword');
    const signupPassword = document.getElementById('signupPassword');

    // Submit buttons
    const loginSubmit = document.getElementById('loginSubmit');
    const signupSubmit = document.getElementById('signupSubmit');

    // Spinners
    const loginSpinner = document.getElementById('loginSpinner');
    const signupSpinner = document.getElementById('signupSpinner');
    const loginText = document.getElementById('loginText');
    const signupText = document.getElementById('signupText');

    // Messages
    const loginMessage = document.getElementById('loginMessage');
    const signupMessage = document.getElementById('signupMessage');

    // ============================================
    // PASSWORD TOGGLE HANDLERS
    // ============================================

    toggleLoginPassword.addEventListener('click', () => {
        const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        loginPassword.setAttribute('type', type);
        toggleLoginPassword.textContent = type === 'password' ? 'Show' : 'Hide';
    });

    toggleSignupPassword.addEventListener('click', () => {
        const type = signupPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        signupPassword.setAttribute('type', type);
        toggleSignupPassword.textContent = type === 'password' ? 'Show' : 'Hide';
    });

    // ============================================
    // FORM SWITCHING
    // ============================================

    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        formSwitchText.innerHTML = 'Already have an account? <a href="#" class="switch-link" id="switchToLogin">Log in</a>';
        document.getElementById('switchToLogin').addEventListener('click', switchToLogin);
        clearMessages();
    });

    function switchToLogin(e) {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        formSwitchText.innerHTML = 'Don\'t have an account? <a href="#" class="switch-link" id="switchToSignup">Sign up</a>';
        document.getElementById('switchToSignup').addEventListener('click', (e) => {
            e.preventDefault();
            switchToSignup.click();
        });
        clearMessages();
    }

    // ============================================
    // ANONYMOUS AUTHENTICATION (Firebase)
    // ============================================

    anonymousLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        showLoading(loginSubmit, loginSpinner, loginText, "Entering anonymously...");
        
        auth.signInAnonymously()
            .then((result) => {
                hideLoading(loginSubmit, loginSpinner, loginText, "Continue");
                showSuccess(loginMessage, "✅ Anonymous session created! Redirecting to OrbitAuras...");
                
                // Store anonymous user info
                const user = result.user;
                localStorage.setItem('orbitauras_user', JSON.stringify({
                    uid: user.uid,
                    isAnonymous: true,
                    timestamp: new Date().toISOString()
                }));
                
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'chat.html'; // Update to your chat interface
                }, 1500);
            })
            .catch((error) => {
                hideLoading(loginSubmit, loginSpinner, loginText, "Continue");
                showError(loginMessage, `Anonymous login failed: ${error.message}`);
                console.error("Anonymous auth error:", error);
            });
    });

    // ============================================
    // EMAIL/PASSWORD AUTHENTICATION
    // ============================================

    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!validateEmail(email)) {
            showError(loginMessage, "Please enter a valid email address.");
            return;
        }
        
        if (password.length < 6) {
            showError(loginMessage, "Password must be at least 6 characters.");
            return;
        }
        
        showLoading(loginSubmit, loginSpinner, loginText, "Authenticating...");
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                hideLoading(loginSubmit, loginSpinner, loginText, "Continue");
                showSuccess(loginMessage, `Welcome back, ${user.email}! Redirecting to your workspace...`);
                
                // Store user info
                localStorage.setItem('orbitauras_user', JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    isAnonymous: false,
                    timestamp: new Date().toISOString()
                }));
                
                setTimeout(() => {
                    window.location.href = 'chat.html'; // Update to your chat interface
                }, 1800);
            })
            .catch((error) => {
                hideLoading(loginSubmit, loginSpinner, loginText, "Continue");
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    showError(loginMessage, "Invalid email or password. Please try again.");
                } else if (error.code === 'auth/too-many-requests') {
                    showError(loginMessage, "Too many failed attempts. Please try again later.");
                } else {
                    showError(loginMessage, error.message);
                }
                console.error("Login error:", error);
            });
    });

    // Signup form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!validateEmail(email)) {
            showError(signupMessage, "Please enter a valid email address.");
            return;
        }
        
        if (password.length < 8) {
            showError(signupMessage, "Password must be at least 8 characters.");
            return;
        }
        
        if (password !== confirmPassword) {
            showError(signupMessage, "Passwords do not match.");
            return;
        }
        
        showLoading(signupSubmit, signupSpinner, signupText, "Creating account...");
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                hideLoading(signupSubmit, signupSpinner, signupText, "Sign up");
                showSuccess(signupMessage, `Account created for ${email}! Welcome to OrbitAuras.`);
                
                // Send email verification
                user.sendEmailVerification().then(() => {
                    console.log("Verification email sent");
                });
                
                // Store user info
                localStorage.setItem('orbitauras_user', JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    isAnonymous: false,
                    emailVerified: false,
                    timestamp: new Date().toISOString()
                }));
                
                setTimeout(() => {
                    window.location.href = 'chat.html'; // Update to your chat interface
                }, 2000);
            })
            .catch((error) => {
                hideLoading(signupSubmit, signupSpinner, signupText, "Sign up");
                if (error.code === 'auth/email-already-in-use') {
                    showError(signupMessage, "This email is already registered. Please log in.");
                } else if (error.code === 'auth/invalid-email') {
                    showError(signupMessage, "Invalid email format.");
                } else if (error.code === 'auth/weak-password') {
                    showError(signupMessage, "Password is too weak. Use at least 8 characters.");
                } else {
                    showError(signupMessage, error.message);
                }
                console.error("Signup error:", error);
            });
    });

    // ============================================
    // GOOGLE SIGN-IN (Firebase)
    // ============================================

    customGoogleBtn.addEventListener('click', () => {
        showLoading(loginSubmit, loginSpinner, loginText, "Signing in with Google...");
        
        // Create Google provider
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        // Sign in with popup
        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                hideLoading(loginSubmit, loginSpinner, loginText, "Continue");
                showSuccess(loginMessage, `Successfully signed in with Google! Welcome, ${user.displayName}.`);
                
                // Store user info
                localStorage.setItem('orbitauras_user', JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    isAnonymous: false,
                    provider: 'google',
                    timestamp: new Date().toISOString()
                }));
                
                setTimeout(() => {
                    window.location.href = 'chat.html'; // Update to your chat interface
                }, 1500);
            })
            .catch((error) => {
                hideLoading(loginSubmit, loginSpinner, loginText, "Continue");
                if (error.code === 'auth/popup-closed-by-user') {
                    showError(loginMessage, "Sign-in cancelled.");
                } else if (error.code === 'auth/popup-blocked') {
                    showError(loginMessage, "Popup blocked. Please allow popups for this site.");
                } else {
                    showError(loginMessage, `Google sign-in failed: ${error.message}`);
                }
                console.error("Google auth error:", error);
            });
    });

    // ============================================
    // PASSWORD RESET
    // ============================================

    forgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        
        if (!email) {
            showError(loginMessage, "Please enter your email first.");
            return;
        }
        
        if (!validateEmail(email)) {
            showError(loginMessage, "Please enter a valid email address.");
            return;
        }
        
        showLoading(loginSubmit, loginSpinner, loginText, "Sending reset link...");
        
        auth.sendPasswordResetEmail(email)
            .then(() => {
                hideLoading(loginSubmit, loginSpinner, loginText, "Continue");
                showSuccess(loginMessage, `Password reset link sent to ${email}. Check your inbox.`);
            })
            .catch((error) => {
                hideLoading(loginSubmit, loginSpinner, loginText, "Continue");
                if (error.code === 'auth/user-not-found') {
                    showError(loginMessage, "No account found with this email address.");
                } else {
                    showError(loginMessage, error.message);
                }
                console.error("Password reset error:", error);
            });
    });

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showError(element, message) {
        element.textContent = message;
        element.className = 'message error';
    }

    function showSuccess(element, message) {
        element.textContent = message;
        element.className = 'message success';
    }

    function showLoading(button, spinner, text, loadingText) {
        button.disabled = true;
        spinner.style.display = 'inline-block';
        text.textContent = loadingText;
    }

    function hideLoading(button, spinner, text, normalText) {
        button.disabled = false;
        spinner.style.display = 'none';
        text.textContent = normalText;
    }

    function clearMessages() {
        loginMessage.className = 'message';
        signupMessage.className = 'message';
    }

    // ============================================
    // AUTH STATE LISTENER
    // ============================================

    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("✅ Auth state changed - User signed in:", user.email || "anonymous");
        } else {
            console.log("ℹ️ Auth state changed - No user signed in");
        }
    });

    // ============================================
    // INITIALIZE
    // ============================================

    document.getElementById('switchToLogin')?.addEventListener('click', switchToLogin);

    console.log("🚀 OrbitAuras Authentication System Loaded");
});