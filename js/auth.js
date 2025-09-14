// ===================================================
// Authentication Logic for Supabase
// ===================================================

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const loginTab = document.getElementById('loginTab')
    const signupTab = document.getElementById('signupTab')
    const loginForm = document.getElementById('loginForm')
    const signupForm = document.getElementById('signupForm')
    const loginButton = document.getElementById('loginButton')
    const signupButton = document.getElementById('signupButton')
    
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
        
        // First try an immediate session check
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session?.user) {
            window.showToast.update(loadingToastId, 'success', '🎉 Welcome back! Redirecting...', { autoClose: 2000 });
            setTimeout(() => {
                window.location.href = 'index.html'
            }, 1500)
            return
        }
        
        // Otherwise listen for auth state change and redirect when signed in.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                try { subscription?.unsubscribe?.() } catch (e) { /* ignore */ }
                window.showToast.update(loadingToastId, 'success', '🎉 Welcome back! Redirecting...', { autoClose: 2000 });
                setTimeout(() => {
                    window.location.href = 'index.html'
                }, 1500)
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
                window.showToast.update(loadingToastId, 'success', '🎉 Welcome back! Redirecting...', { autoClose: 2000 });
                setTimeout(() => {
                    window.location.href = 'index.html'
                }, 1500)
                return
            }
        }
        
        // If we get here, session wasn't established quickly.
        window.showToast.update(loadingToastId, 'error', 'Sign in succeeded but session is not yet available. Please wait or refresh the page.');
    } catch (error) {
        window.showToast.update(loadingToastId, 'error', getSupabaseErrorMessage(error?.message || String(error)));
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
            window.showToast.update(loadingToastId, 'info', '📧 Please check your email to confirm your account!', { autoClose: 8000 });
            return
        }
        
        // If we have a session immediately, redirect
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session?.user) {
            window.showToast.update(loadingToastId, 'success', '🎉 Account created! Welcome to PhotoMoments!', { autoClose: 2000 });
            setTimeout(() => {
                window.location.href = 'index.html'
            }, 1500)
            return
        }
        
        // Otherwise listen for auth state change before redirecting
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                try { subscription?.unsubscribe?.() } catch (e) { /* ignore */ }
                window.showToast.update(loadingToastId, 'success', '🎉 Account created! Welcome to PhotoMoments!', { autoClose: 2000 });
                setTimeout(() => {
                    window.location.href = 'index.html'
                }, 1500)
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
                window.showToast.update(loadingToastId, 'success', '🎉 Account created! Welcome to PhotoMoments!', { autoClose: 2000 });
                setTimeout(() => {
                    window.location.href = 'index.html'
                }, 1500)
                return
            }
        }

        window.showToast.update(loadingToastId, 'error', 'Account created! Please complete email confirmation if required.');
    } catch (error) {
        window.showToast.update(loadingToastId, 'error', getSupabaseErrorMessage(error?.message || String(error)));
    } finally {
        hideLoading(signupButton)
    }
}

async function checkExistingSession() {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
            window.location.href = 'index.html'
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
        return 'Please enter a valid email address.';
    }
    
    return errorMessage || 'An unexpected error occurred. Please try again.';
}
