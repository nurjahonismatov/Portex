const Language = {
  current: 'en',
  translations: {},

  async init() {
    const settings = Storage.getSettings();
    // First-time users: English
    if (!settings.language) {
      settings.language = 'en';
      Storage.saveSettings(settings);
    }
    this.current = settings.language || 'en'; // default English
    await this.load(this.current);
  },

  async load(lang) {
    try {
      const response = await fetch(`locales/${lang}.json`);
      if (!response.ok) throw new Error('Failed to load locale');
      this.translations = await response.json();
      this.current = lang;
      return true;
    } catch (e) {
      console.error('Language load error:', e);
      if (lang !== 'en') {
        return this.load('en');
      }
      return false;
    }
  },

  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    if (typeof value !== 'string') return key;
    return value.replace(/\{(\w+)\}/g, (_, p) => params[p] !== undefined ? params[p] : `{${p}}`);
  },

  async setLanguage(lang) {
    if (!['en', 'uz', 'ru'].includes(lang)) return false;
    const ok = await this.load(lang);
    if (ok) {
      const settings = Storage.getSettings();
      settings.language = lang;
      Storage.saveSettings(settings);
      this.applyToDOM();
      document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
    return ok;
  },

  applyToDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.hasAttribute('placeholder')) {
          el.placeholder = translation;
        }
      } else {
        el.textContent = translation;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = this.t(el.getAttribute('data-i18n-placeholder'));
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = this.t(el.getAttribute('data-i18n-title'));
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', this.t(el.getAttribute('data-i18n-aria')));
    });

    // Update page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
      const activeNav = document.querySelector('.nav-item.active');
      if (activeNav) {
        const section = activeNav.dataset.section;
        pageTitle.textContent = this.t(`nav.${section}`);
      }
    }
  },

  getLevelLabel(level) {
    const map = {
      beginner: 'skills.beginner',
      intermediate: 'skills.intermediate',
      advanced: 'skills.advanced',
      fluent: 'skills.fluent',
      native: 'skills.native'
    };
    return this.t(map[level] || level);
  }
};
