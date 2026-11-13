const Resume = {
  template: 'modern',

  init() {
    this.template = Storage.getResumeTemplate() || 'modern';
    document.addEventListener('sectionChanged', (e) => {
      if (e.detail.section === 'resume') this.render();
    });
    document.addEventListener('languageChanged', () => {
      if (Navigation.currentSection === 'resume') this.render();
    });
    document.addEventListener('dataChanged', () => {
      if (Navigation.currentSection === 'resume') this.render();
    });
  },

  render() {
    const container = document.getElementById('resume-content');
    if (!container) return;

    const profile = Storage.getProfile();
    const hasData = profile.firstName || profile.lastName ||
      Storage.getEducation().length > 0 ||
      Storage.getExperience().length > 0 ||
      Storage.getSkills().length > 0;

    if (!hasData) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="file-text"></i></div>
          <h3 class="empty-state-title">${Language.t('resume.empty')}</h3>
          <p class="empty-state-desc">${Language.t('resume.emptyDesc')}</p>
          <button class="btn btn-primary" onclick="Navigation.navigate('profile')">
            <i data-lucide="user"></i>
            ${Language.t('dashboard.editProfile')}
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = `
      <div class="resume-controls">
        <div class="template-switcher">
          <button class="template-btn ${this.template === 'modern' ? 'active' : ''}" data-template="modern">
            ${Language.t('resume.modern')}
          </button>
          <button class="template-btn ${this.template === 'classic' ? 'active' : ''}" data-template="classic">
            ${Language.t('resume.classic')}
          </button>
        </div>
        <button class="btn btn-primary" id="download-pdf-btn">
          <i data-lucide="download"></i>
          ${Language.t('resume.download')}
        </button>
      </div>
      <div class="resume-preview-wrapper">
        <div class="resume-paper resume-${this.template}" id="resume-paper">
          ${this.buildResumeHtml()}
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    document.querySelectorAll('.template-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.template = btn.dataset.template;
        Storage.saveResumeTemplate(this.template);
        this.render();
      });
    });

    document.getElementById('download-pdf-btn').addEventListener('click', () => this.downloadPDF());
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + '-01');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  },

  buildResumeHtml() {
    const profile = Storage.getProfile();
    const education = Storage.getEducation();
    const experience = Storage.getExperience();
    const skills = Storage.getSkills();
    const languages = Storage.getLanguages();
    const achievements = Storage.getAchievements();
    const projects = Storage.getProjects();

    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
    const location = [profile.city, profile.country].filter(Boolean).join(', ');

    if (this.template === 'classic') {
      return this.buildClassic(profile, fullName, location, education, experience, skills, languages, achievements, projects);
    }
    return this.buildModern(profile, fullName, location, education, experience, skills, languages, achievements, projects);
  },

  buildModern(profile, fullName, location, education, experience, skills, languages, achievements, projects) {
    const contactParts = [];
    if (profile.email) contactParts.push(`<span>${Validation.sanitizeText(profile.email)}</span>`);
    if (profile.phone) contactParts.push(`<span>${Validation.sanitizeText(profile.phone)}</span>`);
    if (location) contactParts.push(`<span>${Validation.sanitizeText(location)}</span>`);
    if (profile.linkedin) contactParts.push(`<span>LinkedIn</span>`);
    if (profile.github) contactParts.push(`<span>GitHub</span>`);
    if (profile.website) contactParts.push(`<span>${Validation.sanitizeText(profile.website.replace(/^https?:\/\//, ''))}</span>`);

    let html = `
      <div class="resume-header">
        ${profile.photo ? `<img class="resume-photo" src="${profile.photo}" alt="">` : ''}
        <div class="resume-header-info">
          <h1>${Validation.sanitizeText(fullName) || 'Your Name'}</h1>
          ${profile.title ? `<div class="title">${Validation.sanitizeText(profile.title)}</div>` : ''}
          <div class="resume-contact">${contactParts.join('')}</div>
        </div>
      </div>
    `;

    if (profile.bio) {
      html += `
        <div class="resume-section">
          <div class="resume-section-title">${Language.t('resume.summary')}</div>
          <div class="resume-bio">${Validation.sanitizeText(profile.bio)}</div>
        </div>
      `;
    }

    if (experience.length > 0) {
      html += `<div class="resume-section"><div class="resume-section-title">${Language.t('resume.experience')}</div>`;
      experience.forEach(exp => {
        html += `
          <div class="resume-item">
            <div class="resume-item-header">
              <div class="resume-item-title">${Validation.sanitizeText(exp.position)}</div>
              <div class="resume-item-date">${this.formatDate(exp.startDate)} — ${exp.current ? Language.t('experience.present') : this.formatDate(exp.endDate)}</div>
            </div>
            <div class="resume-item-subtitle">${Validation.sanitizeText(exp.company)}</div>
            ${exp.description ? `<div class="resume-item-desc">${Validation.sanitizeText(exp.description)}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    }

    if (education.length > 0) {
      html += `<div class="resume-section"><div class="resume-section-title">${Language.t('resume.education')}</div>`;
      education.forEach(edu => {
        html += `
          <div class="resume-item">
            <div class="resume-item-header">
              <div class="resume-item-title">${Validation.sanitizeText(edu.institution)}</div>
              <div class="resume-item-date">${this.formatDate(edu.startDate)} — ${edu.endDate ? this.formatDate(edu.endDate) : Language.t('common.present')}</div>
            </div>
            <div class="resume-item-subtitle">${Validation.sanitizeText(edu.degree)}${edu.field ? ' · ' + Validation.sanitizeText(edu.field) : ''}</div>
            ${edu.description ? `<div class="resume-item-desc">${Validation.sanitizeText(edu.description)}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    }

    if (skills.length > 0) {
      html += `
        <div class="resume-section">
          <div class="resume-section-title">${Language.t('resume.skills')}</div>
          <div class="resume-skills">
            ${skills.map(s => `<span class="resume-skill">${Validation.sanitizeText(s.name)}</span>`).join('')}
          </div>
        </div>
      `;
    }

    if (languages.length > 0) {
      html += `
        <div class="resume-section">
          <div class="resume-section-title">${Language.t('resume.languages')}</div>
          <div class="resume-skills">
            ${languages.map(l => `<span class="resume-skill">${Validation.sanitizeText(l.name)} (${Language.getLevelLabel(l.level)})</span>`).join('')}
          </div>
        </div>
      `;
    }

    if (achievements.length > 0) {
      html += `<div class="resume-section"><div class="resume-section-title">${Language.t('resume.achievements')}</div>`;
      achievements.forEach(ach => {
        html += `
          <div class="resume-item">
            <div class="resume-item-header">
              <div class="resume-item-title">${Validation.sanitizeText(ach.title)}</div>
              ${ach.date ? `<div class="resume-item-date">${this.formatDate(ach.date)}</div>` : ''}
            </div>
            ${ach.organization ? `<div class="resume-item-subtitle">${Validation.sanitizeText(ach.organization)}</div>` : ''}
            ${ach.description ? `<div class="resume-item-desc">${Validation.sanitizeText(ach.description)}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    }

    
    if (projects.length > 0) {
      html += `<div class="resume-section"><div class="resume-section-title">${Language.t('nav.projects')}</div>`;
      projects.forEach(pr => {
        html += `
          <div class="resume-item">
            <div class="resume-item-header">
              <div class="resume-item-title">${Validation.sanitizeText(pr.title)}</div>
            </div>
            ${pr.technologies ? `<div class="resume-item-subtitle">${Validation.sanitizeText(pr.technologies)}</div>` : ''}
            ${pr.description ? `<div class="resume-item-desc">${Validation.sanitizeText(pr.description)}</div>` : ''}
            ${pr.url ? `<div class="resume-item-desc">${Validation.sanitizeText(pr.url)}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    }

    return html;
  },

  buildClassic(profile, fullName, location, education, experience, skills, languages, achievements, projects) {
    const contactParts = [];
    if (profile.email) contactParts.push(Validation.sanitizeText(profile.email));
    if (profile.phone) contactParts.push(Validation.sanitizeText(profile.phone));
    if (location) contactParts.push(Validation.sanitizeText(location));
    if (profile.linkedin) contactParts.push('LinkedIn');
    if (profile.website) contactParts.push(Validation.sanitizeText(profile.website.replace(/^https?:\/\//, '')));

    let html = `
      <div class="resume-header">
        <h1>${Validation.sanitizeText(fullName) || 'Your Name'}</h1>
        ${profile.title ? `<div class="title">${Validation.sanitizeText(profile.title)}</div>` : ''}
        <div class="resume-contact">${contactParts.join(' · ')}</div>
      </div>
    `;

    if (profile.bio) {
      html += `
        <div class="resume-section">
          <div class="resume-section-title">${Language.t('resume.summary')}</div>
          <div class="resume-bio">${Validation.sanitizeText(profile.bio)}</div>
        </div>
      `;
    }

    if (experience.length > 0) {
      html += `<div class="resume-section"><div class="resume-section-title">${Language.t('resume.experience')}</div>`;
      experience.forEach(exp => {
        html += `
          <div class="resume-item">
            <div class="resume-item-header">
              <div class="resume-item-title">${Validation.sanitizeText(exp.position)} — ${Validation.sanitizeText(exp.company)}</div>
              <div class="resume-item-date">${this.formatDate(exp.startDate)} — ${exp.current ? Language.t('experience.present') : this.formatDate(exp.endDate)}</div>
            </div>
            ${exp.description ? `<div class="resume-item-desc">${Validation.sanitizeText(exp.description)}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    }

    if (education.length > 0) {
      html += `<div class="resume-section"><div class="resume-section-title">${Language.t('resume.education')}</div>`;
      education.forEach(edu => {
        html += `
          <div class="resume-item">
            <div class="resume-item-header">
              <div class="resume-item-title">${Validation.sanitizeText(edu.degree)}${edu.field ? ', ' + Validation.sanitizeText(edu.field) : ''} — ${Validation.sanitizeText(edu.institution)}</div>
              <div class="resume-item-date">${this.formatDate(edu.startDate)} — ${edu.endDate ? this.formatDate(edu.endDate) : Language.t('common.present')}</div>
            </div>
            ${edu.description ? `<div class="resume-item-desc">${Validation.sanitizeText(edu.description)}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    }

    if (skills.length > 0) {
      html += `
        <div class="resume-section">
          <div class="resume-section-title">${Language.t('resume.skills')}</div>
          <div class="resume-skills">
            ${skills.map(s => `<span class="resume-skill">${Validation.sanitizeText(s.name)}</span>`).join('')}
          </div>
        </div>
      `;
    }

    if (languages.length > 0) {
      html += `
        <div class="resume-section">
          <div class="resume-section-title">${Language.t('resume.languages')}</div>
          <div class="resume-skills">
            ${languages.map(l => `<span class="resume-skill">${Validation.sanitizeText(l.name)} (${Language.getLevelLabel(l.level)})</span>`).join('')}
          </div>
        </div>
      `;
    }

    if (achievements.length > 0) {
      html += `<div class="resume-section"><div class="resume-section-title">${Language.t('resume.achievements')}</div>`;
      achievements.forEach(ach => {
        html += `
          <div class="resume-item">
            <div class="resume-item-header">
              <div class="resume-item-title">${Validation.sanitizeText(ach.title)}${ach.organization ? ' — ' + Validation.sanitizeText(ach.organization) : ''}</div>
              ${ach.date ? `<div class="resume-item-date">${this.formatDate(ach.date)}</div>` : ''}
            </div>
            ${ach.description ? `<div class="resume-item-desc">${Validation.sanitizeText(ach.description)}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    }

    
    if (projects.length > 0) {
      html += `<div class="resume-section"><div class="resume-section-title">${Language.t('nav.projects')}</div>`;
      projects.forEach(pr => {
        html += `
          <div class="resume-item">
            <div class="resume-item-header">
              <div class="resume-item-title">${Validation.sanitizeText(pr.title)}</div>
            </div>
            ${pr.technologies ? `<div class="resume-item-subtitle">${Validation.sanitizeText(pr.technologies)}</div>` : ''}
            ${pr.description ? `<div class="resume-item-desc">${Validation.sanitizeText(pr.description)}</div>` : ''}
            ${pr.url ? `<div class="resume-item-desc">${Validation.sanitizeText(pr.url)}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    }

    return html;
  },

  async downloadPDF() {
    const paper = document.getElementById('resume-paper');
    if (!paper) return;

    const btn = document.getElementById('download-pdf-btn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2"></i> ${Language.t('resume.downloading')}`;
    if (window.lucide) lucide.createIcons();

    try {
      // Use html2canvas + jsPDF
      const canvas = await html2canvas(paper, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const profile = Storage.getProfile();
      const name = [profile.firstName, profile.lastName].filter(Boolean).join('_') || 'Resume';
      pdf.save(`${name}_Resume.pdf`);

      App.showToast(Language.t('resume.downloaded'), 'success');
    } catch (err) {
      console.error('PDF error:', err);
      App.showToast(Language.t('toast.error'), 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
      if (window.lucide) lucide.createIcons();
    }
  }
};
