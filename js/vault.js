const Vault = {
  editingId: null,

  init() {
    document.addEventListener('sectionChanged', (e) => {
      if (e.detail.section === 'vault') this.render();
    });
    document.addEventListener('languageChanged', () => {
      if (Navigation.currentSection === 'vault') this.render();
    });
  },

  getList() {
    return Storage.getVault();
  },

  saveList(list) {
    return Storage.saveVault(list);
  },

  render() {
    const container = document.getElementById('vault-content');
    if (!container) return;
    const list = this.getList();

    let body = '';
    if (list.length === 0) {
      body = `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="key-round"></i></div>
          <h3 class="empty-state-title">${Language.t('vault.empty')}</h3>
          <p class="empty-state-desc">${Language.t('vault.emptyDesc')}</p>
          <button class="btn btn-primary" id="add-vault-btn"><i data-lucide="plus"></i> ${Language.t('vault.add')}</button>
        </div>
      `;
    } else {
      body = `
        <div class="vault-warning glass-panel mb-16">
          <i data-lucide="shield-alert"></i>
          <p>${Language.t('vault.warning')}</p>
        </div>
        <div class="mb-16" style="display:flex;justify-content:flex-end">
          <button class="btn btn-primary" id="add-vault-btn"><i data-lucide="plus"></i> ${Language.t('vault.add')}</button>
        </div>
        <div class="item-list">
          ${list.map(item => `
            <div class="item-card vault-item" data-id="${item.id}">
              <div class="item-content">
                <div class="item-title">${Validation.sanitizeText(item.title)}</div>
                <div class="item-subtitle">${Validation.sanitizeText(item.username || '')}</div>
                <div class="item-meta vault-pass-row">
                  <span class="vault-pass" data-hidden="1">••••••••</span>
                  <button type="button" class="btn btn-ghost btn-sm toggle-pass">${Language.t('vault.show')}</button>
                  <button type="button" class="btn btn-ghost btn-sm copy-pass">${Language.t('vault.copy')}</button>
                </div>
                ${item.notes ? `<div class="item-desc">${Validation.sanitizeText(item.notes)}</div>` : ''}
                ${item.url ? `<div class="item-meta"><a href="${Validation.sanitizeText(item.url.startsWith('http') ? item.url : 'https://' + item.url)}" target="_blank" rel="noopener">${Validation.sanitizeText(item.url)}</a></div>` : ''}
              </div>
              <div class="item-actions">
                <button class="btn btn-ghost btn-icon btn-sm edit-btn"><i data-lucide="pencil"></i></button>
                <button class="btn btn-ghost btn-icon btn-sm delete-btn"><i data-lucide="trash-2"></i></button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = body;
    if (window.lucide) lucide.createIcons();
    this.bindEvents(list);
  },

  bindEvents(list) {
    document.getElementById('add-vault-btn')?.addEventListener('click', () => this.openModal());

    document.querySelectorAll('#vault-content .edit-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openModal(btn.closest('.vault-item').dataset.id));
    });
    document.querySelectorAll('#vault-content .delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm(Language.t('vault.deleteConfirm'))) return;
        const id = btn.closest('.vault-item').dataset.id;
        this.saveList(this.getList().filter(i => i.id !== id));
        App.showToast(Language.t('vault.deleted'), 'success');
        this.render();
      });
    });

    document.querySelectorAll('#vault-content .toggle-pass').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.vault-item');
        const id = row.dataset.id;
        const item = list.find(i => i.id === id);
        const span = row.querySelector('.vault-pass');
        if (span.dataset.hidden === '1') {
          span.textContent = item.password || '';
          span.dataset.hidden = '0';
          btn.textContent = Language.t('vault.hide');
        } else {
          span.textContent = '••••••••';
          span.dataset.hidden = '1';
          btn.textContent = Language.t('vault.show');
        }
      });
    });

    document.querySelectorAll('#vault-content .copy-pass').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('.vault-item').dataset.id;
        const item = list.find(i => i.id === id);
        try {
          await navigator.clipboard.writeText(item.password || '');
          App.showToast(Language.t('toast.copied'), 'success');
        } catch {
          App.showToast(Language.t('toast.error'), 'error');
        }
      });
    });
  },

  openModal(id = null) {
    this.editingId = id;
    const item = id ? this.getList().find(i => i.id === id) : null;
    document.getElementById('modal-title').textContent = id ? Language.t('vault.edit') : Language.t('vault.add');
    document.getElementById('modal-body').innerHTML = `
      <form id="vault-form" novalidate>
        <div class="form-group">
          <label class="form-label">${Language.t('vault.titleLabel')} *</label>
          <input type="text" name="title" class="form-input" value="${item ? Validation.sanitizeText(item.title) : ''}" placeholder="Gmail, GitHub..." required>
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('vault.username')}</label>
          <input type="text" name="username" class="form-input" value="${item ? Validation.sanitizeText(item.username || '') : ''}" autocomplete="off">
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('vault.password')}</label>
          <input type="text" name="password" class="form-input" value="${item ? Validation.sanitizeText(item.password || '') : ''}" autocomplete="off">
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('vault.url')}</label>
          <input type="url" name="url" class="form-input" value="${item ? Validation.sanitizeText(item.url || '') : ''}" placeholder="https://">
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('vault.notes')}</label>
          <textarea name="notes" class="form-textarea" rows="2">${item ? Validation.sanitizeText(item.notes || '') : ''}</textarea>
        </div>
      </form>
    `;
    document.getElementById('modal-footer').innerHTML = `
      <button class="btn btn-secondary" id="modal-cancel">${Language.t('common.cancel')}</button>
      <button class="btn btn-primary" id="modal-save">${Language.t('common.save')}</button>
    `;
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById('modal-cancel').onclick = () => App.closeModal();
    document.getElementById('modal-save').onclick = () => this.save();
  },

  save() {
    const form = document.getElementById('vault-form');
    if (!form) return;
    const data = {
      title: form.title.value.trim(),
      username: form.username.value.trim(),
      password: form.password.value,
      url: form.url.value.trim(),
      notes: form.notes.value.trim()
    };
    if (!data.title) {
      Validation.showErrors(form, { title: Language.t('validation.required') });
      return;
    }
    const list = this.getList();
    if (this.editingId) {
      const idx = list.findIndex(i => i.id === this.editingId);
      if (idx !== -1) list[idx] = { ...list[idx], ...data };
    } else {
      list.unshift({ id: Storage.generateId(), ...data });
    }
    this.saveList(list);
    App.closeModal();
    App.showToast(Language.t('vault.saved'), 'success');
    this.render();
  }
};
