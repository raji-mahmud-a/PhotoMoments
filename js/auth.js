// ===================================================
// Authentication Logic for Supabase
// ===================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth page loaded')
    
    // DOM elements
    const loginTab = document.getElementById('loginTab')
    const signupTab = document.getElementById('signupTab')
    const loginForm = document.getElementById('loginForm')
    const signupForm = document.getElementById('signupForm')
    const loginButton = document.getElementById('loginButton')
    const signupButton = document.getElementById('signupButton')
    const authMessage = document.getElementById('authMessage')
    
    // Tab switching
    loginTab.addEventListener('click', () => switchTab('login'))
    signupTab.addEventListener('click', () => switchTab('signup'))
    
    // Form submissions
    loginForm.addEventListener('submit', handleLogin)
    signupForm.addEventListener('submit', handleSignup)
    
    // Check if user is already logged in
    checkExistingSession()
})

function switchTab(tab) {
    const loginTab = document.getElementById('loginTab')
    const signupTab = document.getElementById('signupTab')
    const loginForm = document.getElementById('loginForm')
    const signupForm = document.getElementById('signupForm')
    
    if (tab === 'login') {
        loginTab.classList.add('active')
        signupTab.classList.remove('active')
        loginForm.classList.remove('hidden')
        signupForm.classList.add('hidden')
    } else {
        signupTab.classList.add('active')
        loginTab.classList.remove('active')
        signupForm.classList.remove('hidden')
        loginForm.classList.add('hidden')
    }
    
    hideMessage()
}

function showLoading(button) {
    const buttonText = button.querySelector('.button-text')
    const buttonLoading = button.querySelector('.button-loading')
    
    buttonText.classList.add('hidden')
    buttonLoading.classList.remove('hidden')
    button.disabled = true
}

function hideLoading(button) {
    const buttonText = button.querySelector('.button-text')
    const buttonLoading = button.querySelector('.button-loading')
    
    buttonText.classList.remove('hidden')
    buttonLoading.classList.add('hidden')
    button.disabled = false
}

function showMessage(message, isError = false) {
    const messageDiv = document.getElementById('authMessage')
    messageDiv.textContent = message
    messageDiv.className = `auth-message ${isError ? 'error' : 'success'}`
}

function hideMessage() {
    const messageDiv = document.getElementById('authMessage')
    messageDiv.classList.add('hidden')
}

// Small helper to wait for a short period
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function handleLogin(e) {
    e.preventDefault()
    
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value
    const loginButton = document.getElementById('loginButton')
    
    showLoading(loginButton)
    hideMessage()
    
    try {
        console.log('Attempting to sign in:', email)
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
        
        if (error) {
            throw error
        }
        
        console.log('Sign in request succeeded (may still require a session to be established):', data)
        showMessage('Sign in successful! Finalizing session...')
        
        // First try an immediate session check
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session?.user) {
            console.log('Session available immediately after sign in')
            window.location.href = 'index.html'
            return
        }
        
        // Otherwise listen for auth state change and redirect when signed in.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state change event:', event, session)
            if (event === 'SIGNED_IN' && session?.user) {
                try { subscription?.unsubscribe?.() } catch (e) { /* ignore */ }
                window.location.href = 'index.html'
            }
        })
        
        // Fallback: poll for session for a short window (3s)
        let waited = 0
        while (waited < 3000) {
            await sleep(200)
            waited += 200
            const { data: s } = await supabase.auth.getSession()
            if (s?.session?.user) {
                try { subscription?.unsubscribe?.() } catch (e) { /* ignore */ }
                window.location.href = 'index.html'
                return
            }
        }
        
        // If we get here, session wasn't established quickly. Keep on page and inform user.
        showMessage('Sign in succeeded but session is not yet available. Please wait or refresh the page.', true)
    } catch (error) {
        console.error('Login error:', error?.message || error)
        showMessage(getSupabaseErrorMessage(error?.message || String(error)), true)
    } finally {
        hideLoading(loginButton)
    }
}

async function handleSignup(e) {
    e.preventDefault()
    
    const email = document.getElementById('signupEmail').value
    const password = document.getElementById('signupPassword').value
    const confirmPassword = document.getElementById('confirmPassword').value
    const signupButton = document.getElementById('signupButton')
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', true)
        return
    }
    
    showLoading(signupButton)
    hideMessage()
    
    try {
        console.log('Attempting to create account:', email)
        
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        })
        
        if (error) {
            throw error
        }
        
        // If a user exists but no session, an email confirmation may be required
        if (data.user && !data.session) {
            showMessage('Please check your email to confirm your account!')
            return
        }
        
        // If we have a session immediately, redirect
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session?.user) {
            console.log('Account created and session available immediately')
            window.location.href = 'index.html'
            return
        }
        
        // Otherwise listen for auth state change before redirecting
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state change event (signup):', event, session)
            if (event === 'SIGNED_IN' && session?.user) {
                try { subscription?.unsubscribe?.() } catch (e) { /* ignore */ }
                window.location.href = 'index.html'
            }
        })

        // Poll as a short fallback
        let waited = 0
        while (waited < 3000) {
            await sleep(200)
            waited += 200
            const { data: s } = await supabase.auth.getSession()
            if (s?.session?.user) {
                try { subscription?.unsubscribe?.() } catch (e) { /* ignore */ }
                window.location.href = 'index.html'
                return
            }
        }

        showMessage('Account created! Please complete email confirmation if required.', true)
    } catch (error) {
        console.error('Signup error:', error?.message || error)
        showMessage(getSupabaseErrorMessage(error?.message || String(error)), true)
    } finally {
        hideLoading(signupButton)
    }
}

async function checkExistingSession() {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Existing session at page load:', session)
        if (session?.user) {
            console.log('User already logged in, redirecting...')
            window.location.href = 'index.html'
        }
    } catch (err) {
        console.error('Error checking existing session:', err)
    }
}

function getSupabaseErrorMessage(errorMessage) {
    // Common Supabase error messages
    if (!errorMessage) return 'An unexpected error occurred. Please try again.'
    if (errorMessage.includes('Invalid login credentials')) {
        return 'Invalid email or password. Please try again.'
    }
    if (errorMessage.includes('User already registered')) {
        return 'An account with this email already exists.'
    }
    if (errorMessage.includes('Password should be at least 6 characters')) {
        return 'Password should be at least 6 characters long.'
    }
    if (errorMessage.includes('Unable to validate email address')) {
        return 'Please enter a valid email address.';
    }
    
    return errorMessage || 'An unexpected error occurred. Please try again.';
}