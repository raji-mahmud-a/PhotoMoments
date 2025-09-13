// ===================================================
// Supabase Configuration and Initialization
// ===================================================

// Your Supabase configuration (replace with your actual values)
const supabaseUrl = 'https://qxiolkcpjojkwyfiahfq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aW9sa2Nwam9qa3d5ZmlhaGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTEwMjgsImV4cCI6MjA3MzI4NzAyOH0.VJHOR99X6iAZXOzu3w4XWoEnNHknFo5oXTiS0Q5NSAY'

// Initialize Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Global variables for current user
//let currentUser = null
let userPhotos = []

// Initialize auth state listener
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email)
    
    if (session?.user) {
        currentUser = session.user
        console.log('User logged in:', currentUser.email)
        
        // Load user's photos when they log in
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            loadUserPhotos()
        }
    } else {
        currentUser = null
        userPhotos = []
        console.log('User logged out')
        
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
        console.log('No user logged in')
        return
    }
    
    try {
        console.log('Loading photos for user:', currentUser.id)
        
        const { data, error } = await supabase
            .from('Photos')  // ← CHANGED: Capital P
            .select('*')
            .eq('user_id', currentUser.id)
            .order('photo_date', { ascending: false })
        
        if (error) {
            console.error('Error loading photos:', error)
            return
        }
        
        userPhotos = data || []
        console.log(`Loaded ${userPhotos.length} photos`)
        
        // Update the gallery if we're on the main page
        if (typeof renderGrid === 'function') {
            const currentYear = document.getElementById('yearSelect')?.value || new Date().getFullYear()
            const currentMonth = document.getElementById('monthSelect')?.value || (new Date().getMonth() + 1)
            renderGrid(currentYear, currentMonth)
        }
        
    } catch (err) {
        console.error('Error in loadUserPhotos:', err)
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
        
        console.log('Uploading photo:', fileName)
        
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
        
        console.log('Photo saved successfully:', dbData[0])
        
        // Add to local array
        userPhotos.unshift(dbData[0])
        
        return dbData[0]
        
    } catch (error) {
        console.error('Error saving photo:', error)
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

console.log('Supabase initialized successfully! 🚀')