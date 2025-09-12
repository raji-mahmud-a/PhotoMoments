// ===================================================
// PhotoMoments - Day 4 Complete JavaScript
// Dynamic Photo Gallery with Month/Year Navigation and Modal
// ===================================================

// ===================================================
// 1. DOM ELEMENT REFERENCES
// ===================================================

// Get the main navigation elements from the HTML
const yearSelect = document.getElementById('yearSelect');        // Year dropdown
const monthSelect = document.getElementById('monthSelect');      // Month dropdown (mobile)
const galleryGrid = document.getElementById('GallerywrapperGrid');  // Container for photo grid
const galleryGridNotFound = document.getElementById('GallerywrapperNotFound'); // Empty state container

// New: Modal element references
const photoModal = document.getElementById('photoModal');
const modalImage = document.getElementById('modalImage');
const modalDate = document.getElementById('modalDate');
const modalStory = document.getElementById('modalStory');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalBody = document.querySelector('.modal-body'); // The main body of the modal

// Global variables for tracking state
let currentPhotoIndex = 0;
let currentFilteredPhotos = [];

// ===================================================
// 2. UTILITY FUNCTIONS
// ===================================================

/**
 * Function to handle "Add Memory" button clicks
 */
const addNewMoment = () => {
    console.log('Add Memory feature coming soon! 🥹🥹');
    alert('Photo upload functionality will be added in Day 6!');
}

/**
 * Closes the photo modal and restores body scrolling
 */
const closeModal = () => {
    photoModal.classList.remove('visible');
    photoModal.hidden = true;
    document.body.style.overflow = ''; // Restores body scrolling
    console.log('Modal closed');
};

/**
 * Navigate to the next or previous photo in the gallery.
 * @param {string} direction - 'next' or 'prev'
 */
const navigatePhotos = (direction) => {
    if (currentFilteredPhotos.length <= 1) return; // Do nothing if there's only one or no photo

    let newIndex = currentPhotoIndex;
    if (direction === 'next') {
        newIndex = (currentPhotoIndex + 1) % currentFilteredPhotos.length;
    } else if (direction === 'prev') {
        // Use a trick to handle negative modulo: (a % n + n) % n
        newIndex = (currentPhotoIndex - 1 + currentFilteredPhotos.length) % currentFilteredPhotos.length;
    }

    const nextPhoto = currentFilteredPhotos[newIndex];
    if (nextPhoto) {
        handlePhotoClick(nextPhoto.id);
    }
    
};

// ===================================================
// 3. SAMPLE PHOTO DATA
// ===================================================

// Sample photos for testing the gallery
const samplePhotos = [
    {
        id: 1,
        src: 'https://picsum.photos/400/300?random=1',
        date: '2024-01-15',
        story: 'Perfect sunset at the beach with friends. The colors were absolutely incredible and we stayed until the stars came out.',
        monthYear: '2024-01'  // Used for filtering by month/year
    },
    {
        id: 2,
        src: 'https://picsum.photos/400/500?random=2',
        date: '2024-01-22',
        story: 'Morning coffee ritual. These quiet moments before the day begins are so precious to me.',
        monthYear: '2024-01'
    },
    {
        id: 3,
        src: 'https://picsum.photos/400/350?random=3',
        date: '2024-02-03',
        story: 'Adventure in the mountains! The view from the top was worth every step of the challenging hike.',
        monthYear: '2024-02'
    },
    {
        id: 4,
        src: 'https://picsum.photos/400/400?random=4',
        date: '2024-02-14',
        story: 'Valentine\'s dinner at home. Sometimes the simple moments are the most romantic.',
        monthYear: '2024-02'
    },
    {
        id: 5,
        src: 'https://picsum.photos/400/280?random=5',
        date: '2024-02-20',
        story: 'Rainy day reading session. Found a cozy corner and lost myself in a great book.',
        monthYear: '2024-02'
    },
    {
        id: 6,
        src: 'https://picsum.photos/400/450?random=6',
        date: '2024-03-05',
        story: 'First flowers of spring! Nature is waking up and everything feels full of possibility.',
        monthYear: '2024-03'
    },
    {
        id: 7,
        src: 'https://picsum.photos/400/320?random=7',
        date: '2024-03-12',
        story: 'Weekend farmers market visit. Fresh produce and the best people watching in town.',
        monthYear: '2024-03'
    },
    {
        id: 8,
        src: 'https://picsum.photos/400/380?random=8',
        date: '2024-03-18',
        story: 'Late night city lights from the rooftop. The city never sleeps and neither do the dreamers.',
        monthYear: '2024-03'
    },
    {
        id: 9,
        src: 'https://picsum.photos/400/360?random=9',
        date: '2024-12-10',
        story: 'Holiday lights downtown. The magic of December never gets old.',
        monthYear: '2024-12'
    },
    {
        id: 10,
        src: 'https://picsum.photos/400/420?random=10',
        date: '2024-12-25',
        story: 'Christmas morning joy. Family, presents, and pure happiness all around.',
        monthYear: '2024-12'
    }
];

// ===================================================
// 4. MAIN GALLERY RENDERING FUNCTION
// ===================================================

/**
 * Main function to render the photo gallery based on selected year and month
 * This is the heart of the application - it filters and displays photos
 * * @param {number|string} year - The selected year (e.g., 2024)
 * @param {number|string} month - The selected month (1-12)
 */
const renderGrid = (year, month) => {
    console.log(`Rendering gallery for Year: ${year}, Month: ${month}`);
    
    // Show the loader and hide the gallery grid immediately
    galleryGridNotFound.hidden = true;
    galleryGrid.innerHTML = '<div class="loader"></div>';
    galleryGrid.hidden = false;
    
    // Simulate a network delay for demonstration purposes
    setTimeout(() => {
        // Ensure month is in two-digit format (01, 02, etc.)
        const formattedMonth = String(month).padStart(2, '0');
        
        // Filter photos that match the selected year and month
        const filteredPhotos = samplePhotos.filter(photo => {
            return photo.monthYear === `${year}-${formattedMonth}`;
        });
        
        // Update the global filtered photos array
        currentFilteredPhotos = filteredPhotos;
        
        // Clear the loader
        galleryGrid.innerHTML = '';

        // Check if we found any photos
        if (filteredPhotos.length === 0) {
            // No photos found - show empty state
            galleryGrid.hidden = true;              
            galleryGridNotFound.hidden = false;     
            console.log('No photos found for this month/year');
        } else {
            // Photos found - display them
            filteredPhotos.forEach(photo => {
                const photoElement = document.createElement('div');
                photoElement.className = 'photo-card';
                photoElement.setAttribute("data-photo-id", `${photo.id}`);
                
                const dateObj = new Date(photo.date);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                const formattedDate = dateObj.toLocaleDateString('en-US', options);
                
                photoElement.innerHTML = `
                    <img src="${photo.src}" alt="A photo from ${photo.date}" loading="lazy">
                    <div class="photo-overlay">
                        <div class="photo-date">${formattedDate}</div>
                        <div class="photo-story">${photo.story}</div>
                    </div>
                `;
                
                // Add click event listener to the photo card
                photoElement.addEventListener('click', function() {
                    handlePhotoClick(photo.id);
                });
                
                galleryGrid.appendChild(photoElement);
            });
            
            galleryGrid.hidden = false;
            galleryGridNotFound.hidden = true;
            console.log(`Successfully rendered ${filteredPhotos.length} photos`);
        }
    }, 500); // 500ms delay to simulate loading
};

/**
 * Handle when a photo is clicked
 * Now opens a modal with the full photo and story
 * @param {number} photoId - The ID of the clicked photo
 */
function handlePhotoClick(photoId) {
    console.log(`Photo with ID ${photoId} was clicked`);
    
    // Find the photo data by ID
    const photo = samplePhotos.find(p => p.id === photoId);
    
    if (photo) {
        // Show loading state and hide the image
        modalBody.classList.add('loading');
        
        // Find the index of the clicked photo within the filtered list
        currentPhotoIndex = currentFilteredPhotos.findIndex(p => p.id === photoId);
        
        // When the image is done loading, hide the loader
        modalImage.onload = () => {
            modalBody.classList.remove('loading');
        };
        
        // Populate modal with photo data
        modalImage.src = photo.src;
        modalImage.alt = `Photo from ${photo.date}`;
        
        // Format the date nicely
        const dateObj = new Date(photo.date);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString('en-US', options);
        modalDate.textContent = formattedDate;
        
        // Set the story content
        modalStory.textContent = photo.story;
        
        // Show the modal
        photoModal.classList.add('visible');
        photoModal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden'; // Prevents scrolling on the body
        
        console.log(`Modal populated and visible for photo ID: ${photoId}`);
    } else {
        console.error(`Photo with ID ${photoId} not found`);
    }
}


// ===================================================
// 5. MONTH NAVIGATION SETUP
// ===================================================

// Create the desktop month navigation bar (pills)
// This will be inserted into the sidebar after the year dropdown
const monthBar = document.createElement('div');
monthBar.className = 'month-bar';
monthBar.setAttribute('role', 'tablist');  // For screen readers/accessibility
yearSelect.parentElement.insertBefore(monthBar, yearSelect.nextSibling);

// ===================================================
// 6. POPULATE YEAR DROPDOWN
// ===================================================

// Get current date information
const now = new Date();
const currentYear = now.getFullYear();    // Current year (e.g., 2024)
const currentMonth = now.getMonth() + 1;  // Current month (1-12, not 0-11)

// Populate years dropdown from current year back to 2000
for (let y = currentYear; y >= 2000; y--) {
    const opt = document.createElement('option');
    opt.value = y;           // Value used in JavaScript
    opt.textContent = y;     // Text shown to user
    yearSelect.appendChild(opt);
}

// Set the year dropdown to show current year by default
yearSelect.value = currentYear;

// ===================================================
// 7. MONTH DATA AND NAVIGATION SETUP
// ===================================================

// Array of month names for creating navigation elements
const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];

// Populate mobile month dropdown
months.forEach((monthName, index) => {
    const option = document.createElement('option');
    option.value = index + 1;    // January = 1, February = 2, etc.
    option.textContent = monthName;  // Full month name
    monthSelect.appendChild(option);
});

// Populate desktop month pills
months.forEach((monthName, index) => {
    const pill = document.createElement('button');
    pill.className = 'month-pill';
    pill.type = 'button';
    pill.dataset.month = index + 1;         // Store month number (1-12)
    pill.textContent = monthName.slice(0,3); // Show abbreviated name (Jan, Feb, etc.)
    pill.title = monthName;                 // Full name appears on hover
    monthBar.appendChild(pill);
});

// ===================================================
// 8. ACTIVE MONTH MANAGEMENT
// ===================================================

/**
 * Set which month is currently active/selected
 * Updates both desktop pills and mobile dropdown to stay in sync
 * * @param {number|string} m - Month number (1-12)
 */
const setActiveMonth = (m) => {
    console.log(`Setting active month to: ${m}`);
    
    // Update desktop month pills
    monthBar.querySelectorAll('.month-pill').forEach(pill => {
        if (Number(pill.dataset.month) === Number(m)) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });
    
    // Update mobile dropdown to match the selected month
    monthSelect.value = String(m);
};

// Set initial active month to current month when page loads
setActiveMonth(currentMonth);

// ===================================================
// 9. EVENT LISTENERS FOR NAVIGATION
// ===================================================

// Handle clicking on desktop month pills
monthBar.addEventListener('click', (e) => {
    const pill = e.target.closest('.month-pill');
    if (!pill) return; 
    
    console.log(`Month pill clicked: ${pill.dataset.month}`);
    
    setActiveMonth(pill.dataset.month);
    renderGrid(yearSelect.value, pill.dataset.month);
    pill.scrollIntoView({behavior:'smooth', inline:'center'});
});

// Handle mobile month dropdown changes
monthSelect.addEventListener('change', (e) => {
    console.log(`Month select changed to: ${e.target.value}`);
    
    setActiveMonth(e.target.value);
    renderGrid(yearSelect.value, monthSelect.value);
});

// Handle year dropdown changes
yearSelect.addEventListener('change', (e) => {
    console.log(`Year select changed to: ${e.target.value}`);
    
    renderGrid(yearSelect.value, monthSelect.value);
});

// ===================================================
// 10. RESPONSIVE DESIGN HANDLING
// ===================================================

/**
 * Update navigation UI based on screen size
 */
function updateMonthUI() {
    if (window.matchMedia('(max-width:900px)').matches) {
        monthSelect.style.display = 'block'; 
        monthBar.style.display = 'none';     
        console.log('Switched to mobile navigation');
    } else {
        monthSelect.style.display = 'none';  
        monthBar.style.display = 'flex';     
        console.log('Switched to desktop navigation');
    }
}

// Run responsive check when page loads and when screen size changes
updateMonthUI();
window.matchMedia('(max-width:900px)').addEventListener('change', updateMonthUI);

// ===================================================
// 11. INITIALIZATION
// ===================================================

/**
 * Initialize the gallery when the page loads
 */
window.addEventListener('DOMContentLoaded', () => {
    console.log('PhotoMoments Day 4 - Initializing...');
    console.log(`Default view: Year ${yearSelect.value}, Month ${currentMonth}`);
    
    // Set month dropdown to current month
    monthSelect.value = currentMonth;
    
    // Render the gallery with current year and month
    renderGrid(yearSelect.value, currentMonth);
    
    console.log('PhotoMoments Day 4 - Initialization complete! 📸');
});

// ===================================================
// 12. ADDITIONAL EVENT LISTENERS
// ===================================================

// Modal close button listener
modalCloseBtn.addEventListener('click', closeModal);

// Close modal if user clicks outside of the content
photoModal.addEventListener('click', (e) => {
    if (e.target === photoModal) {
        closeModal();
    }
});

// Close modal if user presses the Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && photoModal.classList.contains('visible')) {
        closeModal();
    }
});

// Add event listeners for arrow key navigation
document.addEventListener('keydown', (e) => {
    if (photoModal.classList.contains('visible')) {
        if (e.key === 'ArrowRight') {
            navigatePhotos('next');
        } else if (e.key === 'ArrowLeft') {
            navigatePhotos('prev');
        }
    }
});

// Add click listener to "Add Memory" button
document.addEventListener('DOMContentLoaded', () => {
    const addMemoryBtn = document.querySelector('.add-memory-btn');
    if (addMemoryBtn) {
        addMemoryBtn.addEventListener('click', addNewMoment);
        console.log('Add Memory button listener attached');
    }
});

// ===================================================
// 13. UTILITY FUNCTIONS FOR DEBUGGING
// ===================================================

/**
 * Debug function to check current state
 * Call this in browser console: debugPhotoMoments()
 */
function debugPhotoMoments() {
    console.log('=== PhotoMoments Debug Info ===');
    console.log('Current Year:', yearSelect.value);
    console.log('Current Month:', monthSelect.value);
    console.log('Total Photos:', samplePhotos.length);
    console.log('Gallery Container:', galleryGrid);
    console.log('Month Bar:', monthBar);
    console.log('Sample Photos:', samplePhotos);
    
    const currentSelection = `${yearSelect.value}-${String(monthSelect.value).padStart(2, '0')}`;
    const filteredCount = samplePhotos.filter(p => p.monthYear === currentSelection).length;
    console.log(`Photos for current selection (${currentSelection}):`, filteredCount);
    
    console.log('========================');
}

// Make debug function available globally
window.debugPhotoMoments = debugPhotoMoments;
