document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const yearSelect = document.getElementById('yearSelect');
  const monthSelect = document.getElementById('monthSelect');
  const galleryGrid = document.getElementById('GallerywrapperGrid');

  // Create desktop month bar and insert after yearSelect in aside
  const monthBar = document.createElement('div');
  monthBar.className = 'month-bar';
  monthBar.setAttribute('role', 'tablist');
  yearSelect.parentElement.insertBefore(monthBar, yearSelect.nextSibling);


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
    monthSelect.value = String(m);
  };
  setActiveMonth(currentMonth);

  // pill click handling
  monthBar.addEventListener('click', (e) => {
    const pill = e.target.closest('.month-pill');
    if (!pill) return;
    setActiveMonth(pill.dataset.month);
    // you could filter images by month/year here
    // animate scroll to show clicked pill nicely
    pill.scrollIntoView({behavior:'smooth', inline:'center'});
  });

  // keep selects in sync with pill clicks
  monthSelect.addEventListener('change', (e) => {
    setActiveMonth(e.target.value);
  });

  yearSelect.addEventListener('change', (e) => {
    // placeholder: fetch or filter photos for selected year
    rebuildGrid(); // re-create sample grid for demonstration
  });
  
  let ImageData = {}

  // Utility to create sample images with randomized spans
  

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
});
