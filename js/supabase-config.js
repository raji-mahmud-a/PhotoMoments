// ===================================================
// 1. js/supabase-config.js
// ===================================================

// Supabase configuration
const supabaseUrl = 'https://qxiolkcpjojkwyfiahfq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aW9sa2Nwam9qa3d5ZmlhaGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTEwMjgsImV4cCI6MjA3MzI4NzAyOH0.VJHOR99X6iAZXOzu3w4XWoEnNHknFo5oXTiS0Q5NSAY'

// Initialize Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Global variables
let currentUser = null
let userPhotos = []

/**
 * Global authentication state listener
 * This is the central point for all auth-related redirects.
 */
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email || 'No user')

    const currentPage = window.location.pathname.split('/').pop()

    if (session?.user) {
        currentUser = session.user
        console.log('User is logged in:', currentUser.email)

        // If on a login page, redirect to the main gallery
        if (currentPage.includes('login.html')) {
            toast.success('Welcome back!', { duration: 1500 })
            setTimeout(() => {
                window.location.href = 'index.html'
            }, 1000)
        }

        // Trigger a custom event to let other scripts know the user is ready
        document.dispatchEvent(new CustomEvent('userReady', { detail: { user: currentUser } }))
    } else {
        currentUser = null
        userPhotos = []
        console.log('User is logged out.')

        // If not on the login page, redirect to login
        if (!currentPage.includes('login.html')) {
            toast.info('Session expired. Redirecting to login.', { duration: 1500 })
            setTimeout(() => {
                window.location.href = 'login.html'
            }, 1000)
        }
    }
})

/**
 * Loads current user's photos from Supabase.
 */
async function loadUserPhotos() {
    if (!currentUser) {
        console.log('No current user to load photos for.')
        return
    }

    try {
        const { data, error } = await supabase
            .from('Photos')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('photo_date', { ascending: false })

        if (error) {
            throw error
        }

        userPhotos = data || []
        console.log('Photos loaded successfully:', userPhotos.length)

        // Trigger a custom event to let the gallery page know photos are ready
        document.dispatchEvent(new CustomEvent('photosLoaded'))

    } catch (error) {
        console.error('Error loading photos:', error)
        toast.error('Failed to load photos. Please try again.')
    }
}

/**
 * Saves a new photo entry to Supabase storage and database.
 */
async function savePhotoToSupabase(photoFile, photoData) {
    if (!currentUser) {
        throw new Error('No user is currently logged in.')
    }

    try {
        const fileName = `${currentUser.id}/${Date.now()}-${photoFile.name}`
        const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(fileName, photoFile)
        
        if (uploadError) {
            throw uploadError
        }
        
        const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(fileName)
        
        const photoUrl = urlData.publicUrl
        
        const { data: dbData, error: dbError } = await supabase
            .from('Photos')
            .insert({
                user_id: currentUser.id,
                photo_url: photoUrl,
                photo_date: photoData.date,
                story: photoData.story,
                month_year: photoData.monthYear
            })
            .select()
        
        if (dbError) {
            throw dbError
        }
        
        console.log('Photo saved successfully:', dbData[0])
        userPhotos.unshift(dbData[0])
        
        return dbData[0]
        
    } catch (error) {
        console.error('Error saving photo:', error)
        throw error
    }
}

/**
 * Gets photos for a specific month/year.
 */
function getPhotosForMonth(year, month) {
    const monthYear = `${year}-${String(month).padStart(2, '0')}`
    return userPhotos.filter(photo => photo.month_year === monthYear)
}

// Expose functions to the window
window.loadUserPhotos = loadUserPhotos
window.savePhotoToSupabase = savePhotoToSupabase
window.getPhotosForMonth = getPhotosForMonth

console.log('Supabase initialized successfully!')