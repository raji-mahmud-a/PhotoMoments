// ===================================================
// PhotoMoments - Photo Upload Functionality
// ===================================================
// This file handles the photo upload process including:
// - User authentication validation
// - File selection and preview
// - Form submission and validation
// - Supabase storage upload
// - Database metadata storage
// ===================================================

// Global variables
let selectedFile = null
let isUploading = false
let currentUser = null
let progressInterval = null

// ===================================================
// INITIALIZATION AND AUTHENTICATION
// ===================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📤 Upload page loaded')
    
    // Check user authentication before proceeding
    checkAuthAndInitialize()
    
    // Initialize DOM elements and event listeners
    initializeUploadInterface()
})

/**
 * Sleep utility function for authentication polling
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Resolved promise after delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check user authentication and initialize the upload interface
 * Handles session validation with polling and auth state changes
 */
async function checkAuthAndInitialize() {
    try {
        // First, check if there's an existing session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔐 Initial session check (upload):', session?.user?.email || 'No session')

        // If session exists, set current user and proceed
        if (session?.user) {
            currentUser = session.user
            console.log('✅ User authenticated:', currentUser.email)
            return
        }

        // If no session, wait briefly for session establishment
        // This prevents immediate redirect when user just signed in
        console.log('⏳ No session at startup - waiting for session establishment')

        let sessionFound = false

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, authSession) => {
            console.log('🔄 Auth state change (upload):', event, authSession?.user?.email || 'No user')
            
            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && authSession?.user) {
                sessionFound = true
                currentUser = authSession.user
                
                // Clean up subscription
                try { 
                    subscription?.unsubscribe?.() 
                } catch (e) { 
                    console.warn('⚠️ Error unsubscribing from auth listener:', e)
                }
                
                console.log('✅ Session established via auth listener:', currentUser.email)
            }
        })

        // Poll for session for a maximum of 3 seconds
        let waited = 0
        const maxWaitTime = 3000
        const pollInterval = 300

        while (waited < maxWaitTime && !sessionFound) {
            await sleep(pollInterval)
            waited += pollInterval
            
            const { data: polledSession } = await supabase.auth.getSession()
            if (polledSession?.session?.user) {
                sessionFound = true
                currentUser = polledSession.session.user
                
                // Clean up subscription
                try { 
                    subscription?.unsubscribe?.() 
                } catch (e) { 
                    console.warn('⚠️ Error unsubscribing from auth listener:', e)
                }
                
                console.log('✅ Session found via polling:', currentUser.email)
                break
            }
        }

        // If no session found after waiting, redirect to login
        if (!sessionFound) {
            console.log('❌ No session detected after waiting, redirecting to login')
            window.location.href = 'login.html'
        }

    } catch (error) {
        console.error('❌ Auth check error:', error)
        showMessage('Authentication error. Please try logging in again.', 'error')
        setTimeout(() => {
            window.location.href = 'login.html'
        }, 2000)
    }
}

// ===================================================
// UI INITIALIZATION AND EVENT LISTENERS
// ===================================================

/**
 * Initialize the upload interface with DOM elements and event listeners
 */
function initializeUploadInterface() {
    // Get DOM elements
    const dropZone = document.getElementById('dropZone')
    const photoInput = document.getElementById('photoInput')
    const selectFileBtn = document.getElementById('selectFileBtn')
    const removePhotoBtn = document.getElementById('removePhoto')
    const uploadForm = document.getElementById('uploadForm')
    const photoDate = document.getElementById('photoDate')
    const cancelBtn = document.getElementById('cancelBtn')
    const logoutBtn = document.getElementById('logoutBtn')
    
    // Validate required elements exist
    if (!dropZone || !photoInput || !uploadForm) {
        console.error('❌ Required DOM elements not found')
        showMessage('Page loading error. Please refresh the page.', 'error')
        return
    }
    
    // Set default date to today
    if (photoDate) {
        photoDate.valueAsDate = new Date()
    }
    
    // Setup event listeners
    setupDropZone()
    
    if (selectFileBtn) {
        selectFileBtn.addEventListener('click', () => photoInput.click())
    }
    
    if (photoInput) {
        photoInput.addEventListener('change', handleFileSelect)
    }
    
    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', removeSelectedPhoto)
    }
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleFormSubmit)
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => window.location.href = 'index.html')
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout)
    }
    
    console.log('🎯 Upload interface initialized')
}

// ===================================================
// DRAG AND DROP FUNCTIONALITY
// ===================================================

/**
 * Setup drag and drop functionality for the drop zone
 */
function setupDropZone() {
    const dropZone = document.getElementById('dropZone')
    
    if (!dropZone) {
        console.warn('⚠️ Drop zone not found')
        return
    }
    
    // Prevent default drag behaviors on drop zone and document
    const preventDefaultEvents = ['dragenter', 'dragover', 'dragleave', 'drop']
    
    preventDefaultEvents.forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false)
        document.body.addEventListener(eventName, preventDefaults, false)
    })
    
    // Add visual feedback for drag events
    const highlightEvents = ['dragenter', 'dragover']
    const unhighlightEvents = ['dragleave', 'drop']
    
    highlightEvents.forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false)
    })
    
    unhighlightEvents.forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false)
    })
    
    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false)
    
    console.log('🎯 Drop zone setup complete')
}

/**
 * Prevent default browser behavior for drag events
 */
function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

/**
 * Add visual highlight when dragging over drop zone
 */
function highlight(e) {
    const dropZone = document.getElementById('dropZone')
    if (dropZone) {
        dropZone.classList.add('dragover')
    }
}

/**
 * Remove visual highlight when leaving drop zone
 */
function unhighlight(e) {
    const dropZone = document.getElementById('dropZone')
    if (dropZone) {
        dropZone.classList.remove('dragover')
    }
}

/**
 * Handle files dropped onto the drop zone
 */
function handleDrop(e) {
    const dt = e.dataTransfer
    const files = dt.files
    
    if (files.length > 0) {
        console.log('📁 File dropped:', files[0].name)
        handleFile(files[0])
    }
}

/**
 * Handle files selected via file input
 */
function handleFileSelect(e) {
    const files = e.target.files
    if (files.length > 0) {
        console.log('📁 File selected:', files[0].name)
        handleFile(files[0])
    }
}

// ===================================================
// FILE HANDLING AND VALIDATION
// ===================================================

/**
 * Process and validate selected file
 * @param {File} file - The selected file to process
 */
function handleFile(file) {
    console.log('🔍 Processing file:', {
        name: file.name,
        size: file.size,
        type: file.type
    })
    
    // Validate file type - must be an image
    if (!file.type.startsWith('image/')) {
        console.error('❌ Invalid file type:', file.type)
        showMessage('Please select an image file (JPG, PNG, GIF, etc.)', 'error')
        return
    }
    
    // Validate file size - maximum 10MB
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
        console.error('❌ File too large:', file.size, 'bytes')
        showMessage('File is too large. Please select an image under 10MB', 'error')
        return
    }
    
    // Store the selected file
    selectedFile = file
    
    // Generate and show preview
    generateFilePreview(file)
}

/**
 * Generate preview image for selected file
 * @param {File} file - The file to preview
 */
function generateFilePreview(file) {
    const reader = new FileReader()
    
    reader.onload = function(e) {
        const previewImage = document.getElementById('previewImage')
        const dropZoneContent = document.querySelector('.drop-zone-content')
        const photoPreview = document.getElementById('photoPreview')
        const saveBtn = document.getElementById('saveBtn')
        
        if (previewImage && e.target.result) {
            previewImage.src = e.target.result
            console.log('✅ Preview generated')
        }
        
        // Update UI to show preview
        if (dropZoneContent) {
            dropZoneContent.style.display = 'none'
        }
        
        if (photoPreview) {
            photoPreview.classList.remove('hidden')
        }
        
        // Enable save button
        if (saveBtn) {
            saveBtn.disabled = false
        }
    }
    
    reader.onerror = function() {
        console.error('❌ Error reading file')
        showMessage('Error reading file. Please try again.', 'error')
    }
    
    // Start reading the file
    reader.readAsDataURL(file)
}

/**
 * Remove selected photo and reset UI
 */
function removeSelectedPhoto() {
    console.log('🗑️ Removing selected photo')
    
    // Clear selected file
    selectedFile = null
    
    // Reset file input
    const photoInput = document.getElementById('photoInput')
    if (photoInput) {
        photoInput.value = ''
    }
    
    // Reset UI elements
    const photoPreview = document.getElementById('photoPreview')
    const dropZoneContent = document.querySelector('.drop-zone-content')
    const saveBtn = document.getElementById('saveBtn')
    
    if (photoPreview) {
        photoPreview.classList.add('hidden')
    }
    
    if (dropZoneContent) {
        dropZoneContent.style.display = 'flex'
    }
    
    if (saveBtn) {
        saveBtn.disabled = true
    }
    
    console.log('✅ Photo removed and UI reset')
}

// ===================================================
// FORM SUBMISSION AND VALIDATION
// ===================================================

/**
 * Handle form submission for photo upload
 * @param {Event} e - Form submission event
 */
async function handleFormSubmit(e) {
    e.preventDefault()
    
    console.log('📝 Form submission started')
    
    // Check if file is selected
    if (!selectedFile) {
        showMessage('Please select a photo to upload', 'error')
        return
    }
    
    // Prevent multiple simultaneous uploads
    if (isUploading) {
        console.log('⚠️ Upload already in progress')
        return
    }
    
    // Validate user authentication
    if (!currentUser) {
        showMessage('Please log in to upload photos', 'error')
        setTimeout(() => {
            window.location.href = 'login.html'
        }, 2000)
        return
    }
    
    // Get form data
    const photoDate = document.getElementById('photoDate')?.value
    const photoStory = document.getElementById('photoStory')?.value?.trim() || ''
    
    // Validate required fields
    if (!photoDate) {
        showMessage('Please select a date for this photo', 'error')
        return
    }
    
    // Prepare photo data object
    const photoData = {
        date: photoDate,
        story: photoStory || 'No story added yet.',
        monthYear: photoDate.substring(0, 7) // Extract "YYYY-MM" format
    }
    
    console.log('📋 Upload data prepared:', {
        file: selectedFile.name,
        date: photoData.date,
        storyLength: photoData.story.length,
        monthYear: photoData.monthYear
    })
    
    // Start upload process
    isUploading = true
    showUploadProgress()
    
    try {
        const savedPhoto = await savePhotoToSupabase(selectedFile, photoData)
        console.log('✅ Photo upload completed successfully:', savedPhoto.id)
        
        showMessage('Memory saved successfully! 🎉', 'success')
        
        // Redirect to main page after successful upload
        setTimeout(() => {
            window.location.href = 'index.html'
        }, 2000)
        
    } catch (error) {
        console.error('❌ Upload failed:', error)
        
        // Provide more specific error messages
        let errorMessage = 'Failed to save memory. Please try again.'
        
        if (error.message?.includes('Storage')) {
            errorMessage = 'Storage error. Please check your internet connection and try again.'
        } else if (error.message?.includes('auth')) {
            errorMessage = 'Authentication error. Please log in again.'
        } else if (error.message?.includes('size')) {
            errorMessage = 'File size too large. Please choose a smaller image.'
        }
        
        showMessage(errorMessage, 'error')
        hideUploadProgress()
        
    } finally {
        isUploading = false
    }
}

// ===================================================
// UPLOAD PROGRESS AND UI FEEDBACK
// ===================================================

/**
 * Show upload progress overlay with animated progress bar
 */
function showUploadProgress() {
    const uploadProgress = document.getElementById('uploadProgress')
    const saveBtn = document.getElementById('saveBtn')
    const progressFill = document.getElementById('progressFill')
    
    // Show progress overlay
    if (uploadProgress) {
        uploadProgress.classList.remove('hidden')
    }
    
    // Update button state
    if (saveBtn) {
        saveBtn.classList.add('loading')
        saveBtn.disabled = true
    }
    
    // Animate progress bar
    if (progressFill) {
        let progress = 0
        progressInterval = setInterval(() => {
            progress += Math.random() * 10 + 2 // Random progress between 2-12%
            
            if (progress >= 85) {
                clearInterval(progressInterval)
                progressFill.style.width = '85%'
            } else {
                progressFill.style.width = progress + '%'
            }
        }, 200)
    }
    
    console.log('📊 Upload progress started')
}

/**
 * Hide upload progress overlay and reset UI
 */
function hideUploadProgress() {
    const uploadProgress = document.getElementById('uploadProgress')
    const saveBtn = document.getElementById('saveBtn')
    const progressFill = document.getElementById('progressFill')
    const progressText = document.getElementById('progressText')
    
    // Hide progress overlay
    if (uploadProgress) {
        uploadProgress.classList.add('hidden')
    }
    
    // Reset button state
    if (saveBtn) {
        saveBtn.classList.remove('loading')
        saveBtn.disabled = selectedFile ? false : true
    }
    
    // Clear progress animation
    if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
    }
    
    // Reset progress bar
    if (progressFill) {
        progressFill.style.width = '0%'
    }
    
    // Reset progress text
    if (progressText) {
        progressText.textContent = 'Preparing upload...'
    }
    
    console.log('📊 Upload progress hidden')
}

/**
 * Display messages to user with different styles
 * @param {string} message - Message to display
 * @param {string} type - Message type: 'info', 'success', 'error', 'warning'
 */
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('uploadMessage')
    
    if (messageDiv) {
        messageDiv.textContent = message
        messageDiv.className = `upload-message ${type}`
        messageDiv.classList.remove('hidden')
        
        // Scroll message into view
        messageDiv.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        })
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.classList.add('hidden')
            }, 5000)
        }
    }
    
    console.log(`💬 Message (${type}):`, message)
}

// ===================================================
// SUPABASE INTEGRATION
// ===================================================

/**
 * Upload photo to Supabase storage and save metadata to database
 * @param {File} photoFile - The photo file to upload
 * @param {Object} photoData - Photo metadata (date, story, monthYear)
 * @returns {Promise<Object>} The saved photo record from database
 */
async function savePhotoToSupabase(photoFile, photoData) {
    // Validate user authentication
    if (!currentUser) {
        throw new Error('User not authenticated')
    }
    
    console.log('☁️ Starting Supabase upload process')
    console.log('👤 Current user:', currentUser.id)
    console.log('📊 File details:', {
        name: photoFile.name,
        size: photoFile.size,
        type: photoFile.type
    })
    
    try {
        // First, check if we can access Supabase
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            throw new Error('No active session found')
        }
        
        // Generate unique filename with user ID and timestamp
        const fileExt = photoFile.name.split('.').pop().toLowerCase()
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const fileName = `${currentUser.id}/${timestamp}_${randomSuffix}.${fileExt}`
        
        console.log('📁 Generated filename:', fileName)
        
        // Update progress: Starting upload
        updateProgressText('Uploading photo...')
        
        // Try multiple bucket name variations (common issue)
        const bucketNames = ['photos', 'Photos', 'photo-moments', 'photomoments']
        let uploadSuccess = false
        let uploadData = null
        let workingBucket = null
        
        for (const bucketName of bucketNames) {
            console.log(`🪣 Trying bucket: ${bucketName}`)
            
            try {
                const { data, error } = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, photoFile, {
                        cacheControl: '3600',
                        upsert: true // Allow overwriting if file exists
                    })
                
                if (!error && data) {
                    uploadData = data
                    workingBucket = bucketName
                    uploadSuccess = true
                    console.log(`✅ Upload successful with bucket: ${bucketName}`)
                    break
                } else if (error) {
                    console.log(`❌ Failed with bucket ${bucketName}:`, error.message)
                }
            } catch (bucketError) {
                console.log(`❌ Exception with bucket ${bucketName}:`, bucketError.message)
                continue
            }
        }
        
        if (!uploadSuccess || !uploadData) {
            // If all buckets fail, try creating a new bucket
            console.log('🆕 Attempting to create new bucket: photos')
            
            const { data: bucketData, error: bucketError } = await supabase.storage
                .createBucket('photos', {
                    public: true,
                    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                    fileSizeLimit: 10485760 // 10MB
                })
            
            if (bucketError && !bucketError.message.includes('already exists')) {
                console.error('❌ Bucket creation error:', bucketError)
                throw new Error(`Failed to create storage bucket: ${bucketError.message}`)
            }
            
            // Try upload again with new/existing bucket
            const { data, error } = await supabase.storage
                .from('photos')
                .upload(fileName, photoFile, {
                    cacheControl: '3600',
                    upsert: true
                })
            
            if (error) {
                console.error('❌ Final upload attempt failed:', error)
                throw new Error(`Storage upload failed: ${error.message}. Please check your Supabase configuration.`)
            }
            
            uploadData = data
            workingBucket = 'photos'
        }
        
        console.log('✅ File uploaded to storage:', uploadData.path)
        
        // Update progress: Getting public URL
        updateProgressText('Processing image...')
        updateProgressBar(70)
        
        // Get public URL for the uploaded photo
        const { data: urlData } = supabase.storage
            .from(workingBucket)
            .getPublicUrl(fileName)
        
        if (!urlData?.publicUrl) {
            throw new Error('Failed to get public URL for uploaded image')
        }
        
        const photoUrl = urlData.publicUrl
        console.log('🔗 Public URL generated:', photoUrl)
        
        // Update progress: Saving to database
        updateProgressText('Saving details...')
        updateProgressBar(90)
        
        // Try multiple table name variations
        const tableNames = ['photos', 'Photos', 'photo_moments', 'photomoments']
        let dbSuccess = false
        let savedPhoto = null
        
        // Prepare database record
        const dbRecord = {
            user_id: currentUser.id,
            photo_url: photoUrl,
            thumbnail_url: photoUrl,
            photo_date: photoData.date,
            story: photoData.story,
            month_year: photoData.monthYear,
            created_at: new Date().toISOString()
        }
        
        for (const tableName of tableNames) {
            console.log(`📋 Trying table: ${tableName}`)
            
            try {
                const { data: dbData, error: dbError } = await supabase
                    .from(tableName)
                    .insert([dbRecord])
                    .select()
                
                if (!dbError && dbData && dbData.length > 0) {
                    savedPhoto = dbData[0]
                    dbSuccess = true
                    console.log(`✅ Database save successful with table: ${tableName}`)
                    break
                } else if (dbError) {
                    console.log(`❌ Failed with table ${tableName}:`, dbError.message)
                }
            } catch (tableError) {
                console.log(`❌ Exception with table ${tableName}:`, tableError.message)
                continue
            }
        }
        
        if (!dbSuccess || !savedPhoto) {
            throw new Error('Failed to save photo metadata to database. Please check your table configuration.')
        }
        
        // Update progress: Complete
        updateProgressText('Complete!')
        updateProgressBar(100)
        
        console.log('✅ Photo metadata saved to database:', savedPhoto.id)
        
        // Update local cache if it exists
        if (window.userPhotos && Array.isArray(window.userPhotos)) {
            window.userPhotos.unshift(savedPhoto)
            console.log('📱 Local cache updated')
        }
        
        return savedPhoto
        
    } catch (error) {
        console.error('❌ Save photo error:', error)
        
        // Log additional error details for debugging
        if (error.details) {
            console.error('Error details:', error.details)
        }
        if (error.hint) {
            console.error('Error hint:', error.hint)
        }
        if (error.code) {
            console.error('Error code:', error.code)
        }
        
        // Provide more specific error messages
        let userMessage = error.message
        
        if (error.message.includes('bucket') || error.message.includes('404')) {
            userMessage = 'Storage configuration error. Please contact support or check your Supabase setup.'
        } else if (error.message.includes('auth')) {
            userMessage = 'Authentication error. Please try logging in again.'
        } else if (error.message.includes('RLS') || error.message.includes('policy')) {
            userMessage = 'Permission error. Please check your account permissions.'
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
            userMessage = 'Network error. Please check your internet connection and try again.'
        }
        
        throw new Error(userMessage)
    }
}

/**
 * Update progress bar percentage
 * @param {number} percentage - Progress percentage (0-100)
 */
function updateProgressBar(percentage) {
    const progressFill = document.getElementById('progressFill')
    if (progressFill) {
        progressFill.style.width = `${Math.min(100, Math.max(0, percentage))}%`
    }
}

/**
 * Update progress text message
 * @param {string} text - Progress text to display
 */
function updateProgressText(text) {
    const progressText = document.getElementById('progressText')
    if (progressText) {
        progressText.textContent = text
    }
}

// ===================================================
// AUTHENTICATION MANAGEMENT
// ===================================================

/**
 * Handle user logout
 */
async function handleLogout() {
    try {
        console.log('🚪 Logging out user')
        
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut()
        
        if (error) {
            console.error('❌ Logout error:', error)
        }
        
        // Clear current user
        currentUser = null
        
        // Redirect to login page
        window.location.href = 'login.html'
        
    } catch (error) {
        console.error('❌ Logout error:', error)
        
        // Force redirect even if logout fails
        showMessage('Logging out...', 'info')
        setTimeout(() => {
            window.location.href = 'login.html'
        }, 1000)
    }
}

// ===================================================
// INITIALIZATION COMPLETE
// ===================================================

console.log('✅ Upload page JavaScript loaded successfully! 📤')