const Contact = {
  init() {
    document.addEventListener('sectionChanged', (e) => {
      if (e.detail.section === 'contact') this.render();
    });
    document.addEventListener('languageChanged', () => {
      if (Navigation.currentSection === 'contact') this.render();
    });
  },

  render() {
    const container = document.getElementById('contact-content');
    if (!container) return;

    container.innerHTML = `
      <div class="about-hero">
        <div class="about-hero-icon"><i data-lucide="mail"></i></div>
        <h2>${Language.t('contact.heroTitle')}</h2>
        <p>${Language.t('contact.heroDesc')}</p>
      </div>
      <div class="about-features">
        <a class="about-feature contact-link-card" href="tel:+998931122716">
          <div class="about-feature-icon"><i data-lucide="phone"></i></div>
          <h4>${Language.t('contact.phone')}</h4>
          <p>+998 93 112 27 16</p>
        </a>
        <a class="about-feature contact-link-card" href="https://t.me/nurjahon_oo9" target="_blank" rel="noopener">
          <div class="about-feature-icon"><i data-lucide="send"></i></div>
          <h4>Telegram</h4>
          <p>@nurjahon_oo9</p>
        </a>
        <a class="about-feature contact-link-card" href="https://instagram.com/_nurjahoon_" target="_blank" rel="noopener">
          <div class="about-feature-icon"><i data-lucide="instagram"></i></div>
          <h4>Instagram</h4>
          <p>@_nurjahoon_</p>
        </a>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }
};
