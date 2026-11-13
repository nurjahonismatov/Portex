const Settings = {
  init() {
    document.addEventListener('sectionChanged', (e) => {
      if (e.detail.section === 'settings') this.render();
    });
    document.addEventListener('languageChanged', () => {
      if (Navigation.currentSection === 'settings') this.render();
    });
  },


  render() {
    const container = document.getElementById('settings-content');
    if (!container) return;
    const lock = Auth.getAppLock();
    const user = Auth.getCurrentUser();

    container.innerHTML = `
      <div class="settings-group">
        <div class="settings-group-title">${Language.t('settings.account')}</div>
        <div class="settings-card">
          <div class="settings-item">
            <div class="settings-item-info">
              <h4>${user?.name || 'User'}</h4>
              <p>${user?.email || user?.phone || ''}</p>
            </div>
            <button class="btn btn-secondary" id="logout-btn">
              <i data-lucide="log-out"></i>
              ${Language.t('auth.logout')}
            </button>
          </div>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">${Language.t('settings.security')}</div>
        <div class="settings-card">
          <div class="settings-item">
            <div class="settings-item-info">
              <h4>${Language.t('settings.appLock')}</h4>
              <p>${Language.t('settings.appLockDesc')}</p>
            </div>
            ${lock && lock.enabled
              ? `<button class="btn btn-secondary" id="disable-lock-btn">${Language.t('settings.disableLock')}</button>`
              : `<button class="btn btn-primary" id="enable-lock-btn">${Language.t('settings.enableLock')}</button>`
            }
          </div>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">${Language.t('settings.data')}</div>
        <div class="settings-card">
          <div class="settings-item">
            <div class="settings-item-info">
              <h4>${Language.t('settings.export')}</h4>
              <p>${Language.t('settings.dataDesc')}</p>
            </div>
            <button class="btn btn-secondary" id="export-btn">
              <i data-lucide="download"></i>
              ${Language.t('settings.export')}
            </button>
          </div>
          <div class="settings-item">
            <div class="settings-item-info">
              <h4>${Language.t('settings.import')}</h4>
              <p>${Language.t('settings.dataDesc')}</p>
            </div>
            <label class="btn btn-secondary">
              <i data-lucide="upload"></i>
              ${Language.t('settings.import')}
              <input type="file" id="import-input" accept=".json,application/json" hidden>
            </label>
          </div>
          <div class="settings-item">
            <div class="settings-item-info">
              <h4>${Language.t('settings.clear')}</h4>
              <p>${Language.t('settings.clearConfirm')}</p>
            </div>
            <button class="btn btn-danger" id="clear-btn">
              <i data-lucide="trash-2"></i>
              ${Language.t('settings.clear')}
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    this.bindEvents();
  },

  bindEvents() {
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      sessionStorage.removeItem('myprofile_unlocked');
      Auth.logout();
    });

    document.getElementById('enable-lock-btn')?.addEventListener('click', () => {
      const pw = prompt(Language.t('settings.lockPrompt'));
      if (pw === null) return;
      Auth.setAppLock(pw).then(() => {
        App.showToast(Language.t('settings.lockEnabled'), 'success');
        this.render();
      }).catch(err => App.showToast(err.message, 'error'));
    });

    document.getElementById('disable-lock-btn')?.addEventListener('click', () => {
      const pw = prompt(Language.t('settings.unlockPrompt'));
      if (pw === null) return;
      Auth.unlockApp(pw).then(ok => {
        if (!ok) {
          App.showToast(Language.t('auth.wrongPassword'), 'error');
          return;
        }
        Auth.disableAppLock();
        sessionStorage.removeItem('myprofile_unlocked');
        App.showToast(Language.t('settings.lockDisabled'), 'success');
        this.render();
      });
    });

    document.getElementById('export-btn')?.addEventListener('click', () => Export.exportJSON());
    const importInput = document.getElementById('import-input');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) Export.importJSON(file);
        e.target.value = '';
      });
    }
    document.getElementById('clear-btn')?.addEventListener('click', () => {
      if (confirm(Language.t('settings.clearConfirm'))) {
        Storage.clearAll();
        App.showToast(Language.t('settings.cleared'), 'success');
        document.dispatchEvent(new CustomEvent('dataChanged'));
        App.updateSidebarUser();
        Navigation.navigate('dashboard');
      }
    });
  }
};

