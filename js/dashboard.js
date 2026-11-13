const Dashboard = {
  init() {
    document.addEventListener('sectionChanged', (e) => {
      if (e.detail.section === 'dashboard') this.render();
    });
    document.addEventListener('dataChanged', () => this.render());
    document.addEventListener('languageChanged', () => this.render());
  },

  calculateCompletion() {
    const profile = Storage.getProfile();
    const education = Storage.getEducation();
    const achievements = Storage.getAchievements();
    const skills = Storage.getSkills();
    const languages = Storage.getLanguages();
    const experience = Storage.getExperience();

    let score = 0;
    const max = 100;

    // Profile basics (40 points)
    if (profile.firstName) score += 8;
    if (profile.lastName) score += 8;
    if (profile.title) score += 6;
    if (profile.email) score += 6;
    if (profile.bio) score += 6;
    if (profile.photo) score += 6;

    // Education (15)
    if (education.length > 0) score += 15;

    // Experience (15)
    if (experience.length > 0) score += 15;

    // Skills (15)
    if (skills.length > 0) score += 10;
    if (languages.length > 0) score += 5;

    // Achievements (15)
    if (achievements.length > 0) score += 15;

    return Math.min(score, max);
  },

  render() {
    const container = document.getElementById('dashboard-content');
    if (!container) return;

    const profile = Storage.getProfile();
    const education = Storage.getEducation();
    const achievements = Storage.getAchievements();
    const skills = Storage.getSkills();
    const completion = this.calculateCompletion();
    const hasName = profile.firstName || profile.lastName;
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');

    if (!hasName && education.length === 0 && skills.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <i data-lucide="user-plus"></i>
          </div>
          <h3 class="empty-state-title">${Language.t('dashboard.emptyTitle')}</h3>
          <p class="empty-state-desc">${Language.t('dashboard.emptyDesc')}</p>
          <button class="btn btn-primary" onclick="Navigation.navigate('profile')">
            <i data-lucide="user"></i>
            ${Language.t('dashboard.editProfile')}
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    const avatarHtml = profile.photo
      ? `<img src="${profile.photo}" alt="">`
      : `<i data-lucide="user"></i>`;

    container.innerHTML = `
      <div class="welcome-card">
        <div class="welcome-avatar">${avatarHtml}</div>
        <div class="welcome-text">
          <h2>${Language.t('dashboard.welcome')}${fullName ? ', ' + Validation.sanitizeText(fullName) : ''}</h2>
          <p>${profile.title ? Validation.sanitizeText(profile.title) : Language.t('dashboard.completeProfile')}</p>
        </div>
      </div>

      <div class="grid-4 mb-24">
        <div class="stat-card">
          <div class="stat-icon blue">
            <i data-lucide="pie-chart"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">${completion}%</div>
            <div class="stat-label">${Language.t('dashboard.profileCompletion')}</div>
            <div class="progress-wrapper">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${completion}%"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <i data-lucide="award"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">${achievements.length}</div>
            <div class="stat-label">${Language.t('dashboard.achievements')}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">
            <i data-lucide="graduation-cap"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">${education.length}</div>
            <div class="stat-label">${Language.t('dashboard.education')}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">
            <i data-lucide="sparkles"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">${skills.length}</div>
            <div class="stat-label">${Language.t('dashboard.skills')}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">${Language.t('dashboard.quickAccess')}</h3>
        </div>
        <div class="quick-actions">
          <button class="btn btn-primary" onclick="Navigation.navigate('resume')">
            <i data-lucide="file-text"></i>
            ${Language.t('dashboard.createResume')}
          </button>
          <button class="btn btn-secondary" onclick="Navigation.navigate('profile')">
            <i data-lucide="user"></i>
            ${Language.t('dashboard.editProfile')}
          </button>
          <button class="btn btn-secondary" onclick="Navigation.navigate('education')">
            <i data-lucide="graduation-cap"></i>
            ${Language.t('dashboard.addEducation')}
          </button>
          <button class="btn btn-secondary" onclick="Navigation.navigate('achievements')">
            <i data-lucide="award"></i>
            ${Language.t('dashboard.addAchievement')}
          </button>
          <button class="btn btn-secondary" onclick="Navigation.navigate('skills')">
            <i data-lucide="sparkles"></i>
            ${Language.t('dashboard.addSkill')}
          </button>
          <button class="btn btn-secondary" onclick="Navigation.navigate('projects')">
            <i data-lucide="folder-kanban"></i>
            ${Language.t('nav.projects')}
          </button>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  }
};
