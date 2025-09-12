// ===================================================
// PhotoMoments - Day 3 Complete JavaScript
// Dynamic Photo Gallery with Month/Year Navigation
// ===================================================

// ===================================================
// 1. DOM ELEMENT REFERENCES
// ===================================================

// Get the main navigation elements from the HTML
const yearSelect = document.getElementById('yearSelect');        // Year dropdown
const monthSelect = document.getElementById('monthSelect');      // Month dropdown (mobile)
const galleryGrid = document.getElementById('GallerywrapperGrid');  // Container for photo grid
const galleryGridNotFound = document.getElementById('GallerywrapperNotFound'); // Empty state container

// ===================================================
// 2. UTILITY FUNCTIONS
// ===================================================

/**
 * Function to handle "Add Memory" button clicks
 * This will be expanded in Day 6 with actual upload functionality
 */
const addNewMoment = () => {
    console.log('Add Memory feature coming soon! 🥹🥹');
    alert('Photo upload functionality will be added in Day 6!');
}

// ===================================================
// 3. SAMPLE PHOTO DATA
// ===================================================

// Sample photos for testing the gallery
// In Day 6, this will be replaced with Firebase data
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
 * 
 * @param {number|string} year - The selected year (e.g., 2024)
 * @param {number|string} month - The selected month (1-12)
 */
const renderGrid = (year, month) => {
    console.log(`Rendering gallery for Year: ${year}, Month: ${month}`);
    
    // Clear any previously displayed photos
    galleryGrid.innerHTML = '';
  
    // Ensure month is in two-digit format (01, 02, etc.)
    // This is needed because our monthYear format is "YYYY-MM"
    const formattedMonth = String(month).padStart(2, '0');
    
    // Filter photos that match the selected year and month
    const filteredPhotos = samplePhotos.filter(photo => {
        return photo.monthYear === `${year}-${formattedMonth}`;
    });
    
    console.log(`Found ${filteredPhotos.length} photos for ${year}-${formattedMonth}`);
  
    // Check if we found any photos
    if (filteredPhotos.length === 0) {
        // No photos found - show empty state
        galleryGrid.hidden = true;              // Hide the photo grid
        galleryGridNotFound.hidden = false;     // Show "no photos" message
        console.log('No photos found for this month/year');
    } else {
        // Photos found - display them
        
        // Create HTML elements for each photo
        filteredPhotos.forEach(photo => {
            // Create the main photo card container
            const photoElement = document.createElement('div');
            photoElement.className = 'photo-card';
            
            // Add data attributes for identification and interaction
            photoElement.setAttribute("data-photo-id", `${photo.id}`);
            photoElement.id = "photoCard";
            
            // Format the date for display
            // Convert "2024-01-15" to "January 15, 2024"
            const dateObj = new Date(photo.date);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = dateObj.toLocaleDateString('en-US', options);
            
            // Create the HTML structure for the photo card
            // This includes the image and hover overlay with date/story
            photoElement.innerHTML = `
                <img src="${photo.src}" alt="A photo from ${photo.date}" loading="lazy">
                <div class="photo-overlay">
                    <div class="photo-date">${formattedDate}</div>
                    <div class="photo-story">${photo.story}</div>
                </div>
            `;
            
            // Add click event listener to the photo card
            // When clicked, it will show the full story (tomorrow we'll add modal)
            photoElement.addEventListener('click', function() {
                handlePhotoClick(photo.id);
            });
            
            // Add the photo card to the gallery grid
            galleryGrid.appendChild(photoElement);
        });
        
        // Show the gallery grid and hide empty state
        galleryGrid.hidden = false;
        galleryGridNotFound.hidden = true;
        console.log(`Successfully rendered ${filteredPhotos.length} photos`);
    }
};

/**
 * Handle when a photo is clicked
 * Currently shows an alert, tomorrow this will open a modal
 * 
 * @param {number} photoId - The ID of the clicked photo
 */
function handlePhotoClick(photoId) {
    console.log(`Photo with ID ${photoId} was clicked`);
    
    // Find the photo data by ID
    const photo = samplePhotos.find(p => p.id === photoId);
    
    if (photo) {
        // Format the date nicely
        const dateObj = new Date(photo.date);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString('en-US', options);
        
        // Show photo details in an alert (temporary - will be modal tomorrow)
        const message = `Photo from ${formattedDate}\n\n${photo.story}`;
        alert(message);
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
 * 
 * @param {number|string} m - Month number (1-12)
 */
const setActiveMonth = (m) => {
    console.log(`Setting active month to: ${m}`);
    
    // Update desktop month pills
    // Remove 'active' class from all pills, add it to the selected one
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
    // Find the clicked pill (if any)
    const pill = e.target.closest('.month-pill');
    if (!pill) return; // User clicked outside of a pill
    
    console.log(`Month pill clicked: ${pill.dataset.month}`);
    
    // Set the clicked month as active
    setActiveMonth(pill.dataset.month);
    
    // Render the gallery with the new month selection
    renderGrid(yearSelect.value, pill.dataset.month);
    
    // Smooth scroll the clicked pill into view (useful on narrow screens)
    pill.scrollIntoView({behavior:'smooth', inline:'center'});
});

// Handle mobile month dropdown changes
monthSelect.addEventListener('change', (e) => {
    console.log(`Month select changed to: ${e.target.value}`);
    
    // Update the active month display
    setActiveMonth(e.target.value);
    
    // Render the gallery with the new selection
    renderGrid(yearSelect.value, monthSelect.value);
});

// Handle year dropdown changes
yearSelect.addEventListener('change', (e) => {
    console.log(`Year select changed to: ${e.target.value}`);
    
    // Render the gallery with the new year selection
    // Keep the same month that was previously selected
    renderGrid(yearSelect.value, monthSelect.value);
});

// ===================================================
// 10. RESPONSIVE DESIGN HANDLING
// ===================================================

/**
 * Update navigation UI based on screen size
 * Desktop (>900px): Shows month pills
 * Mobile (<=900px): Shows month dropdown
 */
function updateMonthUI() {
    if (window.matchMedia('(max-width:900px)').matches) {
        // Mobile view
        monthSelect.style.display = 'block';  // Show month dropdown
        monthBar.style.display = 'none';      // Hide month pills
        console.log('Switched to mobile navigation');
    } else {
        // Desktop view  
        monthSelect.style.display = 'none';   // Hide month dropdown
        monthBar.style.display = 'flex';      // Show month pills
        console.log('Switched to desktop navigation');
    }
}

// Run responsive check when page loads
updateMonthUI();

// Run responsive check when screen size changes
window.matchMedia('(max-width:900px)').addEventListener('change', updateMonthUI);

// ===================================================
// 11. INITIALIZATION
// ===================================================

/**
 * Initialize the gallery when the page loads
 * This ensures we show photos for the current month/year by default
 */
window.addEventListener('DOMContentLoaded', () => {
    console.log('PhotoMoments Day 3 - Initializing...');
    console.log(`Default view: Year ${yearSelect.value}, Month ${currentMonth}`);
    
    // Set month dropdown to current month
    monthSelect.value = currentMonth;
    
    // Render the gallery with current year and month
    renderGrid(yearSelect.value, currentMonth);
    
    console.log('PhotoMoments Day 3 - Initialization complete! 📸');
    console.log('Features working: Month navigation, photo filtering, responsive design');
    console.log('Coming tomorrow: Modal system for full photo viewing');
});

// ===================================================
// 12. ADDITIONAL EVENT LISTENERS
// ===================================================

// Add click listener to "Add Memory" button if it exists
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
    
    // Count photos by month/year
    const currentSelection = `${yearSelect.value}-${String(monthSelect.value).padStart(2, '0')}`;
    const filteredCount = samplePhotos.filter(p => p.monthYear === currentSelection).length;
    console.log(`Photos for current selection (${currentSelection}):`, filteredCount);
    
    console.log('========================');
}

// Make debug function available globally
window.debugPhotoMoments = debugPhotoMoments;

// ===================================================
// END OF DAY 3 JAVASCRIPT
// ===================================================

console.log('📸 PhotoMoments Day 3 JavaScript loaded successfully!');
console.log('✅ Features: Dynamic gallery, month/year navigation, responsive design');
console.log('🔜 Tomorrow: Modal system for full-screen photo viewing');