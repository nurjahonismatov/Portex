const About = {
  init() {
    document.addEventListener('sectionChanged', (e) => {
      if (e.detail.section === 'about') this.render();
    });
    document.addEventListener('languageChanged', () => {
      if (Navigation.currentSection === 'about') this.render();
    });
  },

  render() {
    const container = document.getElementById('about-content');
    if (!container) return;

    container.innerHTML = `
      <div class="about-hero">
        <div class="about-hero-icon">
          <i data-lucide="user-circle"></i>
        </div>
        <h2 data-i18n="about.heroTitle">${Language.t('about.heroTitle')}</h2>
        <p data-i18n="about.heroDesc">${Language.t('about.heroDesc')}</p>
      </div>

      <div class="about-features">
        <div class="about-feature">
          <div class="about-feature-icon"><i data-lucide="shield"></i></div>
          <h4>${Language.t('about.f1Title')}</h4>
          <p>${Language.t('about.f1Desc')}</p>
        </div>
        <div class="about-feature">
          <div class="about-feature-icon"><i data-lucide="file-text"></i></div>
          <h4>${Language.t('about.f2Title')}</h4>
          <p>${Language.t('about.f2Desc')}</p>
        </div>
        <div class="about-feature">
          <div class="about-feature-icon"><i data-lucide="globe"></i></div>
          <h4>${Language.t('about.f3Title')}</h4>
          <p>${Language.t('about.f3Desc')}</p>
        </div>
      </div>

      <div class="about-note">
        ${Language.t('about.note')}
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  }
};
