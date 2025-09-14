// ===================================================
// Supabase Configuration and Initialization
// ===================================================

// Your Supabase configuration (replace with your actual values)
const supabaseUrl = 'https://qxiolkcpjojkwyfiahfq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aW9sa2Nwam9qa3d5ZmlhaGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTEwMjgsImV4cCI6MjA3MzI4NzAyOH0.VJHOR99X6iAZXOzu3w4XWoEnNHknFo5oXTiS0Q5NSAY'

// Initialize Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Global variables for current user
let currentUser = null
let userPhotos = []

// Initialize auth state listener
supabase.auth.onAuthStateChange((event, session) => {
    
    if (session?.user) {
        currentUser = session.user
        
        // Load user's photos when they log in
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            loadUserPhotos()
        }
    } else {
        currentUser = null
        userPhotos = []
        
        // Redirect to login if not on login page
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html'
        }
    }
})

/**
 * Load current user's photos from Supabase
 */
async function loadUserPhotos() {
    if (!currentUser) {
        return
    }
    
    try {
        const { data, error } = await supabase
            .from('Photos')  // ← CHANGED: Capital P
            .select('*')
            .eq('user_id', currentUser.id)
            .order('photo_date', { ascending: false })
        
        if (error) {
            window.showToast.error('Failed to load your memories. Please refresh the page.')
            return
        }
        
        userPhotos = data || []
        
        if (userPhotos.length > 0) {
            window.showToast.success(`📸 Loaded ${userPhotos.length} memories`, {
                autoClose: 2000
            })
        }
        
        // Update the gallery if we're on the main page
        if (typeof renderGrid === 'function') {
            const currentYear = document.getElementById('yearSelect')?.value || new Date().getFullYear()
            const currentMonth = document.getElementById('monthSelect')?.value || (new Date().getMonth() + 1)
            renderGrid(currentYear, currentMonth)
        }
        
    } catch (err) {
        window.showToast.error('Connection error. Please check your internet and try again.')
    }
}

/**
 * Save a new photo to Supabase
 */
async function savePhotoToSupabase(photoFile, photoData) {
    if (!currentUser) {
        throw new Error('User not logged in')
    }
    
    try {
        // Create unique filename
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`
        
        // Upload photo to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('Photos')  // Storage bucket name stays lowercase
            .upload(fileName, photoFile)
        
        if (uploadError) {
            throw uploadError
        }
        
        // Get public URL for the uploaded photo
        const { data: urlData } = supabase.storage
            .from('Photos')  // Storage bucket name stays lowercase
            .getPublicUrl(fileName)
        
        const photoUrl = urlData.publicUrl
        
        // Save photo metadata to database
        const { data: dbData, error: dbError } = await supabase
            .from('Photos')  // ← CHANGED: Capital P for table name
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
        
        // Add to local array
        userPhotos.unshift(dbData[0])
        
        return dbData[0]
        
    } catch (error) {
        throw error
    }
}

/**
 * Get photos for specific month/year
 */
function getPhotosForMonth(year, month) {
    const monthYear = `${year}-${String(month).padStart(2, '0')}`
    return userPhotos.filter(photo => photo.month_year === monthYear)
}
