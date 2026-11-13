const Experience = {
  editingId: null,

  init() {
    document.addEventListener('sectionChanged', (e) => {
      if (e.detail.section === 'experience') this.render();
    });
    document.addEventListener('languageChanged', () => {
      if (Navigation.currentSection === 'experience') this.render();
    });
  },

  render() {
    const container = document.getElementById('experience-content');
    if (!container) return;

    const list = Storage.getExperience();

    let listHtml = '';
    if (list.length === 0) {
      listHtml = `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="briefcase"></i></div>
          <h3 class="empty-state-title">${Language.t('experience.empty')}</h3>
          <p class="empty-state-desc">${Language.t('experience.emptyDesc')}</p>
          <button class="btn btn-primary" id="add-experience-btn">
            <i data-lucide="plus"></i>
            ${Language.t('experience.add')}
          </button>
        </div>
      `;
    } else {
      listHtml = `
        <div class="mb-16" style="display:flex;justify-content:flex-end">
          <button class="btn btn-primary" id="add-experience-btn">
            <i data-lucide="plus"></i>
            ${Language.t('experience.add')}
          </button>
        </div>
        <div class="item-list">
          ${list.map(item => `
            <div class="item-card" data-id="${item.id}">
              <div class="item-content">
                <div class="item-title">${Validation.sanitizeText(item.position)}</div>
                <div class="item-subtitle">${Validation.sanitizeText(item.company)}</div>
                <div class="item-meta">${this.formatDate(item.startDate)} — ${item.current ? Language.t('experience.present') : (item.endDate ? this.formatDate(item.endDate) : '')}</div>
                ${item.description ? `<div class="item-desc">${Validation.sanitizeText(item.description)}</div>` : ''}
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
    const d = new Date(dateStr + '-01');
    return d.toLocaleDateString(Language.current === 'uz' ? 'uz-UZ' : Language.current === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'short'
    });
  },

  bindEvents() {
    const addBtn = document.getElementById('add-experience-btn');
    if (addBtn) addBtn.addEventListener('click', () => this.openModal());

    document.querySelectorAll('#experience-content .edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openModal(btn.closest('.item-card').dataset.id);
      });
    });

    document.querySelectorAll('#experience-content .delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.delete(btn.closest('.item-card').dataset.id);
      });
    });
  },

  openModal(id = null) {
    this.editingId = id;
    const item = id ? Storage.getExperience().find(e => e.id === id) : null;

    document.getElementById('modal-title').textContent = id
      ? Language.t('experience.edit')
      : Language.t('experience.add');

    document.getElementById('modal-body').innerHTML = `
      <form id="experience-form" novalidate>
        <div class="form-group">
          <label class="form-label">${Language.t('experience.position')} *</label>
          <input type="text" name="position" class="form-input" value="${item ? Validation.sanitizeText(item.position) : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('experience.company')} *</label>
          <input type="text" name="company" class="form-input" value="${item ? Validation.sanitizeText(item.company) : ''}" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${Language.t('experience.startDate')} *</label>
            <input type="month" name="startDate" class="form-input" value="${item ? item.startDate : ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">${Language.t('experience.endDate')} <span class="optional">(${Language.t('common.optional')})</span></label>
            <input type="month" name="endDate" class="form-input" value="${item && !item.current ? (item.endDate || '') : ''}" id="exp-end-date">
          </div>
        </div>
        <div class="form-group">
          <div class="checkbox-group">
            <input type="checkbox" id="exp-current" name="current" ${item && item.current ? 'checked' : ''}>
            <label for="exp-current">${Language.t('experience.current')}</label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('experience.description')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <textarea name="description" class="form-textarea" rows="3">${item ? Validation.sanitizeText(item.description || '') : ''}</textarea>
        </div>
      </form>
    `;

    document.getElementById('modal-footer').innerHTML = `
      <button class="btn btn-secondary" id="modal-cancel">${Language.t('common.cancel')}</button>
      <button class="btn btn-primary" id="modal-save">${Language.t('common.save')}</button>
    `;

    document.getElementById('modal-overlay').classList.add('active');

    const currentCb = document.getElementById('exp-current');
    const endDate = document.getElementById('exp-end-date');
    if (currentCb && endDate) {
      currentCb.addEventListener('change', () => {
        endDate.disabled = currentCb.checked;
        if (currentCb.checked) endDate.value = '';
      });
      if (currentCb.checked) endDate.disabled = true;
    }

    document.getElementById('modal-cancel').onclick = () => App.closeModal();
    document.getElementById('modal-save').onclick = () => this.save();
  },

  save() {
    const form = document.getElementById('experience-form');
    if (!form) return;

    const current = form.current.checked;
    const data = {
      position: form.position.value.trim(),
      company: form.company.value.trim(),
      startDate: form.startDate.value,
      endDate: current ? null : (form.endDate.value || null),
      current: current,
      description: form.description.value.trim()
    };

    const errors = Validation.validateExperience(data);
    if (Object.keys(errors).length > 0) {
      Validation.showErrors(form, errors);
      return;
    }

    const list = Storage.getExperience();
    if (this.editingId) {
      const idx = list.findIndex(e => e.id === this.editingId);
      if (idx !== -1) list[idx] = { ...list[idx], ...data };
    } else {
      list.push({ id: Storage.generateId(), ...data });
    }

    list.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
    Storage.saveExperience(list);
    App.closeModal();
    App.showToast(Language.t('experience.saved'), 'success');
    this.render();
    document.dispatchEvent(new CustomEvent('dataChanged'));
  },

  delete(id) {
    if (!confirm(Language.t('experience.deleteConfirm'))) return;
    Storage.saveExperience(Storage.getExperience().filter(e => e.id !== id));
    App.showToast(Language.t('experience.deleted'), 'success');
    this.render();
    document.dispatchEvent(new CustomEvent('dataChanged'));
  }
};
