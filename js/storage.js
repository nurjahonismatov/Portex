const Storage = {
  KEYS: {
    PROFILE: 'myprofile_profile',
    EDUCATION: 'myprofile_education',
    ACHIEVEMENTS: 'myprofile_achievements',
    SKILLS: 'myprofile_skills',
    LANGUAGES: 'myprofile_languages',
    EXPERIENCE: 'myprofile_experience',
    SETTINGS: 'myprofile_settings',
    RESUME_TEMPLATE: 'myprofile_resume_template',
    PROJECTS: 'myprofile_projects',
    VAULT: 'myprofile_vault'
  },

  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  },

  getProfile() {
    return this.get(this.KEYS.PROFILE, {
      firstName: '',
      lastName: '',
      title: '',
      bio: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      photo: null,
      linkedin: '',
      github: '',
      telegram: '',
      website: ''
    });
  },

  saveProfile(profile) {
    return this.set(this.KEYS.PROFILE, profile);
  },

  getEducation() {
    return this.get(this.KEYS.EDUCATION, []);
  },

  saveEducation(list) {
    return this.set(this.KEYS.EDUCATION, list);
  },

  getAchievements() {
    return this.get(this.KEYS.ACHIEVEMENTS, []);
  },

  saveAchievements(list) {
    return this.set(this.KEYS.ACHIEVEMENTS, list);
  },

  getSkills() {
    return this.get(this.KEYS.SKILLS, []);
  },

  saveSkills(list) {
    return this.set(this.KEYS.SKILLS, list);
  },

  getLanguages() {
    return this.get(this.KEYS.LANGUAGES, []);
  },

  saveLanguages(list) {
    return this.set(this.KEYS.LANGUAGES, list);
  },

  getExperience() {
    return this.get(this.KEYS.EXPERIENCE, []);
  },

  saveExperience(list) {
    return this.set(this.KEYS.EXPERIENCE, list);
  },

  getSettings() {
    return this.get(this.KEYS.SETTINGS, {
      language: 'en',
      theme: 'system'
    });
  },

  saveSettings(settings) {
    return this.set(this.KEYS.SETTINGS, settings);
  },

  getVault() {
    return this.get(this.KEYS.VAULT, []);
  },

  saveVault(list) {
    return this.set(this.KEYS.VAULT, list);
  },

  getProjects() {
    return this.get(this.KEYS.PROJECTS, []);
  },

  saveProjects(list) {
    return this.set(this.KEYS.PROJECTS, list);
  },

  getResumeTemplate() {
    return this.get(this.KEYS.RESUME_TEMPLATE, 'modern');
  },

  saveResumeTemplate(template) {
    return this.set(this.KEYS.RESUME_TEMPLATE, template);
  },

  exportAll() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      education: this.getEducation(),
      achievements: this.getAchievements(),
      skills: this.getSkills(),
      languages: this.getLanguages(),
      experience: this.getExperience(),
      settings: this.getSettings(),
      resumeTemplate: this.getResumeTemplate(),
      projects: this.getProjects(),
      vault: this.getVault()
    };
  },

  importAll(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data');
    }
    if (data.profile) this.saveProfile(data.profile);
    if (Array.isArray(data.education)) this.saveEducation(data.education);
    if (Array.isArray(data.achievements)) this.saveAchievements(data.achievements);
    if (Array.isArray(data.skills)) this.saveSkills(data.skills);
    if (Array.isArray(data.languages)) this.saveLanguages(data.languages);
    if (Array.isArray(data.experience)) this.saveExperience(data.experience);
    if (data.settings) this.saveSettings(data.settings);
    if (data.resumeTemplate) this.saveResumeTemplate(data.resumeTemplate);
    if (Array.isArray(data.projects)) this.saveProjects(data.projects);
    if (Array.isArray(data.vault)) this.saveVault(data.vault);
    return true;
  },

  clearAll() {
    Object.values(this.KEYS).forEach(key => this.remove(key));
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
};
