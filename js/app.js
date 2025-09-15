// ===================================================
// js/app.js - Main Gallery Page JavaScript
// PhotoMoments Gallery with Modal System
// ===================================================

// DOM elements
let yearSelect, monthSelect, galleryGrid, galleryGridNotFound, monthBar
let photoModal, modalImage, modalDate, modalStory, modalCloseBtn

// Modal state
let currentPhotoIndex = 0
let currentFilteredPhotos = []

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Gallery page loading...')
    
    // Check authentication first
    checkAuthenticationAndInit()
})

async function checkAuthenticationAndInit() {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
            console.log('No user session, redirecting to login...')
            window.location.href = 'login.html'
            return
        }
        
        console.log('User authenticated:', session.user.email)
        currentUser = session.user
        
        // Initialize the app
        initializeGalleryApp()
        
    } catch (error) {
        console.error('Auth check error:', error)
        window.location.href = 'login.html'
    }
}

function initializeGalleryApp() {
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
    
    // Setup other event listeners
    setupEventListeners()
    
    // Load user photos
    loadUserPhotos()
    
    // Show welcome message
    toast.success('Welcome back!')
    
    console.log('Gallery app initialized!')
}

function setupMonthNavigation() {
    if (!yearSelect || !monthSelect) return
    
    // Create desktop month bar
    monthBar = document.createElement('div')
    monthBar.className = 'month-bar'
    monthBar.setAttribute('role', 'tablist')
    yearSelect.parentElement.insertBefore(monthBar, yearSelect.nextSibling)

    // Populate years
    const now = new Date()
    const currentYear = now.getFullYear()
    for (let y = currentYear; y >= 2000; y--) {
        const opt = document.createElement('option')
        opt.value = y
        opt.textContent = y
        yearSelect.appendChild(opt)
    }
    yearSelect.value = currentYear

    // Months data
    const months = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December'
    ]

    // Populate month select (mobile)
    months.forEach((m, idx) => {
        const o = document.createElement('option')
        o.value = idx + 1
        o.textContent = m
        monthSelect.appendChild(o)
    })

    // Populate month bar (desktop)
    months.forEach((m, idx) => {
        const pill = document.createElement('button')
        pill.className = 'month-pill'
        pill.type = 'button'
        pill.dataset.month = idx + 1
        pill.textContent = m.slice(0,3)
        pill.title = m
        monthBar.appendChild(pill)
    })

    // Set initial active month
    const currentMonth = now.getMonth() + 1
    setActiveMonth(currentMonth)
    
    // Event listeners
    monthBar.addEventListener('click', handleMonthPillClick)
    monthSelect.addEventListener('change', handleMonthSelectChange)
    yearSelect.addEventListener('change', handleYearChange)
    
    // Responsive UI
    updateMonthUI()
    window.matchMedia('(max-width:900px)').addEventListener('change', updateMonthUI)
    
    // Initial render
    renderGrid(currentYear, currentMonth)
}

function setActiveMonth(m) {
    if (!monthBar) return
    
    monthBar.querySelectorAll('.month-pill').forEach(p => {
        p.classList.toggle('active', Number(p.dataset.month) === Number(m))
    })
    
    if (monthSelect) monthSelect.value = String(m)
}

function handleMonthPillClick(e) {
    const pill = e.target.closest('.month-pill')
    if (!pill) return
    
    setActiveMonth(pill.dataset.month)
    renderGrid(yearSelect.value, pill.dataset.month)
    pill.scrollIntoView({behavior:'smooth', inline:'center'})
}

function handleMonthSelectChange(e) {
    setActiveMonth(e.target.value)
    renderGrid(yearSelect.value, monthSelect.value)
}

function handleYearChange(e) {
    renderGrid(yearSelect.value, monthSelect.value)
}

function updateMonthUI() {
    if (!monthSelect || !monthBar) return
    
    if (window.matchMedia('(max-width:900px)').matches) {
        monthSelect.style.display = 'block'
        monthBar.style.display = 'none'
    } else {
        monthSelect.style.display = 'none'
        monthBar.style.display = 'flex'
    }
}

function renderGrid(year, month) {
    if (!galleryGrid || !currentUser) return
    
    console.log(`Rendering gallery for Year: ${year}, Month: ${month}`)
    
    // Clear any previously displayed photos
    galleryGrid.innerHTML = ''
    
    // Get photos for the selected month/year
    const filteredPhotos = getPhotosForMonth(year, month)
    currentFilteredPhotos = filteredPhotos
    
    console.log(`Found ${filteredPhotos.length} photos for ${year}-${String(month).padStart(2, '0')}`)
    
    if (filteredPhotos.length === 0) {
        // No photos found - show empty state
        galleryGrid.hidden = true
        galleryGridNotFound.hidden = false
    } else {
        // Photos found - display them
        filteredPhotos.forEach(photo => {
            const photoElement = document.createElement('div')
            photoElement.className = 'photo-card'
            photoElement.setAttribute("data-photo-id", `${photo.id}`)
            photoElement.id = "photoCard"
            
            // Format the date for display
            const dateObj = new Date(photo.photo_date)
            const options = { year: 'numeric', month: 'long', day: 'numeric' }
            const formattedDate = dateObj.toLocaleDateString('en-US', options)
            
            photoElement.innerHTML = `
                <img src="${photo.photo_url}" alt="A photo from ${photo.photo_date}" loading="lazy">
                <div class="photo-overlay">
                    <div class="photo-date">${formattedDate}</div>
                    <div class="photo-story">${photo.story || 'No story yet...'}</div>
                </div>
            `
            
            // Add click event listener
            photoElement.addEventListener('click', function() {
                handlePhotoClick(photo.id)
            })
            
            galleryGrid.appendChild(photoElement)
        })
        
        galleryGrid.hidden = false
        galleryGridNotFound.hidden = true
    }
}

function handlePhotoClick(photoId) {
    console.log(`Photo with ID ${photoId} was clicked`)
    
    // Find the photo data by ID
    const photo = userPhotos.find(p => p.id === photoId)
    
    if (photo) {
        // Find the index of the clicked photo within the filtered list
        currentPhotoIndex = currentFilteredPhotos.findIndex(p => p.id === photoId)
        
        // Show loading state
        const modalBody = document.querySelector('.modal-body')
        modalBody?.classList.add('loading')
        
        // When the image is done loading, hide the loader
        modalImage.onload = () => {
            modalBody?.classList.remove('loading')
        }
        
        // Populate modal with photo data
        modalImage.src = photo.photo_url
        modalImage.alt = `Photo from ${photo.photo_date}`
        
        // Format the date nicely
        const dateObj = new Date(photo.photo_date)
        const options = { year: 'numeric', month: 'long', day: 'numeric' }
        const formattedDate = dateObj.toLocaleDateString('en-US', options)
        modalDate.textContent = formattedDate
        
        // Set the story content
        modalStory.textContent = photo.story || 'No story added yet.'
        
        // Show the modal
        photoModal.classList.add('visible')
        photoModal.removeAttribute('hidden')
        document.body.style.overflow = 'hidden'
        
        console.log(`Modal opened for photo ID: ${photoId}`)
    } else {
        console.error(`Photo with ID ${photoId} not found`)
    }
}

function setupModalEventListeners() {
    if (!photoModal) return
    
    // Close button
    modalCloseBtn?.addEventListener('click', closeModal)
    
    // Close modal if user clicks outside
    photoModal.addEventListener('click', (e) => {
        if (e.target === photoModal) {
            closeModal()
        }
    })
    
    // Keyboard listeners
    document.addEventListener('keydown', (e) => {
        if (!photoModal.classList.contains('visible')) return
        
        switch(e.key) {
            case 'Escape':
                closeModal()
                break
            case 'ArrowLeft':
                navigatePhotos('prev')
                break
            case 'ArrowRight':
                navigatePhotos('next')
                break
        }
    })
}

function closeModal() {
    if (!photoModal) return
    
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

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn')
    logoutBtn?.addEventListener('click', handleLogout)
}

async function handleLogout() {
    try {
        console.log('Logging out...')
        toast.info('Signing you out...')
        
        await supabase.auth.signOut()
        
        setTimeout(() => {
            window.location.href = 'login.html'
        }, 1000)
    } catch (error) {
        console.error('Logout error:', error)
        window.location.href = 'login.html'
    }
}

function addNewMoment() {
    console.log('Redirecting to upload page...')
    window.location.href = 'upload.html'
}

// Make functions global for onclick handlers
window.addNewMoment = addNewMoment
window.navigatePhotos = navigatePhotos

console.log('Gallery JavaScript loaded!')