const Achievements = {
  editingId: null,
  tempCert: null,

  init() {
    document.addEventListener('sectionChanged', (e) => {
      if (e.detail.section === 'achievements') this.render();
    });
    document.addEventListener('languageChanged', () => {
      if (Navigation.currentSection === 'achievements') this.render();
    });
  },

  render() {
    const container = document.getElementById('achievements-content');
    if (!container) return;

    const list = Storage.getAchievements();

    let listHtml = '';
    if (list.length === 0) {
      listHtml = `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="award"></i></div>
          <h3 class="empty-state-title">${Language.t('achievements.empty')}</h3>
          <p class="empty-state-desc">${Language.t('achievements.emptyDesc')}</p>
          <button class="btn btn-primary" id="add-achievement-btn">
            <i data-lucide="plus"></i>
            ${Language.t('achievements.add')}
          </button>
        </div>
      `;
    } else {
      listHtml = `
        <div class="mb-16" style="display:flex;justify-content:flex-end">
          <button class="btn btn-primary" id="add-achievement-btn">
            <i data-lucide="plus"></i>
            ${Language.t('achievements.add')}
          </button>
        </div>
        <div class="item-list">
          ${list.map(item => `
            <div class="item-card" data-id="${item.id}">
              ${item.certificate ? `<img src="${item.certificate}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0">` : ''}
              <div class="item-content">
                <div class="item-title">${Validation.sanitizeText(item.title)}</div>
                ${item.organization ? `<div class="item-subtitle">${Validation.sanitizeText(item.organization)}</div>` : ''}
                ${item.date ? `<div class="item-meta">${this.formatDate(item.date)}</div>` : ''}
                ${item.description ? `<div class="item-desc">${Validation.sanitizeText(item.description)}</div>` : ''}
                ${item.verificationUrl ? `<div class="item-meta"><a href="${Validation.sanitizeText(item.verificationUrl)}" target="_blank" rel="noopener">${Language.t('achievements.verificationUrl')}</a></div>` : ''}
              </div>
              <div class="item-actions">
                <button class="btn btn-ghost btn-icon btn-sm edit-btn" title="${Language.t('common.edit')}">
                  <i data-lucide="pencil"></i>
                </button>
                <button class="btn btn-ghost btn-icon btn-sm delete-btn" title="${Language.t('common.delete')}">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = listHtml;
    if (window.lucide) lucide.createIcons();
    this.bindEvents();
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + (dateStr.length === 7 ? '-01' : ''));
    return d.toLocaleDateString(Language.current === 'uz' ? 'uz-UZ' : Language.current === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'short'
    });
  },

  bindEvents() {
    const addBtn = document.getElementById('add-achievement-btn');
    if (addBtn) addBtn.addEventListener('click', () => this.openModal());

    document.querySelectorAll('#achievements-content .edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openModal(btn.closest('.item-card').dataset.id);
      });
    });

    document.querySelectorAll('#achievements-content .delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.delete(btn.closest('.item-card').dataset.id);
      });
    });
  },

  openModal(id = null) {
    this.editingId = id;
    this.tempCert = null;
    const item = id ? Storage.getAchievements().find(a => a.id === id) : null;
    if (item) this.tempCert = item.certificate || null;

    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-title').textContent = id
      ? Language.t('achievements.edit')
      : Language.t('achievements.add');

    document.getElementById('modal-body').innerHTML = `
      <form id="achievement-form" novalidate>
        <div class="form-group">
          <label class="form-label">${Language.t('achievements.titleLabel')} *</label>
          <input type="text" name="title" class="form-input" value="${item ? Validation.sanitizeText(item.title) : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('achievements.organization')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <input type="text" name="organization" class="form-input" value="${item ? Validation.sanitizeText(item.organization || '') : ''}">
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('achievements.date')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <input type="month" name="date" class="form-input" value="${item ? (item.date || '') : ''}">
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('achievements.description')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <textarea name="description" class="form-textarea" rows="3">${item ? Validation.sanitizeText(item.description || '') : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('achievements.certificate')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <div class="photo-upload">
            <div class="photo-preview" id="cert-preview" style="border-radius:8px;width:64px;height:64px">
              ${this.tempCert ? `<img src="${this.tempCert}" alt="">` : `<i data-lucide="image"></i>`}
            </div>
            <div class="photo-actions">
              <label class="btn btn-secondary btn-sm">
                <i data-lucide="upload"></i>
                <span>${Language.t('achievements.uploadCert')}</span>
                <input type="file" id="cert-input" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
              </label>
              ${this.tempCert ? `<button type="button" class="btn btn-ghost btn-sm" id="remove-cert">${Language.t('profile.removePhoto')}</button>` : ''}
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('achievements.verificationUrl')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <input type="url" name="verificationUrl" class="form-input" value="${item ? Validation.sanitizeText(item.verificationUrl || '') : ''}" placeholder="https://...">
        </div>
      </form>
    `;

    document.getElementById('modal-footer').innerHTML = `
      <button class="btn btn-secondary" id="modal-cancel">${Language.t('common.cancel')}</button>
      <button class="btn btn-primary" id="modal-save">${Language.t('common.save')}</button>
    `;

    overlay.classList.add('active');
    if (window.lucide) lucide.createIcons();

    document.getElementById('modal-cancel').onclick = () => App.closeModal();
    document.getElementById('modal-save').onclick = () => this.save();

    const certInput = document.getElementById('cert-input');
    if (certInput) {
      certInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          this.tempCert = await Validation.readFileAsDataURL(file);
          const preview = document.getElementById('cert-preview');
          if (preview) preview.innerHTML = `<img src="${this.tempCert}" alt="">`;
        } catch (err) {
          App.showToast(err.message, 'error');
        }
      });
    }

    const removeCert = document.getElementById('remove-cert');
    if (removeCert) {
      removeCert.addEventListener('click', () => {
        this.tempCert = null;
        const preview = document.getElementById('cert-preview');
        if (preview) preview.innerHTML = `<i data-lucide="image"></i>`;
        if (window.lucide) lucide.createIcons();
      });
    }
  },

  save() {
    const form = document.getElementById('achievement-form');
    if (!form) return;

    const data = {
      title: form.title.value.trim(),
      organization: form.organization.value.trim(),
      date: form.date.value || null,
      description: form.description.value.trim(),
      verificationUrl: form.verificationUrl.value.trim(),
      certificate: this.tempCert
    };

    const errors = Validation.validateAchievement(data);
    if (Object.keys(errors).length > 0) {
      Validation.showErrors(form, errors);
      return;
    }

    const list = Storage.getAchievements();
    if (this.editingId) {
      const idx = list.findIndex(a => a.id === this.editingId);
      if (idx !== -1) list[idx] = { ...list[idx], ...data };
    } else {
      list.push({ id: Storage.generateId(), ...data });
    }

    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    Storage.saveAchievements(list);
    App.closeModal();
    App.showToast(Language.t('achievements.saved'), 'success');
    this.render();
    document.dispatchEvent(new CustomEvent('dataChanged'));
  },

  delete(id) {
    if (!confirm(Language.t('achievements.deleteConfirm'))) return;
    const list = Storage.getAchievements().filter(a => a.id !== id);
    Storage.saveAchievements(list);
    App.showToast(Language.t('achievements.deleted'), 'success');
    this.render();
    document.dispatchEvent(new CustomEvent('dataChanged'));
  }
};
