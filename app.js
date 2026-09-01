/**
 * Muhammad Rafif Pratama - Portfolio Interactions & Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initMobileDrawer();
  initPortfolioFilter();
  initProjectModals();
  initServiceModals();
  initTestimonialsSlider();
  initContactForm();
  initCopyEmail();
  initNavScrollSpy();
});

/* ===================================================
   1. Scroll Reveal Animations
   =================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target); // Reveal once
      }
    });
  }, observerOptions);

  reveals.forEach(el => observer.observe(el));
}

/* ===================================================
   2. Mobile Navigation Drawer
   =================================================== */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const menuIcon = document.getElementById('menu-icon');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('drawer-open');
    if (menuIcon) menuIcon.textContent = 'close';
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('drawer-open');
    if (menuIcon) menuIcon.textContent = 'menu';
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (drawer.classList.contains('drawer-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  // Close on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Close when clicking outside drawer content
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) {
      closeDrawer();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('drawer-open')) {
      closeDrawer();
    }
  });
}

/* ===================================================
   3. Portfolio Filter Tabs
   =================================================== */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');

  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filterValue = btn.getAttribute('data-filter');

      // Update active button state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards
      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/* ===================================================
   4. Project Details Modal
   =================================================== */
const projectData = {
  arume: {
    title: 'Arumé Perfume — Infinite Scents, One Vessel',
    tagline: 'Premium AI-IoT Modular Perfume System | CEO & Project Lead',
    category: 'AI & IoT Startup',
    image: 'https://arume-perfume.vercel.app/assets/arume_smart_bottle.png',
    liveUrl: 'https://arume-perfume.vercel.app',
    description: 'Arumé adalah platform wewangian modular cerdas berbasis IoT & AI pertama di iklim tropis. Mengintegrasikan botol pintar berbasis ESP32 S3 dengan 4 katrid aroma utama, mikro-pompa presisi, dan aplikasi mobile untuk layering aroma personal secara real-time. Muhammad Rafif Pratama berperan sebagai Chief Executive Officer (CEO) yang memimpin perancangan strategi bisnis komersial, arsitektur IoT, dan komitmen keberlanjutan (SDGs 9 & 12).',
    tags: ['ESP32 S3 IoT', 'AI Scent Layering', 'Solenoid Micropump', 'SDG 9 & 12', 'Business Model Canvas', 'Chief Executive Officer']
  },
  fore: {
    title: 'Fore Coffee Redesign',
    tagline: 'High-Converting Mobile-First Web Experience',
    category: 'Landing Page & UI',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMGIMokKaC_tgxR07EpiTfvZzMFX2-Wl6lOSRdQbosqgxH8McXyuWXx6_PJhcCQlr9zkNyTL8QF5EZ1TIXERjviTGnQwqyOSg3FD9xvrRcr02YicOY5CaTe_73CWMW1FvHc-C0f1iahUjE8Vw-7lGBJssVnPCye87_OkW7os8dFx9BZGIHYHnUs9jvFbl3jZ18bqS3ihN_dmrRPmz3HA2BBhK9ONUMgCxmUsZKrDXPuT8vnM5Eux-N',
    liveUrl: '#',
    description: 'A concept redesign for Fore Coffee focusing on streamlining the online ordering funnel, showcasing artisanal coffee bean origin stories, and accelerating subscription renewals with optimized micro-interactions and smooth checkout UX.',
    tags: ['E-Commerce UX', 'Tailwind CSS', 'Responsive Layout', 'Conversion Rate Optimization', 'Design System']
  },
  prisma: {
    title: 'Prisma Digital Hub',
    tagline: 'Integrated Student Organization Management Portal',
    category: 'Organization Platform',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBt2k6Y4ZDe4Xo2cb07mfk_LmrfkV132v6jWqHljCKEn6rFmph91BxTtSa91tWk2HpFMYUxqoQk2bVEU03Iq9Fn9agBUGLIR2U1Bs-5nRUKNoZGSjlSuaiY-mJ26w-J5KlyFZHvXcZALPG7UsmdDbF9iOPI0pGL4QXMd72ebptwcpaYUlwQYku3k5XFTTPim39dBT-9jPYhUbQIttn77O3oryr0Zs94nI_uQ502u4mWRovq4Zc2bT0I',
    liveUrl: '#',
    description: 'An end-to-end digital dashboard engineered for UKM Prisma UMS to supervise member recruitment, research paper submissions, event budgets, and collaborative workshop milestones.',
    tags: ['Dashboard Architecture', 'Role-Based Access', 'Data Analytics', 'Leadership Operations', 'Workflow Automation']
  },
  web3: {
    title: 'HackQuest Innovate ID',
    tagline: 'Web3 Developer Ecosystem & Hackathon Platform',
    category: 'Web3 & Community',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMGIMokKaC_tgxR07EpiTfvZzMFX2-Wl6lOSRdQbosqgxH8McXyuWXx6_PJhcCQlr9zkNyTL8QF5EZ1TIXERjviTGnQwqyOSg3FD9xvrRcr02YicOY5CaTe_73CWMW1FvHc-C0f1iahUjE8Vw-7lGBJssVnPCye87_OkW7os8dFx9BZGIHYHnUs9jvFbl3jZ18bqS3ihN_dmrRPmz3HA2BBhK9ONUMgCxmUsZKrDXPuT8vnM5Eux-N',
    liveUrl: '#',
    description: 'Community platform and registration portal for HackQuest Indonesia Web3 competition. Features hackathon track guides, mentor matching, and submission showcases.',
    tags: ['Web3 Ecosystem', 'Community Engagement', 'Event Technology', 'Promotional Campaign', 'UI/UX']
  }
};

function initProjectModals() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('close-project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const liveBtn = document.getElementById('modal-project-live');
  const projectCards = document.querySelectorAll('.portfolio-card');

  if (!modal) return;

  function openProjectModal(key) {
    const data = projectData[key];
    if (!data) return;

    document.getElementById('modal-project-img').src = data.image;
    document.getElementById('modal-project-img').alt = data.title;
    document.getElementById('modal-project-badge').textContent = data.category;
    document.getElementById('modal-project-title').textContent = data.title;
    document.getElementById('modal-project-tagline').textContent = data.tagline;
    document.getElementById('modal-project-desc').textContent = data.description;

    if (liveBtn) {
      if (data.liveUrl && data.liveUrl !== '#') {
        liveBtn.href = data.liveUrl;
        liveBtn.style.display = 'inline-flex';
      } else {
        liveBtn.style.display = 'none';
      }
    }

    const tagsContainer = document.getElementById('modal-project-tags');
    tagsContainer.innerHTML = '';
    data.tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'text-xs bg-surface-container border border-outline px-3 py-1 rounded-full font-medium text-on-surface';
      span.textContent = tag;
      tagsContainer.appendChild(span);
    });

    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    modal.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const key = card.getAttribute('data-project');
      openProjectModal(key);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeProjectModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeProjectModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('modal-open')) {
      closeProjectModal();
    }
  });
}

/* ===================================================
   5. Service Details Modal
   =================================================== */
const serviceData = {
  uiux: {
    tag: 'UI/UX Design',
    title: 'User Interface & Experience Design',
    desc: 'Crafting user-centered digital experiences that balance visual delight, brand consistency, and frictionless user journeys.',
    deliverables: [
      'User Research & Empathy Mapping',
      'Wireframing & Information Architecture',
      'Interactive Figma Prototypes (High Fidelity)',
      'Scalable Design System & Component Library',
      'Usability Testing & Iteration'
    ]
  },
  web: {
    tag: 'Web Design & Dev',
    title: 'Custom Responsive Web Development',
    desc: 'Developing fast, clean, and accessible web experiences using modern frontend standards, responsive grids, and crisp typography.',
    deliverables: [
      'Pixel-Perfect Responsive Layouts (Mobile, Tablet, Desktop)',
      'Semantic & SEO-Optimized HTML5 / Tailwind CSS',
      'Fast Load Speeds & Core Web Vitals Optimization',
      'Interactive Component Micro-Animations',
      'Clean Code & Easy Maintenance Handover'
    ]
  },
  landing: {
    tag: 'Conversion',
    title: 'High-Converting Landing Pages',
    desc: 'Strategic single-page sites engineered for startups, product launches, lead generation, and marketing campaigns.',
    deliverables: [
      'Value Proposition & Copy Architecture',
      'Hero Section & Strong Call-to-Action Placements',
      'Social Proof, Testimonial & Metric Showcases',
      'Lead Capture & Form Integrations',
      'A/B Testing Ready Layout Strategy'
    ]
  }
};

function initServiceModals() {
  const modal = document.getElementById('service-modal');
  const closeBtn = document.getElementById('close-service-modal');
  const serviceCards = document.querySelectorAll('.service-card');
  const inquireBtn = document.getElementById('service-inquire-btn');

  if (!modal) return;

  function openServiceModal(key) {
    const data = serviceData[key];
    if (!data) return;

    document.getElementById('service-modal-tag').textContent = data.tag;
    document.getElementById('service-modal-title').textContent = data.title;
    document.getElementById('service-modal-desc').textContent = data.desc;

    const list = document.getElementById('service-modal-deliverables');
    list.innerHTML = '';
    data.deliverables.forEach(item => {
      const li = document.createElement('li');
      li.className = 'flex items-center gap-2';
      li.innerHTML = `<span class="material-symbols-outlined text-primary text-[18px]">check_circle</span> <span>${item}</span>`;
      list.appendChild(li);
    });

    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }

  function closeServiceModal() {
    modal.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      const serviceKey = card.getAttribute('data-service');
      openServiceModal(serviceKey);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeServiceModal);
  if (inquireBtn) {
    inquireBtn.addEventListener('click', () => {
      closeServiceModal();
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeServiceModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('modal-open')) {
      closeServiceModal();
    }
  });
}

/* ===================================================
   6. Testimonials Slider / Carousel
   =================================================== */
function initTestimonialsSlider() {
  const track = document.getElementById('testimonial-track');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  const dotsContainer = document.getElementById('testimonial-dots');

  if (!track || !prevBtn || !nextBtn) return;

  const slides = track.children;
  const totalSlides = slides.length;
  let currentSlide = 0;

  function updateSlider() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('button');
      dots.forEach((dot, idx) => {
        if (idx === currentSlide) {
          dot.className = 'w-6 h-2.5 rounded-full bg-primary transition-all duration-300';
        } else {
          dot.className = 'w-2.5 h-2.5 rounded-full bg-white/30 hover:bg-white/60 transition-all duration-300';
        }
      });
    }
  }

  prevBtn.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlider();
  });

  nextBtn.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider();
  });

  // Dot clicks
  if (dotsContainer) {
    const dots = dotsContainer.querySelectorAll('button');
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentSlide = index;
        updateSlider();
      });
    });
  }

  // Mobile Touch Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const threshold = 40;
    if (touchEndX < touchStartX - threshold) {
      // Swiped Left -> Next
      currentSlide = (currentSlide + 1) % totalSlides;
      updateSlider();
    }
    if (touchEndX > touchStartX + threshold) {
      // Swiped Right -> Prev
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      updateSlider();
    }
  }

  updateSlider();
}

/* ===================================================
   7. Contact Form & Booking Modal
   =================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const emailInput = document.getElementById('contact-email');
  const bookingModal = document.getElementById('booking-modal');
  const closeBookingBtn = document.getElementById('close-booking-modal');
  const userEmailSpan = document.getElementById('user-submitted-email');

  if (!form || !emailInput) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!email || !isValidEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    // Show Toast
    showToast('Sending invitation details...', 'info');

    // Open Success Modal
    setTimeout(() => {
      if (userEmailSpan) userEmailSpan.textContent = email;
      if (bookingModal) {
        bookingModal.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
      }
      form.reset();
      showToast('Booking request sent successfully!', 'check_circle');
    }, 400);
  });

  if (closeBookingBtn && bookingModal) {
    closeBookingBtn.addEventListener('click', () => {
      bookingModal.classList.remove('modal-open');
      document.body.style.overflow = '';
    });

    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        bookingModal.classList.remove('modal-open');
        document.body.style.overflow = '';
      }
    });
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ===================================================
   8. Copy Email & Toast Notifications
   =================================================== */
function initCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  if (!copyBtn) return;

  const emailToCopy = 'rafifpratama@gmail.com';

  copyBtn.addEventListener('click', () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(emailToCopy).then(() => {
        showToast('Email copied: ' + emailToCopy, 'check');
      }).catch(() => {
        fallbackCopyText(emailToCopy);
      });
    } else {
      fallbackCopyText(emailToCopy);
    }
  });
}

function fallbackCopyText(text) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  try {
    document.execCommand('copy');
    showToast('Email copied: ' + text, 'check');
  } catch (err) {
    showToast('Email: ' + text, 'info');
  }
  document.body.removeChild(tempInput);
}

let toastTimeout;
function showToast(message, icon = 'info') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');

  if (!toast || !toastMsg) return;

  clearTimeout(toastTimeout);

  toastMsg.textContent = message;
  if (toastIcon) toastIcon.textContent = icon;

  toast.style.opacity = '1';
  toast.style.pointerEvents = 'auto';
  toast.style.transform = 'translateY(0)';

  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.pointerEvents = 'none';
    toast.style.transform = 'translateY(16px)';
  }, 3500);
}

/* ===================================================
   9. Active Navigation Scroll Spy
   =================================================== */
function initNavScrollSpy() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navItems = document.querySelectorAll('.nav-item');

  if (!sections.length || !navItems.length) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 160;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href === '#' + currentId) {
        item.classList.add('text-primary');
      } else {
        item.classList.remove('text-primary');
      }
    });
  }, { passive: true });
}
