const Projects = {
  editingId: null,
  tempImage: null,

  init() {
    document.addEventListener('sectionChanged', (e) => {
      if (e.detail.section === 'projects') this.render();
    });
    document.addEventListener('languageChanged', () => {
      if (Navigation.currentSection === 'projects') this.render();
    });
  },

  render() {
    const container = document.getElementById('projects-content');
    if (!container) return;

    const list = Storage.getProjects();

    let listHtml = '';
    if (list.length === 0) {
      listHtml = `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="folder-kanban"></i></div>
          <h3 class="empty-state-title">${Language.t('projects.empty')}</h3>
          <p class="empty-state-desc">${Language.t('projects.emptyDesc')}</p>
          <button class="btn btn-primary" id="add-project-btn">
            <i data-lucide="plus"></i>
            ${Language.t('projects.add')}
          </button>
        </div>
      `;
    } else {
      listHtml = `
        <div class="mb-16" style="display:flex;justify-content:flex-end">
          <button class="btn btn-primary" id="add-project-btn">
            <i data-lucide="plus"></i>
            ${Language.t('projects.add')}
          </button>
        </div>
        <div class="projects-grid">
          ${list.map(item => this.cardHtml(item)).join('')}
        </div>
      `;
    }

    container.innerHTML = listHtml;
    if (window.lucide) lucide.createIcons();
    this.bindEvents();
  },

  cardHtml(item) {
    const hasUrl = item.url && item.url.trim();
    const tech = (item.technologies || '').split(',').map(t => t.trim()).filter(Boolean);
    return `
      <div class="project-card ${hasUrl ? 'is-clickable' : ''}" data-id="${item.id}" data-url="${hasUrl ? Validation.sanitizeText(item.url) : ''}" role="${hasUrl ? 'link' : 'article'}" tabindex="${hasUrl ? '0' : '-1'}">
        ${item.image ? `<div class="project-card-image"><img src="${item.image}" alt=""></div>` : `
          <div class="project-card-image project-card-placeholder">
            <i data-lucide="folder-kanban"></i>
          </div>
        `}
        <div class="project-card-body">
          <div class="project-card-top">
            <h3 class="project-card-title">${Validation.sanitizeText(item.title)}</h3>
            <div class="item-actions" onclick="event.stopPropagation()">
              <button class="btn btn-ghost btn-icon btn-sm edit-btn" title="${Language.t('common.edit')}">
                <i data-lucide="pencil"></i>
              </button>
              <button class="btn btn-ghost btn-icon btn-sm delete-btn" title="${Language.t('common.delete')}">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
          ${item.description ? `<p class="project-card-desc">${Validation.sanitizeText(item.description)}</p>` : ''}
          ${tech.length ? `
            <div class="project-tech">
              ${tech.map(t => `<span class="project-tech-tag">${Validation.sanitizeText(t)}</span>`).join('')}
            </div>
          ` : ''}
          ${hasUrl ? `
            <div class="project-card-link">
              <i data-lucide="external-link"></i>
              <span>${Language.t('projects.openProject')}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  bindEvents() {
    const addBtn = document.getElementById('add-project-btn');
    if (addBtn) addBtn.addEventListener('click', () => this.openModal());

    document.querySelectorAll('#projects-content .edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openModal(btn.closest('.project-card').dataset.id);
      });
    });

    document.querySelectorAll('#projects-content .delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.delete(btn.closest('.project-card').dataset.id);
      });
    });

    // Click on card → open project URL
    document.querySelectorAll('#projects-content .project-card.is-clickable').forEach(card => {
      const open = () => {
        const url = card.dataset.url;
        if (!url) return;
        let href = url;
        if (!/^https?:\/\//i.test(href)) href = 'https://' + href;
        window.open(href, '_blank', 'noopener,noreferrer');
      };
      card.addEventListener('click', open);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });
  },

  openModal(id = null) {
    this.editingId = id;
    this.tempImage = null;
    const item = id ? Storage.getProjects().find(p => p.id === id) : null;
    if (item) this.tempImage = item.image || null;

    document.getElementById('modal-title').textContent = id
      ? Language.t('projects.edit')
      : Language.t('projects.add');

    document.getElementById('modal-body').innerHTML = `
      <form id="project-form" novalidate>
        <div class="form-group">
          <label class="form-label">${Language.t('projects.titleLabel')} *</label>
          <input type="text" name="title" class="form-input" value="${item ? Validation.sanitizeText(item.title) : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('projects.description')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <textarea name="description" class="form-textarea" rows="3">${item ? Validation.sanitizeText(item.description || '') : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('projects.technologies')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <input type="text" name="technologies" class="form-input" value="${item ? Validation.sanitizeText(item.technologies || '') : ''}" placeholder="${Language.t('projects.techPlaceholder')}">
          <div class="form-hint">${Language.t('projects.techHint')}</div>
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('projects.url')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <input type="url" name="url" class="form-input" value="${item ? Validation.sanitizeText(item.url || '') : ''}" placeholder="https://...">
          <div class="form-hint">${Language.t('projects.urlHint')}</div>
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('projects.image')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <div class="photo-upload">
            <div class="photo-preview" id="project-img-preview" style="border-radius:12px;width:96px;height:64px">
              ${this.tempImage ? `<img src="${this.tempImage}" alt="">` : `<i data-lucide="image"></i>`}
            </div>
            <div class="photo-actions">
              <label class="btn btn-secondary btn-sm">
                <i data-lucide="upload"></i>
                <span>${Language.t('projects.uploadImage')}</span>
                <input type="file" id="project-img-input" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
              </label>
              ${this.tempImage ? `<button type="button" class="btn btn-ghost btn-sm" id="remove-project-img">${Language.t('profile.removePhoto')}</button>` : ''}
            </div>
          </div>
        </div>
      </form>
    `;

    document.getElementById('modal-footer').innerHTML = `
      <button class="btn btn-secondary" id="modal-cancel">${Language.t('common.cancel')}</button>
      <button class="btn btn-primary" id="modal-save">${Language.t('common.save')}</button>
    `;

    document.getElementById('modal-overlay').classList.add('active');
    if (window.lucide) lucide.createIcons();

    document.getElementById('modal-cancel').onclick = () => App.closeModal();
    document.getElementById('modal-save').onclick = () => this.save();

    const imgInput = document.getElementById('project-img-input');
    if (imgInput) {
      imgInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          this.tempImage = await Validation.readFileAsDataURL(file);
          const preview = document.getElementById('project-img-preview');
          if (preview) preview.innerHTML = `<img src="${this.tempImage}" alt="">`;
        } catch (err) {
          App.showToast(err.message, 'error');
        }
      });
    }

    const removeImg = document.getElementById('remove-project-img');
    if (removeImg) {
      removeImg.addEventListener('click', () => {
        this.tempImage = null;
        const preview = document.getElementById('project-img-preview');
        if (preview) preview.innerHTML = `<i data-lucide="image"></i>`;
        if (window.lucide) lucide.createIcons();
      });
    }
  },

  save() {
    const form = document.getElementById('project-form');
    if (!form) return;

    const data = {
      title: form.title.value.trim(),
      description: form.description.value.trim(),
      technologies: form.technologies.value.trim(),
      url: form.url.value.trim(),
      image: this.tempImage
    };

    if (!data.title) {
      Validation.showErrors(form, { title: Language.t('validation.required') });
      return;
    }
    if (data.url && !Validation.isUrl(data.url)) {
      Validation.showErrors(form, { url: Language.t('validation.url') });
      return;
    }

    const list = Storage.getProjects();
    if (this.editingId) {
      const idx = list.findIndex(p => p.id === this.editingId);
      if (idx !== -1) list[idx] = { ...list[idx], ...data };
    } else {
      list.unshift({ id: Storage.generateId(), ...data });
    }

    Storage.saveProjects(list);
    App.closeModal();
    App.showToast(Language.t('projects.saved'), 'success');
    this.render();
    document.dispatchEvent(new CustomEvent('dataChanged'));
  },

  delete(id) {
    if (!confirm(Language.t('projects.deleteConfirm'))) return;
    Storage.saveProjects(Storage.getProjects().filter(p => p.id !== id));
    App.showToast(Language.t('projects.deleted'), 'success');
    this.render();
    document.dispatchEvent(new CustomEvent('dataChanged'));
  }
};
