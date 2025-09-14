// ===================================================
// PhotoMoments - Upload Page Logic (with new toast + progress + preview + external savePhotoToSupabase)
// ===================================================

let selectedFile = null
let isUploading = false
let currentObjectUrl = null

document.addEventListener('DOMContentLoaded', () => {
  console.log('Upload page loading...')
  document.addEventListener('userReady', initializeUploadInterface)
})

function initializeUploadInterface() {
  console.log('User session ready. Initializing upload interface.')

  const dropZone = document.getElementById('dropZone')
  const photoInput = document.getElementById('photoInput')
  const uploadForm = document.getElementById('uploadForm')
  const dropZoneContent = document.getElementById('dropZoneContent')
  const uploadButton = document.getElementById('uploadButton')
  const removePhotoBtn = document.getElementById('removePhoto')
  const photoDate = document.getElementById('photoDate')
  const cancelBtn = document.getElementById('cancelBtn')
  const logoutBtn = document.getElementById('logoutBtn')

  if (!dropZone || !photoInput || !uploadForm || !dropZoneContent) {
    console.warn(dropZone, photoInput, uploadForm, dropZoneContent)
    toast.error('Page loading error. Please refresh the page.')
    return
  }

  if (photoDate) photoDate.valueAsDate = new Date()

  setupDropZone(dropZone, photoInput)

  // This is a key change: Ensure handleFile is called
  // directly when the input changes.
  photoInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0]
    if (f) handleFile(f)
  })

  document.addEventListener('click', (e) => {
    const target = e.target
    if (!target) return

    if (target.matches('#selectFileBtn') || target.closest('#selectFileBtn')) {
      e.preventDefault()
      photoInput.click()
    }

    if (target.matches('#removePhoto') || target.closest('#removePhoto')) {
      e.preventDefault()
      removeSelectedPhoto(dropZoneContent, photoInput, dropZone)
    }
  })

  uploadForm.addEventListener('submit', handleFormSubmit)

  cancelBtn?.addEventListener('click', () => (window.location.href = 'index.html'))
  logoutBtn?.addEventListener('click', handleLogout)

  showInitialState(dropZone, uploadButton, removePhotoBtn, dropZoneContent, uploadForm)
}

// -------------------
// File Handling
// -------------------
function handleFile(file) {
  console.log('File selected:', file.name)

  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file (JPG, PNG, WEBP)', { autoClose: 4000 })
    return
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    toast.error('File is too large. Please select an image under 10MB', { autoClose: 5000 })
    return
  }

  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
  toast.success(`📷 ${file.name} selected (${fileSizeMB}MB)`, { autoClose: 2000 })

  selectedFile = file

  if (currentObjectUrl) {
    try { URL.revokeObjectURL(currentObjectUrl) } catch {}
    currentObjectUrl = null
  }

  const reader = new FileReader()
  reader.onload = function (e) {
    currentObjectUrl = e.target.result
    const dropZoneContent = document.getElementById('dropZoneContent')
    if (dropZoneContent) {
      dropZoneContent.innerHTML = `
        <div class="preview-wrapper">
          <img id="previewImage" src="${currentObjectUrl}" alt="Image preview" />
        </div>
      `
    }

    showPreviewState(
      document.getElementById('dropZone'),
      document.getElementById('uploadButton'),
      document.getElementById('removePhoto'),
      document.getElementById('uploadForm'),
      dropZoneContent
    )

    toast.info('💡 Add a story to make this memory special!', { autoClose: 3000, delay: 1000 })
  }
  reader.readAsDataURL(file)
}

// -------------------
// Upload Form Submit
// -------------------
async function handleFormSubmit(e) {
  e.preventDefault()

  if (!selectedFile) {
    toast.error('Please select a photo to upload')
    return
  }

  if (isUploading) {
    toast.warning('Upload already in progress...')
    return
  }

  const photoDate = document.getElementById('photoDate').value
  const photoStory = document.getElementById('photoStory').value.trim()

  if (!photoDate) {
    toast.error('Please select a date for this photo')
    return
  }

  isUploading = true
  showUploadProgress()

  const uploadToastId = toast.loading('📤 Uploading your memory...')

  try {
    console.log('Starting upload process...')

    const photoData = {
      date: photoDate,
      story: photoStory || 'No story added yet.',
      monthYear: photoDate.substring(0, 7)
    }

    toast.update(uploadToastId, 'loading', '🔄 Processing your photo...')

    const savedPhoto = await savePhotoToSupabase(selectedFile, photoData)
    console.log('Photo saved successfully:', savedPhoto)

    toast.update(uploadToastId, 'success', '✨ Memory saved successfully! Redirecting...', {
      autoClose: 3000
    })

    toast.success(`📅 Added to ${getMonthName(photoData.monthYear)} ${photoData.date.split('-')[0]}`, {
      autoClose: 2000,
      delay: 500
    })

    setTimeout(() => { window.location.href = 'index.html' }, 2500)

  } catch (error) {
    console.error('Upload error:', error)
    toast.update(uploadToastId, 'error', '❌ Failed to save memory. Please try again.')

    if (error.message) {
      toast.error(error.message, { autoClose: 6000, delay: 1000 })
    }

    hideUploadProgress()
  } finally {
    isUploading = false
  }
}

function getMonthName(monthYear) {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const monthNum = parseInt(monthYear.split('-')[1]) - 1
  return months[monthNum]
}

// -------------------
// Drop Zone
// -------------------
function setupDropZone(dropZone, photoInput) {
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault()
    dropZone.classList.add('dragover')
  })

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault()
    dropZone.classList.remove('dragover')
  })

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault()
    dropZone.classList.remove('dragover')

    const dt = e.dataTransfer
    if (!dt) return

    let file = null
    if (dt.items && dt.items.length) {
      for (let i = 0; i < dt.items.length; i++) {
        const item = dt.items[i]
        if (item.kind === 'file') {
          file = item.getAsFile()
          break
        }
      }
    }
    if (!file && dt.files && dt.files.length) file = dt.files[0]
    if (!file) return

    try {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      photoInput.files = dataTransfer.files
    } catch (err) {
      console.warn('Could not set input.files:', err)
    }

    handleFile(file)
  })
}

// -------------------
// State Controls
// -------------------
function removeSelectedPhoto(dropZoneContentElem, photoInputElem, dropZoneElem) {
  selectedFile = null

  if (currentObjectUrl) {
    try { URL.revokeObjectURL(currentObjectUrl) } catch {}
    currentObjectUrl = null
  }

  try { photoInputElem.value = '' } catch {}

  if (dropZoneContentElem) {
    dropZoneContentElem.innerHTML = `
      <span class="material-symbols-outlined upload-icon">cloud_upload</span>
      <p>Drag & Drop your photo here</p>
      <p>OR</p>
      <button type="button" class="btn Primarybtn" id="selectFileBtn">Select from device</button>
    `
  }

  showInitialState(dropZoneElem, document.getElementById('uploadButton'), document.getElementById('removePhoto'), dropZoneContentElem, document.getElementById('uploadForm'))
}

function showInitialState(dropZone, uploadButton, removePhotoBtn, dropZoneContent, uploadForm) {
  uploadButton && (uploadButton.style.display = 'none')
  removePhotoBtn && (removePhotoBtn.style.display = 'none')
  dropZone && (dropZone.style.border = '2px dashed #9ca3af')
  dropZone && (dropZone.style.padding = '20px')
  uploadForm && (uploadForm.style.display = 'none')
  dropZoneContent && dropZoneContent.classList.remove('preview-state')
}

function showPreviewState(dropZone, uploadButton, removePhotoBtn, uploadForm, dropZoneContent) {
  uploadButton && (uploadButton.style.display = 'inline-block')
  removePhotoBtn && (removePhotoBtn.style.display = 'inline-block')
  dropZone && (dropZone.style.border = 'none')
  dropZone && (dropZone.style.padding = '0')
  uploadForm && (uploadForm.style.display = 'block')
  dropZoneContent && dropZoneContent.classList.add('preview-state')
}

// -------------------
// Upload Progress (stub)
// -------------------
function showUploadProgress() {
  const bar = document.getElementById('uploadProgress')
  if (bar) bar.style.display = 'block'
}

function hideUploadProgress() {
  const bar = document.getElementById('uploadProgress')
  if (bar) bar.style.display = 'none'
}

// -------------------
// Logout
// -------------------
async function handleLogout() {
  const logoutToast = toast.loading('Signing you out...')
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.update(logoutToast, 'error', 'Logout failed. Redirecting anyway...')
      return setTimeout(() => (window.location.href = 'login.html'), 1000)
    }
    toast.update(logoutToast, 'success', '👋 See you next time!')
    setTimeout(() => (window.location.href = 'login.html'), 900)
  } catch {
    toast.update(logoutToast, 'error', 'Logout failed. Redirecting anyway...')
    setTimeout(() => (window.location.href = 'login.html'), 1000)
  }
}
