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
        const project = header.closest('.project-detail');

        // Close all other projects
        document.querySelectorAll('.project-detail').forEach(otherProject => {
            if (otherProject !== project && otherProject.classList.contains('active')) {
                otherProject.classList.remove('active');
            }
        });

        // Toggle current project
        project.classList.toggle('active');
    });
});

// ============================================
// EXPERIENCE CATEGORY FILTER
// ============================================

const categoryDropdown = document.getElementById('experienceCategory');

if (categoryDropdown) {
    // Function to filter timeline items
    const filterTimelineItems = (category) => {
        const timelineItems = document.querySelectorAll('.timeline-item');

        timelineItems.forEach(item => {
            if (item.dataset.category === category) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    // Initial load - show experience items
    filterTimelineItems('experience');

    // Listen for dropdown changes
    categoryDropdown.addEventListener('change', (e) => {
        filterTimelineItems(e.target.value);
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
