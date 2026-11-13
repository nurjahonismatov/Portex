const Skills = {
  editingType: null, // 'skill' | 'language'
  editingId: null,

  init() {
    document.addEventListener('sectionChanged', (e) => {
      if (e.detail.section === 'skills') this.render();
    });
    document.addEventListener('languageChanged', () => {
      if (Navigation.currentSection === 'skills') this.render();
    });
  },

  render() {
    const container = document.getElementById('skills-content');
    if (!container) return;

    const skills = Storage.getSkills();
    const languages = Storage.getLanguages();

    container.innerHTML = `
      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${Language.t('skills.skillsTitle')}</h3>
            <button class="btn btn-primary btn-sm" id="add-skill-btn">
              <i data-lucide="plus"></i>
              ${Language.t('skills.addSkill')}
            </button>
          </div>
          ${skills.length === 0 ? `
            <div class="empty-state" style="padding:32px 16px">
              <div class="empty-state-icon" style="width:48px;height:48px"><i data-lucide="sparkles"></i></div>
              <h3 class="empty-state-title" style="font-size:1rem">${Language.t('skills.emptySkills')}</h3>
              <p class="empty-state-desc" style="font-size:0.875rem">${Language.t('skills.emptySkillsDesc')}</p>
            </div>
          ` : `
            <div class="badge-list">
              ${skills.map(s => `
                <div class="skill-badge" data-id="${s.id}" data-type="skill">
                  <span>${Validation.sanitizeText(s.name)}</span>
                  <span class="level">${Language.getLevelLabel(s.level)}</span>
                  <button class="remove-btn" title="${Language.t('common.delete')}"><i data-lucide="x"></i></button>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">${Language.t('skills.languagesTitle')}</h3>
            <button class="btn btn-primary btn-sm" id="add-language-btn">
              <i data-lucide="plus"></i>
              ${Language.t('skills.addLanguage')}
            </button>
          </div>
          ${languages.length === 0 ? `
            <div class="empty-state" style="padding:32px 16px">
              <div class="empty-state-icon" style="width:48px;height:48px"><i data-lucide="languages"></i></div>
              <h3 class="empty-state-title" style="font-size:1rem">${Language.t('skills.emptyLanguages')}</h3>
              <p class="empty-state-desc" style="font-size:0.875rem">${Language.t('skills.emptyLanguagesDesc')}</p>
            </div>
          ` : `
            <div class="badge-list">
              ${languages.map(l => `
                <div class="skill-badge" data-id="${l.id}" data-type="language">
                  <span>${Validation.sanitizeText(l.name)}</span>
                  <span class="level">${Language.getLevelLabel(l.level)}</span>
                  <button class="remove-btn" title="${Language.t('common.delete')}"><i data-lucide="x"></i></button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    this.bindEvents();
  },

  bindEvents() {
    const addSkill = document.getElementById('add-skill-btn');
    const addLang = document.getElementById('add-language-btn');
    if (addSkill) addSkill.addEventListener('click', () => this.openModal('skill'));
    if (addLang) addLang.addEventListener('click', () => this.openModal('language'));

    document.querySelectorAll('#skills-content .remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const badge = btn.closest('.skill-badge');
        this.delete(badge.dataset.type, badge.dataset.id);
      });
    });

    document.querySelectorAll('#skills-content .skill-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        if (e.target.closest('.remove-btn')) return;
        this.openModal(badge.dataset.type, badge.dataset.id);
      });
    });
  },

  openModal(type, id = null) {
    this.editingType = type;
    this.editingId = id;
    const list = type === 'skill' ? Storage.getSkills() : Storage.getLanguages();
    const item = id ? list.find(i => i.id === id) : null;

    const isSkill = type === 'skill';
    const levels = isSkill
      ? ['beginner', 'intermediate', 'advanced']
      : ['beginner', 'intermediate', 'advanced', 'fluent', 'native'];

    document.getElementById('modal-title').textContent = id
      ? (isSkill ? Language.t('skills.addSkill') : Language.t('skills.addLanguage'))
      : (isSkill ? Language.t('skills.addSkill') : Language.t('skills.addLanguage'));

    // For edit, still use add labels or could differentiate
    if (id) {
      document.getElementById('modal-title').textContent = Language.t('common.edit');
    }

    document.getElementById('modal-body').innerHTML = `
      <form id="skill-form" novalidate>
        <div class="form-group">
          <label class="form-label">${isSkill ? Language.t('skills.skillName') : Language.t('skills.languageName')} *</label>
          <input type="text" name="name" class="form-input" value="${item ? Validation.sanitizeText(item.name) : ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">${Language.t('skills.level')} *</label>
          <select name="level" class="form-select" required>
            ${levels.map(l => `
              <option value="${l}" ${item && item.level === l ? 'selected' : ''}>${Language.getLevelLabel(l)}</option>
            `).join('')}
          </select>
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
    const form = document.getElementById('skill-form');
    if (!form) return;

    const data = {
      name: form.name.value.trim(),
      level: form.level.value
    };

    const errors = Validation.validateSkill(data);
    if (Object.keys(errors).length > 0) {
      Validation.showErrors(form, errors);
      return;
    }

    if (this.editingType === 'skill') {
      const list = Storage.getSkills();
      if (this.editingId) {
        const idx = list.findIndex(s => s.id === this.editingId);
        if (idx !== -1) list[idx] = { ...list[idx], ...data };
      } else {
        list.push({ id: Storage.generateId(), ...data });
      }
      Storage.saveSkills(list);
    } else {
      const list = Storage.getLanguages();
      if (this.editingId) {
        const idx = list.findIndex(l => l.id === this.editingId);
        if (idx !== -1) list[idx] = { ...list[idx], ...data };
      } else {
        list.push({ id: Storage.generateId(), ...data });
      }
      Storage.saveLanguages(list);
    }

    App.closeModal();
    App.showToast(Language.t('skills.saved'), 'success');
    this.render();
    document.dispatchEvent(new CustomEvent('dataChanged'));
  },

  delete(type, id) {
    if (!confirm(Language.t('skills.deleteConfirm'))) return;
    if (type === 'skill') {
      Storage.saveSkills(Storage.getSkills().filter(s => s.id !== id));
    } else {
      Storage.saveLanguages(Storage.getLanguages().filter(l => l.id !== id));
    }
    App.showToast(Language.t('skills.deleted'), 'success');
    this.render();
    document.dispatchEvent(new CustomEvent('dataChanged'));
  }
};
