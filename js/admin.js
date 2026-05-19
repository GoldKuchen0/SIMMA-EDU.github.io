(function () {
  'use strict';

  const REPO   = 'GoldKuchen0/SIMMA-EDU.github.io';
  const BRANCH = 'main';
  const LS_HASH  = 'cms_pw_hash';
  const LS_PAT   = 'cms_gh_pat';
  const LS_SETUP = 'cms_setup_done';

  const TABS = [
    { id: 'cert',    label: 'Cert'      },
    { id: 'visit',   label: 'Visit'     },
    { id: 'exp',     label: 'Exp'       },
    { id: 'project', label: 'Project'   },
    { id: 'skill',   label: 'Skill'     },
    { id: 'contact', label: 'Contact'   },
    { id: 'settings',label: 'Settings'  },
  ];

  // ── edit state ──────────────────────────────────────────────────────────────
  const editing = { cert: null, visit: null, exp: null, project: null, skill: null };

  // ── trigger: 5 clicks on [MS] footer logo within 3 s ──────────────────────
  let clicks = 0, clickTimer = null;
  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    document.querySelectorAll('.footer-logo').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        clearTimeout(clickTimer);
        clicks++;
        clickTimer = setTimeout(() => { clicks = 0; }, 3000);
        if (clicks >= 5) { clicks = 0; clearTimeout(clickTimer); openAdmin(); }
      });
    });
  });

  // ── entry ──────────────────────────────────────────────────────────────────
  function openAdmin() {
    localStorage.getItem(LS_SETUP) ? showLoginModal() : showSetupModal();
  }

  // ── SHA-256 ────────────────────────────────────────────────────────────────
  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  // ── modal helpers ──────────────────────────────────────────────────────────
  function makeOverlay(id, html) {
    const el = document.createElement('div');
    el.id = id; el.className = 'cms-overlay'; el.innerHTML = html;
    document.body.appendChild(el); return el;
  }
  function removeEl(id) { const e = document.getElementById(id); if (e) e.remove(); }
  function showErr(el, msg) { el.textContent = msg; el.style.display = 'block'; }

  // ── setup modal ────────────────────────────────────────────────────────────
  function showSetupModal() {
    const ov = makeOverlay('cms-setup-overlay', `
      <div class="cms-modal">
        <h2 class="cms-modal-title">Admin Setup</h2>
        <p class="cms-modal-sub">One-time configuration for your CMS credentials.</p>
        <div class="cms-field"><label>Password</label><input type="password" id="sp1" placeholder="Choose a password" autocomplete="new-password"></div>
        <div class="cms-field"><label>Confirm Password</label><input type="password" id="sp2" placeholder="Confirm password" autocomplete="new-password"></div>
        <div class="cms-field"><label>GitHub Personal Access Token</label><input type="password" id="sp3" placeholder="ghp_..." autocomplete="off"><span class="cms-hint">Needs repo write access.</span></div>
        <div id="setup-err" class="cms-error" style="display:none"></div>
        <div class="cms-modal-actions">
          <button class="cms-btn-secondary" id="setup-cancel">Cancel</button>
          <button class="cms-btn-primary" id="setup-save">Save & Open</button>
        </div>
      </div>`);
    ov.querySelector('#setup-cancel').onclick = () => removeEl('cms-setup-overlay');
    ov.querySelector('#setup-save').onclick = async () => {
      const pw=ov.querySelector('#sp1').value, pw2=ov.querySelector('#sp2').value, pat=ov.querySelector('#sp3').value.trim();
      const err=ov.querySelector('#setup-err');
      if (!pw||pw.length<4) { showErr(err,'Password must be at least 4 characters.'); return; }
      if (pw!==pw2)          { showErr(err,'Passwords do not match.');                 return; }
      if (!pat.startsWith('ghp_')&&!pat.startsWith('github_pat_')) { showErr(err,'Invalid PAT format.'); return; }
      localStorage.setItem(LS_HASH, await sha256(pw));
      localStorage.setItem(LS_PAT, pat);
      localStorage.setItem(LS_SETUP, '1');
      removeEl('cms-setup-overlay'); openPanel();
    };
  }

  // ── login modal ────────────────────────────────────────────────────────────
  function showLoginModal() {
    const ov = makeOverlay('cms-login-overlay', `
      <div class="cms-modal">
        <h2 class="cms-modal-title">Admin Login</h2>
        <div class="cms-field"><label>Password</label><input type="password" id="lp" placeholder="Password" autocomplete="current-password"></div>
        <div id="login-err" class="cms-error" style="display:none"></div>
        <div class="cms-modal-actions">
          <button class="cms-btn-secondary" id="login-cancel">Cancel</button>
          <button class="cms-btn-primary" id="login-enter">Enter</button>
        </div>
        <p class="cms-hint" style="margin-top:1rem;text-align:center;"><a href="#" id="login-reset" style="color:var(--accent)">Reset credentials</a></p>
      </div>`);
    const inp = ov.querySelector('#lp');
    const tryLogin = async () => {
      const hash = await sha256(inp.value);
      if (hash===localStorage.getItem(LS_HASH)) { removeEl('cms-login-overlay'); openPanel(); }
      else showErr(ov.querySelector('#login-err'), 'Incorrect password.');
    };
    inp.addEventListener('keydown', e => { if(e.key==='Enter') tryLogin(); });
    ov.querySelector('#login-cancel').onclick = () => removeEl('cms-login-overlay');
    ov.querySelector('#login-enter').onclick  = tryLogin;
    ov.querySelector('#login-reset').onclick  = e => {
      e.preventDefault();
      if (confirm('Clear all CMS credentials?')) {
        [LS_HASH,LS_PAT,LS_SETUP].forEach(k => localStorage.removeItem(k));
        removeEl('cms-login-overlay'); showSetupModal();
      }
    };
  }

  // ── panel ──────────────────────────────────────────────────────────────────
  function openPanel() {
    if (document.getElementById('cms-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'cms-panel'; panel.className = 'cms-panel';
    panel.innerHTML = `
      <div class="cms-panel-header">
        <span class="cms-panel-title">CMS Admin</span>
        <button class="cms-panel-close" id="cms-close">✕</button>
      </div>
      <div class="cms-tabs" id="cms-tabs">
        ${TABS.map(t=>`<button class="cms-tab${t.id==='cert'?' active':''}" data-tab="${t.id}">${t.label}</button>`).join('')}
      </div>
      <div class="cms-panel-body" id="cms-body"></div>
      <div class="cms-panel-status" id="cms-status"></div>`;
    document.body.appendChild(panel);
    document.getElementById('cms-close').onclick = () => panel.remove();
    panel.querySelectorAll('.cms-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.cms-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTab(btn.dataset.tab);
      });
    });
    renderTab('cert');
    requestAnimationFrame(() => panel.classList.add('open'));
  }

  async function renderTab(tab) {
    const body = document.getElementById('cms-body');
    if (!body) return;
    body.innerHTML = '<div class="cms-loading">Loading…</div>';
    if      (tab==='cert')    await renderCertTab();
    else if (tab==='visit')   await renderVisitTab();
    else if (tab==='exp')     await renderExpTab();
    else if (tab==='project') await renderProjectTab();
    else if (tab==='skill')   await renderSkillTab();
    else if (tab==='contact') await renderContactTab();
    else if (tab==='settings') renderSettingsTab();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CERTIFICATES
  // ═══════════════════════════════════════════════════════════════════════════
  async function renderCertTab() {
    const data = await fetchJSON('data/certificates.json');
    const body = document.getElementById('cms-body');
    const editingCert = editing.cert ? data.certificates.find(c=>c.id===editing.cert) : null;
    body.innerHTML = `
      ${buildItemList(data.certificates, 'cert', 'title')}
      <hr class="cms-divider">
      <div class="cms-form">
        <h3 class="cms-form-title">${editingCert?'Edit Certificate':'Add Certificate'}</h3>
        <div class="cms-field"><label>Title</label><input type="text" id="cf-title" value="${editingCert?esc(editingCert.title):''}" placeholder="e.g. Excel Expert"></div>
        <div class="cms-field"><label>Description</label><input type="text" id="cf-desc" value="${editingCert?esc(editingCert.description):''}" placeholder="Short description"></div>
        <div class="cms-field"><label>Issuer</label><input type="text" id="cf-issuer" value="${editingCert?esc(editingCert.issuer):''}" placeholder="e.g. Microsoft Office Specialist"></div>
        <div class="cms-field"><label>Status</label>
          <select id="cf-status">
            <option value="active" ${editingCert&&editingCert.status==='active'?'selected':''}>Active</option>
            <option value="date"   ${editingCert&&editingCert.status==='date'?'selected':''}>Date range</option>
            <option value="attempted" ${editingCert&&editingCert.status==='attempted'?'selected':''}>Attempted</option>
          </select>
        </div>
        <div class="cms-field" id="cf-date-wrap" style="display:${editingCert&&editingCert.status==='date'?'block':'none'}">
          <label>Date Label</label><input type="text" id="cf-date" value="${editingCert&&editingCert.status==='date'?esc(editingCert.statusLabel):''}" placeholder="Nov 2025 - Nov 2030">
        </div>
        <div class="cms-field"><label>Credential URL</label><input type="url" id="cf-url" value="${editingCert?esc(editingCert.credentialUrl):''}" placeholder="https://www.credly.com/..."></div>
        <div class="cms-field"><label>Section</label>
          <select id="cf-section">
            <option value="certifications" ${!editingCert||editingCert.section==='certifications'?'selected':''}>Certifications</option>
            <option value="attempted" ${editingCert&&editingCert.section==='attempted'?'selected':''}>Certification Journey (Attempted)</option>
          </select>
        </div>
        <div class="cms-field"><label>Badge Image (upload to replace)</label>
          <input type="file" id="cf-img" accept="image/*">
          ${editingCert&&editingCert.image?`<p class="cms-hint">Current: ${editingCert.image}</p>`:''}
        </div>
        <div class="cms-btn-row">
          ${editingCert?`<button class="cms-btn-secondary" id="cf-cancel">Cancel Edit</button>`:''}
          <button class="cms-btn-primary" id="cf-save">${editingCert?'Update & Push':'Add & Push'}</button>
        </div>
      </div>`;

    document.getElementById('cf-status').addEventListener('change', e => {
      document.getElementById('cf-date-wrap').style.display = e.target.value==='date'?'block':'none';
    });
    if (editingCert) document.getElementById('cf-cancel').onclick = () => { editing.cert=null; renderTab('cert'); };
    document.getElementById('cf-save').onclick = () => saveCert(data);
    bindListActions('cert');
  }

  async function saveCert(data) {
    const title  = v('cf-title'), desc = v('cf-desc'), issuer = v('cf-issuer');
    const status = v('cf-status'), dateVal = v('cf-date'), url = v('cf-url'), section = v('cf-section');
    const imgFile = document.getElementById('cf-img').files[0];
    if (!title||!issuer) { setStatus('Title and Issuer required.','error'); return; }
    setStatus('Saving…','info');

    let imagePath = editing.cert ? data.certificates.find(c=>c.id===editing.cert)?.image||'' : '';
    if (imgFile) {
      const b64 = await fileToBase64(imgFile);
      const ext = imgFile.name.split('.').pop();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-');
      imagePath = `certificates/${slug}.${ext}`;
      const ok = await githubPutFile(imagePath, b64, `cert image: ${title}`);
      if (!ok) { setStatus('Image upload failed.','error'); return; }
    }
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const item = { id, title, description:desc, image:imagePath?`./${imagePath}`:(editing.cert?data.certificates.find(c=>c.id===editing.cert)?.image:''), issuer, status, statusLabel:status==='active'?'Active':status==='attempted'?'Attempted':dateVal, credentialUrl:url, section };
    if (editing.cert) {
      const idx = data.certificates.findIndex(c=>c.id===editing.cert);
      if (idx>-1) data.certificates[idx] = {...data.certificates[idx], ...item, id:data.certificates[idx].id};
      editing.cert = null;
    } else {
      data.certificates.push(item);
    }
    const ok = await githubPutJSON('data/certificates.json', data, `cert: ${title}`);
    setStatus(ok?`"${title}" saved!`:'GitHub push failed.', ok?'success':'error');
    if (ok) renderTab('cert');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VISITS
  // ═══════════════════════════════════════════════════════════════════════════
  async function renderVisitTab() {
    const data = await fetchJSON('data/visits.json');
    const ev = editing.visit ? data.visits.find(x=>x.id===editing.visit) : null;
    const body = document.getElementById('cms-body');
    body.innerHTML = `
      ${buildItemList(data.visits,'visit','title')}
      <hr class="cms-divider">
      <div class="cms-form">
        <h3 class="cms-form-title">${ev?'Edit Visit':'Add Visit / External'}</h3>
        <div class="cms-field"><label>Title</label><input type="text" id="vf-title" value="${ev?esc(ev.title):''}" placeholder="e.g. 2026 - Company Visit"></div>
        <div class="cms-field"><label>Duration / Label</label><input type="text" id="vf-dur" value="${ev?esc(ev.duration):''}" placeholder="March or Semester 1"></div>
        <div class="cms-field"><label>Location</label><input type="text" id="vf-loc" value="${ev?esc(ev.location):''}" placeholder="Company, City"></div>
        <div class="cms-field"><label>Category</label>
          <select id="vf-cat">
            <option value="visit"    ${ev&&ev.category==='visit'?'selected':''}>Visit</option>
            <option value="training" ${ev&&ev.category==='training'?'selected':''}>Training</option>
            <option value="external" ${ev&&ev.category==='external'?'selected':''}>External</option>
          </select>
        </div>
        <div class="cms-field"><label>Details (one per line)</label>
          <textarea id="vf-det" rows="5" placeholder="What happened&#10;What you learned">${ev?(ev.details||[]).join('\n'):''}</textarea>
        </div>
        <div class="cms-btn-row">
          ${ev?`<button class="cms-btn-secondary" id="vf-cancel">Cancel Edit</button>`:''}
          <button class="cms-btn-primary" id="vf-save">${ev?'Update & Push':'Add & Push'}</button>
        </div>
      </div>`;
    if (ev) document.getElementById('vf-cancel').onclick = () => { editing.visit=null; renderTab('visit'); };
    document.getElementById('vf-save').onclick = () => saveVisit(data);
    bindListActions('visit');
  }

  async function saveVisit(data) {
    const title=v('vf-title'), dur=v('vf-dur'), loc=v('vf-loc'), cat=v('vf-cat');
    const details = document.getElementById('vf-det').value.split('\n').map(l=>l.trim()).filter(Boolean);
    if (!title) { setStatus('Title required.','error'); return; }
    setStatus('Saving…','info');
    const id = editing.visit || title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-+/g,'-');
    const item = { id, title, duration:dur, location:loc, category:cat, details };
    if (editing.visit) {
      const idx = data.visits.findIndex(x=>x.id===editing.visit);
      if (idx>-1) data.visits[idx] = item; editing.visit=null;
    } else { data.visits.unshift(item); }
    const ok = await githubPutJSON('data/visits.json', data, `visit: ${title}`);
    setStatus(ok?`"${title}" saved!`:'GitHub push failed.', ok?'success':'error');
    if (ok) renderTab('visit');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPERIENCE
  // ═══════════════════════════════════════════════════════════════════════════
  async function renderExpTab() {
    const data = await fetchJSON('data/experience.json');
    const ev = editing.exp ? data.entries.find(x=>x.id===editing.exp) : null;
    const body = document.getElementById('cms-body');
    body.innerHTML = `
      ${buildItemList(data.entries,'exp','title')}
      <hr class="cms-divider">
      <div class="cms-form">
        <h3 class="cms-form-title">${ev?'Edit Experience':'Add Experience'}</h3>
        <div class="cms-field"><label>Title</label><input type="text" id="ef-title" value="${ev?esc(ev.title):''}" placeholder="2024 - Internship at Company"></div>
        <div class="cms-field"><label>Duration</label><input type="text" id="ef-dur" value="${ev?esc(ev.duration):''}" placeholder="6 weeks"></div>
        <div class="cms-field"><label>Location</label><input type="text" id="ef-loc" value="${ev?esc(ev.location):''}" placeholder="Company, City"></div>
        <div class="cms-field"><label>Category</label>
          <select id="ef-cat">
            <option value="education" ${ev&&ev.category==='education'?'selected':''}>Education</option>
            <option value="work"      ${ev&&ev.category==='work'?'selected':''}>Work &amp; Internships</option>
          </select>
        </div>
        <div class="cms-field"><label>Type</label>
          <select id="ef-type">
            <option value="false" ${!ev||!ev.expandable?'selected':''}>Simple (bullet list)</option>
            <option value="true"  ${ev&&ev.expandable?'selected':''}>Expandable (tasks / tools / learned)</option>
          </select>
        </div>
        <div id="ef-simple-wrap" style="display:${ev&&ev.expandable?'none':'block'}">
          <div class="cms-field"><label>Details (one per line)</label>
            <textarea id="ef-details" rows="4">${ev&&!ev.expandable?(ev.details||[]).join('\n'):''}</textarea>
          </div>
        </div>
        <div id="ef-expand-wrap" style="display:${ev&&ev.expandable?'block':'none'}">
          <div class="cms-field"><label>Tasks (one per line)</label>
            <textarea id="ef-tasks" rows="4">${ev&&ev.expandable?(ev.tasks||[]).join('\n'):''}</textarea>
          </div>
          <div class="cms-field"><label>Tools Used (one per line)</label>
            <textarea id="ef-tools" rows="3">${ev&&ev.expandable?(ev.tools||[]).join('\n'):''}</textarea>
          </div>
          <div class="cms-field"><label>What I Learned (one per line)</label>
            <textarea id="ef-learned" rows="4">${ev&&ev.expandable?(ev.learned||[]).join('\n'):''}</textarea>
          </div>
        </div>
        <div class="cms-btn-row">
          ${ev?`<button class="cms-btn-secondary" id="ef-cancel">Cancel Edit</button>`:''}
          <button class="cms-btn-primary" id="ef-save">${ev?'Update & Push':'Add & Push'}</button>
        </div>
      </div>`;
    document.getElementById('ef-type').addEventListener('change', e => {
      const expand = e.target.value==='true';
      document.getElementById('ef-simple-wrap').style.display = expand?'none':'block';
      document.getElementById('ef-expand-wrap').style.display = expand?'block':'none';
    });
    if (ev) document.getElementById('ef-cancel').onclick = () => { editing.exp=null; renderTab('exp'); };
    document.getElementById('ef-save').onclick = () => saveExp(data);
    bindListActions('exp');
  }

  async function saveExp(data) {
    const title=v('ef-title'), dur=v('ef-dur'), loc=v('ef-loc'), cat=v('ef-cat');
    const expandable = document.getElementById('ef-type').value==='true';
    if (!title) { setStatus('Title required.','error'); return; }
    setStatus('Saving…','info');
    const lines = el => (document.getElementById(el)||{value:''}).value.split('\n').map(l=>l.trim()).filter(Boolean);
    const id = editing.exp || title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-+/g,'-');
    const item = expandable
      ? {id, title, duration:dur, location:loc, category:cat, expandable:true, tasks:lines('ef-tasks'), tools:lines('ef-tools'), learned:lines('ef-learned')}
      : {id, title, duration:dur, location:loc, category:cat, expandable:false, details:lines('ef-details')};
    if (editing.exp) {
      const idx = data.entries.findIndex(x=>x.id===editing.exp);
      if (idx>-1) data.entries[idx]=item; editing.exp=null;
    } else { data.entries.unshift(item); }
    const ok = await githubPutJSON('data/experience.json', data, `exp: ${title}`);
    setStatus(ok?`"${title}" saved!`:'GitHub push failed.', ok?'success':'error');
    if (ok) renderTab('exp');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECTS
  // ═══════════════════════════════════════════════════════════════════════════
  async function renderProjectTab() {
    const data = await fetchJSON('data/projects.json');
    const ep = editing.project ? data.projects.find(x=>x.id===editing.project) : null;
    const body = document.getElementById('cms-body');
    body.innerHTML = `
      ${buildItemList(data.projects,'project','name')}
      <hr class="cms-divider">
      <div class="cms-form">
        <h3 class="cms-form-title">${ep?'Edit Project':'Add Project'}</h3>
        <div class="cms-field"><label>Name</label><input type="text" id="pf-name" value="${ep?esc(ep.name):''}" placeholder="Project Name"></div>
        <div class="cms-field"><label>Tagline</label><input type="text" id="pf-tag" value="${ep?esc(ep.tagline):''}" placeholder="Short description"></div>
        <div class="cms-field"><label>Course</label><input type="text" id="pf-course" value="${ep?esc(ep.course):''}" placeholder="e.g. TBUCO"></div>
        <div class="cms-field"><label>Status</label>
          <select id="pf-status">
            <option value="completed"   ${ep&&ep.status==='completed'?'selected':''}>Completed</option>
            <option value="development" ${ep&&ep.status==='development'?'selected':''}>In Development</option>
            <option value="future"      ${ep&&ep.status==='future'?'selected':''}>Future Project</option>
          </select>
        </div>
        <div class="cms-field"><label>Logo</label>
          <select id="pf-logo-type">
            <option value="emoji" ${ep&&ep.logo&&!ep.logo.img?'selected':''}>Emoji</option>
            <option value="image" ${ep&&ep.logo&&ep.logo.img?'selected':''}>Image path</option>
          </select>
          <input type="text" id="pf-logo-val" value="${ep&&ep.logo?(ep.logo.ico||ep.logo.img||''):''}" placeholder="🗄️ or ./img/..." style="margin-top:.4rem;">
        </div>
        <div class="cms-field"><label>Overview</label><textarea id="pf-overview" rows="4">${ep?esc(ep.overview):''}</textarea></div>
        <div class="cms-field"><label>Note (italic, optional)</label><input type="text" id="pf-note" value="${ep?esc(ep.overviewNote||''):''}" placeholder="Future plans..."></div>
        <div class="cms-field"><label>Tech Stack Section Title</label><input type="text" id="pf-techtitle" value="${ep?esc(ep.techTitle||'Technology Stack'):''}" placeholder="Technology Stack"></div>
        <div class="cms-field"><label>Tech Stack (one per line: emoji Name :: Description <em>or</em> img:./path Name :: Description)</label>
          <textarea id="pf-tech" rows="5" placeholder="🐍 Python :: Core language&#10;img:./img/x.png Django :: Web framework">${ep?(ep.tech||[]).map(t=>t.img?`img:${t.img} ${t.name} :: ${t.desc}`:`${t.ico||''} ${t.name} :: ${t.desc}`).join('\n'):''}</textarea>
        </div>
        <div class="cms-field"><label>Features (Title :: Description, one per line; blank line = new section)</label>
          <textarea id="pf-feats" rows="6" placeholder="Key Features&#10;Admin Panel :: Complete UI&#10;Security :: CSRF protection&#10;&#10;Future Plans&#10;Backend :: Laravel">${ep?serializeFeats(ep.featSections):''}</textarea>
        </div>
        <div class="cms-field"><label>Team (Name :: Role, one per line)</label>
          <textarea id="pf-team" rows="3" placeholder="Max :: Infrastructure&#10;Sven :: Developer">${ep?(ep.team||[]).map(m=>`${m.name} :: ${m.role}`).join('\n'):''}</textarea>
        </div>
        <div class="cms-field"><label>What I Learned (one per line)</label>
          <textarea id="pf-learned" rows="3">${ep?(ep.learned||[]).join('\n'):''}</textarea>
        </div>
        <div class="cms-field"><label>Downloads (emoji :: Title :: Description :: URL, one per line)</label>
          <textarea id="pf-dl" rows="3" placeholder="📄 :: Documentation :: Project docs (PDF) :: Downloads/x.pdf">${ep?(ep.downloads||[]).map(d=>`${d.ico} :: ${d.name} :: ${d.desc} :: ${d.url}`).join('\n'):''}</textarea>
        </div>
        <div class="cms-btn-row">
          ${ep?`<button class="cms-btn-secondary" id="pf-cancel">Cancel Edit</button>`:''}
          <button class="cms-btn-primary" id="pf-save">${ep?'Update & Push':'Add & Push'}</button>
        </div>
      </div>`;
    if (ep) document.getElementById('pf-cancel').onclick = () => { editing.project=null; renderTab('project'); };
    document.getElementById('pf-save').onclick = () => saveProject(data);
    bindListActions('project');
  }

  function serializeFeats(featSections) {
    if (!featSections||!featSections.length) return '';
    return featSections.map(fs => fs.title+'\n'+fs.items.map(i=>`${i.t} :: ${i.d}`).join('\n')).join('\n\n');
  }

  function parseFeats(raw) {
    const sections = []; let cur = null;
    raw.split('\n').forEach(line => {
      const l = line.trim();
      if (!l) { cur=null; return; }
      if (!l.includes(' :: ')) { cur={title:l,items:[]}; sections.push(cur); }
      else if (cur) { const [t,...rest]=l.split(' :: '); cur.items.push({t:t.trim(),d:rest.join(' :: ').trim()}); }
      else { cur={title:'Features',items:[{t:l.split(' :: ')[0].trim(),d:l.split(' :: ').slice(1).join(' :: ').trim()}]}; sections.push(cur); }
    });
    return sections;
  }

  async function saveProject(data) {
    const name=v('pf-name'), tagline=v('pf-tag'), course=v('pf-course'), status=v('pf-status');
    const logoType=v('pf-logo-type'), logoVal=v('pf-logo-val');
    if (!name) { setStatus('Name required.','error'); return; }
    setStatus('Saving…','info');
    const lines = id => (document.getElementById(id)||{value:''}).value.split('\n').map(l=>l.trim()).filter(Boolean);
    const tech = lines('pf-tech').map(l => {
      if (l.startsWith('img:')) { const [imgPart,...rest]=l.slice(4).split(' '); const [name,...desc]=rest.join(' ').split(' :: '); return {img:imgPart,name:name.trim(),desc:desc.join(' :: ').trim()}; }
      const firstSpace=l.indexOf(' '); const ico=l.slice(0,firstSpace).trim(); const rest2=l.slice(firstSpace+1); const [name2,...desc2]=rest2.split(' :: '); return {ico,name:name2.trim(),desc:desc2.join(' :: ').trim()};
    });
    const downloads = lines('pf-dl').map(l => { const p=l.split(' :: '); return {ico:p[0]?.trim()||'📄',name:p[1]?.trim()||'',desc:p[2]?.trim()||'',url:p[3]?.trim()||'',note:''}; });
    const team = lines('pf-team').map(l => { const [n,...r]=l.split(' :: '); return {name:n.trim(),role:r.join(' :: ').trim()}; });
    const id = editing.project || name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-+/g,'project-');
    const logo = logoType==='image' ? {img:logoVal} : {ico:logoVal};
    const item = {
      id, name, tagline, course, status, filterStatus:status, logo,
      overview:v('pf-overview'), overviewNote:v('pf-note'),
      tech, techTitle:v('pf-techtitle')||'Technology Stack',
      featSections:parseFeats(document.getElementById('pf-feats').value),
      team, learned:lines('pf-learned'), screenshots:editing.project?(data.projects.find(x=>x.id===editing.project)?.screenshots||[]):[],
      downloads
    };
    if (editing.project) {
      const idx=data.projects.findIndex(x=>x.id===editing.project);
      if (idx>-1) data.projects[idx]=item; editing.project=null;
    } else { data.projects.push(item); }
    const ok = await githubPutJSON('data/projects.json', data, `project: ${name}`);
    setStatus(ok?`"${name}" saved!`:'GitHub push failed.', ok?'success':'error');
    if (ok) renderTab('project');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HARD SKILLS
  // ═══════════════════════════════════════════════════════════════════════════
  async function renderSkillTab() {
    const data = await fetchJSON('data/hardskills.json');
    const es = editing.skill ? data.skills.find(x=>x.id===editing.skill) : null;
    const body = document.getElementById('cms-body');
    body.innerHTML = `
      ${buildItemList(data.skills,'skill','name')}
      <hr class="cms-divider">
      <div class="cms-form">
        <h3 class="cms-form-title">${es?'Edit Skill Row':'Add Skill Row'}</h3>
        <div class="cms-field"><label>Icon (emoji)</label><input type="text" id="sf-icon" value="${es?esc(es.icon):''}" placeholder="☁️" style="width:4rem"></div>
        <div class="cms-field"><label>Category Name</label><input type="text" id="sf-name" value="${es?esc(es.name):''}" placeholder="Cloud"></div>
        <div class="cms-field"><label>Tags (one per line: Label  <em>or</em>  Label :: tooltip)</label>
          <textarea id="sf-tags" rows="5" placeholder="Python&#10;Bash / PowerShell :: Scripting shells">${es?(es.tags||[]).map(t=>t.tip?`${t.label} :: ${t.tip}`:t.label).join('\n'):''}</textarea>
        </div>
        <div class="cms-field"><label>Related Projects (one per line: Label :: projects.html#id)</label>
          <textarea id="sf-proj" rows="3" placeholder="LME :: projects.html#project-lme">${es?(es.projects||[]).map(p=>`${p.label} :: ${p.href}`).join('\n'):''}</textarea>
        </div>
        <div class="cms-btn-row">
          ${es?`<button class="cms-btn-secondary" id="sf-cancel">Cancel Edit</button>`:''}
          <button class="cms-btn-primary" id="sf-save">${es?'Update & Push':'Add & Push'}</button>
        </div>
      </div>`;
    if (es) document.getElementById('sf-cancel').onclick = () => { editing.skill=null; renderTab('skill'); };
    document.getElementById('sf-save').onclick = () => saveSkill(data);
    bindListActions('skill');
  }

  async function saveSkill(data) {
    const icon=v('sf-icon'), name=v('sf-name');
    if (!name) { setStatus('Name required.','error'); return; }
    setStatus('Saving…','info');
    const lines = id => (document.getElementById(id)||{value:''}).value.split('\n').map(l=>l.trim()).filter(Boolean);
    const tags = lines('sf-tags').map(l => l.includes(' :: ') ? {label:l.split(' :: ')[0].trim(),tip:l.split(' :: ')[1].trim()} : {label:l,tip:''});
    const projects = lines('sf-proj').map(l => { const [label,...h]=l.split(' :: '); return {label:label.trim(),href:h.join(' :: ').trim()}; });
    const id = editing.skill || name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const item = {id, icon, name, tags, projects};
    if (editing.skill) {
      const idx=data.skills.findIndex(x=>x.id===editing.skill);
      if (idx>-1) data.skills[idx]=item; editing.skill=null;
    } else { data.skills.push(item); }
    const ok = await githubPutJSON('data/hardskills.json', data, `skill: ${name}`);
    setStatus(ok?`"${name}" saved!`:'GitHub push failed.', ok?'success':'error');
    if (ok) renderTab('skill');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTACT
  // ═══════════════════════════════════════════════════════════════════════════
  async function renderContactTab() {
    const data = await fetchJSON('data/contact.json');
    const body = document.getElementById('cms-body');
    const f = (id, lbl, val, type='text') =>
      `<div class="cms-field"><label>${lbl}</label><input type="${type}" id="ct-${id}" value="${esc(val||'')}"></div>`;
    body.innerHTML = `
      <div class="cms-form">
        <h3 class="cms-form-title">Edit Contact Info</h3>
        ${f('email',    'Email',         data.email, 'email')}
        ${f('linkedin', 'LinkedIn URL',  data.linkedin, 'url')}
        ${f('lihandle', 'LinkedIn Handle (display text)', data.linkedinHandle)}
        ${f('avail',    'Availability Status', data.availability)}
        ${f('response', 'Response Time', data.responseTime)}
        ${f('education','Education',     data.education)}
        ${f('location', 'Location',      data.location)}
        <div class="cms-field"><label>Contact Page Description</label>
          <textarea id="ct-desc" rows="3">${esc(data.description||'')}</textarea>
        </div>
        ${f('cta-title','CTA Title',     data.ctaTitle)}
        <div class="cms-field"><label>CTA Text</label>
          <textarea id="ct-cta-text" rows="2">${esc(data.ctaText||'')}</textarea>
        </div>
        ${f('stats-certs',   'Stats: Certifications', data.statsCertifications)}
        ${f('stats-projects','Stats: Projects',       data.statsProjects)}
        ${f('tagline',   'Footer Tagline', data.tagline)}
        ${f('card-name', 'Card Name',    data.cardName)}
        ${f('card-role', 'Card Role',    data.cardRole)}
        <button class="cms-btn-primary" id="ct-save">Save & Push</button>
      </div>`;
    document.getElementById('ct-save').onclick = () => saveContact(data);
  }

  async function saveContact(data) {
    setStatus('Saving…','info');
    const cv = id => v('ct-'+id);
    const tv = id => { const el=document.getElementById('ct-'+id); return el?el.value.trim():''; };
    const updated = {
      ...data,
      email: cv('email'), linkedin: cv('linkedin'), linkedinHandle: cv('lihandle'),
      availability: cv('avail'), responseTime: cv('response'),
      education: cv('education'), location: cv('location'),
      description: tv('desc'), ctaTitle: cv('cta-title'), ctaText: tv('cta-text'),
      statsCertifications: cv('stats-certs'), statsProjects: cv('stats-projects'),
      tagline: cv('tagline'), cardName: cv('card-name'), cardRole: cv('card-role')
    };
    const ok = await githubPutJSON('data/contact.json', updated, 'Update contact info');
    setStatus(ok?'Contact info saved!':'GitHub push failed.', ok?'success':'error');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════
  function renderSettingsTab() {
    document.getElementById('cms-body').innerHTML = `
      <div class="cms-form">
        <h3 class="cms-form-title">Settings</h3>
        <div class="cms-field"><label>New Password</label><input type="password" id="st-pw" placeholder="Leave blank to keep current"></div>
        <div class="cms-field"><label>Confirm New Password</label><input type="password" id="st-pw2" placeholder="Confirm"></div>
        <div class="cms-field"><label>GitHub PAT (update)</label><input type="password" id="st-pat" placeholder="Leave blank to keep current"></div>
        <button class="cms-btn-primary" id="st-save">Update</button>
      </div>`;
    document.getElementById('st-save').onclick = async () => {
      const pw=v('st-pw'), pw2=v('st-pw2'), pat=v('st-pat');
      if (pw) { if (pw!==pw2) { setStatus('Passwords do not match.','error'); return; } localStorage.setItem(LS_HASH, await sha256(pw)); }
      if (pat) localStorage.setItem(LS_PAT, pat);
      setStatus('Settings saved.','success');
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST + DELETE + EDIT helpers
  // ═══════════════════════════════════════════════════════════════════════════
  function buildItemList(items, type, labelKey) {
    if (!items||!items.length) return '<p class="cms-hint cms-empty">No items yet.</p>';
    return `<div class="cms-list">${items.map(item => `
      <div class="cms-list-item" data-type="${type}" data-id="${item.id}">
        <span class="cms-list-label">${esc(item[labelKey]||item.id)}</span>
        <div class="cms-list-actions">
          <button class="cms-list-btn cms-edit-btn">Edit</button>
          <button class="cms-list-btn cms-del-btn">Delete</button>
        </div>
      </div>`).join('')}</div>`;
  }

  function bindListActions(type) {
    const body = document.getElementById('cms-body');
    body.querySelectorAll(`.cms-edit-btn`).forEach(btn => {
      btn.onclick = () => {
        const id = btn.closest('.cms-list-item').dataset.id;
        editing[type] = id; renderTab(type);
      };
    });
    body.querySelectorAll(`.cms-del-btn`).forEach(btn => {
      btn.onclick = async () => {
        const id = btn.closest('.cms-list-item').dataset.id;
        if (!confirm(`Delete "${id}"?`)) return;
        setStatus('Deleting…','info');
        await deleteItem(type, id);
      };
    });
  }

  async function deleteItem(type, id) {
    const fileMap = { cert:'data/certificates.json', visit:'data/visits.json', exp:'data/experience.json', project:'data/projects.json', skill:'data/hardskills.json' };
    const arrayMap = { cert:'certificates', visit:'visits', exp:'entries', project:'projects', skill:'skills' };
    const path = fileMap[type], key = arrayMap[type];
    const data = await fetchJSON(path);
    if (!data) { setStatus('Load failed.','error'); return; }
    data[key] = data[key].filter(x => x.id !== id);
    const ok = await githubPutJSON(path, data, `delete ${type}: ${id}`);
    setStatus(ok?'Deleted!':'Push failed.', ok?'success':'error');
    if (ok) { if(editing[type]===id) editing[type]=null; renderTab(type); }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GitHub API helpers
  // ═══════════════════════════════════════════════════════════════════════════
  async function fetchJSON(path) {
    try { const r=await fetch(path+'?v='+Date.now()); return r.ok?await r.json():null; }
    catch { return null; }
  }

  async function getFileSHA(path) {
    const pat=localStorage.getItem(LS_PAT);
    const r=await fetch(`https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`,{headers:{Authorization:`token ${pat}`,Accept:'application/vnd.github.v3+json'}});
    if (!r.ok) return null;
    return (await r.json()).sha||null;
  }

  async function githubPutFile(path, b64, msg) {
    const pat=localStorage.getItem(LS_PAT), sha=await getFileSHA(path);
    const body={message:msg,content:b64,branch:BRANCH}; if(sha) body.sha=sha;
    const r=await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`,{method:'PUT',headers:{Authorization:`token ${pat}`,Accept:'application/vnd.github.v3+json','Content-Type':'application/json'},body:JSON.stringify(body)});
    return r.ok;
  }

  async function githubPutJSON(path, data, msg) {
    const json=JSON.stringify(data,null,2);
    const b64=btoa(unescape(encodeURIComponent(json)));
    return githubPutFile(path,b64,msg);
  }

  function fileToBase64(file) {
    return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(',')[1]); r.onerror=rej; r.readAsDataURL(file); });
  }

  // ── utilities ──────────────────────────────────────────────────────────────
  function v(id) { const e=document.getElementById(id); return e?e.value.trim():''; }
  function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function setStatus(msg, type) {
    const el=document.getElementById('cms-status'); if(!el) return;
    el.textContent=msg; el.className=`cms-panel-status ${type}`; el.style.display='block';
    if(type==='success') setTimeout(()=>{ el.style.display='none'; },4000);
  }

  // ── styles ─────────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('cms-styles')) return;
    const s=document.createElement('style'); s.id='cms-styles';
    s.textContent=`
      .cms-overlay{position:fixed;inset:0;background:rgba(10,14,26,.88);display:flex;align-items:center;justify-content:center;z-index:99999;backdrop-filter:blur(4px)}
      .cms-modal{background:#0f1623;border:1px solid #1e2d40;border-radius:12px;padding:2rem;width:min(420px,90vw);color:#e0e6ef;font-family:'Outfit',sans-serif}
      .cms-modal-title{font-size:1.3rem;font-weight:700;margin:0 0 .4rem;color:#00FFA3}
      .cms-modal-sub{font-size:.85rem;color:#6b7a99;margin:0 0 1.5rem}
      .cms-field{margin-bottom:.9rem}
      .cms-field label{display:block;font-size:.75rem;color:#8a9bb5;margin-bottom:.3rem;text-transform:uppercase;letter-spacing:.05em}
      .cms-field input,.cms-field select,.cms-field textarea{width:100%;padding:.5rem .75rem;background:#0a0e1a;border:1px solid #1e2d40;border-radius:6px;color:#e0e6ef;font-family:inherit;font-size:.88rem;box-sizing:border-box;transition:border-color .2s}
      .cms-field input:focus,.cms-field select:focus,.cms-field textarea:focus{outline:none;border-color:#00FFA3}
      .cms-field textarea{resize:vertical}
      .cms-hint{font-size:.75rem;color:#4a5a72;margin-top:.3rem;display:block}
      .cms-error{background:#3a0e12;border:1px solid #7a1e26;color:#ff6b7a;border-radius:6px;padding:.5rem .75rem;font-size:.85rem;margin-bottom:.75rem}
      .cms-modal-actions,.cms-btn-row{display:flex;gap:.6rem;justify-content:flex-end;margin-top:1.1rem;flex-wrap:wrap}
      .cms-btn-primary{background:#00FFA3;color:#0a0e1a;border:none;border-radius:6px;padding:.5rem 1.1rem;font-weight:700;font-size:.88rem;cursor:pointer;font-family:inherit;transition:opacity .2s}
      .cms-btn-primary:hover{opacity:.85}
      .cms-btn-secondary{background:transparent;color:#6b7a99;border:1px solid #1e2d40;border-radius:6px;padding:.5rem 1.1rem;font-size:.88rem;cursor:pointer;font-family:inherit;transition:border-color .2s}
      .cms-btn-secondary:hover{border-color:#6b7a99}
      .cms-panel{position:fixed;top:0;right:-500px;width:min(480px,96vw);height:100vh;background:#0f1623;border-left:1px solid #1e2d40;display:flex;flex-direction:column;z-index:99998;transition:right .3s cubic-bezier(.4,0,.2,1);font-family:'Outfit',sans-serif;color:#e0e6ef}
      .cms-panel.open{right:0}
      .cms-panel-header{display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.1rem;border-bottom:1px solid #1e2d40;flex-shrink:0}
      .cms-panel-title{font-weight:700;font-size:.95rem;color:#00FFA3}
      .cms-panel-close{background:none;border:none;color:#6b7a99;font-size:1.1rem;cursor:pointer;padding:.2rem;line-height:1}
      .cms-panel-close:hover{color:#e0e6ef}
      .cms-tabs{display:flex;border-bottom:1px solid #1e2d40;flex-shrink:0;overflow-x:auto}
      .cms-tab{flex-shrink:0;padding:.6rem .7rem;background:none;border:none;color:#6b7a99;font-family:inherit;font-size:.8rem;cursor:pointer;border-bottom:2px solid transparent;transition:color .2s,border-color .2s;white-space:nowrap}
      .cms-tab.active{color:#00FFA3;border-bottom-color:#00FFA3}
      .cms-tab:hover:not(.active){color:#e0e6ef}
      .cms-panel-body{flex:1;overflow-y:auto;padding:1rem}
      .cms-form-title{font-size:.95rem;font-weight:600;margin:0 0 1rem;color:#c0cce0}
      .cms-panel-status{padding:.65rem 1.1rem;font-size:.85rem;flex-shrink:0;border-top:1px solid #1e2d40;display:none}
      .cms-panel-status.info{color:#6baed6}.cms-panel-status.success{color:#00FFA3}.cms-panel-status.error{color:#ff6b7a}
      .cms-divider{border:none;border-top:1px solid #1e2d40;margin:1rem 0}
      .cms-loading{color:#6b7a99;padding:1rem;text-align:center}
      .cms-empty{padding:.5rem 0}
      .cms-list{display:flex;flex-direction:column;gap:.4rem;margin-bottom:.5rem}
      .cms-list-item{display:flex;align-items:center;justify-content:space-between;background:#0a0e1a;border:1px solid #1e2d40;border-radius:6px;padding:.45rem .75rem;gap:.5rem}
      .cms-list-label{font-size:.82rem;color:#c0cce0;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .cms-list-actions{display:flex;gap:.35rem;flex-shrink:0}
      .cms-list-btn{border:none;border-radius:4px;padding:.25rem .6rem;font-size:.75rem;cursor:pointer;font-family:inherit}
      .cms-edit-btn{background:#1e3a2a;color:#00FFA3}
      .cms-del-btn{background:#3a1e1e;color:#ff6b7a}
      .cms-edit-btn:hover{background:#2a5a3a}.cms-del-btn:hover{background:#5a2a2a}
    `;
    document.head.appendChild(s);
  }

})();
