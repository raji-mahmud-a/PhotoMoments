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
let progressInterval = null

document.addEventListener('DOMContentLoaded', function() {
    console.log('Upload page loading...')

    // Wait for the global userReady event before initializing the interface
    document.addEventListener('userReady', initializeUploadInterface)
})

/**
 * Initialize the upload interface with DOM elements and event listeners
 */
function initializeUploadInterface() {
    console.log('User session ready. Initializing upload interface.')
    
    // Get DOM elements
    const dropZone = document.getElementById('dropZone')
    const photoInput = document.getElementById('photoInput')
    const selectFileBtn = document.getElementById('selectFileBtn')
    const removePhotoBtn = document.getElementById('removePhoto')
    const uploadForm = document.getElementById('uploadForm')
    const photoDate = document.getElementById('photoDate')
    const cancelBtn = document.getElementById('cancelBtn')
    const logoutBtn = document.getElementById('logoutBtn')
    const uploadBtn = document.getElementById('uploadButton')

    // Validate required elements exist
    if (!dropZone || !photoInput || !uploadForm) {
        toast.error('Page loading error. Please refresh the page.');
        return
    }

    // Set default date to today
    if (photoDate) {
        photoDate.valueAsDate = new Date()
    }

    // Setup event listeners
    setupDropZone()

    selectFileBtn?.addEventListener('click', () => photoInput.click())
    photoInput?.addEventListener('change', handleFileSelect)
    removePhotoBtn?.addEventListener('click', removeSelectedPhoto)
    uploadForm?.addEventListener('submit', handleFormSubmit)
    cancelBtn?.addEventListener('click', () => window.location.href = 'index.html')
    logoutBtn?.addEventListener('click', handleLogout)
}

/**
 * Setup drag-and-drop functionality
 */
function setupDropZone() {
    const dropZone = document.getElementById('dropZone')
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.stopPropagation()
        dropZone.classList.add('dragover')
    })
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault()
        e.stopPropagation()
        dropZone.classList.remove('dragover')
    })
    dropZone.addEventListener('drop', handleDrop)
}

/**
 * Handle files dropped into the drop zone
 */
function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    const dropZone = document.getElementById('dropZone')
    dropZone.classList.remove('dragover')
    const files = e.dataTransfer.files
    if (files.length > 0) {
        handleFile(files[0])
    }
}

/**
 * Handle file selection from input
 */
function handleFileSelect(event) {
    handleFile(event.target.files[0])
}

/**
 * Process a single file
 */
function handleFile(file) {
    if (!file) return

    if (file.type.startsWith('image/')) {
        selectedFile = file
        const dropZoneContent = document.getElementById('dropZoneContent')
        dropZoneContent.innerHTML = `<img id="previewImage" src="${URL.createObjectURL(file)}" alt="Image Preview">`
        showPreviewState()
    } else {
        toast.error('Invalid file type. Please select an image.')
        selectedFile = null
    }
}

/**
 * Remove the selected photo and reset the UI
 */
function removeSelectedPhoto() {
    selectedFile = null
    const dropZoneContent = document.getElementById('dropZoneContent')
    dropZoneContent.innerHTML = `
        <span class="material-symbols-outlined upload-icon">cloud_upload</span>
        <p>Drag & Drop your photo here</p>
        <p>OR</p>
        <button type="button" class="btn Primarybtn" id="selectFileBtn">Select from device</button>
    `
    showInitialState()
    
    // Re-attach event listener to the new button
    document.getElementById('selectFileBtn').addEventListener('click', () => document.getElementById('photoInput').click())
}

/**
 * Show the initial state of the upload form
 */
function showInitialState() {
    document.getElementById('uploadButton').style.display = 'none'
    document.getElementById('removePhoto').style.display = 'none'
    document.getElementById('dropZone').style.border = '2px dashed #9ca3af'
    document.getElementById('dropZone').style.padding = '20px'
    document.getElementById('uploadForm').style.display = 'none'
    document.getElementById('dropZoneContent').classList.remove('preview-state')
    
}

/**
 * Show the preview state of the upload form
 */
function showPreviewState() {
    document.getElementById('uploadButton').style.display = 'inline-block'
    document.getElementById('removePhoto').style.display = 'inline-block'
    document.getElementById('dropZone').style.border = 'none'
    document.getElementById('dropZone').style.padding = '0'
    document.getElementById('uploadForm').style.display = 'block'
    document.getElementById('dropZoneContent').classList.add('preview-state')
}


/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault()
    
    if (isUploading) return
    
    if (!selectedFile) {
        toast.error('Please select a photo to upload.')
        return
    }

    const uploadButton = document.getElementById('uploadButton')
    const form = event.target
    const story = form.elements['story'].value
    const date = form.elements['photoDate'].value
    const year = new Date(date).getFullYear()
    const month = new Date(date).getMonth() + 1
    const monthYear = `${year}-${String(month).padStart(2, '0')}`

    const photoData = {
        story: story,
        date: date,
        monthYear: monthYear
    }
    
    showLoading(uploadButton)
    isUploading = true
    
    try {
        await savePhotoToSupabase(selectedFile, photoData)
        toast.success('Photo uploaded and saved successfully!')
        
        // Reset form and go back to main page
        setTimeout(() => {
            window.location.href = 'index.html'
        }, 1500)
    } catch (error) {
        console.error('Upload failed:', error)
        toast.error(`Upload failed: ${error.message}`)
    } finally {
        hideLoading(uploadButton)
        isUploading = false
    }
}

function showLoading(button) {
    const buttonText = button.querySelector('.button-text')
    const buttonLoading = button.querySelector('.button-loading')
    if (buttonText) buttonText.classList.add('hidden')
    if (buttonLoading) buttonLoading.classList.remove('hidden')
    if (button) button.disabled = true
}

function hideLoading(button) {
    const buttonText = button.querySelector('.button-text')
    const buttonLoading = button.querySelector('.button-loading')
    if (buttonText) buttonText.classList.remove('hidden')
    if (buttonLoading) buttonLoading.classList.add('hidden')
    if (button) button.disabled = false
}

/**
 * Handle user logout
 */
async function handleLogout() {
    const logoutToast = toast.loading('Signing you out...')
    try {
        const { error } = await supabase.auth.signOut()
        
        if (error) {
            toast.update(logoutToast, {
                text: 'Logout failed. Redirecting anyway...',
                type: 'error',
                duration: 1500
            });
            setTimeout(() => {
                window.location.href = 'login.html'
            }, 1000)
            return;
        }
        
        toast.update(logoutToast, {
            text: '👋 See you next time!',
            type: 'success',
            duration: 1500
        });
        
    } catch (error) {
        toast.update(logoutToast, {
            text: 'Logout failed. Redirecting anyway...',
            type: 'error',
            duration: 1500
        });
        setTimeout(() => {
            window.location.href = 'login.html'
        }, 1000)
    }
}
