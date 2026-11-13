const Theme = {
  current: 'system',

  init() {
    const settings = Storage.getSettings();
    this.current = settings.theme || 'system';
    this.apply(this.current);
    this.watchSystem();
    this.bindTopbar();
  },

  apply(theme) {
    this.current = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    document.querySelectorAll('#theme-control .top-control-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  },

  set(theme) {
    if (!['light', 'dark', 'system'].includes(theme)) return;
    this.apply(theme);
    const settings = Storage.getSettings();
    settings.theme = theme;
    Storage.saveSettings(settings);
  },

  bindTopbar() {
    document.querySelectorAll('#theme-control .top-control-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.set(btn.dataset.theme);
      });
    });
  },

  watchSystem() {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', () => {
      if (this.current === 'system') {
        this.apply('system');
      }
    });
  }
};
