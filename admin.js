/**
 * Portfolio In-House Admin Dashboard
 * For Muhammad Rafif Pratama (rafifpratama.my.id)
 */

(function () {
  'use strict';

  // Encrypted Token Payload (Protected with AES-GCM 256 PBKDF2)
  const CRYPTO_CONFIG = {
    saltHex: "b1574a6fd85331bb109a4b7b78cde058",
    ivHex: "c08afbd3bf93b849ea5165c8",
    tagHex: "972a40d79d69a13da39151248e6c073f",
    dataHex: "e8b035145f4a7b2f8c2a8c816b754f5e52b48713315cfd955b6d1fac74313c72988f2ee3527b0fa1",
    repoOwner: "abhimanyu-studio",
    repoName: "rafif-portofolio",
    branch: "main"
  };

  // State Management
  let authToken = null;
  let portfolioData = {
    profile: {},
    projects: [],
    activities: [],
    experiences: []
  };
  let pendingUploads = {}; // filename -> base64
  let isDirty = false;

  // DOM Elements
  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');
  const loginForm = document.getElementById('login-form');
  const adminPasswordInput = document.getElementById('admin-password');
  const loginError = document.getElementById('login-error');
  const loginErrorMsg = document.getElementById('login-error-msg');
  const rememberMe = document.getElementById('remember-me');
  const togglePw = document.getElementById('toggle-pw');
  const btnLogout = document.getElementById('btn-logout');
  const btnPublishAll = document.getElementById('btn-publish-all');

  // Modals
  const modalProject = document.getElementById('modal-project');
  const modalActivity = document.getElementById('modal-activity');
  const modalExp = document.getElementById('modal-exp');
  const modalPublishProgress = document.getElementById('modal-publish-progress');

  // Helpers
  function hexToBuf(hexString) {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  // Decrypt Token with Password
  async function unlockToken(password) {
    try {
      const salt = hexToBuf(CRYPTO_CONFIG.saltHex);
      const iv = hexToBuf(CRYPTO_CONFIG.ivHex);
      const data = hexToBuf(CRYPTO_CONFIG.dataHex);
      const tag = hexToBuf(CRYPTO_CONFIG.tagHex);

      const ciphertextWithTag = new Uint8Array(data.length + tag.length);
      ciphertextWithTag.set(data, 0);
      ciphertextWithTag.set(tag, data.length);

      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
      );

      const key = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        ciphertextWithTag
      );

      const dec = new TextDecoder();
      return dec.decode(decrypted);
    } catch (e) {
      console.warn("Decryption error:", e);
      return null;
    }
  }

  // Toggle Password visibility
  if (togglePw) {
    togglePw.addEventListener('click', () => {
      const isPassword = adminPasswordInput.type === 'password';
      adminPasswordInput.type = isPassword ? 'text' : 'password';
      togglePw.querySelector('span').textContent = isPassword ? 'visibility_off' : 'visibility';
    });
  }

  // Login handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    const pwd = adminPasswordInput.value.trim();

    const token = await unlockToken(pwd);
    if (!token) {
      loginErrorMsg.textContent = "Password salah! Silakan coba lagi.";
      loginError.classList.remove('hidden');
      return;
    }

    authToken = token;
    if (rememberMe.checked) {
      localStorage.setItem('rafif_admin_auth', pwd);
    } else {
      sessionStorage.setItem('rafif_admin_auth', pwd);
    }

    initDashboard();
  });

  // Check existing session
  async function checkSession() {
    const saved = localStorage.getItem('rafif_admin_auth') || sessionStorage.getItem('rafif_admin_auth');
    if (saved) {
      const token = await unlockToken(saved);
      if (token) {
        authToken = token;
        initDashboard();
        return;
      }
    }
    loginView.classList.remove('hidden');
  }

  // Logout handler
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('rafif_admin_auth');
    sessionStorage.removeItem('rafif_admin_auth');
    authToken = null;
    dashboardView.classList.add('hidden');
    loginView.classList.remove('hidden');
    adminPasswordInput.value = '';
  });

  // Initialize Dashboard
  async function initDashboard() {
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');

    try {
      const res = await fetch('data/portfolio.json?t=' + Date.now());
      if (res.ok) {
        portfolioData = await res.json();
      } else {
        console.warn("data/portfolio.json not found, using default state");
      }
    } catch (err) {
      console.error("Error loading portfolio data:", err);
    }

    renderAll();
    setupNavigation();
    setupModals();
  }

  function renderAll() {
    renderOverview();
    renderProjects();
    renderActivities();
    renderExperiences();
    updateBadges();
  }

  // Tab Navigation
  function setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active', 'bg-primary', 'text-white');
          t.classList.add('text-gray-400');
        });
        contents.forEach(c => c.classList.add('hidden'));

        tab.classList.add('active', 'bg-primary', 'text-white');
        tab.classList.remove('text-gray-400');

        const target = tab.getAttribute('data-tab');
        const targetEl = document.getElementById(target);
        if (targetEl) targetEl.classList.remove('hidden');
      });
    });
  }

  function updateBadges() {
    document.getElementById('badge-count-projects').textContent = portfolioData.projects ? portfolioData.projects.length : 0;
    document.getElementById('badge-count-activities').textContent = portfolioData.activities ? portfolioData.activities.length : 0;
    document.getElementById('badge-count-exp').textContent = portfolioData.experiences ? portfolioData.experiences.length : 0;
  }

  // 1. Overview Tab
  function renderOverview() {
    const p = portfolioData.profile || {};
    document.getElementById('prof-name').value = p.name || '';
    document.getElementById('prof-headline').value = p.headline || '';
    document.getElementById('prof-location').value = p.location || '';
    document.getElementById('prof-email').value = p.email || '';
    document.getElementById('prof-bio').value = p.bio || '';

    const stats = p.stats || {};
    document.getElementById('stat-projects').value = stats.projects || '';
    document.getElementById('stat-awards').value = stats.awards || '';
    document.getElementById('stat-exp').value = stats.experience || '';
  }

  function saveOverviewInputs() {
    if (!portfolioData.profile) portfolioData.profile = {};
    if (!portfolioData.profile.stats) portfolioData.profile.stats = {};

    portfolioData.profile.name = document.getElementById('prof-name').value;
    portfolioData.profile.headline = document.getElementById('prof-headline').value;
    portfolioData.profile.location = document.getElementById('prof-location').value;
    portfolioData.profile.email = document.getElementById('prof-email').value;
    portfolioData.profile.bio = document.getElementById('prof-bio').value;

    portfolioData.profile.stats.projects = document.getElementById('stat-projects').value;
    portfolioData.profile.stats.awards = document.getElementById('stat-awards').value;
    portfolioData.profile.stats.experience = document.getElementById('stat-exp').value;
    isDirty = true;
  }

  ['prof-name', 'prof-headline', 'prof-location', 'prof-email', 'prof-bio', 'stat-projects', 'stat-awards', 'stat-exp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', saveOverviewInputs);
  });

  // 2. Projects Tab
  function renderProjects() {
    const container = document.getElementById('projects-list');
    container.innerHTML = '';

    (portfolioData.projects || []).forEach((proj, idx) => {
      const card = document.createElement('div');
      card.className = "bg-[#181818] border border-white/10 hover:border-primary/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between group transition-all";
      card.innerHTML = `
        <div>
          <div class="aspect-[16/10] bg-[#111] rounded-xl overflow-hidden mb-3 relative border border-white/5">
            <img src="${proj.image || 'assets/placeholder.png'}" alt="${proj.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='assets/artrade_showcase.png'" />
            <span class="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
              ${proj.badge || proj.category || 'Project'}
            </span>
            ${proj.liveUrl ? `
              <a href="${proj.liveUrl}" target="_blank" class="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 shadow-md transition-all">
                <span class="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            ` : ''}
          </div>
          <div class="flex items-center justify-between gap-2 mb-1">
            <h4 class="font-extrabold text-base text-white group-hover:text-primary transition-colors font-headline">${proj.title}</h4>
            <span class="text-[11px] text-gray-400 capitalize">${proj.category || ''}</span>
          </div>
          <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4 font-body">${proj.description || ''}</p>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-white/5">
          <span class="text-[11px] text-gray-500 font-mono">#${idx + 1}</span>
          <div class="flex items-center gap-1">
            <button class="btn-edit-proj p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors" data-index="${idx}">
              <span class="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button class="btn-del-proj p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors" data-index="${idx}">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Attach click events
    container.querySelectorAll('.btn-edit-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        openProjectModal(idx);
      });
    });

    container.querySelectorAll('.btn-del-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (confirm(`Yakin ingin menghapus proyek "${portfolioData.projects[idx].title}"?`)) {
          portfolioData.projects.splice(idx, 1);
          isDirty = true;
          renderProjects();
          updateBadges();
        }
      });
    });
  }

  // 3. Activities Tab
  function renderActivities() {
    const container = document.getElementById('activities-list');
    container.innerHTML = '';

    (portfolioData.activities || []).forEach((act, idx) => {
      const card = document.createElement('div');
      card.className = "bg-[#181818] border border-white/10 hover:border-primary/40 rounded-2xl p-4 flex flex-col justify-between group transition-all";
      card.innerHTML = `
        <div>
          <div class="aspect-[4/3] bg-[#111] rounded-xl overflow-hidden mb-3 relative border border-white/5">
            <img src="${act.image || 'assets/placeholder.png'}" alt="${act.title}" class="w-full h-full object-cover ${act.objectPosition || 'object-center'} group-hover:scale-105 transition-transform duration-300" onerror="this.src='assets/activity_afl_best_team.jpg'" />
            <span class="absolute top-2.5 left-2.5 bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
              ${act.badge || 'Activity'}
            </span>
          </div>
          <h4 class="font-bold text-sm text-white mb-1 group-hover:text-primary transition-colors font-headline line-clamp-1">${act.title}</h4>
          <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3 font-body">${act.description || ''}</p>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-white/5">
          <span class="text-[11px] text-gray-500 font-mono">Foto #${idx + 1}</span>
          <div class="flex items-center gap-1">
            <button class="btn-edit-act p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors" data-index="${idx}">
              <span class="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button class="btn-del-act p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors" data-index="${idx}">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll('.btn-edit-act').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        openActivityModal(idx);
      });
    });

    container.querySelectorAll('.btn-del-act').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (confirm(`Yakin ingin menghapus foto kegiatan "${portfolioData.activities[idx].title}"?`)) {
          portfolioData.activities.splice(idx, 1);
          isDirty = true;
          renderActivities();
          updateBadges();
        }
      });
    });
  }

  // 4. Experience Tab
  function renderExperiences() {
    const container = document.getElementById('experiences-list');
    container.innerHTML = '';

    (portfolioData.experiences || []).forEach((exp, idx) => {
      const card = document.createElement('div');
      card.className = "bg-[#181818] border border-white/10 hover:border-primary/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start justify-between gap-4 transition-all";
      card.innerHTML = `
        <div class="flex-1 space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <h4 class="font-extrabold text-base text-white font-headline">${exp.company}</h4>
            <span class="text-xs text-primary font-bold bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">${exp.period}</span>
            <span class="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">${exp.badge || 'Role'}</span>
          </div>
          <p class="text-sm font-semibold text-gray-200">${exp.role} — <span class="text-xs text-gray-400 font-normal">${exp.location || ''}</span></p>
          <ul class="text-xs text-gray-400 space-y-1 pl-4 list-disc font-body">
            ${(exp.bullets || []).slice(0, 2).map(b => `<li>${b}</li>`).join('')}
            ${(exp.bullets || []).length > 2 ? `<li class="text-gray-500 italic">+ ${(exp.bullets.length - 2)} poin lainnya</li>` : ''}
          </ul>
        </div>
        <div class="flex items-center gap-1 self-end sm:self-start">
          <button class="btn-edit-exp p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors" data-index="${idx}">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button class="btn-del-exp p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors" data-index="${idx}">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      `;
      container.appendChild(card);
    });

    container.querySelectorAll('.btn-edit-exp').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        openExpModal(idx);
      });
    });

    container.querySelectorAll('.btn-del-exp').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (confirm(`Yakin ingin menghapus pengalaman di "${portfolioData.experiences[idx].company}"?`)) {
          portfolioData.experiences.splice(idx, 1);
          isDirty = true;
          renderExperiences();
          updateBadges();
        }
      });
    });
  }

  // Modals & Forms setup
  function setupModals() {
    // Close modal on click
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        modalProject.classList.add('hidden');
        modalActivity.classList.add('hidden');
        modalExp.classList.add('hidden');
      });
    });

    // Add buttons
    document.getElementById('btn-add-project').addEventListener('click', () => openProjectModal(-1));
    document.getElementById('btn-add-activity').addEventListener('click', () => openActivityModal(-1));
    document.getElementById('btn-add-exp').addEventListener('click', () => openExpModal(-1));

    // Project Form
    document.getElementById('form-project').addEventListener('submit', (e) => {
      e.preventDefault();
      const idx = parseInt(document.getElementById('proj-id').value, 10);
      const newProj = {
        id: idx >= 0 && portfolioData.projects[idx].id ? portfolioData.projects[idx].id : 'proj-' + Date.now(),
        title: document.getElementById('proj-title').value.trim(),
        category: document.getElementById('proj-category').value,
        badge: document.getElementById('proj-badge').value.trim() || 'Project',
        liveUrl: document.getElementById('proj-live-url').value.trim(),
        image: document.getElementById('proj-image').value.trim() || 'assets/artrade_showcase.png',
        description: document.getElementById('proj-desc').value.trim(),
        featured: true
      };

      if (idx >= 0) {
        portfolioData.projects[idx] = newProj;
      } else {
        portfolioData.projects.unshift(newProj);
      }

      isDirty = true;
      modalProject.classList.add('hidden');
      renderProjects();
      updateBadges();
    });

    // Activity Form
    document.getElementById('form-activity').addEventListener('submit', (e) => {
      e.preventDefault();
      const idx = parseInt(document.getElementById('act-id').value, 10);
      const newAct = {
        id: idx >= 0 && portfolioData.activities[idx].id ? portfolioData.activities[idx].id : 'act-' + Date.now(),
        title: document.getElementById('act-title').value.trim(),
        badge: document.getElementById('act-badge').value.trim() || 'Activity',
        objectPosition: document.getElementById('act-position').value,
        image: document.getElementById('act-image').value.trim() || 'assets/activity_afl_best_team.jpg',
        description: document.getElementById('act-desc').value.trim()
      };

      if (idx >= 0) {
        portfolioData.activities[idx] = newAct;
      } else {
        portfolioData.activities.push(newAct);
      }

      isDirty = true;
      modalActivity.classList.add('hidden');
      renderActivities();
      updateBadges();
    });

    // Experience Form
    document.getElementById('form-exp').addEventListener('submit', (e) => {
      e.preventDefault();
      const idx = parseInt(document.getElementById('exp-id').value, 10);
      const bulletsRaw = document.getElementById('exp-bullets').value;
      const bullets = bulletsRaw.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
      const tagsRaw = document.getElementById('exp-tags').value;
      const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

      const newExp = {
        id: idx >= 0 && portfolioData.experiences[idx].id ? portfolioData.experiences[idx].id : 'exp-' + Date.now(),
        company: document.getElementById('exp-company').value.trim(),
        role: document.getElementById('exp-role').value.trim(),
        location: document.getElementById('exp-location').value.trim(),
        period: document.getElementById('exp-period').value.trim(),
        badge: document.getElementById('exp-badge').value.trim() || 'Experience',
        bullets: bullets,
        tags: tags
      };

      if (idx >= 0) {
        portfolioData.experiences[idx] = newExp;
      } else {
        portfolioData.experiences.unshift(newExp);
      }

      isDirty = true;
      modalExp.classList.add('hidden');
      renderExperiences();
      updateBadges();
    });

    // File Input Handlers
    handleImageUpload('proj-file-input', 'proj-image', 'proj-preview-wrap', 'proj-preview-img');
    handleImageUpload('act-file-input', 'act-image', 'act-preview-wrap', 'act-preview-img');
  }

  function handleImageUpload(fileInputId, textInputId, previewWrapId, previewImgId) {
    const fileInput = document.getElementById(fileInputId);
    const textInput = document.getElementById(textInputId);
    const previewWrap = document.getElementById(previewWrapId);
    const previewImg = document.getElementById(previewImgId);

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const safeName = 'assets/' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const reader = new FileReader();

      reader.onload = function (ev) {
        const base64Data = ev.target.result.split(',')[1];
        pendingUploads[safeName] = base64Data;
        textInput.value = safeName;
        previewImg.src = ev.target.result;
        previewWrap.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    });
  }

  function openProjectModal(idx) {
    const title = document.getElementById('modal-project-title');
    const previewWrap = document.getElementById('proj-preview-wrap');
    const previewImg = document.getElementById('proj-preview-img');

    if (idx >= 0) {
      const p = portfolioData.projects[idx];
      title.textContent = 'Edit Proyek: ' + p.title;
      document.getElementById('proj-id').value = idx;
      document.getElementById('proj-title').value = p.title || '';
      document.getElementById('proj-category').value = p.category || 'startup';
      document.getElementById('proj-badge').value = p.badge || '';
      document.getElementById('proj-live-url').value = p.liveUrl || '';
      document.getElementById('proj-image').value = p.image || '';
      document.getElementById('proj-desc').value = p.description || '';

      if (p.image) {
        previewImg.src = p.image;
        previewWrap.classList.remove('hidden');
      } else {
        previewWrap.classList.add('hidden');
      }
    } else {
      title.textContent = 'Tambah Proyek Baru';
      document.getElementById('proj-id').value = -1;
      document.getElementById('form-project').reset();
      previewWrap.classList.add('hidden');
    }
    modalProject.classList.remove('hidden');
  }

  function openActivityModal(idx) {
    const title = document.getElementById('modal-activity-title');
    const previewWrap = document.getElementById('act-preview-wrap');
    const previewImg = document.getElementById('act-preview-img');

    if (idx >= 0) {
      const a = portfolioData.activities[idx];
      title.textContent = 'Edit Foto Kegiatan: ' + a.title;
      document.getElementById('act-id').value = idx;
      document.getElementById('act-title').value = a.title || '';
      document.getElementById('act-badge').value = a.badge || '';
      document.getElementById('act-position').value = a.objectPosition || 'object-top';
      document.getElementById('act-image').value = a.image || '';
      document.getElementById('act-desc').value = a.description || '';

      if (a.image) {
        previewImg.src = a.image;
        previewWrap.classList.remove('hidden');
      } else {
        previewWrap.classList.add('hidden');
      }
    } else {
      title.textContent = 'Tambah Foto Kegiatan';
      document.getElementById('act-id').value = -1;
      document.getElementById('form-activity').reset();
      previewWrap.classList.add('hidden');
    }
    modalActivity.classList.remove('hidden');
  }

  function openExpModal(idx) {
    const title = document.getElementById('modal-exp-title');
    if (idx >= 0) {
      const exp = portfolioData.experiences[idx];
      title.textContent = 'Edit Pengalaman: ' + exp.company;
      document.getElementById('exp-id').value = idx;
      document.getElementById('exp-company').value = exp.company || '';
      document.getElementById('exp-role').value = exp.role || '';
      document.getElementById('exp-location').value = exp.location || '';
      document.getElementById('exp-period').value = exp.period || '';
      document.getElementById('exp-badge').value = exp.badge || '';
      document.getElementById('exp-bullets').value = (exp.bullets || []).join('\n');
      document.getElementById('exp-tags').value = (exp.tags || []).join(', ');
    } else {
      title.textContent = 'Tambah Pengalaman Baru';
      document.getElementById('exp-id').value = -1;
      document.getElementById('form-exp').reset();
    }
    modalExp.classList.remove('hidden');
  }

  // ================= PUBLISH PIPELINE TO GITHUB =================
  btnPublishAll.addEventListener('click', async () => {
    saveOverviewInputs();

    if (!confirm("Publikasikan seluruh perubahan ke website live (rafifpratama.my.id)?")) {
      return;
    }

    modalPublishProgress.classList.remove('hidden');
    const spinner = document.getElementById('publish-spinner');
    const successIcon = document.getElementById('publish-success-icon');
    const title = document.getElementById('publish-status-title');
    const msg = document.getElementById('publish-status-msg');
    const bar = document.getElementById('publish-bar');
    const actions = document.getElementById('publish-actions');

    spinner.classList.remove('hidden');
    successIcon.classList.add('hidden');
    actions.classList.add('hidden');
    bar.style.width = '20%';

    try {
      // 1. Upload Pending Images
      const uploadKeys = Object.keys(pendingUploads);
      for (let i = 0; i < uploadKeys.length; i++) {
        const filePath = uploadKeys[i];
        const base64 = pendingUploads[filePath];
        title.textContent = `Mengunggah Gambar (${i + 1}/${uploadKeys.length})...`;
        msg.textContent = filePath;
        bar.style.width = `${20 + (i / uploadKeys.length) * 40}%`;

        // Check if file exists to get SHA
        let sha = null;
        try {
          const checkRes = await fetch(`https://api.github.com/repos/${CRYPTO_CONFIG.repoOwner}/${CRYPTO_CONFIG.repoName}/contents/${filePath}`, {
            headers: {
              'Authorization': `token ${authToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          if (checkRes.ok) {
            const data = await checkRes.json();
            sha = data.sha;
          }
        } catch (_) {}

        // Put asset
        await fetch(`https://api.github.com/repos/${CRYPTO_CONFIG.repoOwner}/${CRYPTO_CONFIG.repoName}/contents/${filePath}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${authToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `upload ${filePath} via admin dashboard`,
            content: base64,
            branch: CRYPTO_CONFIG.branch,
            ...(sha ? { sha } : {})
          })
        });
      }

      // 2. Upload Updated portfolio.json
      title.textContent = "Menyimpan Data Portofolio...";
      msg.textContent = "data/portfolio.json";
      bar.style.width = '80%';

      let currentSha = null;
      try {
        const jsonCheck = await fetch(`https://api.github.com/repos/${CRYPTO_CONFIG.repoOwner}/${CRYPTO_CONFIG.repoName}/contents/data/portfolio.json`, {
          headers: {
            'Authorization': `token ${authToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (jsonCheck.ok) {
          const jsonMeta = await jsonCheck.json();
          currentSha = jsonMeta.sha;
        }
      } catch (_) {}

      const jsonString = JSON.stringify(portfolioData, null, 2);
      const jsonBase64 = utf8ToBase64(jsonString);

      const commitRes = await fetch(`https://api.github.com/repos/${CRYPTO_CONFIG.repoOwner}/${CRYPTO_CONFIG.repoName}/contents/data/portfolio.json`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${authToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: "feat: update portfolio data via admin dashboard",
          content: jsonBase64,
          branch: CRYPTO_CONFIG.branch,
          ...(currentSha ? { sha: currentSha } : {})
        })
      });

      if (!commitRes.ok) {
        throw new Error("Gagal menyimpan ke GitHub. Status: " + commitRes.status);
      }

      // Clear pending uploads
      pendingUploads = {};
      isDirty = false;

      // Finish
      bar.style.width = '100%';
      spinner.classList.add('hidden');
      successIcon.classList.remove('hidden');
      title.textContent = "Berhasil Di-Publish!";
      msg.textContent = "Perubahan telah tersimpan ke GitHub dan website akan live dalam ~30 detik.";
      actions.classList.remove('hidden');

    } catch (err) {
      console.error("Publish error:", err);
      spinner.classList.add('hidden');
      title.textContent = "Gagal Publikasi";
      msg.textContent = err.message || "Terjadi kesalahan saat menghubungi GitHub API.";
      actions.classList.remove('hidden');
    }
  });

  document.getElementById('btn-close-publish').addEventListener('click', () => {
    modalPublishProgress.classList.add('hidden');
  });

  // Start
  checkSession();

})();
