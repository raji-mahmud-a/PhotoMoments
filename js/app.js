const yearSelect = document.getElementById('yearSelect');
const monthSelect = document.getElementById('monthSelect');
const galleryGrid = document.getElementById('GallerywrapperGrid');
const galleryGridNotFound = document.getElementById('GallerywrapperNotFound');

const samplePhotos = [
    {
        id: 1,
        src: 'https://picsum.photos/400/300?random=1',
        date: '2024-01-15',
        story: 'Perfect sunset at the beach with friends. The colors were absolutely incredible and we stayed until the stars came out.',
        monthYear: '2024-01'
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

const renderGrid = (year, month) => {
    // Clear any previous photos
    galleryGrid.innerHTML = '';
  
    // Ensure month is in two-digit format
    const formattedMonth = String(month).padStart(2, '0');
    const filteredPhotos = samplePhotos.filter(photo => photo.monthYear === `${year}-${formattedMonth}`);
  
    if (filteredPhotos.length === 0) {
        galleryGrid.hidden = true;
        galleryGridNotFound.hidden = false;
    } else {
        filteredPhotos.forEach(photo => {
            const photoElement = document.createElement('div');
            photoElement.className = 'photo-card';
  
            // Get the date object and format it correctly
            const dateObj = new Date(photo.date);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = dateObj.toLocaleDateString('en-US', options);
  
            photoElement.innerHTML = `
                <img src="${photo.src}" alt="A photo from ${photo.date}">
                <div class="photo-overlay">
                    <div class="photo-date">${formattedDate}</div>
                    <div class="photo-story">${photo.story}</div>
                </div>
            `;
            galleryGrid.appendChild(photoElement);
        });
        galleryGrid.hidden = false;
        galleryGridNotFound.hidden = true;
    }
};

// All other parts of your code
// Create desktop month bar and insert after yearSelect in aside
const monthBar = document.createElement('div');
monthBar.className = 'month-bar';
monthBar.setAttribute('role', 'tablist');
yearSelect.parentElement.insertBefore(monthBar, yearSelect.nextSibling);

const buildGrid = (month, year) => {
    console.log(month, year);
};

// Populate years (2000..current)
const now = new Date();
const currentYear = now.getFullYear();
for (let y = currentYear; y >= 2000; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
}
yearSelect.value = currentYear;

// Months data
const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];

// Populate month select (mobile)
months.forEach((m, idx) => {
    const o = document.createElement('option');
    o.value = idx + 1;
    o.textContent = m;
    monthSelect.appendChild(o);
});

// Populate month bar (desktop)
months.forEach((m, idx) => {
    const pill = document.createElement('button');
    pill.className = 'month-pill';
    pill.type = 'button';
    pill.dataset.month = idx + 1;
    pill.textContent = m.slice(0,3); // compact label
    pill.title = m;
    monthBar.appendChild(pill);
});

// set initial active month to current
const currentMonth = now.getMonth() + 1;
const setActiveMonth = (m) => {
    // update pills
    monthBar.querySelectorAll('.month-pill').forEach(p => {
        p.classList.toggle('active', Number(p.dataset.month) === Number(m));
    });
    // update select (keeps mobile in sync)
    monthSelect.value = (m);
};
setActiveMonth(currentMonth);

// pill click handling
monthBar.addEventListener('click', (e) => {
    const pill = e.target.closest('.month-pill');
    if (!pill) return;
    setActiveMonth(pill.dataset.month);
    // You must add this call to render the photos
    renderGrid(yearSelect.value, pill.dataset.month);
    // animate scroll to show clicked pill nicely
    pill.scrollIntoView({behavior:'smooth', inline:'center'});
});

// keep selects in sync with pill clicks
monthSelect.addEventListener('change', (e) => {
    setActiveMonth(e.target.value);
    // Corrected call to renderGrid
    renderGrid(yearSelect.value, monthSelect.value);
});

yearSelect.addEventListener('change', (e) => {
    // Corrected call to renderGrid
    renderGrid(yearSelect.value, monthSelect.value);
});

// Optional: reflow on window resize to ensure layout looks good
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
    // if you want to recalc spans based on width you can rebuild
    // rebuildGrid();
    }, 200);
});

// Small UX: show/hide monthSelect vs monthBar based on width on load
function updateMonthUI() {
    if (window.matchMedia('(max-width:900px)').matches) {
        monthSelect.style.display = 'block';
        monthBar.style.display = 'none';
    } else {
        monthSelect.style.display = 'none';
        monthBar.style.display = 'flex';
    }
}
updateMonthUI();
window.matchMedia('(max-width:900px)').addEventListener('change', updateMonthUI);

// 🐞 The fix: Call renderGrid on page load with the default values
window.addEventListener('DOMContentLoaded', () => {
  renderGrid(yearSelect.value, monthSelect.value);
});
