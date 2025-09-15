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
//let currentUser = null
let progressInterval = null

// ===================================================
// INITIALIZATION AND AUTHENTICATION
// ===================================================

document.addEventListener('DOMContentLoaded', function() {
    
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

        // If session exists, set current user and proceed
        if (session?.user) {
            currentUser = session.user
            return
        }

        // If no session, wait briefly for session establishment
        let sessionFound = false

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, authSession) => {
            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && authSession?.user) {
                sessionFound = true
                currentUser = authSession.user
                
                // Clean up subscription
                try { 
                    subscription?.unsubscribe?.() 
                } catch (e) { 
                    /* ignore */
                }
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
                    /* ignore */
                }
                break
            }
        }

        // If no session found after waiting, redirect to login
        if (!sessionFound) {
            window.location.href = 'login.html'
        }

    } catch (error) {
        window.toast.error('Authentication error. Please try logging in again.');
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
        window.toast.error('Page loading error. Please refresh the page.');
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
        handleFile(files[0])
    }
}

/**
 * Handle files selected via file input
 */
function handleFileSelect(e) {
    const files = e.target.files
    if (files.length > 0) {
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
    
    // Validate file type - must be an image
    if (!file.type.startsWith('image/')) {
        window.toast.error('Please select an image file (JPG, PNG, GIF, etc.)');
        return
    }
    
    // Validate file size - maximum 10MB
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
        window.toast.error('File is too large. Please select an image under 10MB');
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
        window.toast.error('Error reading file. Please try again.');
    }
    
    // Start reading the file
    reader.readAsDataURL(file)
}

/**
 * Remove selected photo and reset UI
 */
function removeSelectedPhoto() {
    
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
    
    // Check if file is selected
    if (!selectedFile) {
        window.toast.error('Please select a photo to upload');
        return
    }
    
    // Prevent multiple simultaneous uploads
    if (isUploading) {
        window.toast.warning('Upload already in progress...');
        return
    }
    
    // Validate user authentication
    if (!currentUser) {
        window.toast.error('Please log in to upload photos');
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
        window.toast.error('Please select a date for this photo');
        return
    }
    
    // Prepare photo data object
    const photoData = {
        date: photoDate,
        story: photoStory || 'No story added yet.',
        monthYear: photoDate.substring(0, 7) // Extract "YYYY-MM" format
    }
    
    // Start upload process
    isUploading = true
    const uploadToastId = window.toast.loading('📤 Uploading your memory...')
    
    try {
        window.toast.loading('🔄 Processing your photo...');
        const savedPhoto = await savePhotoToSupabase(selectedFile, photoData)
        
        window.toast.success('✨ Memory saved successfully! Redirecting to your gallery...', { autoClose: 3000 });
        
        // Show additional success info
        const getMonthName = (monthYear) => {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const monthNum = parseInt(monthYear.split('-')[1]) - 1;
            return months[monthNum];
        };
        window.toast.success(`📅 Added to ${getMonthName(photoData.monthYear)} ${photoData.date.split('-')[0]}`, { autoClose: 2000, delay: 500 });
        
        // Redirect to main page after successful upload
        setTimeout(() => {
            window.location.href = 'index.html'
        }, 2500)
        
    } catch (error) {
        window.toast.error('❌ Failed to save memory. Please try again.');
        
        if (error.message) {
            window.toast.error(error.message, { autoClose: 6000, delay: 1000 });
        }
        
    } finally {
        isUploading = false
    }
}

// ===================================================
// UPLOAD PROGRESS AND SUPABASE INTEGRATION
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
        
        // Try multiple bucket name variations (common issue)
        const bucketNames = ['photos', 'Photos', 'photo-moments', 'photomoments']
        let uploadSuccess = false
        let uploadData = null
        let workingBucket = null
        
        for (const bucketName of bucketNames) {
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
                    break
                } else if (error) {
                    continue
                }
            } catch (bucketError) {
                continue
            }
        }
        
        if (!uploadSuccess || !uploadData) {
            // If all buckets fail, try creating a new bucket
            const { data: bucketData, error: bucketError } = await supabase.storage
                .createBucket('photos', {
                    public: true,
                    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                    fileSizeLimit: 10485760 // 10MB
                })
            
            if (bucketError && !bucketError.message.includes('already exists')) {
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
                throw new Error(`Storage upload failed: ${error.message}. Please check your Supabase configuration.`)
            }
            
            uploadData = data
            workingBucket = 'photos'
        }
        
        // Get public URL for the uploaded photo
        const { data: urlData } = supabase.storage
            .from(workingBucket)
            .getPublicUrl(fileName)
        
        if (!urlData?.publicUrl) {
            throw new Error('Failed to get public URL for uploaded image')
        }
        
        const photoUrl = urlData.publicUrl
        
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
            try {
                const { data: dbData, error: dbError } = await supabase
                    .from(tableName)
                    .insert([dbRecord])
                    .select()
                
                if (!dbError && dbData && dbData.length > 0) {
                    savedPhoto = dbData[0]
                    dbSuccess = true
                    break
                } else if (dbError) {
                    continue
                }
            } catch (tableError) {
                continue
            }
        }
        
        if (!dbSuccess || !savedPhoto) {
            throw new Error('Failed to save photo metadata to database. Please check your table configuration.')
        }
        
        // Update local cache if it exists
        if (window.userPhotos && Array.isArray(window.userPhotos)) {
            window.userPhotos.unshift(savedPhoto)
        }
        
        return savedPhoto
        
    } catch (error) {
        
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

// ===================================================
// AUTHENTICATION MANAGEMENT
// ===================================================

/**
 * Handle user logout
 */
async function handleLogout() {
    const logoutToastId = window.toast.loading('Signing you out...')
    try {
        const { error } = await supabase.auth.signOut()
        
        if (error) {
            window.toast.error('Logout failed. Redirecting anyway...', {
                autoClose: 1500
            });
            setTimeout(() => {
                window.location.href = 'login.html'
            }, 1000)
            return;
        }
        
        currentUser = null
        window.toast.success('👋 See you next time!', {
            autoClose: 1500
        });
        setTimeout(() => {
            window.location.href = 'login.html'
        }, 1500)
        
    } catch (error) {
        window.toast.error('Logout failed. Redirecting anyway...');
        setTimeout(() => {
            window.location.href = 'login.html'
        }, 1000)
    }
}
