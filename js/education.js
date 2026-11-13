const Education = {
  editingId: null,

  init() {
    document.addEventListener('sectionChanged', (e) => {
      if (e.detail.section === 'education') this.render();
    });
    document.addEventListener('languageChanged', () => {
      if (Navigation.currentSection === 'education') this.render();
    });
  },

  render() {
    const container = document.getElementById('education-content');
    if (!container) return;

    const list = Storage.getEducation();

    let listHtml = '';
    if (list.length === 0) {
      listHtml = `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="graduation-cap"></i></div>
          <h3 class="empty-state-title">${Language.t('education.empty')}</h3>
          <p class="empty-state-desc">${Language.t('education.emptyDesc')}</p>
          <button class="btn btn-primary" id="add-education-btn">
            <i data-lucide="plus"></i>
            ${Language.t('education.add')}
          </button>
        </div>
      `;
    } else {
      listHtml = `
        <div class="mb-16" style="display:flex;justify-content:flex-end">
          <button class="btn btn-primary" id="add-education-btn">
            <i data-lucide="plus"></i>
            ${Language.t('education.add')}
          </button>
        </div>
        <div class="item-list">
          ${list.map(item => `
            <div class="item-card" data-id="${item.id}">
              <div class="item-content">
                <div class="item-title">${Validation.sanitizeText(item.institution)}</div>
                <div class="item-subtitle">${Validation.sanitizeText(item.degree)}${item.field ? ' · ' + Validation.sanitizeText(item.field) : ''}</div>
                <div class="item-meta">${this.formatDate(item.startDate)} — ${item.endDate ? this.formatDate(item.endDate) : Language.t('common.present')}</div>
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
    const addBtn = document.getElementById('add-education-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.openModal());
    }

    document.querySelectorAll('#education-content .edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.item-card').dataset.id;
        this.openModal(id);
      });
    });

    document.querySelectorAll('#education-content .delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.item-card').dataset.id;
        this.delete(id);
      });
    });
  },

  openModal(id = null) {
    this.editingId = id;
    const item = id ? Storage.getEducation().find(e => e.id === id) : null;

    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    
    document.getElementById('modal-title').textContent = id
      ? Language.t('education.edit')
      : Language.t('education.add');

    document.getElementById('modal-body').innerHTML = `
      <form id="education-form" novalidate>
        <div class="form-group">
          <label class="form-label">${Language.t('education.institution')} *</label>
          <input type="text" name="institution" class="form-input" value="${item ? Validation.sanitizeText(item.institution) : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('education.degree')} *</label>
          <input type="text" name="degree" class="form-input" value="${item ? Validation.sanitizeText(item.degree) : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('education.field')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <input type="text" name="field" class="form-input" value="${item ? Validation.sanitizeText(item.field || '') : ''}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${Language.t('education.startDate')} *</label>
            <input type="month" name="startDate" class="form-input" value="${item ? item.startDate : ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">${Language.t('education.endDate')} <span class="optional">(${Language.t('common.optional')})</span></label>
            <input type="month" name="endDate" class="form-input" value="${item ? (item.endDate || '') : ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('education.description')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <textarea name="description" class="form-textarea" rows="3">${item ? Validation.sanitizeText(item.description || '') : ''}</textarea>
        </div>
      </form>
    `;

    document.getElementById('modal-footer').innerHTML = `
      <button class="btn btn-secondary" id="modal-cancel">${Language.t('common.cancel')}</button>
      <button class="btn btn-primary" id="modal-save">${Language.t('common.save')}</button>
    `;

    overlay.classList.add('active');
    
    document.getElementById('modal-cancel').onclick = () => App.closeModal();
    document.getElementById('modal-save').onclick = () => this.save();
  },

  save() {
    const form = document.getElementById('education-form');
    if (!form) return;

    const data = {
      institution: form.institution.value.trim(),
      degree: form.degree.value.trim(),
      field: form.field.value.trim(),
      startDate: form.startDate.value,
      endDate: form.endDate.value || null,
      description: form.description.value.trim()
    };

    const errors = Validation.validateEducation(data);
    if (Object.keys(errors).length > 0) {
      Validation.showErrors(form, errors);
      return;
    }

    const list = Storage.getEducation();
    if (this.editingId) {
      const idx = list.findIndex(e => e.id === this.editingId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
      }
    } else {
      list.push({ id: Storage.generateId(), ...data });
    }

    // Sort by start date descending
    list.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));

    Storage.saveEducation(list);
    App.closeModal();
    App.showToast(Language.t('education.saved'), 'success');
    this.render();
    document.dispatchEvent(new CustomEvent('dataChanged'));
  },

  delete(id) {
    if (!confirm(Language.t('education.deleteConfirm'))) return;
    const list = Storage.getEducation().filter(e => e.id !== id);
    Storage.saveEducation(list);
    App.showToast(Language.t('education.deleted'), 'success');
    this.render();
    document.dispatchEvent(new CustomEvent('dataChanged'));
  }
};
