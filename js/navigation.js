const Navigation = {
  currentSection: 'dashboard',

  init() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        if (section) this.navigate(section);
      });
    });

    // Mobile menu
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }

    // Close mobile menu on nav click
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
        }
      });
    });

    // Handle hash on load
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(`section-${hash}`)) {
      this.navigate(hash, false);
    } else {
      this.navigate('dashboard', false);
    }
  },

  navigate(section, updateHash = true) {
    if (!document.getElementById(`section-${section}`)) return;

    this.currentSection = section;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
    });

    // Update sections
    document.querySelectorAll('.section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `section-${section}`);
    });

    // Update page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
      pageTitle.textContent = Language.t(`nav.${section}`);
    }

    if (updateHash) {
      history.replaceState(null, '', `#${section}`);
    }

    // Trigger section-specific refresh
    document.dispatchEvent(new CustomEvent('sectionChanged', { detail: { section } }));
  }
};
