const Profile = {
  init() {
    document.addEventListener('sectionChanged', (e) => {
      if (e.detail.section === 'profile') this.render();
    });
    document.addEventListener('languageChanged', () => {
      if (Navigation.currentSection === 'profile') this.render();
    });
  },

  render() {
    const container = document.getElementById('profile-content');
    if (!container) return;

    const profile = Storage.getProfile();

    container.innerHTML = `
      <form id="profile-form" class="card" novalidate>
        <div class="form-group">
          <label class="form-label">${Language.t('profile.photo')}</label>
          <div class="photo-upload">
            <div class="photo-preview" id="photo-preview">
              ${profile.photo ? `<img src="${profile.photo}" alt="">` : `<i data-lucide="user"></i>`}
            </div>
            <div class="photo-actions">
              <label class="btn btn-secondary btn-sm">
                <i data-lucide="upload"></i>
                <span>${profile.photo ? Language.t('profile.changePhoto') : Language.t('profile.uploadPhoto')}</span>
                <input type="file" id="photo-input" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
              </label>
              ${profile.photo ? `<button type="button" class="btn btn-ghost btn-sm" id="remove-photo">${Language.t('profile.removePhoto')}</button>` : ''}
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${Language.t('profile.firstName')} *</label>
            <input type="text" name="firstName" class="form-input" value="${Validation.sanitizeText(profile.firstName)}" required>
          </div>
          <div class="form-group">
            <label class="form-label">${Language.t('profile.lastName')} *</label>
            <input type="text" name="lastName" class="form-input" value="${Validation.sanitizeText(profile.lastName)}" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">${Language.t('profile.titleLabel')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <input type="text" name="title" class="form-input" value="${Validation.sanitizeText(profile.title)}" data-i18n-placeholder="profile.titleLabel">
        </div>

        <div class="form-group">
          <label class="form-label">${Language.t('profile.bio')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <textarea name="bio" class="form-textarea" rows="4">${Validation.sanitizeText(profile.bio)}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${Language.t('profile.email')} <span class="optional">(${Language.t('common.optional')})</span></label>
            <input type="email" name="email" class="form-input" value="${Validation.sanitizeText(profile.email)}">
          </div>
          <div class="form-group">
            <label class="form-label">${Language.t('profile.phone')} <span class="optional">(${Language.t('common.optional')})</span></label>
            <input type="tel" name="phone" class="form-input" value="${Validation.sanitizeText(profile.phone)}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">${Language.t('profile.country')} <span class="optional">(${Language.t('common.optional')})</span></label>
            <input type="text" name="country" class="form-input" value="${Validation.sanitizeText(profile.country)}">
          </div>
          <div class="form-group">
            <label class="form-label">${Language.t('profile.city')} <span class="optional">(${Language.t('common.optional')})</span></label>
            <input type="text" name="city" class="form-input" value="${Validation.sanitizeText(profile.city)}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">${Language.t('profile.linkedin')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <input type="url" name="linkedin" class="form-input" value="${Validation.sanitizeText(profile.linkedin)}" placeholder="https://linkedin.com/in/...">
        </div>

        <div class="form-group">
          <label class="form-label">${Language.t('profile.github')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <input type="url" name="github" class="form-input" value="${Validation.sanitizeText(profile.github)}" placeholder="https://github.com/...">
        </div>

        <div class="form-group">
          <label class="form-label">${Language.t('profile.telegram')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <input type="url" name="telegram" class="form-input" value="${Validation.sanitizeText(profile.telegram)}" placeholder="https://t.me/...">
        </div>

        <div class="form-group">
          <label class="form-label">${Language.t('profile.website')} <span class="optional">(${Language.t('common.optional')})</span></label>
          <input type="url" name="website" class="form-input" value="${Validation.sanitizeText(profile.website)}" placeholder="https://...">
        </div>

        <div class="mt-16">
          <button type="submit" class="btn btn-primary">
            <i data-lucide="save"></i>
            ${Language.t('profile.save')}
          </button>
        </div>
      </form>
    `;

    if (window.lucide) lucide.createIcons();
    this.bindEvents();
  },

  bindEvents() {
    const form = document.getElementById('profile-form');
    const photoInput = document.getElementById('photo-input');
    const removeBtn = document.getElementById('remove-photo');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.save();
      });
    }

    if (photoInput) {
      photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const dataUrl = await Validation.readFileAsDataURL(file);
          const preview = document.getElementById('photo-preview');
          if (preview) {
            preview.innerHTML = `<img src="${dataUrl}" alt="">`;
          }
          // Store temporarily on form
          form.dataset.photo = dataUrl;
        } catch (err) {
          App.showToast(err.message, 'error');
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        const profile = Storage.getProfile();
        profile.photo = null;
        Storage.saveProfile(profile);
        form.dataset.photo = '';
        this.render();
        document.dispatchEvent(new CustomEvent('dataChanged'));
        App.showToast(Language.t('toast.saved'), 'success');
      });
    }
  },

  save() {
    const form = document.getElementById('profile-form');
    if (!form) return;

    const data = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      title: form.title.value.trim(),
      bio: form.bio.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      country: form.country.value.trim(),
      city: form.city.value.trim(),
      linkedin: form.linkedin.value.trim(),
      github: form.github.value.trim(),
      telegram: form.telegram.value.trim(),
      website: form.website.value.trim(),
      photo: form.dataset.photo !== undefined ? (form.dataset.photo || null) : Storage.getProfile().photo
    };

    const errors = Validation.validateProfile(data);
    if (Object.keys(errors).length > 0) {
      Validation.showErrors(form, errors);
      return;
    }

    Validation.clearErrors(form);
    Storage.saveProfile(data);
    App.showToast(Language.t('profile.saved'), 'success');
    document.dispatchEvent(new CustomEvent('dataChanged'));
    App.updateSidebarUser();
  }
};
