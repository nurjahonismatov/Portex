const App = {
  async init() {
    await Language.init();
    Theme.init();

    // Auth first
    const ok = await Auth.boot();
    if (!ok) {
      // still bind theme/lang on auth screens via body
      this.bindLanguageSelect();
      if (window.lucide) lucide.createIcons();
      return;
    }

    this.startApp();
  },

  startApp() {
    Navigation.init();
    Dashboard.init();
    Profile.init();
    Education.init();
    Achievements.init();
    Skills.init();
    Experience.init();
    if (typeof Projects !== 'undefined') Projects.init();
    Resume.init();
    Settings.init();
    About.init();
    if (typeof Vault !== 'undefined') Vault.init();
    if (typeof Contact !== 'undefined') Contact.init();

    Language.applyToDOM();
    this.updateSidebarUser();
    this.bindLanguageSelect();
    Dashboard.render();

    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
    if (window.lucide) lucide.createIcons();
  },

  onAuthSuccess() {
    this.startApp();
  },

  bindLanguageSelect() {
    const select = document.getElementById('lang-select');
    if (!select) return;
    select.value = Language.current;
    select.onchange = async () => {
      await Language.setLanguage(select.value);
      select.value = Language.current;
      if (!Auth.isLoggedIn() || (Auth.isAppLocked() && sessionStorage.getItem('myprofile_unlocked') !== '1')) {
        if (!Auth.isLoggedIn()) Auth.renderAuth();
        else Auth.renderLock();
      }
      if (window.lucide) lucide.createIcons();
    };
    document.addEventListener('languageChanged', () => {
      if (select) select.value = Language.current;
    });
  },

  updateSidebarUser() {
    const profile = Storage.getProfile();
    const authUser = Auth.getCurrentUser();
    const nameEl = document.getElementById('sidebar-user-name');
    const titleEl = document.getElementById('sidebar-user-title');
    const avatarEl = document.getElementById('sidebar-user-avatar');
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || authUser?.name || '';
    if (nameEl) nameEl.textContent = fullName || Language.t('app.name');
    if (titleEl) titleEl.textContent = profile.title || authUser?.email || authUser?.phone || Language.t('app.tagline');
    if (avatarEl) {
      if (profile.photo) avatarEl.innerHTML = `<img src="${profile.photo}" alt="">`;
      else {
        avatarEl.innerHTML = `<i data-lucide="user"></i>`;
        if (window.lucide) lucide.createIcons();
      }
    }
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon"><i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i></div>
      <div class="toast-message">${Validation.sanitizeText(message)}</div>
      <button class="toast-close"><i data-lucide="x"></i></button>
    `;
    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    const close = () => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 200); };
    toast.querySelector('.toast-close').addEventListener('click', close);
    setTimeout(close, 4000);
  },

  closeModal() {
    document.getElementById('modal-overlay')?.classList.remove('active');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
