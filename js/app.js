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

  // Utility to create sample images with randomized spans
  function createGridItems(count = 12) {
    galleryGrid.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const div = document.createElement('div');
      div.className = 'gridImageItem';
      // Create image element
      const img = document.createElement('img');
      img.src = `https://picsum.photos/400/600?random=${Math.floor(Math.random()*1000) + i}`;
      img.alt = `Image ${i}`;
      // compute a random span - biased distribution: more small, some tall
      const rand = Math.random();
      let span;
      if (rand < 0.6) span = 12 + Math.floor(Math.random()*8);    // short-medium (12-19 rows)
      else if (rand < 0.9) span = 20 + Math.floor(Math.random()*16); // medium-long (20-35 rows)
      else span = 36 + Math.floor(Math.random()*24); // tall (36-59 rows)
      // Set grid-row-end to span N
      div.style.gridRowEnd = `span ${span}`;
      // attach image
      div.appendChild(img);
      galleryGrid.appendChild(div);
    }
  }

  // Rebuild grid (example entry point)
  function rebuildGrid() {
    // optionally use yearSelect.value and monthSelect.value for filtering when data available
    createGridItems(14 + Math.floor(Math.random()*8));
    // optional: apply small reveal animation
    requestAnimationFrame(()=> {
      galleryGrid.querySelectorAll('.gridImageItem').forEach((el, idx) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
        setTimeout(() => {
          el.style.transition = 'opacity .45s ease, transform .45s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 40 * idx);
      });
    });
  }

  // initial population
  rebuildGrid();

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
