(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────────────────────────
  const REPO = 'GoldKuchen0/SIMMA-EDU.github.io';
  const BRANCH = 'main';
  const LS_HASH = 'cms_pw_hash';
  const LS_PAT  = 'cms_gh_pat';
  const LS_SETUP = 'cms_setup_done';

  // ── Hidden trigger: 5 clicks on [MS] logo within 3 s ──────────────────────
  let clickCount = 0;
  let clickTimer = null;

  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();

    const logos = document.querySelectorAll('.footer-logo');
    logos.forEach(logo => {
      logo.addEventListener('click', handleLogoClick);
    });
  });

  function handleLogoClick(e) {
    e.preventDefault();
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 3000);
    if (clickCount >= 5) {
      clickCount = 0;
      clearTimeout(clickTimer);
      openAdmin();
    }
  }

  // ── Entry point ────────────────────────────────────────────────────────────
  function openAdmin() {
    if (!localStorage.getItem(LS_SETUP)) {
      showSetupModal();
    } else {
      showLoginModal();
    }
  }

  // ── SHA-256 helper ─────────────────────────────────────────────────────────
  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ── Modal helpers ──────────────────────────────────────────────────────────
  function makeOverlay(id) {
    const el = document.createElement('div');
    el.id = id;
    el.className = 'cms-overlay';
    document.body.appendChild(el);
    return el;
  }

  function removeEl(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  // ── Setup Modal ────────────────────────────────────────────────────────────
  function showSetupModal() {
    const overlay = makeOverlay('cms-setup-overlay');
    overlay.innerHTML = `
      <div class="cms-modal">
        <h2 class="cms-modal-title">Admin Setup</h2>
        <p class="cms-modal-sub">Configure your CMS credentials. This only runs once.</p>
        <div class="cms-field">
          <label>Choose Password</label>
          <input type="password" id="cms-setup-pw" placeholder="Password" autocomplete="new-password">
        </div>
        <div class="cms-field">
          <label>Confirm Password</label>
          <input type="password" id="cms-setup-pw2" placeholder="Confirm password" autocomplete="new-password">
        </div>
        <div class="cms-field">
          <label>GitHub Personal Access Token</label>
          <input type="password" id="cms-setup-pat" placeholder="ghp_..." autocomplete="off">
          <span class="cms-hint">Needs repo write access to push changes.</span>
        </div>
        <div id="cms-setup-error" class="cms-error" style="display:none"></div>
        <div class="cms-modal-actions">
          <button class="cms-btn-secondary" id="cms-setup-cancel">Cancel</button>
          <button class="cms-btn-primary" id="cms-setup-save">Save & Continue</button>
        </div>
      </div>`;

    document.getElementById('cms-setup-cancel').onclick = () => removeEl('cms-setup-overlay');
    document.getElementById('cms-setup-save').onclick = async () => {
      const pw  = document.getElementById('cms-setup-pw').value;
      const pw2 = document.getElementById('cms-setup-pw2').value;
      const pat = document.getElementById('cms-setup-pat').value.trim();
      const err = document.getElementById('cms-setup-error');

      if (!pw || pw.length < 4) { showErr(err, 'Password must be at least 4 characters.'); return; }
      if (pw !== pw2)           { showErr(err, 'Passwords do not match.');                 return; }
      if (!pat.startsWith('ghp_') && !pat.startsWith('github_pat_')) {
        showErr(err, 'PAT must start with ghp_ or github_pat_'); return;
      }

      const hash = await sha256(pw);
      localStorage.setItem(LS_HASH, hash);
      localStorage.setItem(LS_PAT, pat);
      localStorage.setItem(LS_SETUP, '1');
      removeEl('cms-setup-overlay');
      openPanel();
    };
  }

  // ── Login Modal ────────────────────────────────────────────────────────────
  function showLoginModal() {
    const overlay = makeOverlay('cms-login-overlay');
    overlay.innerHTML = `
      <div class="cms-modal">
        <h2 class="cms-modal-title">Admin Login</h2>
        <div class="cms-field">
          <label>Password</label>
          <input type="password" id="cms-login-pw" placeholder="Password" autocomplete="current-password">
        </div>
        <div id="cms-login-error" class="cms-error" style="display:none"></div>
        <div class="cms-modal-actions">
          <button class="cms-btn-secondary" id="cms-login-cancel">Cancel</button>
          <button class="cms-btn-primary" id="cms-login-enter">Enter</button>
        </div>
        <p class="cms-hint" style="margin-top:1rem;text-align:center;">
          <a href="#" id="cms-reset-link" style="color:var(--accent)">Reset credentials</a>
        </p>
      </div>`;

    const pwInput = document.getElementById('cms-login-pw');
    pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
    document.getElementById('cms-login-cancel').onclick = () => removeEl('cms-login-overlay');
    document.getElementById('cms-login-enter').onclick  = tryLogin;
    document.getElementById('cms-reset-link').onclick   = (e) => {
      e.preventDefault();
      if (confirm('This will clear all CMS credentials. Continue?')) {
        localStorage.removeItem(LS_HASH);
        localStorage.removeItem(LS_PAT);
        localStorage.removeItem(LS_SETUP);
        removeEl('cms-login-overlay');
        showSetupModal();
      }
    };

    async function tryLogin() {
      const pw = pwInput.value;
      const hash = await sha256(pw);
      if (hash === localStorage.getItem(LS_HASH)) {
        removeEl('cms-login-overlay');
        openPanel();
      } else {
        showErr(document.getElementById('cms-login-error'), 'Incorrect password.');
      }
    }
  }

  function showErr(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
  }

  // ── Admin Panel ────────────────────────────────────────────────────────────
  async function openPanel() {
    const panel = document.createElement('div');
    panel.id = 'cms-panel';
    panel.className = 'cms-panel';
    panel.innerHTML = `
      <div class="cms-panel-header">
        <span class="cms-panel-title">CMS Admin</span>
        <button class="cms-panel-close" id="cms-panel-close">✕</button>
      </div>
      <div class="cms-tabs">
        <button class="cms-tab active" data-tab="certificate">Certificate</button>
        <button class="cms-tab" data-tab="visit">Visit / External</button>
        <button class="cms-tab" data-tab="settings">Settings</button>
      </div>
      <div class="cms-panel-body" id="cms-panel-body"></div>
      <div class="cms-panel-status" id="cms-panel-status"></div>`;

    document.body.appendChild(panel);

    document.getElementById('cms-panel-close').onclick = () => panel.remove();
    panel.querySelectorAll('.cms-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        panel.querySelectorAll('.cms-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderTab(tab.dataset.tab);
      });
    });

    renderTab('certificate');
    requestAnimationFrame(() => panel.classList.add('open'));
  }

  async function renderTab(tab) {
    const body = document.getElementById('cms-panel-body');
    if (tab === 'certificate') {
      body.innerHTML = buildCertForm();
      document.getElementById('cms-cert-img-input').addEventListener('change', previewCertImage);
      document.getElementById('cms-cert-save').addEventListener('click', saveCertificate);
    } else if (tab === 'visit') {
      body.innerHTML = buildVisitForm();
      document.getElementById('cms-visit-save').addEventListener('click', saveVisit);
    } else if (tab === 'settings') {
      body.innerHTML = buildSettingsForm();
      document.getElementById('cms-settings-save').addEventListener('click', saveSettings);
    }
  }

  // ── Certificate Form ───────────────────────────────────────────────────────
  function buildCertForm() {
    return `
      <div class="cms-form">
        <h3 class="cms-form-title">Add Certificate</h3>
        <div class="cms-field">
          <label>Title</label>
          <input type="text" id="cms-cert-title" placeholder="e.g. Excel Expert">
        </div>
        <div class="cms-field">
          <label>Description</label>
          <input type="text" id="cms-cert-desc" placeholder="Short description">
        </div>
        <div class="cms-field">
          <label>Issuer</label>
          <input type="text" id="cms-cert-issuer" placeholder="e.g. Microsoft Office Specialist">
        </div>
        <div class="cms-field">
          <label>Status</label>
          <select id="cms-cert-status">
            <option value="active">Active</option>
            <option value="date">Date range</option>
            <option value="attempted">Attempted</option>
          </select>
        </div>
        <div class="cms-field" id="cms-cert-date-field" style="display:none">
          <label>Date Label (e.g. Nov 2025 - Nov 2030)</label>
          <input type="text" id="cms-cert-date" placeholder="Nov 2025 - Nov 2030">
        </div>
        <div class="cms-field">
          <label>Credential URL (optional)</label>
          <input type="url" id="cms-cert-url" placeholder="https://www.credly.com/...">
        </div>
        <div class="cms-field">
          <label>Section</label>
          <select id="cms-cert-section">
            <option value="certifications">Certifications</option>
            <option value="attempted">Certification Journey (Attempted)</option>
          </select>
        </div>
        <div class="cms-field">
          <label>Badge Image</label>
          <input type="file" id="cms-cert-img-input" accept="image/*">
          <img id="cms-cert-img-preview" style="display:none;max-height:80px;margin-top:0.5rem;border-radius:4px;">
        </div>
        <button class="cms-btn-primary" id="cms-cert-save">Save & Push</button>
      </div>`;
  }

  document.addEventListener('change', e => {
    if (e.target && e.target.id === 'cms-cert-status') {
      const dateField = document.getElementById('cms-cert-date-field');
      if (dateField) dateField.style.display = e.target.value === 'date' ? 'block' : 'none';
    }
  });

  function previewCertImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = document.getElementById('cms-cert-img-preview');
      img.src = ev.target.result;
      img.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  async function saveCertificate() {
    const title   = document.getElementById('cms-cert-title').value.trim();
    const desc    = document.getElementById('cms-cert-desc').value.trim();
    const issuer  = document.getElementById('cms-cert-issuer').value.trim();
    const status  = document.getElementById('cms-cert-status').value;
    const dateVal = document.getElementById('cms-cert-date') ? document.getElementById('cms-cert-date').value.trim() : '';
    const url     = document.getElementById('cms-cert-url').value.trim();
    const section = document.getElementById('cms-cert-section').value;
    const imgFile = document.getElementById('cms-cert-img-input').files[0];

    if (!title || !issuer) { setStatus('Title and Issuer are required.', 'error'); return; }

    setStatus('Saving…', 'info');

    let imagePath = '';
    if (imgFile) {
      const imgB64 = await fileToBase64(imgFile);
      const ext    = imgFile.name.split('.').pop();
      const slug   = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      imagePath    = `certificates/${slug}.${ext}`;
      const ok = await githubPutFile(imagePath, imgB64, `Add certificate image: ${title}`);
      if (!ok) { setStatus('Failed to upload image.', 'error'); return; }
    }

    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCert = {
      id, title, description: desc,
      image: imagePath ? `./${imagePath}` : '',
      issuer,
      status: status === 'date' ? 'date' : status,
      statusLabel: status === 'active' ? 'Active' : status === 'attempted' ? 'Attempted' : dateVal,
      credentialUrl: url,
      section
    };

    const data = await fetchJSON('data/certificates.json');
    if (!data) { setStatus('Failed to load certificates.json.', 'error'); return; }
    data.certificates.push(newCert);

    const ok = await githubPutJSON('data/certificates.json', data, `Add certificate: ${title}`);
    if (ok) {
      setStatus(`Certificate "${title}" added successfully!`, 'success');
      document.getElementById('cms-cert-title').value = '';
      document.getElementById('cms-cert-desc').value  = '';
      document.getElementById('cms-cert-url').value   = '';
    } else {
      setStatus('Failed to push to GitHub.', 'error');
    }
  }

  // ── Visit Form ─────────────────────────────────────────────────────────────
  function buildVisitForm() {
    return `
      <div class="cms-form">
        <h3 class="cms-form-title">Add Visit / External</h3>
        <div class="cms-field">
          <label>Title</label>
          <input type="text" id="cms-visit-title" placeholder="e.g. 2026 - Company Visit">
        </div>
        <div class="cms-field">
          <label>Duration / Label</label>
          <input type="text" id="cms-visit-duration" placeholder="e.g. March or Semester 1">
        </div>
        <div class="cms-field">
          <label>Location</label>
          <input type="text" id="cms-visit-location" placeholder="Company, City">
        </div>
        <div class="cms-field">
          <label>Category</label>
          <select id="cms-visit-category">
            <option value="visit">Visit</option>
            <option value="training">Training</option>
            <option value="external">External</option>
          </select>
        </div>
        <div class="cms-field">
          <label>Details (one per line)</label>
          <textarea id="cms-visit-details" rows="5" placeholder="What happened&#10;What you learned&#10;..."></textarea>
        </div>
        <button class="cms-btn-primary" id="cms-visit-save">Save & Push</button>
      </div>`;
  }

  async function saveVisit() {
    const title    = document.getElementById('cms-visit-title').value.trim();
    const duration = document.getElementById('cms-visit-duration').value.trim();
    const location = document.getElementById('cms-visit-location').value.trim();
    const category = document.getElementById('cms-visit-category').value;
    const rawDetails = document.getElementById('cms-visit-details').value;

    if (!title) { setStatus('Title is required.', 'error'); return; }

    const details = rawDetails.split('\n').map(l => l.trim()).filter(Boolean);
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');

    setStatus('Saving…', 'info');

    const data = await fetchJSON('data/visits.json');
    if (!data) { setStatus('Failed to load visits.json.', 'error'); return; }
    data.visits.unshift({ id, title, duration, location, category, details });

    const ok = await githubPutJSON('data/visits.json', data, `Add visit: ${title}`);
    if (ok) {
      setStatus(`Visit "${title}" added successfully!`, 'success');
      document.getElementById('cms-visit-title').value    = '';
      document.getElementById('cms-visit-details').value  = '';
    } else {
      setStatus('Failed to push to GitHub.', 'error');
    }
  }

  // ── Settings Form ──────────────────────────────────────────────────────────
  function buildSettingsForm() {
    return `
      <div class="cms-form">
        <h3 class="cms-form-title">Settings</h3>
        <div class="cms-field">
          <label>New Password</label>
          <input type="password" id="cms-new-pw" placeholder="Leave blank to keep current">
        </div>
        <div class="cms-field">
          <label>Confirm New Password</label>
          <input type="password" id="cms-new-pw2" placeholder="Confirm new password">
        </div>
        <div class="cms-field">
          <label>GitHub PAT (update)</label>
          <input type="password" id="cms-new-pat" placeholder="Leave blank to keep current">
        </div>
        <button class="cms-btn-primary" id="cms-settings-save">Update</button>
      </div>`;
  }

  async function saveSettings() {
    const pw   = document.getElementById('cms-new-pw').value;
    const pw2  = document.getElementById('cms-new-pw2').value;
    const pat  = document.getElementById('cms-new-pat').value.trim();

    if (pw) {
      if (pw !== pw2) { setStatus('Passwords do not match.', 'error'); return; }
      if (pw.length < 4) { setStatus('Password too short.', 'error'); return; }
      localStorage.setItem(LS_HASH, await sha256(pw));
    }
    if (pat) {
      localStorage.setItem(LS_PAT, pat);
    }
    setStatus('Settings saved.', 'success');
  }

  // ── GitHub API helpers ─────────────────────────────────────────────────────
  async function fetchJSON(path) {
    try {
      const res = await fetch(`data/${path.replace('data/', '')}`);
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }

  async function getFileSHA(path) {
    const pat = localStorage.getItem(LS_PAT);
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`, {
      headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha || null;
  }

  async function githubPutFile(path, base64Content, message) {
    const pat = localStorage.getItem(LS_PAT);
    const sha = await getFileSHA(path);
    const body = { message, content: base64Content, branch: BRANCH };
    if (sha) body.sha = sha;

    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${pat}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return res.ok;
  }

  async function githubPutJSON(path, data, message) {
    const json    = JSON.stringify(data, null, 2);
    const base64  = btoa(unescape(encodeURIComponent(json)));
    return githubPutFile(path, base64, message);
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => {
        const b64 = reader.result.split(',')[1];
        resolve(b64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ── Status bar ─────────────────────────────────────────────────────────────
  function setStatus(msg, type) {
    const el = document.getElementById('cms-panel-status');
    if (!el) return;
    el.textContent = msg;
    el.className = `cms-panel-status ${type}`;
    el.style.display = 'block';
    if (type === 'success') setTimeout(() => { el.style.display = 'none'; }, 4000);
  }

  // ── Styles ─────────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('cms-styles')) return;
    const s = document.createElement('style');
    s.id = 'cms-styles';
    s.textContent = `
      .cms-overlay {
        position: fixed; inset: 0; background: rgba(10,14,26,0.85);
        display: flex; align-items: center; justify-content: center;
        z-index: 99999; backdrop-filter: blur(4px);
      }
      .cms-modal {
        background: #0f1623; border: 1px solid #1e2d40;
        border-radius: 12px; padding: 2rem; width: min(420px, 90vw);
        color: #e0e6ef; font-family: 'Outfit', sans-serif;
      }
      .cms-modal-title { font-size: 1.3rem; font-weight: 700; margin: 0 0 0.4rem; color: #00FFA3; }
      .cms-modal-sub   { font-size: 0.85rem; color: #6b7a99; margin: 0 0 1.5rem; }
      .cms-field       { margin-bottom: 1rem; }
      .cms-field label { display: block; font-size: 0.78rem; color: #8a9bb5; margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: .05em; }
      .cms-field input,
      .cms-field select,
      .cms-field textarea {
        width: 100%; padding: 0.55rem 0.8rem; background: #0a0e1a;
        border: 1px solid #1e2d40; border-radius: 6px; color: #e0e6ef;
        font-family: inherit; font-size: 0.9rem; box-sizing: border-box;
        transition: border-color .2s;
      }
      .cms-field input:focus,
      .cms-field select:focus,
      .cms-field textarea:focus { outline: none; border-color: #00FFA3; }
      .cms-field textarea { resize: vertical; }
      .cms-hint        { font-size: 0.75rem; color: #4a5a72; margin-top: 0.3rem; display: block; }
      .cms-error       { background: #3a0e12; border: 1px solid #7a1e26; color: #ff6b7a; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; margin-bottom: 0.75rem; }
      .cms-modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.25rem; }
      .cms-btn-primary  { background: #00FFA3; color: #0a0e1a; border: none; border-radius: 6px; padding: 0.55rem 1.25rem; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: opacity .2s; font-family: inherit; }
      .cms-btn-primary:hover  { opacity: 0.85; }
      .cms-btn-secondary { background: transparent; color: #6b7a99; border: 1px solid #1e2d40; border-radius: 6px; padding: 0.55rem 1.25rem; font-size: 0.9rem; cursor: pointer; font-family: inherit; transition: border-color .2s; }
      .cms-btn-secondary:hover { border-color: #6b7a99; }

      .cms-panel {
        position: fixed; top: 0; right: -480px; width: min(460px, 95vw); height: 100vh;
        background: #0f1623; border-left: 1px solid #1e2d40;
        display: flex; flex-direction: column; z-index: 99998;
        transition: right .3s cubic-bezier(.4,0,.2,1);
        font-family: 'Outfit', sans-serif; color: #e0e6ef;
      }
      .cms-panel.open { right: 0; }
      .cms-panel-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 1rem 1.25rem; border-bottom: 1px solid #1e2d40; flex-shrink: 0;
      }
      .cms-panel-title { font-weight: 700; font-size: 1rem; color: #00FFA3; }
      .cms-panel-close {
        background: none; border: none; color: #6b7a99; font-size: 1.1rem;
        cursor: pointer; padding: 0.25rem; line-height: 1;
      }
      .cms-panel-close:hover { color: #e0e6ef; }
      .cms-tabs {
        display: flex; border-bottom: 1px solid #1e2d40; flex-shrink: 0;
      }
      .cms-tab {
        flex: 1; padding: 0.75rem; background: none; border: none;
        color: #6b7a99; font-family: inherit; font-size: 0.85rem; cursor: pointer;
        border-bottom: 2px solid transparent; transition: color .2s, border-color .2s;
      }
      .cms-tab.active { color: #00FFA3; border-bottom-color: #00FFA3; }
      .cms-tab:hover:not(.active) { color: #e0e6ef; }
      .cms-panel-body { flex: 1; overflow-y: auto; padding: 1.25rem; }
      .cms-form-title { font-size: 1rem; font-weight: 600; margin: 0 0 1.25rem; color: #c0cce0; }
      .cms-panel-status {
        padding: 0.7rem 1.25rem; font-size: 0.85rem; flex-shrink: 0;
        border-top: 1px solid #1e2d40; display: none;
      }
      .cms-panel-status.info    { color: #6baed6; }
      .cms-panel-status.success { color: #00FFA3; }
      .cms-panel-status.error   { color: #ff6b7a; }
    `;
    document.head.appendChild(s);
  }

})();
