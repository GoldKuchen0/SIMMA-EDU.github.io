// ============================================
// CV DOWNLOAD MODAL
// ============================================

(function () {
    // Inject modal styles
    const style = document.createElement('style');
    style.textContent = `
        #cv-modal {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 9999;
        }
        #cv-modal.open {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .cv-modal-overlay {
            position: absolute;
            inset: 0;
            background: rgba(10, 14, 26, 0.75);
            backdrop-filter: blur(6px);
        }
        .cv-modal-box {
            position: relative;
            background: var(--color-surface, #131929);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 2rem 2.5rem;
            min-width: 320px;
            text-align: center;
            z-index: 1;
        }
        .cv-modal-title {
            font-family: 'Outfit', sans-serif;
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--color-primary, #00FFA3);
            margin: 0 0 0.25rem;
        }
        .cv-modal-subtitle {
            font-size: 0.85rem;
            color: var(--color-text-dim, #8892A6);
            margin: 0 0 1.5rem;
        }
        .cv-modal-options {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
        .cv-modal-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 1.5rem;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: var(--color-text, #E8EAF0);
            text-decoration: none;
            font-family: 'Outfit', sans-serif;
            font-size: 0.95rem;
            font-weight: 600;
            transition: border-color 0.2s, background 0.2s;
            cursor: pointer;
        }
        .cv-modal-btn:hover {
            border-color: var(--color-primary, #00FFA3);
            background: rgba(0,255,163,0.06);
        }
        .cv-modal-flag {
            font-size: 1.8rem;
        }
        .cv-modal-close {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            background: none;
            border: none;
            color: var(--color-text-dim, #8892A6);
            font-size: 1rem;
            cursor: pointer;
            line-height: 1;
            padding: 0.25rem;
        }
        .cv-modal-close:hover {
            color: var(--color-text, #E8EAF0);
        }

        /* CV Download Box */
        .cv-download-box {
            border: 1px solid var(--color-border, #262D3E);
            overflow: hidden;
            width: fit-content;
            min-width: 300px;
            margin-top: 1.5rem;
        }
        .cv-box-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.25rem;
            border-bottom: 1px solid var(--color-border, #262D3E);
            font-family: 'Space Mono', monospace;
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: var(--color-text-dim, #8892A6);
            background: var(--color-surface, #141824);
        }
        .cv-box-langs {
            display: flex;
        }
        .cv-box-lang {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            padding: 1rem 1.25rem;
            text-decoration: none;
            font-family: 'Outfit', sans-serif;
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--color-text, #E8EAF0);
            transition: background 0.2s, color 0.2s;
        }
        .cv-box-lang:hover {
            background: rgba(0,255,163,0.08);
            color: var(--color-primary, #00FFA3);
        }
        .cv-box-flag {
            font-size: 1.2rem;
            line-height: 1;
        }
        .cv-box-divider {
            width: 1px;
            background: var(--color-border, #262D3E);
            align-self: stretch;
        }

        /* Home Sections */
        .home-section {
            padding: 5rem 2rem;
        }
        .home-section-alt {
            background: var(--color-surface, #141824);
            border-top: 1px solid var(--color-border, #262D3E);
            border-bottom: 1px solid var(--color-border, #262D3E);
        }
        .home-section-inner {
            max-width: 1200px;
            margin: 0 auto;
        }
        .home-section-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            margin-bottom: 2.5rem;
            flex-wrap: wrap;
            gap: 1rem;
        }
        .home-section-label {
            font-family: 'Space Mono', monospace;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: var(--color-primary, #00FFA3);
            display: block;
            margin-bottom: 0.3rem;
        }
        .home-section-title {
            font-size: 2rem;
            font-weight: 800;
            color: var(--color-text, #E8EAF0);
            margin: 0;
        }
        .home-section-link {
            font-family: 'Space Mono', monospace;
            font-size: 0.75rem;
            color: var(--color-primary, #00FFA3);
            text-decoration: none;
            white-space: nowrap;
        }
        .home-section-link:hover { text-decoration: underline; }

        /* Featured Projects */
        .home-projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1rem;
        }
        .home-project-card {
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
            padding: 1.25rem 1.5rem;
            border: 1px solid var(--color-border, #262D3E);
            background: var(--color-surface, #141824);
            text-decoration: none;
            transition: border-color 0.2s, transform 0.2s;
            position: relative;
        }
        .home-project-card:hover {
            border-color: var(--color-primary, #00FFA3);
            transform: translateY(-3px);
        }
        .hpc-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
        }
        .hpc-course {
            font-family: 'Space Mono', monospace;
            font-size: 0.6rem;
            color: var(--color-text-dim, #8892A6);
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }
        .hpc-status {
            font-family: 'Space Mono', monospace;
            font-size: 0.6rem;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            padding: 0.15rem 0.5rem;
            border: 1px solid;
        }
        .hpc-status.completed { color: #00FFA3; border-color: rgba(0,255,163,0.3); }
        .hpc-status.development { color: #F59E0B; border-color: rgba(245,158,11,0.3); }
        .hpc-name {
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--color-text, #E8EAF0);
            margin: 0;
        }
        .hpc-desc {
            font-size: 0.85rem;
            color: var(--color-text-dim, #8892A6);
            line-height: 1.6;
            margin: 0;
            flex: 1;
        }
        .hpc-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.35rem;
        }
        .hpc-tags span {
            font-family: 'Space Mono', monospace;
            font-size: 0.65rem;
            color: var(--color-text-dim, #8892A6);
            background: var(--color-bg, #0A0E1A);
            border: 1px solid var(--color-border, #262D3E);
            padding: 0.15rem 0.5rem;
        }
        .hpc-arrow {
            font-size: 0.9rem;
            color: var(--color-primary, #00FFA3);
            align-self: flex-end;
        }

        /* Certificates */
        .home-certs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
        }
        .home-certs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1rem;
        }
        .home-cert-card {
            display: flex;
            align-items: center;
            gap: 1.25rem;
            padding: 1.25rem 1.5rem;
            border: 1px solid var(--color-border, #262D3E);
            background: var(--color-bg, #0A0E1A);
            text-decoration: none;
            transition: border-color 0.2s;
        }
        .home-cert-card:hover { border-color: var(--color-primary, #00FFA3); }
        .home-cert-img {
            width: 68px;
            height: 68px;
            object-fit: contain;
            flex-shrink: 0;
        }
        .home-cert-info {
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
        }
        .home-cert-issuer {
            font-family: 'Space Mono', monospace;
            font-size: 0.65rem;
            color: var(--color-text-dim, #8892A6);
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }
        .home-cert-name {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--color-text, #E8EAF0);
            margin: 0;
        }
        .home-cert-badge {
            font-family: 'Space Mono', monospace;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }
        .home-cert-badge.active { color: var(--color-primary, #00FFA3); }

        /* Technical Skills Cards */
        .home-skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1rem;
        }
        .home-skill-card {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1.5rem;
            border: 1px solid var(--color-border, #262D3E);
            background: var(--color-bg, #0A0E1A);
            text-decoration: none;
            transition: border-color 0.2s, transform 0.2s;
            position: relative;
        }
        .home-skill-card:hover {
            border-color: var(--color-primary, #00FFA3);
            transform: translateY(-3px);
        }
        .hsk-icon {
            color: var(--color-primary, #00FFA3);
            flex-shrink: 0;
            margin-top: 0.15rem;
        }
        .hsk-content {
            display: flex;
            flex-direction: column;
            gap: 0.45rem;
            flex: 1;
        }
        .hsk-name {
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--color-text, #E8EAF0);
            margin: 0;
        }
        .hsk-desc {
            font-size: 0.82rem;
            color: var(--color-text-dim, #8892A6);
            line-height: 1.6;
            margin: 0;
        }
        .hsk-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.35rem;
        }
        .hsk-tags span {
            font-family: 'Space Mono', monospace;
            font-size: 0.62rem;
            color: var(--color-text-dim, #8892A6);
            background: var(--color-surface, #141824);
            border: 1px solid var(--color-border, #262D3E);
            padding: 0.15rem 0.5rem;
        }
        .hsk-arrow {
            font-size: 0.9rem;
            color: var(--color-primary, #00FFA3);
            align-self: flex-end;
            margin-top: auto;
        }

        /* Screenshots */
        .screenshots-section {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid var(--color-border, #262D3E);
        }
        .screenshots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.25rem;
            margin-top: 1rem;
        }
        .screenshot-item {
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
            border: 1px solid var(--color-border, #262D3E);
            background: var(--color-bg, #0A0E1A);
            overflow: hidden;
        }
        .screenshot-img {
            width: 100%;
            display: block;
            object-fit: cover;
        }
        .screenshot-caption {
            font-size: 0.75rem;
            color: var(--color-text-dim, #8892A6);
            padding: 0 0.85rem 0.85rem;
            line-height: 1.5;
            font-style: italic;
        }

        /* Team Roles */
        .team-roles-section {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid var(--color-border, #262D3E);
        }
        .team-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-top: 1rem;
        }
        .team-member {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
            padding: 0.75rem 1.1rem;
            background: var(--color-bg, #0A0E1A);
            border: 1px solid var(--color-border, #262D3E);
            border-left: 3px solid var(--color-primary, #00FFA3);
            min-width: 180px;
        }
        .member-name {
            font-family: 'Space Mono', monospace;
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--color-primary, #00FFA3);
        }
        .member-role {
            font-size: 0.78rem;
            color: var(--color-text-dim, #8892A6);
            line-height: 1.4;
        }

        /* Pluralsight */
        .ps-icon {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .pluralsight-label {
            font-family: 'Space Mono', monospace;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: #F15B2B;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }
        .pluralsight-label::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #262D3E;
        }
        .skill-iq-card {
            display: grid;
            grid-template-columns: 260px 1fr;
            gap: 2rem;
            background: #141824;
            border: 1px solid #262D3E;
            border-left: 3px solid #F15B2B;
            padding: 1.5rem;
            margin-top: 0.5rem;
        }
        .skill-iq-screenshot {
            width: 100%;
            display: block;
            border: 1px solid #262D3E;
        }
        .skill-iq-right {
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
        }
        .skill-iq-meta {
            font-family: 'Space Mono', monospace;
            font-size: 0.65rem;
            color: #F15B2B;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        .skill-iq-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #E8EAF0;
        }
        .skill-iq-score-row {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-top: 0.25rem;
        }
        .skill-iq-bar-wrap {
            flex: 1;
            height: 6px;
            background: #262D3E;
        }
        .skill-iq-bar {
            height: 100%;
            background: #F15B2B;
        }
        .skill-iq-pct {
            font-family: 'Space Mono', monospace;
            font-size: 0.8rem;
            color: #F15B2B;
            font-weight: 700;
            min-width: 36px;
        }
        .skill-iq-level {
            font-family: 'Space Mono', monospace;
            font-size: 0.7rem;
            color: #8892A6;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        .skill-iq-note {
            font-size: 0.82rem;
            color: #8892A6;
            line-height: 1.6;
            margin-top: 0.5rem;
            font-style: italic;
        }
        @media (max-width: 640px) {
            .skill-iq-card { grid-template-columns: 1fr; }
        }

        /* LinkedIn QR Code */
        .linkedin-qr-block {
            margin-top: 2rem;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 1.25rem;
            padding: 1.25rem 1.5rem;
            background: #0d1117;
            border: 1px solid #262D3E;
            border-left: 3px solid #00FFA3;
        }
        .qr-text-block {
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
        }
        .qr-label {
            font-size: 0.7rem;
            color: #00FFA3;
            font-family: 'Space Mono', monospace;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin: 0;
        }
        .qr-title {
            font-size: 0.95rem;
            font-weight: 600;
            color: #E8EAF0;
            font-family: 'Outfit', sans-serif;
            margin: 0;
        }
        .qr-sub {
            font-size: 0.75rem;
            color: #8892A6;
            font-family: 'Space Mono', monospace;
            margin: 0;
        }
        #linkedin-qr {
            flex-shrink: 0;
            line-height: 0;
            outline: 2px solid #00FFA3;
            outline-offset: 3px;
        }
        #linkedin-qr img,
        #linkedin-qr canvas {
            display: block;
        }
    `;
    document.head.appendChild(style);

    // Inject modal HTML
    const modal = document.createElement('div');
    modal.id = 'cv-modal';
    modal.innerHTML = `
        <div class="cv-modal-overlay"></div>
        <div class="cv-modal-box">
            <button class="cv-modal-close" aria-label="Close">✕</button>
            <h3 class="cv-modal-title">Download CV</h3>
            <p class="cv-modal-subtitle">Choose your preferred language</p>
            <div class="cv-modal-options">
                <a href="Downloads/cv/EN-CV-Simon-Max.pdf" download class="cv-modal-btn">
                    <span class="cv-modal-flag">🇬🇧</span>
                    <span>English</span>
                </a>
                <a href="Downloads/cv/FR-CV-Simon-Max.pdf" download class="cv-modal-btn">
                    <span class="cv-modal-flag">🇫🇷</span>
                    <span>Français</span>
                </a>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const openModal = () => modal.classList.add('open');
    const closeModal = () => modal.classList.remove('open');

    // Open on any CV trigger click
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.cv-download-trigger');
        if (trigger) {
            e.preventDefault();
            openModal();
        }
    });

    // Close on overlay or close button click
    modal.querySelector('.cv-modal-overlay').addEventListener('click', closeModal);
    modal.querySelector('.cv-modal-close').addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Close modal after a download link is clicked
    modal.querySelectorAll('.cv-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => setTimeout(closeModal, 300));
    });
})();

// ============================================
// PAGE LOAD ANIMATION
// ============================================

window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// ============================================
// NAVIGATION SCROLL EFFECT
// ============================================

const nav = document.querySelector('.nav-system');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        nav.style.background = 'rgba(10, 14, 26, 0.95)';
        nav.style.backdropFilter = 'blur(20px)';
    } else {
        nav.style.background = 'rgba(10, 14, 26, 0.8)';
    }
    
    lastScroll = currentScroll;
});

// ============================================
// SMOOTH SCROLL
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements that should fade in
const fadeElements = document.querySelectorAll('.quick-card, .project-detail, .skill-category, .cert-card');
fadeElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeInObserver.observe(el);
});

// ============================================
// CONSOLE MESSAGE
// ============================================

console.log(
    '%c[MAX SIMON]',
    'color: #00FFA3; font-size: 20px; font-weight: bold; font-family: monospace;'
);
console.log(
    '%cCloud Computing Portfolio',
    'color: #8892A6; font-size: 14px; font-family: monospace;'
);
console.log(
    '%cBuilt with modern web technologies',
    'color: #8892A6; font-size: 12px; font-family: monospace;'
);

// ============================================
// DYNAMIC YEAR UPDATE
// ============================================

const yearElements = document.querySelectorAll('.current-year');
yearElements.forEach(el => {
    el.textContent = new Date().getFullYear();
});

// ============================================
// LINK EXTERNAL INDICATOR
// ============================================

document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.setAttribute('rel', 'noopener noreferrer');
});

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================

document.addEventListener('keydown', (e) => {
    // Navigate between pages with arrow keys when focused on nav
    if (document.activeElement.classList.contains('nav-link')) {
        const navLinks = Array.from(document.querySelectorAll('.nav-link'));
        const currentIndex = navLinks.indexOf(document.activeElement);
        
        if (e.key === 'ArrowRight' && currentIndex < navLinks.length - 1) {
            e.preventDefault();
            navLinks[currentIndex + 1].focus();
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            e.preventDefault();
            navLinks[currentIndex - 1].focus();
        }
    }
});

// ============================================
// CUSTOM CURSOR EFFECT (Optional Enhancement)
// ============================================

const createCursorEffect = () => {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid var(--color-primary);
        pointer-events: none;
        z-index: 10000;
        transform: translate(-50%, -50%);
        transition: width 0.2s, height 0.2s;
        display: none;
    `;
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animateCursor = () => {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Show cursor on hover interactive elements
    document.querySelectorAll('a, button, .quick-card, .contact-method').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '40px';
            cursor.style.height = '40px';
            cursor.style.display = 'block';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
        });
    });
};

// Only create cursor effect on desktop
if (window.innerWidth > 1024) {
    // Uncomment to enable custom cursor
    // createCursorEffect();
}

// ============================================
// PROJECT ACCORDION
// ============================================

document.querySelectorAll('.project-header-section').forEach(header => {
    header.addEventListener('click', () => {
        const scrollY = window.scrollY;
        const project = header.closest('.project-detail');

        // Close all other projects
        document.querySelectorAll('.project-detail').forEach(otherProject => {
            if (otherProject !== project && otherProject.classList.contains('active')) {
                otherProject.classList.remove('active');
            }
        });

        // Toggle current project
        project.classList.toggle('active');

        // Restore scroll position so page doesn't jump
        requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: 'instant' }));
    });
});

// ============================================
// SCREENSHOT LIGHTBOX
// ============================================

(function () {
    const style = document.createElement('style');
    style.textContent = `
        #lightbox {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 9998;
            align-items: center;
            justify-content: center;
        }
        #lightbox.open { display: flex; }
        #lightbox-overlay {
            position: absolute;
            inset: 0;
            background: rgba(10, 14, 26, 0.92);
            backdrop-filter: blur(8px);
        }
        #lightbox-img {
            position: relative;
            z-index: 1;
            max-width: 90vw;
            max-height: 88vh;
            display: block;
            box-shadow: 0 0 60px rgba(0,0,0,0.8);
            outline: 1px solid rgba(255,255,255,0.08);
        }
        #lightbox-close {
            position: fixed;
            top: 1.25rem;
            right: 1.5rem;
            z-index: 2;
            background: none;
            border: 1px solid rgba(255,255,255,0.15);
            color: #E8EAF0;
            font-size: 1.1rem;
            width: 36px;
            height: 36px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #lightbox-close:hover { border-color: #00FFA3; color: #00FFA3; }
        .screenshot-img { cursor: zoom-in; }
    `;
    document.head.appendChild(style);

    const lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.innerHTML = `
        <div id="lightbox-overlay"></div>
        <button id="lightbox-close">✕</button>
        <img id="lightbox-img" src="" alt="">
    `;
    document.body.appendChild(lb);

    const open  = (src, alt) => { document.getElementById('lightbox-img').src = src; document.getElementById('lightbox-img').alt = alt; lb.classList.add('open'); };
    const close = () => lb.classList.remove('open');

    document.addEventListener('click', e => {
        if (e.target.classList.contains('screenshot-img')) open(e.target.src, e.target.alt);
    });
    document.getElementById('lightbox-overlay').addEventListener('click', close);
    document.getElementById('lightbox-close').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// ============================================
// EXPERIENCE CATEGORY FILTER
// ============================================

const categoryDropdown = document.getElementById('experienceCategory');

if (categoryDropdown) {
    const filterTimelineItems = (category) => {
        document.querySelectorAll('.timeline-item').forEach(item => {
            const match = category === 'all' || item.dataset.category === category;
            if (match) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    filterTimelineItems('all');

    categoryDropdown.addEventListener('change', (e) => {
        filterTimelineItems(e.target.value);
    });
} else {
    // No category dropdown — show all timeline items
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.classList.add('active');
    });
}

// ============================================
// PROJECT STATUS FILTER
// ============================================

const projectFilter = document.getElementById('projectFilter');

if (projectFilter) {
    // Function to filter projects by status
    const filterProjects = (status) => {
        const projects = document.querySelectorAll('.project-detail');

        projects.forEach(project => {
            const statusBadge = project.querySelector('.status-badge');

            if (!statusBadge) {
                project.style.display = 'none';
                return;
            }

            let shouldShow = false;

            if (status === 'all') {
                shouldShow = true;
            } else if (status === 'completed') {
                shouldShow = statusBadge.classList.contains('status-completed');
            } else if (status === 'development') {
                shouldShow = statusBadge.classList.contains('status-development');
            } else if (status === 'future') {
                shouldShow = statusBadge.classList.contains('status-future');
            }

            project.style.display = shouldShow ? 'block' : 'none';
        });
    };

    // Initial load - show all projects
    filterProjects('all');

    // Listen for dropdown changes
    projectFilter.addEventListener('change', (e) => {
        filterProjects(e.target.value);
    });
}

// ============================================
// EXPERIENCE ITEM TOGGLE
// ============================================

const timelineItems = document.querySelectorAll('.timeline-item');

timelineItems.forEach(item => {
    const toggleBtn = item.querySelector('.timeline-toggle');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isExpanded = item.classList.contains('expanded');

            // Toggle expanded state
            item.classList.toggle('expanded');

            // Update button text
            if (isExpanded) {
                toggleBtn.textContent = 'Show Details ▼';
            } else {
                toggleBtn.textContent = 'Hide Details ▲';
            }
        });
    }
});
