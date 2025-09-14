// ===================================================
// Authentication Logic for Supabase
// ===================================================

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const loginTab = document.getElementById('loginTab')
    const signupTab = document.getElementById('signupTab')
    const loginForm = document.getElementById('loginForm')
    const signupForm = document.getElementById('signupForm')
    
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
    
    // Dismiss any lingering messages
    if (window.showToast) {
        window.showToast.dismissAll();
    }
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
    
    const loadingToastId = window.showToast.loading('Signing you in...')

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
        
        if (error) {
            throw error
        }
        
        // Set session in localStorage to prevent redirect loops
        localStorage.setItem('photoMoments_session', 'true')
        
        window.showToast.update(loadingToastId, 'success', '🎉 Welcome back! Redirecting...', { autoClose: 2000 })
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = 'index.html'
        }, 1500)
        
    } catch (error) {
        window.showToast.update(loadingToastId, 'error', getSupabaseErrorMessage(error?.message || String(error)))
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
        window.showToast.error('Passwords do not match. Please try again.')
        return
    }
    
    showLoading(signupButton)
    
    const loadingToastId = window.showToast.loading('Creating your account...')

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        })
        
        if (error) {
            throw error
        }
        
        // If a user exists but no session, an email confirmation may be required
        if (data.user && !data.session) {
            window.showToast.update(loadingToastId, 'info', '📧 Please check your email to confirm your account!', { autoClose: 8000 })
            hideLoading(signupButton)
            return
        }
        
        // Set session in localStorage
        localStorage.setItem('photoMoments_session', 'true')
        
        window.showToast.update(loadingToastId, 'success', '🎉 Account created! Welcome to PhotoMoments!', { autoClose: 2000 })
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = 'index.html'
        }, 1500)
        
    } catch (error) {
        window.showToast.update(loadingToastId, 'error', getSupabaseErrorMessage(error?.message || String(error)))
    } finally {
        hideLoading(signupButton)
    }
}

async function checkExistingSession() {
    // Don't redirect from login page if we're already there
    if (window.location.pathname.includes('login.html')) {
        return
    }
    
    try {
        const { data: { session } } = await supabase.auth.getSession()
        const hasLocalSession = localStorage.getItem('photoMoments_session') === 'true'
        
        // Only redirect if there's no session and no local session marker
        if (!session?.user && !hasLocalSession) {
            window.location.href = 'login.html'
        }
    } catch (err) {
        window.showToast.error('Error checking session. Please try refreshing the page.')
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
        return 'Please enter a valid email address.'
    }
    
    return errorMessage || 'An unexpected error occurred. Please try again.'
}

// Add logout handler
async function handleLogout() {
    const loadingToastId = window.showToast.loading('Signing you out...')
    
    try {
        await supabase.auth.signOut()
        
        // Clear session marker
        localStorage.removeItem('photoMoments_session')
        
        window.showToast.update(loadingToastId, 'success', '👋 See you next time!', { autoClose: 1500 })
        
        setTimeout(() => {
            window.location.href = 'login.html'
        }, 1500)
    } catch (error) {
        window.showToast.update(loadingToastId, 'error', 'Error signing out. Please try again.')
    }
}

// Attach logout handler to logout buttons
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn')
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout)
    }
})