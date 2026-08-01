/* ==========================================================================
   PORTFOLIO INTERACTIVE APP - THREE.JS 3D PARTICLES & DYNAMIC PROJECT STORE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. INITIALIZE SPLASH INTRO PRELOADER ---
  initPreloader();

  // --- 2. INITIALIZE THREE.JS 3D PARTICLE HERO ANIMATION ---
  initThreeJSScene();

  // --- 3. INITIALIZE PROJECT STORE & LOCALSTORAGE ---
  initProjectStore();

  // --- 4. INITIALIZE UI CONTROLS & EVENT LISTENERS ---
  initUIControls();

  // --- 5. INITIALIZE CV RESUME MODAL ---
  initCVModal();

  // --- 6. INITIALIZE CUSTOM CURSOR ---
  initCustomCursor();

  // --- 7. INITIALIZE STATS COUNT UP & INTERSECTION OBSERVER ---
  initStatsObserver();

  // --- 8. INITIALIZE TERMINAL CLI & FAQ ACCORDION ---
  initTerminalCLI();
  initFAQAccordion();
});

/* ==========================================================================
   1. THREE.JS HYPERSPACE SPEEDLINE TUNNEL (PURE BLACK & WHITE MONOCHROME)
   ========================================================================== */
function initThreeJSScene() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  if (typeof THREE === 'undefined') {
    initFallback2DSpeedlines(canvas);
    return;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x000000, 0.004);

  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 30);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: false,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // --- HYPERSPACE SPEEDLINES ---
  const lineCount = 1800;
  const tunnelLength = 1600; // Z-depth -1570 to +30
  const geometry = new THREE.BufferGeometry();
  
  // Each line has 2 points (Start point and End point along Z)
  const positions = new Float32Array(lineCount * 2 * 3);
  const baseData = []; // Store origin (x, y, initialZ, initialLength)

  for (let i = 0; i < lineCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 12 + Math.random() * 45; // Distribute in wider cylindrical tunnel
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = 30 - Math.random() * tunnelLength;
    const baseLen = 10 + Math.random() * 22;

    baseData.push({ x, y, z, baseLen, radius, angle });

    const idx = i * 6;
    // Point A
    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
    // Point B (stretching backwards along Z)
    positions[idx + 3] = x;
    positions[idx + 4] = y;
    positions[idx + 5] = z - baseLen;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Pure Monochrome High-Contrast Line Material
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    linewidth: 2
  });

  const speedlinesMesh = new THREE.LineSegments(geometry, lineMaterial);
  scene.add(speedlinesMesh);

  // Concentric Speed Ring Accents (Bold Wireframes)
  const ringCount = 38;
  const ringSpacing = tunnelLength / ringCount;
  const rings = [];

  for (let i = 0; i < ringCount; i++) {
    const ringGeo = new THREE.TorusGeometry(32, 0.55, 8, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.z = 30 - (i * ringSpacing);
    scene.add(ringMesh);
    rings.push(ringMesh);
  }

  // Expose Theme Color Updater for Three.js Canvas
  window.updateCanvasThemeColors = (theme) => {
    const isLight = theme === 'light';
    const bgHex = isLight ? 0xffffff : 0x000000;
    const fgHex = isLight ? 0x000000 : 0xffffff;

    scene.background.setHex(bgHex);
    scene.fog.color.setHex(bgHex);
    lineMaterial.color.setHex(fgHex);
    lineMaterial.opacity = isLight ? 0.98 : 0.92;

    rings.forEach(ring => {
      ring.material.color.setHex(fgHex);
      ring.material.opacity = isLight ? 0.75 : 0.50;
    });
  };

  // Set initial colors based on current html attribute
  const currentInitialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  window.updateCanvasThemeColors(currentInitialTheme);

  // Expose Impulse Trigger for Finger-Snap Intro Unlock
  window.triggerHyperspaceImpulse = () => {
    scrollVelocity = 28;
  };

  // --- SCROLL SPEED & DIRECTION CONTROLLER ---
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  const baseSpeed = 0.8; // Idle forward cruise speed

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;

    // Scrolling DOWN (delta > 0): Fast forward hyperspace warp
    // Scrolling UP (delta < 0): Reverse backward velocity
    scrollVelocity += delta * 0.15;
    lastScrollY = currentScrollY;
  });

  window.addEventListener('wheel', (e) => {
    scrollVelocity += e.deltaY * 0.05;
  }, { passive: true });

  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 3;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 3;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- ANIMATION LOOP ---
  function animate() {
    requestAnimationFrame(animate);

    // Smooth Mouse Camera Tilt
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    camera.position.x = mouse.x;
    camera.position.y = mouse.y;
    camera.lookAt(0, 0, -100);

    // Velocity Friction Decay
    scrollVelocity *= 0.92;

    const currentSpeed = baseSpeed + scrollVelocity;
    // Stretch speedlines as speed increases!
    const stretch = Math.max(1, 1 + Math.abs(currentSpeed) * 0.5);

    const posArr = geometry.attributes.position.array;

    for (let i = 0; i < lineCount; i++) {
      const data = baseData[i];
      const idx = i * 6;

      // Update Z Position
      data.z += currentSpeed;

      // Infinite Z Wrap
      if (data.z > 35) {
        data.z -= tunnelLength;
      } else if (data.z < (30 - tunnelLength)) {
        data.z += tunnelLength;
      }

      const lineLen = data.baseLen * stretch;

      // Point A
      posArr[idx] = data.x;
      posArr[idx + 1] = data.y;
      posArr[idx + 2] = data.z;

      // Point B (Stretching backwards)
      posArr[idx + 3] = data.x;
      posArr[idx + 4] = data.y;
      posArr[idx + 5] = data.z - lineLen;
    }

    geometry.attributes.position.needsUpdate = true;

    // Rotate & wrap concentric rings
    rings.forEach(ring => {
      ring.position.z += currentSpeed;
      ring.rotation.z += 0.002;

      if (ring.position.z > 35) {
        ring.position.z -= tunnelLength;
      } else if (ring.position.z < (30 - tunnelLength)) {
        ring.position.z += tunnelLength;
      }
    });

    renderer.render(scene, camera);
  }

  animate();
}

function initFallback2DSpeedlines(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const numLines = 600;
  const lines = [];
  const fov = 350;

  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  const baseSpeed = 3.5;

  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - width / 2) * 0.12;
    mouseY = (e.clientY - height / 2) * 0.12;
  });

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    scrollVelocity += delta * 0.35;
    lastScrollY = currentScrollY;
  });

  window.addEventListener('wheel', (e) => {
    scrollVelocity += e.deltaY * 0.12;
  }, { passive: true });

  for (let i = 0; i < numLines; i++) {
    lines.push(createLine());
  }

  function createLine() {
    const angle = Math.random() * Math.PI * 2;
    const radius = 30 + Math.random() * (Math.max(width, height) * 0.75);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: Math.random() * 1100 + 40,
      length: 24 + Math.random() * 40,
      alpha: 0.55 + Math.random() * 0.45
    };
  }

  let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

  window.updateCanvasThemeColors = (theme) => {
    currentTheme = theme;
  };

  function animate() {
    requestAnimationFrame(animate);

    scrollVelocity *= 0.92;
    const speed = baseSpeed + scrollVelocity;
    const stretch = Math.max(1, 1 + Math.abs(speed) * 0.15);

    const isLight = currentTheme === 'light';
    const bgFill = isLight ? '#ffffff' : '#000000';
    const strokeColor = isLight ? '0, 0, 0' : '255, 255, 255';

    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2 + mouseX;
    const cy = height / 2 + mouseY;

    for (let i = 0; i < numLines; i++) {
      const l = lines[i];

      l.z -= speed * 2;

      if (l.z <= 10) {
        l.z += 1100;
      } else if (l.z > 1150) {
        l.z -= 1100;
      }

      const scaleA = fov / l.z;
      const xA = cx + l.x * scaleA;
      const yA = cy + l.y * scaleA;

      const zB = l.z + l.length * stretch;
      const scaleB = fov / zB;
      const xB = cx + l.x * scaleB;
      const yB = cy + l.y * scaleB;

      if (xA >= 0 && xA <= width && yA >= 0 && yA <= height) {
        ctx.beginPath();
        ctx.moveTo(xA, yA);
        ctx.lineTo(xB, yB);
        ctx.strokeStyle = `rgba(${strokeColor}, ${l.alpha})`;
        ctx.lineWidth = Math.max(1.2, scaleA * 3.2);
        ctx.stroke();
      }
    }
  }

  animate();
}

/* ==========================================================================
   2. PROJECT STORE & LOCALSTORAGE MANAGEMENT
   ========================================================================== */
const STORAGE_KEY = 'portfolio_user_projects_v20';

// Default Initial Showcase Projects (Aman Jain CV Portfolio)
const DEFAULT_PROJECTS = [
  {
    id: 'proj-1',
    title: 'NutriLumen – 360° Holistic Wellness Platform',
    category: 'Web App',
    tech: ['React', 'Next.js', 'Node.js', 'Tailwind CSS', 'UI/UX Design'],
    description: 'A 360° Holistic Wellness Initiative integrating Mind, Body & Soul. Features client meal planning, dietary analytics, and personalized wellness dashboards at thenutrilumen.com.',
    image: 'nutrilumen-preview.png',
    demoUrl: 'https://thenutrilumen.com',
    githubUrl: 'https://github.com/cooldude698',
    isUserUploaded: false,
    date: '2026-04-15'
  },
  {
    id: 'proj-2',
    title: 'Drishti AI – Crime Tracking & Intelligence Co-Pilot',
    category: 'AI / Tools',
    tech: ['Python', 'React', 'MongoDB', 'AI Models', 'REST APIs'],
    description: 'Karnataka State Police Co-Pilot: Next-Gen AI Crime Intelligence Platform with live crime tracking, predictive analytics, 5,35,815+ MCCTNS records & digital FIR management at drishtiii.vercel.app.',
    image: 'drishti-preview.png',
    demoUrl: 'https://drishtiii.vercel.app',
    githubUrl: 'https://github.com/cooldude698',
    isUserUploaded: false,
    date: '2026-05-10'
  },
  {
    id: 'proj-3',
    title: 'Rawgenn Tech – Talent & Engineering Platform',
    category: 'Web App',
    tech: ['React', 'Next.js', 'Node.js', 'Tailwind CSS', 'UI/UX Design'],
    description: 'RAWGENN – Talent, Curated. Quality, Guaranteed: Founded and independently built rawgenn.tech, connecting clients with elite engineering talent for end-to-end digital solutions.',
    image: 'rawgenn-preview.png',
    demoUrl: 'https://rawgenn.tech',
    githubUrl: 'https://github.com/cooldude698',
    isUserUploaded: false,
    date: '2026-06-01'
  }
];

let projectsList = [];
let currentFilter = 'all';
let searchQuery = '';

async function initProjectStore() {
  // Try fetching live from Firebase Cloud Firestore
  if (typeof window.fetchCloudProjects === 'function') {
    let cloudProjects = await window.fetchCloudProjects();

    // If Firestore database is brand new and empty, seed initial projects to Firebase
    if (!cloudProjects || cloudProjects.length === 0) {
      if (typeof window.saveCloudProject === 'function') {
        console.log("🔥 Seeding initial projects to Firebase Cloud Firestore...");
        for (const proj of DEFAULT_PROJECTS) {
          await window.saveCloudProject(proj);
        }
        cloudProjects = await window.fetchCloudProjects();
      }
    }

    if (cloudProjects && cloudProjects.length > 0) {
      projectsList = cloudProjects;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projectsList));
      renderProjects();
      return;
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        projectsList = parsed;
      } else {
        projectsList = DEFAULT_PROJECTS;
      }
    } catch (e) {
      console.error('Failed to parse localStorage projects', e);
      projectsList = DEFAULT_PROJECTS;
    }
  } else {
    projectsList = DEFAULT_PROJECTS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
  }
  renderProjects();
}

function saveUserProjectsToStorage() {
  const userOnly = projectsList.filter(p => p.isUserUploaded);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userOnly));
}

function renderProjects() {
  const homeGrid = document.getElementById('homeProjectsGrid');
  const grid = document.getElementById('projectsGrid');
  const emptyState = document.getElementById('emptyState');

  // If on Home Page (#homeProjectsGrid exists), render 3 featured preview projects
  if (homeGrid) {
    homeGrid.innerHTML = '';
    const previews = projectsList.slice(0, 3);
    previews.forEach(proj => {
      const card = createProjectCardElement(proj);
      homeGrid.appendChild(card);
    });
  }

  // If on Projects Page (#projectsGrid exists), render full search/filter grid
  if (grid) {
    grid.innerHTML = '';

    const filtered = projectsList.filter(proj => {
      let matchesCategory = false;
      if (currentFilter === 'all') {
        matchesCategory = true;
      } else if (currentFilter === 'User Uploaded') {
        matchesCategory = proj.isUserUploaded;
      } else {
        matchesCategory = proj.category.toLowerCase() === currentFilter.toLowerCase();
      }

      let matchesSearch = true;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const titleMatch = proj.title.toLowerCase().includes(q);
        const descMatch = proj.description.toLowerCase().includes(q);
        const techMatch = proj.tech.some(t => t.toLowerCase().includes(q));
        matchesSearch = titleMatch || descMatch || techMatch;
      }

      return matchesCategory && matchesSearch;
    });

    if (emptyState) {
      if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }

    filtered.forEach(proj => {
      const card = createProjectCardElement(proj);
      grid.appendChild(card);
    });
  }

  // Update stats counters across pages
  const projectStatEl = document.querySelector('[data-count="35"]');
  if (projectStatEl) {
    projectStatEl.setAttribute('data-count', projectsList.length);
    projectStatEl.textContent = projectsList.length;
  }
}

function createProjectCardElement(proj) {
  // Enforce authoritative URLs & screenshots for core showcase projects regardless of browser cache
  if (proj.id === 'proj-2' || proj.title.includes('Drishti') || proj.title.includes('Crime')) {
    proj.demoUrl = 'https://drishtiii.vercel.app';
    proj.githubUrl = 'https://github.com/cooldude698';
    proj.image = 'drishti-preview.png';
    proj.title = 'Drishti AI – Crime Tracking & Intelligence Co-Pilot';
    proj.description = 'Karnataka State Police Co-Pilot: Next-Gen AI Crime Intelligence Platform with live crime tracking, predictive analytics, 5,35,815+ MCCTNS records & digital FIR management at drishtiii.vercel.app.';
  } else if (proj.id === 'proj-3' || proj.title.includes('Rawgenn')) {
    proj.demoUrl = 'https://rawgenn.tech';
    proj.githubUrl = 'https://github.com/cooldude698';
    proj.image = 'rawgenn-preview.png';
    proj.title = 'Rawgenn Tech – Talent & Engineering Platform';
    proj.description = 'RAWGENN – Talent, Curated. Quality, Guaranteed: Founded and independently built rawgenn.tech, connecting clients with elite engineering talent for end-to-end digital solutions.';
  } else if (proj.id === 'proj-1' || proj.title.includes('NutriLumen') || proj.title.includes('Schedula')) {
    proj.demoUrl = 'https://thenutrilumen.com';
    proj.githubUrl = 'https://github.com/cooldude698';
    proj.image = 'nutrilumen-preview.png';
    proj.title = 'NutriLumen – 360° Holistic Wellness Platform';
    proj.description = 'A 360° Holistic Wellness Initiative integrating Mind, Body & Soul. Features client meal planning, dietary analytics, and personalized wellness dashboards at thenutrilumen.com.';
  }

  const card = document.createElement('div');
  card.className = 'project-card glass-panel';

  const techBadges = proj.tech
    .map(t => `<span class="tech-chip">${t.trim()}</span>`)
    .join('');

  const userBadge = proj.isUserUploaded
    ? `<span class="user-tag-badge"><i class="fa-solid fa-user-check"></i> Uploaded</span>`
    : '';

  card.innerHTML = `
    <div class="project-thumb">
      <img src="${proj.image}" alt="${proj.title}" loading="lazy" />
      ${userBadge}
      <span class="category-badge">${proj.category}</span>
    </div>
    <div class="project-body">
      <h3 class="project-title">${proj.title}</h3>
      <p class="project-desc">${proj.description}</p>
      <div class="project-tech">
        ${techBadges}
      </div>
      <div class="project-footer">
        <div class="project-links">
          ${proj.demoUrl ? `<a href="${proj.demoUrl}" target="_blank" rel="noopener" class="project-link-btn" title="Live Demo"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
          ${proj.githubUrl ? `<a href="${proj.githubUrl}" target="_blank" rel="noopener" class="project-link-btn" title="GitHub Repo"><i class="fa-brands fa-github"></i></a>` : ''}
          <button class="project-link-btn view-detail-btn" data-id="${proj.id}" title="Inspect Project Details">
            <i class="fa-solid fa-eye"></i>
          </button>
        </div>
        ${proj.isUserUploaded ? `<button class="delete-project-btn" data-id="${proj.id}" title="Delete Project"><i class="fa-solid fa-trash"></i></button>` : ''}
      </div>
    </div>
  `;

  // Attach card event listeners
  const detailBtn = card.querySelector('.view-detail-btn');
  if (detailBtn) {
    detailBtn.addEventListener('click', () => openProjectDetailModal(proj.id));
  }

  const deleteBtn = card.querySelector('.delete-project-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteProject(proj.id);
    });
  }

  return card;
}

function deleteProject(id) {
  if (confirm('Are you sure you want to delete this project?')) {
    projectsList = projectsList.filter(p => p.id !== id);
    saveUserProjectsToStorage();
    renderProjects();
    showToast('Project deleted successfully.', 'info');
  }
}

// Generate stylized SVG Data URL placeholders for default projects
function createPlaceholderSvgImage(title) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="600" height="400" fill="#000000"/>
    <rect width="600" height="400" fill="url(#grid)"/>
    <circle cx="300" cy="200" r="120" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2" stroke-dasharray="8 6"/>
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Syne, sans-serif" font-size="28" font-weight="800">${title}</text>
    <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="#aaaaaa" font-family="JetBrains Mono, monospace" font-size="14" letter-spacing="3">// HYPERSPACE PROJECT</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

/* ==========================================================================
   3. UI CONTROLS & EVENT LISTENERS
   ========================================================================== */
function initUIControls() {
  // Mobile Nav Menu Toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
  }

  // Sticky Navbar Scroll Listener
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Filter Pills Handler
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      filterPills.forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.getAttribute('data-filter');
      renderProjects();
    });
  });

  // Search Bar Handler
  const searchInput = document.getElementById('projectSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchQuery.length > 0) {
        clearSearchBtn.classList.add('visible');
      } else {
        clearSearchBtn.classList.remove('visible');
      }
      renderProjects();
    });

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.classList.remove('visible');
        renderProjects();
      });
    }
  }

  // MODAL: Upload Project Triggers
  const uploadModal = document.getElementById('uploadModal');
  const openUploadModalBtn = document.getElementById('openUploadModalBtn');
  const heroAddBtn = document.getElementById('heroAddBtn');
  const uploadProjectTrigger = document.getElementById('uploadProjectTrigger');
  const emptyStateUploadBtn = document.getElementById('emptyStateUploadBtn');
  const closeUploadModalBtn = document.getElementById('closeUploadModalBtn');
  const cancelUploadBtn = document.getElementById('cancelUploadBtn');

  const openUploadModal = () => {
    if (uploadModal) uploadModal.classList.remove('hidden');
  };

  const closeUploadModal = () => {
    if (uploadModal) {
      uploadModal.classList.add('hidden');
      resetUploadForm();
    }
  };

  // Check URL params for ?upload=true
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('upload') === 'true' && uploadModal) {
    openUploadModal();
  }

  [openUploadModalBtn, heroAddBtn, uploadProjectTrigger, emptyStateUploadBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', openUploadModal);
  });

  [closeUploadModalBtn, cancelUploadBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', closeUploadModal);
  });

  uploadModal.addEventListener('click', (e) => {
    if (e.target === uploadModal) closeUploadModal();
  });

  // Drag & Drop File Upload Handler
  const dropzone = document.getElementById('fileDropzone');
  const fileInput = document.getElementById('projectImageInput');
  const dropzoneContent = document.getElementById('dropzoneContent');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const imagePreview = document.getElementById('imagePreview');
  const removeImageBtn = document.getElementById('removeImageBtn');

  let uploadedImageDataUrl = '';

  if (dropzone && fileInput) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files[0]) handleFileSelect(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    });

    function handleFileSelect(file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        uploadedImageDataUrl = event.target.result;
        imagePreview.src = uploadedImageDataUrl;
        dropzoneContent.classList.add('hidden');
        imagePreviewContainer.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }

    if (removeImageBtn) {
      removeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadedImageDataUrl = '';
        fileInput.value = '';
        imagePreview.src = '';
        dropzoneContent.classList.remove('hidden');
        imagePreviewContainer.classList.add('hidden');
      });
    }
  }

  // Upload Form Submit Event
  const uploadForm = document.getElementById('uploadProjectForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('projectTitle').value;
      const category = document.getElementById('projectCategory').value;
      const techString = document.getElementById('projectTechStack').value;
      const description = document.getElementById('projectDescription').value;
      const demoUrl = document.getElementById('projectDemoUrl').value;
      const githubUrl = document.getElementById('projectGithubUrl').value;

      const techArray = techString.split(',').map(s => s.trim()).filter(Boolean);

      const newProject = {
        id: 'user-proj-' + Date.now(),
        title: title,
        category: category,
        tech: techArray.length > 0 ? techArray : ['Web'],
        description: description,
        image: uploadedImageDataUrl || createPlaceholderSvgImage(title, '#00f2fe', '#9d4edd'),
        demoUrl: demoUrl || '#',
        githubUrl: githubUrl || '#',
        isUserUploaded: true,
        date: new Date().toISOString().split('T')[0]
      };

      projectsList.unshift(newProject);
      saveUserProjectsToStorage();
      renderProjects();
      closeUploadModal();
      showToast('Project uploaded & published successfully!', 'success');
    });
  }

  function resetUploadForm() {
    if (uploadForm) uploadForm.reset();
    uploadedImageDataUrl = '';
    if (imagePreviewContainer) imagePreviewContainer.classList.add('hidden');
    if (dropzoneContent) dropzoneContent.classList.remove('hidden');
  }

  // MODAL: Detail Inspector Close
  const detailModal = document.getElementById('detailModal');
  const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
  if (detailModal && closeDetailModalBtn) {
    closeDetailModalBtn.addEventListener('click', () => detailModal.classList.add('hidden'));
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) detailModal.classList.add('hidden');
    });
  }

  // Copy Email Handlers
  const copyEmailBtns = document.querySelectorAll('.copy-email-btn, #copyEmailAbout');
  copyEmailBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const email = 'aj2194078@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast('Email copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Email: ' + email, 'info');
      });
    });
  });

  // Contact Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.reset();
      showToast('Message sent! I will respond within 24 hours.', 'success');
    });
  }
}

// Open Project Detail Inspector
function openProjectDetailModal(id) {
  const proj = projectsList.find(p => p.id === id);
  if (!proj) return;

  const detailModal = document.getElementById('detailModal');
  const detailContent = document.getElementById('detailModalContent');

  const techBadges = proj.tech.map(t => `<span class="tech-chip">${t}</span>`).join('');

  detailContent.innerHTML = `
    <img src="${proj.image}" alt="${proj.title}" class="detail-img" />
    <h2 class="detail-title">${proj.title}</h2>
    <div class="detail-tags">
      <span class="category-badge" style="position:static;">${proj.category}</span>
      ${techBadges}
    </div>
    <p class="detail-description">${proj.description}</p>
    <div class="detail-actions">
      ${proj.demoUrl && proj.demoUrl !== '#' ? `<a href="${proj.demoUrl}" target="_blank" rel="noopener" class="btn btn-gradient"><i class="fa-solid fa-arrow-up-right-from-square"></i> Visit Live App</a>` : ''}
      ${proj.githubUrl && proj.githubUrl !== '#' ? `<a href="${proj.githubUrl}" target="_blank" rel="noopener" class="btn btn-outline"><i class="fa-brands fa-github"></i> Source Code</a>` : ''}
    </div>
  `;

  detailModal.classList.remove('hidden');
}

/* ==========================================================================
   4. CUSTOM GLOWING CURSOR FOLLOWER
   ========================================================================== */
function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Add Hover scale effect for interactive elements
  const interactables = 'a, button, input, textarea, select, .project-card, .social-card, .filter-pill';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactables)) {
      ring.classList.add('active');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactables)) {
      ring.classList.remove('active');
    }
  });
}

/* ==========================================================================
   5. STATS COUNT-UP & INTERSECTION OBSERVER
   ========================================================================== */
function initStatsObserver() {
  const statValues = document.querySelectorAll('.stat-value');
  if (statValues.length === 0) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statValues.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-count'), 10) || 0;
          let count = 0;
          const speed = Math.max(1, Math.floor(target / 40));

          const updateCounter = () => {
            count += speed;
            if (count >= target) {
              counter.textContent = target + '+';
            } else {
              counter.textContent = count;
              setTimeout(updateCounter, 30);
            }
          };
          updateCounter();
        });
      }
    });
  }, { threshold: 0.5 });

  const aboutSection = document.getElementById('about');
  if (aboutSection) observer.observe(aboutSection);
}

/* ==========================================================================
   TOAST NOTIFICATION SYSTEM
   ========================================================================== */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconClass = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info');

  toast.innerHTML = `
    <i class="fa-solid ${iconClass} toast-icon"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

/* ==========================================================================
   INTERACTIVE TERMINAL CLI & FAQ ACCORDION HANDLERS
   ========================================================================== */
window.runTerminalCmd = function(cmdText) {
  if (!cmdText || !cmdText.trim()) return;
  const cleanCmd = cmdText.trim().replace(/\\/g, '').toLowerCase();
  if (!cleanCmd) return;

  const terminalBody = document.getElementById('terminalOutput');
  const terminalInput = document.getElementById('terminalInput');

  if (terminalBody) {
    // Echo user input
    const userLine = document.createElement('div');
    userLine.className = 'terminal-line';
    userLine.innerHTML = `<span class="prompt-user">aman@portfolio:~$</span> ${escapeHtml(cleanCmd)}`;
    terminalBody.appendChild(userLine);

    if (cleanCmd === 'clear') {
      terminalBody.innerHTML = '';
      if (terminalInput) terminalInput.value = '';
      return;
    }

    const commands = {
      help: 'Available commands: bio, education, skills, projects, achievements, quote, contact, clear',
      bio: 'Aman Jain: Second-year B.Tech CS student at Jain University, Full-Stack Engineer & Founder of Rawgenn Tech (rawgenn.tech).',
      education: 'B.Tech (CS) @ Jain University (CGPA: 8.95, Grad: 2029) | 12th CBSE @ Alpine Public (79%) | 10th CBSE @ DPS Aligarh (80%)',
      skills: 'Languages: C, C++, Python, Java, JS | Frameworks: React, Next.js, Node, Express, Tailwind | Databases: MongoDB, MySQL, Firebase | AI/LLM Integration',
      projects: '1. NutriLumen (thenutrilumen.com) | 2. Drishti AI (drishtiii.vercel.app) | 3. Rawgenn Tech (rawgenn.tech)',
      achievements: 'Finalist Odoo Hackathon 2026 (Top 20,000+ applicants) | Top 800 / 32,000+ Scaler x Meta Hackathon | 2nd Prize CRCE Hackathon (8 Campuses) | 2nd Prize Enigma Hackathon | Winner of 7-8 College Events',
      quote: '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
      contact: 'Email: aj2194078@gmail.com | Phone: +91 9936870833 | GitHub: github.com/cooldude698 | Location: Bangalore, Karnataka',
      clear: 'CLEAR_ACTION'
    };

    const response = commands[cleanCmd] || `Command not found: '${escapeHtml(cleanCmd)}'. Type <span class="cmd-highlight">'help'</span> for available commands.`;
    
    const outputLine = document.createElement('div');
    outputLine.className = 'terminal-line text-muted';
    outputLine.innerHTML = response;
    terminalBody.appendChild(outputLine);

    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  if (terminalInput) {
    terminalInput.value = '';
    terminalInput.focus();
  }

  // Interactive action connected to specific section/page
  setTimeout(() => {
    if (cleanCmd === 'skills' || cleanCmd === 'education' || cleanCmd === 'achievements') {
      const target = document.getElementById('specializations') || document.querySelector('.specializations-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (cleanCmd === 'projects') {
      const target = document.getElementById('featuredProjects') || document.querySelector('.home-preview-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = 'projects.html';
      }
    } else if (cleanCmd === 'bio') {
      window.location.href = 'about.html';
    } else if (cleanCmd === 'contact') {
      const target = document.getElementById('contact') || document.querySelector('.cta-banner-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = 'socials.html#contact';
      }
    } else if (cleanCmd === 'quote') {
      if (typeof showToast === 'function') {
        showToast('"Code is like humor. When you have to explain it, it\'s bad." — Cory House');
      }
    }
  }, 350);

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};

function initTerminalCLI() {
  const terminalForm = document.getElementById('terminalForm');
  const terminalInput = document.getElementById('terminalInput');

  if (terminalForm) {
    terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (terminalInput) {
        window.runTerminalCmd(terminalInput.value);
      }
      return false;
    });
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        window.runTerminalCmd(terminalInput.value);
      }
    });
  }

  document.addEventListener('click', (e) => {
    const pill = e.target.closest('.cmd-pill');
    if (pill) {
      e.preventDefault();
      const cmd = pill.getAttribute('data-cmd') || pill.textContent.trim();
      window.runTerminalCmd(cmd);
      return;
    }

    const card = e.target.closest('.terminal-card');
    if (card && terminalInput && !e.target.closest('input')) {
      terminalInput.focus();
    }
  });
}

function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (btn) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });
}

/* ==========================================================================
   DOTLOTTIE INTRO SPLASH ANIMATION CONTROLLER
   ========================================================================== */
function initPreloader() {
  const overlay = document.getElementById('preloaderOverlay');
  const statusText = document.getElementById('preloaderStatusText');
  const dotLottie = document.getElementById('dotLottiePlayer');

  if (!overlay) return;

  let unlocked = false;

  function triggerSnapUnlock() {
    if (unlocked) return;
    unlocked = true;

    if (statusText) statusText.textContent = 'WARPING INTO PORTFOLIO...';

    if (window.triggerHyperspaceImpulse) {
      window.triggerHyperspaceImpulse();
    }

    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 750);
    }, 450);
  }

  if (dotLottie) {
    dotLottie.addEventListener('complete', triggerSnapUnlock);
    dotLottie.addEventListener('stop', triggerSnapUnlock);
  }

  // Unlock after animation finishes (2.3s)
  setTimeout(() => {
    triggerSnapUnlock();
  }, 2350);
}

function initVectorHandSnapCanvas(canvas, onSnapComplete) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  let startTime = null;

  function drawFrame(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) / 1000; // seconds

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (elapsed < 0.5) {
      // --- STAGE 1: EXPANDING DOT TO SPINNING ARC RING ---
      const progress = elapsed / 0.5;
      const radius = 20 + progress * 40;
      const startAngle = elapsed * Math.PI * 4;
      const endAngle = startAngle + (Math.PI * 1.5 * progress);

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.stroke();

      // Central glowing dot
      ctx.beginPath();
      ctx.arc(cx, cy, 6 * (1 - progress * 0.5), 0, Math.PI * 2);
      ctx.fill();

    } else if (elapsed < 1.2) {
      // --- STAGE 2: CIRCLE MORPHING INTO WRIST & HAND OUTLINE ---
      const progress = (elapsed - 0.5) / 0.7;

      ctx.beginPath();
      // Draw Wrist
      ctx.moveTo(cx - 35, cy + 85);
      ctx.lineTo(cx - 35, cy + 30 + (1 - progress) * 20);
      
      // Hand Arc Morph
      ctx.arc(cx, cy - 10, 45, Math.PI * 0.8, Math.PI * 1.8, false);

      // Thumb & Index finger outline
      ctx.lineTo(cx + 35, cy + 30 + (1 - progress) * 20);
      ctx.lineTo(cx + 35, cy + 85);
      ctx.stroke();

    } else if (elapsed < 1.8) {
      // --- STAGE 3: HAND FORMING FINGER-SNAP GESTURE ---
      ctx.beginPath();
      // Wrist
      ctx.moveTo(cx - 30, cy + 80);
      ctx.lineTo(cx - 30, cy + 20);
      // Index & Thumb Crossing
      ctx.bezierCurveTo(cx - 40, cy - 40, cx + 10, cy - 70, cx + 25, cy - 30);
      ctx.bezierCurveTo(cx + 40, cy - 10, cx + 10, cy + 20, cx + 30, cy + 80);
      ctx.stroke();

      // Middle finger curled
      ctx.beginPath();
      ctx.arc(cx - 5, cy + 5, 16, 0, Math.PI * 1.5);
      ctx.stroke();

    } else {
      // --- STAGE 4: FINGER SNAP SPARK BURST! ---
      const snapTime = elapsed - 1.8;
      
      // Hand in snapped position
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy + 80);
      ctx.lineTo(cx - 30, cy + 20);
      ctx.bezierCurveTo(cx - 40, cy - 35, cx + 15, cy - 65, cx + 28, cy - 25);
      ctx.bezierCurveTo(cx + 40, cy - 5, cx + 10, cy + 20, cx + 30, cy + 80);
      ctx.stroke();

      // Snap Spark Lines
      const burstProgress = Math.min(1, snapTime / 0.4);
      const sparkCount = 8;
      const sparkRadiusMin = 30 + burstProgress * 20;
      const sparkRadiusMax = 50 + burstProgress * 45;

      for (let i = 0; i < sparkCount; i++) {
        const angle = (i / sparkCount) * Math.PI * 2 + snapTime * 2;
        const x1 = cx + Math.cos(angle) * sparkRadiusMin;
        const y1 = (cy - 35) + Math.sin(angle) * sparkRadiusMin;
        const x2 = cx + Math.cos(angle) * sparkRadiusMax;
        const y2 = (cy - 35) + Math.sin(angle) * sparkRadiusMax;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - burstProgress})`;
        ctx.stroke();
      }

      if (elapsed > 2.0 && onSnapComplete) {
        onSnapComplete();
      }
    }

    if (elapsed < 2.5) {
      requestAnimationFrame(drawFrame);
    }
  }

  requestAnimationFrame(drawFrame);
}

/* ==========================================================================
   CV RESUME MODAL & PRINT / COPY CONTROLLER
   ========================================================================== */
window.openCVModal = function(e) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }
  let modal = document.getElementById('cvModal');
  if (!modal) {
    initCVModal();
    modal = document.getElementById('cvModal');
  }
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    modal.style.pointerEvents = 'auto';
    document.body.style.overflow = 'hidden';
  } else {
    window.open('cv.html', '_blank');
  }
};

window.closeCVModal = function() {
  let modal = document.getElementById('cvModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    modal.style.pointerEvents = 'none';
    document.body.style.overflow = '';
  }
};

function initCVModal() {
  let modal = document.getElementById('cvModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay hidden';
    modal.id = 'cvModal';
    modal.innerHTML = `
      <div class="cv-modal-card">
        <div class="cv-header-title">AMAN JAIN</div>
        <div class="cv-sub-header">
          Bengaluru, India • +91 9936870833 • aj2194078@gmail.com • <a href="https://rawgenn.tech" target="_blank" rel="noopener" style="color: #ffffff; text-decoration: underline;">rawgenn.tech</a>
        </div>

        <div class="cv-section-heading">Career Objective</div>
        <p class="cv-item-sub">
          Second-year B.Tech student with a strong foundation in programming and full-stack development, and hands-on experience building AI-integrated products and founding Rawgenn Tech (rawgenn.tech). Seeking opportunities to apply problem-solving and software engineering skills to real-world projects.
        </p>

        <div class="cv-section-heading">Education</div>
        <div class="cv-item">
          <div class="cv-item-header">
            <span class="cv-item-title">B.Tech (Computer Science)</span>
            <span class="cv-item-date">CGPA: 8.95 | Expected Graduation: 2029</span>
          </div>
          <div class="cv-item-sub">Jain (Deemed-to-be University), Bengaluru</div>
        </div>

        <div class="cv-item">
          <div class="cv-item-header">
            <span class="cv-item-title">Senior Secondary (12th), CBSE</span>
            <span class="cv-item-date">Percentage: 79% | 2024</span>
          </div>
          <div class="cv-item-sub">Alpine Public School, Jhansi</div>
        </div>

        <div class="cv-item">
          <div class="cv-item-header">
            <span class="cv-item-title">Secondary (10th), CBSE</span>
            <span class="cv-item-date">Percentage: 80% | 2022</span>
          </div>
          <div class="cv-item-sub">Delhi Public School, Aligarh</div>
        </div>

        <div class="cv-section-heading">Skills</div>
        <ul class="cv-list">
          <li><strong>Programming Languages:</strong> C, C++, Python, Java, JavaScript</li>
          <li><strong>Web & Frameworks:</strong> React, Node.js, Next.js, Express.js, HTML/CSS, Tailwind CSS</li>
          <li><strong>Databases:</strong> MongoDB, MySQL, Firebase</li>
          <li><strong>Tools & Platforms:</strong> Git, GitHub, Figma, VS Code, Postman, Vercel, Netlify</li>
          <li><strong>Core Concepts:</strong> Data Structures & Algorithms, OOP, REST APIs, AI/LLM Integration, Full-Stack Development, UI/UX Design</li>
        </ul>

        <div class="cv-section-heading">Projects</div>
        <div class="cv-item">
          <div class="cv-item-title">Schedula – AI-Powered College Timetable Organizer</div>
          <ul class="cv-list">
            <li>Built an intelligent scheduling system that automatically generates timetables for students, teachers, and administrators.</li>
            <li>Integrated AI to generate optimized timetables based on custom constraints and resource libraries, reducing administrative workload.</li>
          </ul>
        </div>

        <div class="cv-item">
          <div class="cv-item-title">AI-Driven Crime Tracking & Prediction System – Karnataka Police</div>
          <ul class="cv-list">
            <li>Designed an AI-based solution to track live crime activity and predict potential future incidents using intelligence models.</li>
            <li>Built a digital FIR storage module to eliminate paperwork-based processes for police departments.</li>
          </ul>
        </div>

        <div class="cv-item">
          <div class="cv-item-title">Rawgenn Tech – AI & Software Venture (rawgenn.tech)</div>
          <ul class="cv-list">
            <li>Founded and independently built Rawgenn Tech (rawgenn.tech), an engineering platform delivering custom web and AI applications.</li>
            <li>Designed and developed the platform's website, rawgenn.tech, from concept to deployment.</li>
          </ul>
        </div>

        <div class="cv-section-heading">Certifications</div>
        <ul class="cv-list">
          <li>Java Programming – LinkedIn Learning</li>
          <li>Data Structures & Algorithms – Coursera</li>
          <li>Full-Stack Web Development (React & Node.js) – Coursera</li>
          <li>Introduction to Artificial Intelligence – Coursera</li>
        </ul>

        <div class="cv-section-heading">Achievements & Extracurricular</div>
        <ul class="cv-list">
          <li>Winner of 7–8 college-level events, competing against 50+ teams.</li>
          <li>2nd Prize – CRCE Entrepreneurship Hackathon, a multi-campus competition across 8 campuses.</li>
          <li>2nd Prize – Enigma Hackathon, organized by the Enigma college club.</li>
          <li>Selected among top 800 teams from 32,000+ participants in the Scaler x Meta Hackathon and advanced to the final round.</li>
          <li>Finalist – Odoo Hackathon 2026, selected from 20,000+ applicants; advancing to the 24-hour Grand Finale at Odoo India HQ, Gandhinagar (September 2026).</li>
        </ul>

        <div class="cv-section-heading">Languages Known</div>
        <p class="cv-item-sub">English, Hindi</p>

        <div class="cv-actions-row">
          <button class="btn btn-primary" id="printCVBtn"><i class="fa-solid fa-print"></i> Print / Save PDF</button>
          <a href="cv.html" class="btn btn-outline" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> Full Page View</a>
          <button class="btn btn-outline" id="copyCVTextBtn"><i class="fa-solid fa-copy"></i> Copy CV Text</button>
          <button class="btn btn-glass" id="closeCVModalBtn" onclick="window.closeCVModal()"><i class="fa-solid fa-xmark"></i> Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Bind trigger buttons across all pages
  document.querySelectorAll('.cv-modal-trigger-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.openCVModal();
    });
  });

  const closeBtn = document.getElementById('closeCVModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.closeCVModal();
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) window.closeCVModal();
  });

  const printBtn = document.getElementById('printCVBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const copyBtn = document.getElementById('copyCVTextBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = `AMAN JAIN
Bengaluru, India • +91 9936870833 • aj2194078@gmail.com • rawgenn.tech

CAREER OBJECTIVE:
Second-year B.Tech student with a strong foundation in programming and full-stack development, and hands-on experience building AI-integrated products and founding Rawgenn Tech (rawgenn.tech).

EDUCATION:
- B.Tech (Computer Science), Jain (Deemed-to-be University) | CGPA: 8.95 | Grad: 2029
- Senior Secondary (12th), CBSE, Alpine Public School, Jhansi | 79% (2024)
- Secondary (10th), CBSE, Delhi Public School, Aligarh | 80% (2022)

SKILLS:
- Programming Languages: C, C++, Python, Java, JavaScript
- Web & Frameworks: React, Node.js, Next.js, Express.js, HTML/CSS, Tailwind CSS
- Databases: MongoDB, MySQL, Firebase
- Tools: Git, GitHub, Figma, VS Code, Postman, Vercel, Netlify
- Core Concepts: DSA, OOP, REST APIs, AI/LLM Integration, Full-Stack, UI/UX

PROJECTS:
- Schedula (AI-Powered College Timetable Organizer)
- AI Crime Tracking & Prediction System (Karnataka Police)
- Rawgenn Tech (AI & Software Venture - rawgenn.tech)

CERTIFICATIONS:
- Java Programming (LinkedIn Learning)
- Data Structures & Algorithms (Coursera)
- Full-Stack Web Development (React & Node.js - Coursera)
- Intro to Artificial Intelligence (Coursera)

ACHIEVEMENTS:
- Winner of 7-8 college-level events competing against 50+ teams
- 2nd Prize CRCE Entrepreneurship Hackathon (8 campuses)
- 2nd Prize Enigma Hackathon
- Top 800 teams out of 32,000+ Scaler x Meta Hackathon
- Finalist - Odoo Hackathon 2026 (Selected from 20,000+ applicants to Grand Finale at Odoo India HQ)`;

      navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') {
          showToast('CV text copied to clipboard!', 'success');
        }
      });
    });
  }
}
