// ===================================================
// 3. js/auth.js (for login.html)
// ===================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth page loaded')

    // DOM elements
    const loginTab = document.getElementById('loginTab')
    const signupTab = document.getElementById('signupTab')
    const loginForm = document.getElementById('loginForm')
    const signupForm = document.getElementById('signupForm')

    // Tab switching
    loginTab?.addEventListener('click', () => switchTab('login'))
    signupTab?.addEventListener('click', () => switchTab('signup'))

    // Form submissions
    loginForm?.addEventListener('submit', handleLogin)
    signupForm?.addEventListener('submit', handleSignup)
})

function switchTab(tab) {
    const loginTab = document.getElementById('loginTab')
    const signupTab = document.getElementById('signupTab')
    const loginForm = document.getElementById('loginForm')
    const signupForm = document.getElementById('signupForm')

    if (tab === 'login') {
        loginTab?.classList.add('active')
        signupTab?.classList.remove('active')
        loginForm?.classList.remove('hidden')
        signupForm?.classList.add('hidden')
    } else {
        signupTab?.classList.add('active')
        loginTab?.classList.remove('active')
        signupForm?.classList.remove('hidden')
        loginForm?.classList.add('hidden')
    }
}

function showLoading(button) {
    const buttonText = button?.querySelector('.button-text')
    const buttonLoading = button?.querySelector('.button-loading')
    if (buttonText) buttonText.classList.add('hidden')
    if (buttonLoading) buttonLoading.classList.remove('hidden')
    if (button) button.disabled = true
}

function hideLoading(button) {
    const buttonText = button?.querySelector('.button-text')
    const buttonLoading = button?.querySelector('.button-loading')
    if (buttonText) buttonText.classList.remove('hidden')
    if (buttonLoading) buttonLoading.classList.add('hidden')
    if (button) button.disabled = false
}

async function handleLogin(event) {
    event.preventDefault()
    const loginButton = document.getElementById('loginButton')
    showLoading(loginButton)

    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) throw error
        toast.success('Signed in successfully!')

    } catch (error) {
        console.error('Login error:', error.message)
        toast.error(getSupabaseErrorMessage(error.message))
    } finally {
        hideLoading(loginButton)
    }
}

async function handleSignup(event) {
    event.preventDefault()
    const signupButton = document.getElementById('signupButton')
    showLoading(signupButton)

    const email = document.getElementById('signupEmail').value
    const password = document.getElementById('signupPassword').value
    const confirmPassword = document.getElementById('confirmPassword').value

    if (password !== confirmPassword) {
        toast.error("Passwords don't match.")
        hideLoading(signupButton)
        return
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        })

        if (error) throw error

        if (data.user && !data.session) {
            toast.info('Please check your email to confirm your account!')
        } else {
            toast.success('Account created! Welcome to PhotoMoments!')
        }

    } catch (error) {
        console.error('Signup error:', error.message)
        toast.error(getSupabaseErrorMessage(error.message))
    } finally {
        hideLoading(signupButton)
    }
}

function getSupabaseErrorMessage(errorMessage) {
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
