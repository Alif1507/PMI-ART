/* ==========================================================================
   PMI ART - MAIN JAVASCRIPT & ANIMATION CONTROLLER
   Architecture: Lenis Smooth Scroll + GSAP 3 + ScrollTrigger + Tab Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. GSAP Plugin Registration
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // 2. Lenis Smooth Scroll Initialization
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    // Synchronize Lenis with GSAP ScrollTrigger Ticker
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    }
  }

  // 3. Tab Navigation Controller
  const navPills = document.querySelectorAll('.nav-pill');
  const pageSections = document.querySelectorAll('.page-section');
  const leaderboardFilters = document.getElementById('leaderboard-filters');
  const heroCtaBtn = document.getElementById('btn-explore');

  function switchTab(targetId) {
    // Update Nav Pills Active State
    navPills.forEach(pill => {
      if (pill.getAttribute('data-target') === targetId) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Show Target Section & Hide Others
    pageSections.forEach(section => {
      if (section.id === targetId) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    // Lock / unlock page scroll depending on active tab
    if (targetId === 'home') {
      document.body.classList.add('home-active');
    } else {
      document.body.classList.remove('home-active');
    }

    // Toggle Leaderboard Filters in Top Header
    if (targetId === 'leaderboard') {
      leaderboardFilters.classList.add('visible');
    } else {
      leaderboardFilters.classList.remove('visible');
    }

    // Reset Lenis Scroll position cleanly
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    // Trigger Section Animations
    runSectionAnimations(targetId);
  }

  // Bind click events to nav pills
  navPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetId = pill.getAttribute('data-target');
      switchTab(targetId);
    });
  });

  // Bind CTA button on Home page to navigate to Events tab
  if (heroCtaBtn) {
    heroCtaBtn.addEventListener('click', () => {
      switchTab('events');
    });
  }

  // Apply home-active on initial load (home is the default tab)
  document.body.classList.add('home-active');
  runSectionAnimations('home');

  // Leaderboard JSON Renderer
  let leaderboardData = null;

  async function loadLeaderboardData() {
    try {
      const response = await fetch('leaderboard.json');
      if (response.ok) {
        leaderboardData = await response.json();
        renderLeaderboard('minggu_ini');
      }
    } catch (e) {
      console.warn('Could not load leaderboard.json:', e);
    }
  }

  function renderLeaderboard(filterKey) {
    if (!leaderboardData || !leaderboardData[filterKey]) return;

    const data = leaderboardData[filterKey];

    // Render Podium (JUARA 1, JUARA 2, JUARA 3)
    if (data.podium) {
      data.podium.forEach(item => {
        const col = document.querySelector(`.juara-${item.rank}`);
        if (!col) return;
        
        const nameEl = col.querySelector('.user-name');
        const scoreEl = col.querySelector('.score-num');
        const avatarEl = col.querySelector('.avatar-wrapper');

        if (nameEl) nameEl.textContent = item.name;
        if (scoreEl) scoreEl.textContent = item.pts;
        if (avatarEl && item.avatar) {
          avatarEl.innerHTML = `<img src="${item.avatar}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        }
      });
    }

    // Render Rank List (Rank 4+)
    const listContainer = document.querySelector('.leaderboard-list');
    if (listContainer && data.ranks) {
      listContainer.innerHTML = data.ranks.map(row => `
        <div class="leaderboard-row">
          <div class="row-left">
            <span class="rank-number">${row.rank}</span>
            <span class="row-user-name">${row.name}</span>
          </div>
          <div class="row-right">
            <span class="score-num">${row.pts}</span>
            <span class="score-unit">Pts</span>
          </div>
        </div>
      `).join('');
    }
  }

  // Filter tabs on Leaderboard view
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filterKey = tab.getAttribute('data-filter');
      renderLeaderboard(filterKey);
    });
  });

  loadLeaderboardData();

  // 4. GSAP UI Entrance Animations
  function runSectionAnimations(sectionId) {
    if (typeof gsap === 'undefined') return;

    if (sectionId === 'home') {
      const heroTl = gsap.timeline();
      heroTl.fromTo('.hero-title', 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }
      )
      .fromTo('.hero-subtitle', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4'
      )
      .fromTo('.hero-cta', 
        { opacity: 0, scale: 0.9 }, 
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.2'
      )
      .fromTo('.hero-char', 
        { opacity: 0, x: 50 }, 
        { opacity: 1, x: 0, duration: 1.0, ease: 'power2.out' }, '-=0.8'
      )
      .fromTo('.hero-ghost', 
        { opacity: 0 }, 
        { opacity: 0.55, duration: 1.2, ease: 'power1.out' }, '-=1.2'
      );
    } 
    else if (sectionId === 'events') {
      const eventsTl = gsap.timeline();
      eventsTl.fromTo('.events-banner', 
        { opacity: 0, scale: 0.96 }, 
        { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }
      )
      .fromTo('.event-card', 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, '-=0.4'
      );
    } 
    else if (sectionId === 'leaderboard') {
      const leaderboardTl = gsap.timeline();
      leaderboardTl.fromTo('.juara-2', 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      )
      .fromTo('.juara-1', 
        { opacity: 0, y: 45 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4'
      )
      .fromTo('.juara-3', 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4'
      )
      .fromTo('.badge-arise', 
        { scale: 0, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, '-=0.2'
      )
      .fromTo('.leaderboard-row', 
        { opacity: 0, x: -30 }, 
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.2'
      );
    }
  }

  // Initial animation call on page load
  runSectionAnimations('home');

  // 5. Interactive Modal for "Bangkitkan" Action
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalClose = document.getElementById('modal-close');
  const modalConfirm = document.getElementById('modal-confirm');
  const bangkitkanBtns = document.querySelectorAll('.btn-bangkitkan');

  bangkitkanBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const eventName = btn.getAttribute('data-event') || 'Tantangan';
      const targetUrl = btn.getAttribute('data-url') || '#';
      
      if (modalTitle && modalDesc) {
        modalTitle.textContent = `Tantangan "${eventName}" Dibangkitkan!`;
        modalDesc.textContent = `Persiapkan karya terbaikmu untuk tantangan "${eventName}". Upload karya kamu langsung ke folder Google Drive pengumpulan.`;
      }
      
      if (modalConfirm) {
        modalConfirm.setAttribute('href', targetUrl);
      }

      if (modalOverlay) {
        modalOverlay.classList.add('active');
      }
    });
  });

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalConfirm) modalConfirm.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

});
