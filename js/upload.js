// ===================================================
// Photo Upload Functionality
// ===================================================

let selectedFile = null
let isUploading = false
let currentUser = null

document.addEventListener('DOMContentLoaded', function() {
    console.log('Upload page loaded')
    
    // Check authentication
    checkAuthAndInitialize()
    
    // DOM elements
    const dropZone = document.getElementById('dropZone')
    const photoInput = document.getElementById('photoInput')
    const selectFileBtn = document.getElementById('selectFileBtn')
    const removePhotoBtn = document.getElementById('removePhoto')
    const uploadForm = document.getElementById('uploadForm')
    const photoDate = document.getElementById('photoDate')
    const cancelBtn = document.getElementById('cancelBtn')
    const logoutBtn = document.getElementById('logoutBtn')
    
    // Set default date to today
    photoDate.valueAsDate = new Date()
    
    // Event listeners
    setupDropZone()
    selectFileBtn.addEventListener('click', () => photoInput.click())
    photoInput.addEventListener('change', handleFileSelect)
    removePhotoBtn.addEventListener('click', removeSelectedPhoto())
    uploadForm.addEventListener('submit', handleFormSubmit)
    cancelBtn.addEventListener('click', () => window.location.href = 'index.html')
    logoutBtn.addEventListener('click', handleLogout)
})

async function checkAuthAndInitialize() {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
            console.log('No user session, redirecting to login...')
            window.location.href = 'login.html'
            return
        }
        
        currentUser = session.user
        console.log('User authenticated:', currentUser.email)
        
    } catch (error) {
        console.error('Auth check error:', error)
        window.location.href = 'login.html'
    }
}

function setupDropZone() {
    const dropZone = document.getElementById('dropZone')
    
    // Prevent default drag behaviors
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false)
        document.body.addEventListener(eventName, preventDefaults, false)
    })
    
    // Highlight drop zone when item is dragged over it
    ;['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false)
    })
    
    ;['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false)
    })
    
    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false)
}

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

function highlight(e) {
    document.getElementById('dropZone').classList.add('dragover')
}

function unhighlight(e) {
    document.getElementById('dropZone').classList.remove('dragover')
}

function handleDrop(e) {
    const dt = e.dataTransfer
    const files = dt.files
    
    if (files.length > 0) {
        handleFile(files[0])
    }
}

function handleFileSelect(e) {
    const files = e.target.files
    if (files.length > 0) {
        handleFile(files[0])
    }
}

function handleFile(file) {
    console.log('File selected:', file.name)
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showMessage('Please select an image file', 'error')
        return
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
        showMessage('File is too large. Please select an image under 10MB', 'error')
        return
    }
    
    selectedFile = file
    
    // Show preview
    const reader = new FileReader()
    reader.onload = function(e) {
        const previewImage = document.getElementById('previewImage')
        previewImage.src = e.target.result
        
        // Hide drop zone content, show preview
        document.querySelector('.drop-zone-content').style.display = 'none'
        document.getElementById('photoPreview').classList.remove('hidden')
        
        // Enable save button
        document.getElementById('saveBtn').disabled = false
    }
    reader.readAsDataURL(file)
}

function removeSelectedPhoto() {
    selectedFile = null
    
    // Reset file input
    document.getElementById('photoInput').value = ''
    
    // Hide preview, show drop zone content
    document.getElementById('photoPreview').classList.add('hidden')
    document.querySelector('.drop-zone-content').style.display = 'flex'
    
    // Disable save button
    document.getElementById('saveBtn').disabled = true
    
    console.log('Photo removed')
}

async function handleFormSubmit(e) {
    e.preventDefault()
    
    if (!selectedFile) {
        showMessage('Please select a photo', 'error')
        return
    }
    
    if (isUploading) {
        console.log('Upload already in progress')
        return
    }
    
    const photoDate = document.getElementById('photoDate').value
    const photoStory = document.getElementById('photoStory').value.trim()
    
    if (!photoDate) {
        showMessage('Please select a date for this photo', 'error')
        return
    }
    
    isUploading = true
    showUploadProgress()
    
    try {
        console.log('Starting upload process...')
        
        const photoData = {
            date: photoDate,
            story: photoStory || 'No story added yet.',
            monthYear: photoDate.substring(0, 7) // "2024-01" format
        }
        
        const savedPhoto = await savePhotoToSupabase(selectedFile, photoData)
        console.log('Photo saved successfully:', savedPhoto)
        
        showMessage('Memory saved successfully! 🎉', 'success')
        
        // Reset form after success
        setTimeout(() => {
            window.location.href = 'index.html'
        }, 2000)
        
    } catch (error) {
        console.error('Upload error:', error)
        showMessage('Failed to save memory. Please try again.', 'error')
        hideUploadProgress()
    } finally {
        isUploading = false
    }
}

function showUploadProgress() {
    // Show progress overlay
    document.getElementById('uploadProgress').classList.remove('hidden')
    
    // Show loading state on button
    const saveBtn = document.getElementById('saveBtn')
    saveBtn.classList.add('loading')
    saveBtn.disabled = true
    
    // Animate progress bar
    const progressFill = document.getElementById('progressFill')
    let progress = 0
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 90) {
            clearInterval(progressInterval)
            progressFill.style.width = '90%'
        } else {
            progressFill.style.width = progress + '%'
        }
    }, 200)
    
    // Store interval for cleanup
    saveBtn.dataset.progressInterval = progressInterval
}

function hideUploadProgress() {
    // Hide progress overlay
    document.getElementById('uploadProgress').classList.add('hidden')
    
    // Hide loading state on button
    const saveBtn = document.getElementById('saveBtn')
    saveBtn.classList.remove('loading')
    saveBtn.disabled = false
    
    // Clear progress animation
    if (saveBtn.dataset.progressInterval) {
        clearInterval(saveBtn.dataset.progressInterval)
        delete saveBtn.dataset.progressInterval
    }
    
    // Reset progress bar
    document.getElementById('progressFill').style.width = '0%'
}

function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('uploadMessage')
    messageDiv.textContent = message
    messageDiv.className = `upload-message ${type}`
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    
    // Hide message after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.classList.add('hidden')
        }, 5000)
    }
}

async function handleLogout() {
    try {
        console.log('Logging out...')
        await supabase.auth.signOut()
        window.location.href = 'login.html'
    } catch (error) {
        console.error('Logout error:', error)
        // Force redirect even if logout fails
        window.location.href = 'login.html'
    }
}

// Function to handle the Supabase photo upload and metadata saving
async function savePhotoToSupabase(photoFile, photoData) {
    if (!currentUser) {
        throw new Error('User not logged in')
    }
    
    try {
        // Create unique filename
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`
        
        console.log('Uploading photo:', fileName)
        
        // Update progress text
        document.getElementById('progressText').textContent = 'Uploading photo...'
        
        // Upload photo to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('Photos')
            .upload(fileName, photoFile)
        
        if (uploadError) {
            throw uploadError
        }
        
        // Update progress
        document.getElementById('progressFill').style.width = '95%'
        document.getElementById('progressText').textContent = 'Saving details...'
        
        // Get public URL for the uploaded photo
        const { data: urlData } = supabase.storage
            .from('Photos')
            .getPublicUrl(fileName)
        
        const photoUrl = urlData.publicUrl
        
        // Save photo metadata to database
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
        
        // Complete progress
        document.getElementById('progressFill').style.width = '100%'
        document.getElementById('progressText').textContent = 'Complete!'
        
        console.log('Photo saved successfully:', dbData[0])
        
        // Add to local array for immediate UI update
        if (window.userPhotos) {
            window.userPhotos.unshift(dbData[0])
        }
        
        return dbData[0]
        
    } catch (error) {
        console.error('Error saving photo:', error)
        throw error
    }
}

console.log('Upload page JavaScript loaded! 📤')
