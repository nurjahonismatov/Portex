const Validation = {
  isEmail(value) {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  },

  isUrl(value) {
    if (!value) return true;
    try {
      const url = new URL(value.startsWith('http') ? value : `https://${value}`);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  },

  isRequired(value) {
    return value !== null && value !== undefined && String(value).trim().length > 0;
  },

  isImageFile(file) {
    if (!file) return true;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return allowed.includes(file.type);
  },

  isFileSizeOk(file, maxMB = 2) {
    if (!file) return true;
    return file.size <= maxMB * 1024 * 1024;
  },

  sanitizeText(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  validateProfile(data) {
    const errors = {};
    if (!this.isRequired(data.firstName)) {
      errors.firstName = Language.t('validation.required');
    }
    if (!this.isRequired(data.lastName)) {
      errors.lastName = Language.t('validation.required');
    }
    if (data.email && !this.isEmail(data.email)) {
      errors.email = Language.t('validation.email');
    }
    if (data.linkedin && !this.isUrl(data.linkedin)) {
      errors.linkedin = Language.t('validation.url');
    }
    if (data.github && !this.isUrl(data.github)) {
      errors.github = Language.t('validation.url');
    }
    if (data.telegram && !this.isUrl(data.telegram)) {
      errors.telegram = Language.t('validation.url');
    }
    if (data.website && !this.isUrl(data.website)) {
      errors.website = Language.t('validation.url');
    }
    return errors;
  },

  validateEducation(data) {
    const errors = {};
    if (!this.isRequired(data.institution)) {
      errors.institution = Language.t('validation.required');
    }
    if (!this.isRequired(data.degree)) {
      errors.degree = Language.t('validation.required');
    }
    if (!this.isRequired(data.startDate)) {
      errors.startDate = Language.t('validation.required');
    }
    return errors;
  },

  validateAchievement(data) {
    const errors = {};
    if (!this.isRequired(data.title)) {
      errors.title = Language.t('validation.required');
    }
    if (data.verificationUrl && !this.isUrl(data.verificationUrl)) {
      errors.verificationUrl = Language.t('validation.url');
    }
    return errors;
  },

  validateSkill(data) {
    const errors = {};
    if (!this.isRequired(data.name)) {
      errors.name = Language.t('validation.required');
    }
    if (!this.isRequired(data.level)) {
      errors.level = Language.t('validation.required');
    }
    return errors;
  },

  validateExperience(data) {
    const errors = {};
    if (!this.isRequired(data.position)) {
      errors.position = Language.t('validation.required');
    }
    if (!this.isRequired(data.company)) {
      errors.company = Language.t('validation.required');
    }
    if (!this.isRequired(data.startDate)) {
      errors.startDate = Language.t('validation.required');
    }
    return errors;
  },

  showErrors(form, errors) {
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
    Object.entries(errors).forEach(([field, message]) => {
      const input = form.querySelector(`[name="${field}"]`);
      if (input) {
        input.classList.add('error');
        const errorEl = document.createElement('div');
        errorEl.className = 'form-error';
        errorEl.textContent = message;
        input.parentElement.appendChild(errorEl);
      }
    });
  },

  clearErrors(form) {
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  },

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      if (!this.isImageFile(file)) {
        reject(new Error(Language.t('validation.fileType')));
        return;
      }
      if (!this.isFileSizeOk(file)) {
        reject(new Error(Language.t('validation.fileSize')));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
};
