const Export = {
  exportJSON() {
    try {
      const data = Storage.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `myprofile-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      App.showToast(Language.t('settings.exported'), 'success');
    } catch (e) {
      console.error(e);
      App.showToast(Language.t('toast.error'), 'error');
    }
  },

  importJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid');
        }
        Storage.importAll(data);
        
        // Re-apply settings
        const settings = Storage.getSettings();
        Theme.set(settings.theme || 'system');
        Language.setLanguage(settings.language || 'en').then(() => {
          App.showToast(Language.t('settings.imported'), 'success');
          document.dispatchEvent(new CustomEvent('dataChanged'));
          App.updateSidebarUser();
          if (Navigation.currentSection === 'settings') {
            Settings.render();
          } else {
            Navigation.navigate(Navigation.currentSection);
          }
        });
      } catch (err) {
        console.error(err);
        App.showToast(Language.t('settings.importError'), 'error');
      }
    };
    reader.onerror = () => {
      App.showToast(Language.t('toast.error'), 'error');
    };
    reader.readAsText(file);
  }
};
