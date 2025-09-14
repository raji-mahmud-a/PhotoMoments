// ===================================================
// 4. js/app.js (for index.html)
// ===================================================

// DOM elements
let yearSelect, monthSelect, galleryGrid, galleryGridNotFound, monthBar
let photoModal, modalImage, modalDate, modalStory, modalCloseBtn

// Modal state
let currentPhotoIndex = 0
let currentFilteredPhotos = []

document.addEventListener('DOMContentLoaded', function() {
    console.log('Gallery page loading...')
    
    // Listen for the custom event to know when the user session is ready
    document.addEventListener('userReady', initializeGalleryApp)

    // Setup event listeners for the header buttons
    const logoutBtn = document.getElementById('logoutBtn')
    const addMomentBtn = document.querySelector('.addNewMoment')

    logoutBtn?.addEventListener('click', handleLogout)
    addMomentBtn?.addEventListener('click', addNewMoment)
})

function initializeGalleryApp() {
    console.log('User session ready. Initializing gallery app...')
    
    // Get DOM elements
    yearSelect = document.getElementById('yearSelect')
    monthSelect = document.getElementById('monthSelect')
    galleryGrid = document.getElementById('GallerywrapperGrid')
    galleryGridNotFound = document.getElementById('GallerywrapperNotFound')
    
    // Modal elements
    photoModal = document.getElementById('photoModal')
    modalImage = document.getElementById('modalImage')
    modalDate = document.getElementById('modalDate')
    modalStory = document.getElementById('modalStory')
    modalCloseBtn = document.getElementById('modalCloseBtn')
    
    // Setup navigation
    setupMonthNavigation()
    
    // Setup modal event listeners
    setupModalEventListeners()
    
    // Load user photos
    loadUserPhotos()
    
    console.log('Gallery app initialized!')
}

function setupMonthNavigation() {
    // Generate years dynamically
    const currentYear = new Date().getFullYear()
    for (let year = currentYear; year >= 2020; year--) {
        const option = document.createElement('option')
        option.value = year
        option.textContent = year
        yearSelect.appendChild(option)
    }

    // Generate months dynamically
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    months.forEach((month, index) => {
        const option = document.createElement('option')
        option.value = index + 1
        option.textContent = month
        monthSelect.appendChild(option)
    })

    // Set current month/year
    const today = new Date()
    yearSelect.value = today.getFullYear()
    monthSelect.value = today.getMonth() + 1
    
    // Event listeners
    yearSelect.addEventListener('change', displayFilteredPhotos)
    monthSelect.addEventListener('change', displayFilteredPhotos)
}

function displayFilteredPhotos() {
    const selectedYear = yearSelect.value
    const selectedMonth = monthSelect.value
    
    currentFilteredPhotos = getPhotosForMonth(selectedYear, selectedMonth)
    
    galleryGrid.innerHTML = '' // Clear previous photos
    
    if (currentFilteredPhotos.length === 0) {
        galleryGridNotFound.style.display = 'flex'
        galleryGrid.style.display = 'none'
    } else {
        galleryGridNotFound.style.display = 'none'
        galleryGrid.style.display = 'grid'
        
        currentFilteredPhotos.forEach((photo) => {
            const photoCard = document.createElement('div')
            photoCard.className = 'photo-card'
            photoCard.innerHTML = `<img src="${photo.photo_url}" alt="Photo from ${photo.month_year}">`
            photoCard.dataset.id = photo.id
            photoCard.addEventListener('click', () => handlePhotoClick(photo.id))
            galleryGrid.appendChild(photoCard)
        })
    }
}

function handlePhotoClick(photoId) {
    const photo = currentFilteredPhotos.find(p => p.id === photoId)
    if (photo) {
        currentPhotoIndex = currentFilteredPhotos.findIndex(p => p.id === photoId)
        
        modalImage.src = photo.photo_url
        modalDate.textContent = `Date: ${new Date(photo.photo_date).toLocaleDateString()}`
        modalStory.textContent = `Story: ${photo.story || 'No story provided.'}`
        
        openModal()
    }
}

function openModal() {
    photoModal.classList.add('visible')
    photoModal.removeAttribute('hidden')
    document.body.style.overflow = 'hidden' // Prevent scrolling
}

function setupModalEventListeners() {
    modalCloseBtn?.addEventListener('click', closeModal)
    photoModal?.addEventListener('click', (event) => {
        if (event.target === photoModal) {
            closeModal()
        }
    })
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal()
        }
    })
}

function closeModal() {
    photoModal.classList.remove('visible')
    photoModal.setAttribute('hidden', '')
    document.body.style.overflow = ''
    console.log('Modal closed')
}

function navigatePhotos(direction) {
    if (currentFilteredPhotos.length <= 1) return
    
    let newIndex = currentPhotoIndex
    if (direction === 'next') {
        newIndex = (currentPhotoIndex + 1) % currentFilteredPhotos.length
    } else if (direction === 'prev') {
        newIndex = (currentPhotoIndex - 1 + currentFilteredPhotos.length) % currentFilteredPhotos.length
    }
    
    const nextPhoto = currentFilteredPhotos[newIndex]
    if (nextPhoto) {
        handlePhotoClick(nextPhoto.id)
    }
}

async function handleLogout() {
    try {
        console.log('Logging out...')
        toast.info('Signing you out...')
        await supabase.auth.signOut()
    } catch (error) {
        console.error('Logout error:', error)
        toast.error('Logout failed.')
    }
}

function addNewMoment() {
    console.log('Redirecting to upload page...')
    window.location.href = 'upload.html'
}
