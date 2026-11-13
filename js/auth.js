const Auth = {
  SESSION_KEY: 'portex_session',
  USERS_KEY: 'portex_users',
  LOCK_KEY: 'portex_app_lock',
  GUEST_KEY: 'portex_guest',
  PENDING_KEY: 'portex_pending_reg',

  async hash(text) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  getUsers() {
    try { return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]'); }
    catch { return []; }
  },

  saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  getSession() {
    try { return JSON.parse(localStorage.getItem(this.SESSION_KEY) || 'null'); }
    catch { return null; }
  },

  setSession(user, remember) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      remember: !!remember,
      at: Date.now()
    }));
    localStorage.removeItem(this.GUEST_KEY);
  },

  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  isGuest() {
    return localStorage.getItem(this.GUEST_KEY) === '1';
  },

  continueAsGuest() {
    localStorage.setItem(this.GUEST_KEY, '1');
    this.clearSession();
    this.showApp();
    if (typeof App.onAuthSuccess === 'function') App.onAuthSuccess();
  },

  isLoggedIn() {
    const s = this.getSession();
    if (!s) return false;
    if (!s.remember && Date.now() - (s.at || 0) > 12 * 60 * 60 * 1000) {
      this.clearSession();
      return false;
    }
    return true;
  },

  canUseApp() {
    return this.isLoggedIn() || this.isGuest();
  },

  getCurrentUser() {
    const s = this.getSession();
    if (!s) return null;
    return this.getUsers().find(u => u.id === s.id) || s;
  },

  generateCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  },

  setPending(data) {
    localStorage.setItem(this.PENDING_KEY, JSON.stringify({
      ...data,
      expiresAt: Date.now() + 2 * 60 * 1000
    }));
  },

  getPending() {
    try {
      const p = JSON.parse(localStorage.getItem(this.PENDING_KEY) || 'null');
      if (!p) return null;
      if (Date.now() > p.expiresAt) {
        localStorage.removeItem(this.PENDING_KEY);
        return null;
      }
      return p;
    } catch { return null; }
  },

  clearPending() {
    localStorage.removeItem(this.PENDING_KEY);
  },

  async startRegister({ name, email, phone, password }) {
    const users = this.getUsers();
    if (email && users.some(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error(Language.t('auth.emailExists'));
    }
    if (phone && users.some(u => u.phone && u.phone === phone)) {
      throw new Error(Language.t('auth.phoneExists'));
    }
    if (!email && !phone) throw new Error(Language.t('auth.needContact'));
    if (!password || password.length < 4) throw new Error(Language.t('auth.passwordShort'));

    const code = this.generateCode();
    const passwordHash = await this.hash(password);
    this.setPending({
      name: (name || '').trim() || 'User',
      email: (email || '').trim(),
      phone: (phone || '').trim(),
      passwordHash,
      code,
      channel: email ? 'email' : 'sms'
    });
    return { code, channel: email ? 'email' : 'sms', target: email || phone };
  },

  async confirmRegister(inputCode) {
    const pending = this.getPending();
    if (!pending) throw new Error(Language.t('auth.codeExpired'));
    if (String(inputCode).trim() !== String(pending.code)) {
      throw new Error(Language.t('auth.codeWrong'));
    }
    const user = {
      id: Storage.generateId(),
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      passwordHash: pending.passwordHash,
      createdAt: new Date().toISOString()
    };
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
    this.clearPending();
    this.setSession(user, true);
    return user;
  },

  async login({ email, phone, password, remember }) {
    const users = this.getUsers();
    let user = null;
    if (email) user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    else if (phone) user = users.find(u => u.phone && u.phone === phone);
    if (!user) throw new Error(Language.t('auth.invalidCredentials'));
    const passwordHash = await this.hash(password);
    if (user.passwordHash !== passwordHash) throw new Error(Language.t('auth.invalidCredentials'));
    this.setSession(user, remember);
    return user;
  },

  logout() {
    this.clearSession();
    localStorage.removeItem(this.GUEST_KEY);
    sessionStorage.removeItem('portex_unlocked');
    this.showAuthScreen();
  },

  async setAppLock(password) {
    if (!password || password.length < 4) throw new Error(Language.t('auth.passwordShort'));
    const hash = await this.hash(password);
    localStorage.setItem(this.LOCK_KEY, JSON.stringify({ enabled: true, hash }));
  },

  disableAppLock() {
    localStorage.removeItem(this.LOCK_KEY);
  },

  getAppLock() {
    try { return JSON.parse(localStorage.getItem(this.LOCK_KEY) || 'null'); }
    catch { return null; }
  },

  isAppLocked() {
    const lock = this.getAppLock();
    return !!(lock && lock.enabled && this.isLoggedIn());
  },

  async unlockApp(password) {
    const lock = this.getAppLock();
    if (!lock || !lock.enabled) return true;
    const hash = await this.hash(password);
    return hash === lock.hash;
  },

  showAuthScreen() {
    document.getElementById('auth-screen')?.classList.remove('hidden');
    document.getElementById('lock-screen')?.classList.add('hidden');
    document.querySelector('.app')?.classList.add('hidden');
    this.renderAuth();
  },

  showLockScreen() {
    document.getElementById('lock-screen')?.classList.remove('hidden');
    document.getElementById('auth-screen')?.classList.add('hidden');
    document.querySelector('.app')?.classList.add('hidden');
    this.renderLock();
  },

  showApp() {
    document.getElementById('auth-screen')?.classList.add('hidden');
    document.getElementById('lock-screen')?.classList.add('hidden');
    document.querySelector('.app')?.classList.remove('hidden');
  },

  async boot() {
    // Optional auth: guest or logged-in can use app
    if (this.canUseApp()) {
      if (this.isAppLocked()) {
        if (sessionStorage.getItem('portex_unlocked') === '1') {
          this.showApp();
          return true;
        }
        this.showLockScreen();
        return false;
      }
      this.showApp();
      return true;
    }
    this.showAuthScreen();
    return false;
  },

  _timerId: null,

  startCodeTimer(el) {
    if (this._timerId) clearInterval(this._timerId);
    const pending = this.getPending();
    if (!pending || !el) return;
    const tick = () => {
      const left = Math.max(0, pending.expiresAt - Date.now());
      const sec = Math.ceil(left / 1000);
      const m = Math.floor(sec / 60);
      const s = String(sec % 60).padStart(2, '0');
      el.textContent = Language.t('auth.timeLeft').replace('{time}', `${m}:${s}`);
      if (left <= 0) {
        clearInterval(this._timerId);
        this._timerId = null;
        el.textContent = Language.t('auth.codeExpired');
        el.classList.add('auth-expired');
      }
    };
    tick();
    this._timerId = setInterval(tick, 250);
  },

  renderAuth() {
    const el = document.getElementById('auth-screen');
    if (!el) return;
    const mode = el.dataset.mode || 'welcome';

    if (mode === 'verify') {
      this.renderVerify(el);
      return;
    }

    const isLogin = mode === 'login';
    const isRegister = mode === 'register';

    if (mode === 'welcome' || (!isLogin && !isRegister)) {
      el.dataset.mode = 'welcome';
      el.innerHTML = `
        <div class="auth-card glass-panel">
          <div class="auth-brand">
            <div class="sidebar-logo"><i data-lucide="layers"></i></div>
            <h1>Portex</h1>
            <p>${Language.t('auth.tagline')}</p>
          </div>
          <button type="button" class="btn btn-primary w-full" id="auth-goto-login">${Language.t('auth.login')}</button>
          <button type="button" class="btn btn-secondary w-full mt-16" id="auth-goto-register">${Language.t('auth.register')}</button>
          <button type="button" class="btn btn-ghost w-full mt-16" id="auth-guest">${Language.t('auth.continueGuest')}</button>
          <p class="auth-note">${Language.t('auth.optionalNote')}</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      document.getElementById('auth-goto-login').onclick = () => { el.dataset.mode = 'login'; this.renderAuth(); };
      document.getElementById('auth-goto-register').onclick = () => { el.dataset.mode = 'register'; this.renderAuth(); };
      document.getElementById('auth-guest').onclick = () => this.continueAsGuest();
      return;
    }

    el.innerHTML = `
      <div class="auth-card glass-panel">
        <div class="auth-brand">
          <div class="sidebar-logo"><i data-lucide="layers"></i></div>
          <h1>Portex</h1>
          <p>${Language.t('auth.tagline')}</p>
        </div>
        <div class="auth-tabs">
          <button class="auth-tab ${isLogin ? 'active' : ''}" data-mode="login">${Language.t('auth.login')}</button>
          <button class="auth-tab ${isRegister ? 'active' : ''}" data-mode="register">${Language.t('auth.register')}</button>
        </div>
        <form id="auth-form" class="auth-form" novalidate>
          ${isRegister ? `
            <div class="form-group">
              <label class="form-label">${Language.t('auth.name')}</label>
              <input type="text" name="name" class="form-input" autocomplete="name">
            </div>
          ` : ''}
          <div class="form-group">
            <label class="form-label">${Language.t('auth.emailOrPhone')}</label>
            <input type="text" name="identifier" class="form-input" placeholder="email@gmail.com / +998..." autocomplete="username" required>
          </div>
          <div class="form-group">
            <label class="form-label">${Language.t('auth.password')}</label>
            <input type="password" name="password" class="form-input" autocomplete="${isLogin ? 'current-password' : 'new-password'}" required>
          </div>
          ${isLogin ? `
            <div class="form-group">
              <div class="checkbox-group">
                <input type="checkbox" id="remember-me" name="remember" checked>
                <label for="remember-me">${Language.t('auth.remember')}</label>
              </div>
            </div>
          ` : ''}
          <button type="submit" class="btn btn-primary w-full">${isLogin ? Language.t('auth.login') : Language.t('auth.sendCode')}</button>
        </form>
        <button type="button" class="btn btn-ghost w-full mt-16" id="auth-back">${Language.t('auth.back')}</button>
        <button type="button" class="btn btn-ghost w-full" id="auth-guest2">${Language.t('auth.continueGuest')}</button>
        <p class="auth-note">${Language.t('auth.demoCodeNote')}</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();

    el.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => { el.dataset.mode = tab.dataset.mode; this.renderAuth(); });
    });
    document.getElementById('auth-back').onclick = () => { el.dataset.mode = 'welcome'; this.renderAuth(); };
    document.getElementById('auth-guest2').onclick = () => this.continueAsGuest();

    document.getElementById('auth-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const identifier = form.identifier.value.trim();
      const password = form.password.value;
      const isEmail = identifier.includes('@');
      try {
        if (isLogin) {
          await this.login({
            email: isEmail ? identifier : '',
            phone: !isEmail ? identifier : '',
            password,
            remember: form.remember?.checked
          });
          App.showToast(Language.t('auth.loginSuccess'), 'success');
          this.showApp();
          if (typeof App.onAuthSuccess === 'function') App.onAuthSuccess();
        } else {
          const result = await this.startRegister({
            name: form.name?.value,
            email: isEmail ? identifier : '',
            phone: !isEmail ? identifier : '',
            password
          });
          // Demo: show code (real email/SMS needs backend)
          App.showToast(
            (result.channel === 'email' ? Language.t('auth.demoEmailCode') : Language.t('auth.demoSmsCode'))
              .replace('{code}', result.code),
            'success'
          );
          el.dataset.mode = 'verify';
          this.renderAuth();
        }
      } catch (err) {
        App.showToast(err.message || Language.t('toast.error'), 'error');
      }
    });
  },

  renderVerify(el) {
    const pending = this.getPending();
    if (!pending) {
      el.dataset.mode = 'register';
      this.renderAuth();
      App.showToast(Language.t('auth.codeExpired'), 'error');
      return;
    }
    const target = pending.email || pending.phone;
    el.innerHTML = `
      <div class="auth-card glass-panel">
        <div class="auth-brand">
          <div class="sidebar-logo"><i data-lucide="shield-check"></i></div>
          <h1>${Language.t('auth.verifyTitle')}</h1>
          <p>${Language.t('auth.verifyDesc').replace('{target}', target)}</p>
        </div>
        <p class="auth-timer" id="auth-timer"></p>
        <form id="verify-form" class="auth-form" novalidate>
          <div class="form-group">
            <label class="form-label">${Language.t('auth.codeLabel')}</label>
            <input type="text" name="code" class="form-input auth-code-input" inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="one-time-code" required>
          </div>
          <button type="submit" class="btn btn-primary w-full">${Language.t('auth.confirm')}</button>
        </form>
        <button type="button" class="btn btn-ghost w-full mt-16" id="auth-resend">${Language.t('auth.resend')}</button>
        <button type="button" class="btn btn-ghost w-full" id="auth-cancel-verify">${Language.t('common.cancel')}</button>
        <p class="auth-note">${Language.t('auth.demoCodeNote')}</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    this.startCodeTimer(document.getElementById('auth-timer'));

    document.getElementById('verify-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await this.confirmRegister(e.target.code.value);
        App.showToast(Language.t('auth.registerSuccess'), 'success');
        this.showApp();
        if (typeof App.onAuthSuccess === 'function') App.onAuthSuccess();
      } catch (err) {
        App.showToast(err.message || Language.t('toast.error'), 'error');
      }
    });

    document.getElementById('auth-resend').onclick = async () => {
      const p = this.getPending();
      if (!p) {
        App.showToast(Language.t('auth.codeExpired'), 'error');
        el.dataset.mode = 'register';
        this.renderAuth();
        return;
      }
      const code = this.generateCode();
      this.setPending({ ...p, code, expiresAt: undefined });
      // setPending overwrites expires
      const again = this.getPending();
      App.showToast(
        (p.channel === 'email' ? Language.t('auth.demoEmailCode') : Language.t('auth.demoSmsCode')).replace('{code}', code),
        'success'
      );
      this.startCodeTimer(document.getElementById('auth-timer'));
      document.getElementById('auth-timer')?.classList.remove('auth-expired');
    };

    document.getElementById('auth-cancel-verify').onclick = () => {
      this.clearPending();
      el.dataset.mode = 'register';
      this.renderAuth();
    };
  },

  renderLock() {
    const el = document.getElementById('lock-screen');
    if (!el) return;
    el.innerHTML = `
      <div class="auth-card glass-panel">
        <div class="auth-brand">
          <div class="sidebar-logo"><i data-lucide="lock"></i></div>
          <h1>${Language.t('auth.unlockTitle')}</h1>
          <p>${Language.t('auth.unlockDesc')}</p>
        </div>
        <form id="lock-form" class="auth-form" novalidate>
          <div class="form-group">
            <label class="form-label">${Language.t('auth.password')}</label>
            <input type="password" name="password" class="form-input" autocomplete="current-password" required autofocus>
          </div>
          <button type="submit" class="btn btn-primary w-full">${Language.t('auth.unlock')}</button>
        </form>
        <button type="button" class="btn btn-ghost w-full mt-16" id="lock-logout">${Language.t('auth.logout')}</button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    document.getElementById('lock-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const ok = await this.unlockApp(e.target.password.value);
      if (ok) {
        sessionStorage.setItem('portex_unlocked', '1');
        this.showApp();
        if (typeof App.onAuthSuccess === 'function') App.onAuthSuccess();
      } else {
        App.showToast(Language.t('auth.wrongPassword'), 'error');
      }
    });
    document.getElementById('lock-logout').onclick = () => this.logout();
  }
};
