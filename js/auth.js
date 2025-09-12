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
        
        console.log('Sign in successful:', data.user.email)
        showMessage('Sign in successful! Redirecting...')
        
        // Redirect to main app
        setTimeout(() => {
            window.location.href = 'index.html'
        }, 1000)
        
    } catch (error) {
        console.error('Login error:', error.message)
        showMessage(getSupabaseErrorMessage(error.message), true)
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
        
        if (data.user && !data.session) {
            // Email confirmation required
            showMessage('Please check your email to confirm your account!')
        } else {
            // Auto-signed in
            console.log('Account created and signed in:', data.user.email)
            showMessage('Account created! Redirecting...')
            
            setTimeout(() => {
                window.location.href = 'index.html'
            }, 1000)
        }
        
    } catch (error) {
        console.error('Signup error:', error.message)
        showMessage(getSupabaseErrorMessage(error.message), true)
    } finally {
        hideLoading(signupButton)
    }
}

async function checkExistingSession() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
        console.log('User already logged in, redirecting...')
        window.location.href = 'index.html'
    }
}

function getSupabaseErrorMessage(errorMessage) {
    // Common Supabase error messages
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
        return 'Please enter a valid email address.'
    }
    
    return errorMessage || 'An unexpected error occurred. Please try again.'
}