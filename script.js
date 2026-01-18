// ========================================
// Utility Functions
// ========================================

// Throttle function to optimize scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// Navigation
// ========================================

const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');

// Navbar scroll effect (throttled)
function handleNavbarScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu on link click
navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Active link on scroll
const sections = document.querySelectorAll('section[id]');

function highlightNavLink() {
    const scrollY = window.scrollY;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector(`.nav-links a[href="#${sectionId}"]`)?.classList.add('active');
        } else {
            document.querySelector(`.nav-links a[href="#${sectionId}"]`)?.classList.remove('active');
        }
    });
}

// Unified scroll handler (throttled)
const throttledScrollHandler = throttle(() => {
    handleNavbarScroll();
    highlightNavLink();
    animateCounters();
}, 100);

window.addEventListener('scroll', throttledScrollHandler);

// ========================================
// Smooth Scroll
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// Scroll Animations
// ========================================

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.service-card, .portfolio-item, .timeline-item, .trust-point, .process-step, .stat-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// ========================================
// Counter Animation
// ========================================

const counters = document.querySelectorAll('.stat-number');
let countersAnimated = false;

function animateCounters() {
    if (countersAnimated) return;

    const statsSection = document.querySelector('.why-me-stats');
    if (!statsSection) return;

    const sectionTop = statsSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (sectionTop < windowHeight - 100) {
        countersAnimated = true;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            updateCounter();
        });
    }
}

window.addEventListener('load', animateCounters);

// ========================================
// Form Handling (Formspree)
// ========================================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');

        // Simple validation
        if (!name || !email || !message) {
            showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Veuillez entrer une adresse email valide.', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showNotification('Merci pour votre message ! Je vous répondrai dans les 48h.', 'success');
                contactForm.reset();
            } else {
                throw new Error('Erreur serveur');
            }
        } catch (error) {
            showNotification('Une erreur est survenue. Veuillez réessayer ou me contacter par email.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========================================
// Notification System
// ========================================

function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
        opacity: 0.8;
    `;
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 5s
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ========================================
// Typing Effect for Hero
// ========================================

function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// ========================================
// Parallax Effect (subtle)
// ========================================

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const shapes = document.querySelectorAll('.shape');

    shapes.forEach((shape, index) => {
        const speed = 0.05 * (index + 1);
        shape.style.transform = `translate(${scrolled * speed}px, ${scrolled * speed}px)`;
    });
});

// ========================================
// Initialize on Load
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initial navbar check
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    }

    // Trigger initial highlight
    highlightNavLink();

    // Add loaded class for any initial animations
    document.body.classList.add('loaded');
});

// ========================================
// Preloader (optional)
// ========================================

window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

// ========================================
// Preview Overlay (Multi-projets)
// ========================================

const previewOverlay = document.getElementById('previewOverlay');
const previewContainer = document.getElementById('previewContainer');
const previewCloseBtn = document.getElementById('previewCloseBtn');
const previewTitle = document.getElementById('previewTitle');
const previewScreenshots = document.getElementById('previewScreenshots');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const placeholderTitle = document.getElementById('placeholderTitle');
const placeholderFiles = document.getElementById('placeholderFiles');
let closeTimeout = null;

// Configuration des projets
const projects = {
    'suivi-travaux': {
        title: 'Suivi Travaux - Application de gestion',
        screenshots: [
            'screenshots/suivi-travaux-1.png',
            'screenshots/suivi-travaux-2.png',
            'screenshots/suivi-travaux-3.png'
        ]
    },
    'antoine-vigne': {
        title: 'Antoine Vigne - Beatmaker',
        screenshots: [
            'screenshots/antoine-vigne-1.png',
            'screenshots/antoine-vigne-2.png',
            'screenshots/antoine-vigne-3.png'
        ]
    },
    's3tp-btp': {
        title: 'S3TP BTP - Travaux Publics',
        screenshots: [
            'screenshots/s3tp-btp-1.png',
            'screenshots/s3tp-btp-2.png',
            'screenshots/s3tp-btp-3.png'
        ]
    }
};

function openPreview(projectId) {
    if (!previewOverlay) return;

    const project = projects[projectId];
    if (!project) return;

    // Update title
    previewTitle.textContent = project.title;
    placeholderTitle.textContent = `Aperçu de ${project.title}`;

    // Clear previous screenshots
    previewScreenshots.innerHTML = '';
    previewPlaceholder.style.display = 'none';

    // Track loaded images
    let loadedImages = 0;
    let failedImages = 0;

    // Create and load screenshots
    project.screenshots.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${project.title} - Screenshot ${index + 1}`;
        img.className = 'preview-screenshot';
        img.loading = 'lazy';

        img.onload = () => {
            loadedImages++;
            img.style.display = 'block';
        };

        img.onerror = () => {
            failedImages++;
            img.style.display = 'none';
            // If all images failed, show placeholder
            if (failedImages === project.screenshots.length) {
                showPlaceholder(projectId);
            }
        };

        previewScreenshots.appendChild(img);
    });

    // Show overlay
    previewOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Clear any pending close timeout
    if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
    }
}

function showPlaceholder(projectId) {
    if (!previewPlaceholder) return;

    const project = projects[projectId];
    previewPlaceholder.style.display = 'block';

    // Update placeholder files list
    if (project && placeholderFiles) {
        placeholderFiles.innerHTML = project.screenshots
            .map(src => `<code>${src}</code>`)
            .join('');
    }
}

function closePreview() {
    if (previewOverlay) {
        previewOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Handle preview button clicks
document.querySelectorAll('.portfolio-preview-btn[data-preview]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const projectId = btn.getAttribute('data-preview');
        openPreview(projectId);
    });
});

// Close button handler
if (previewCloseBtn) {
    previewCloseBtn.addEventListener('click', closePreview);
}

// Close when mouse leaves the container
if (previewContainer) {
    previewContainer.addEventListener('mouseleave', () => {
        closeTimeout = setTimeout(() => {
            closePreview();
        }, 300);
    });

    previewContainer.addEventListener('mouseenter', () => {
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            closeTimeout = null;
        }
    });
}

// Close on click outside
if (previewOverlay) {
    previewOverlay.addEventListener('click', (e) => {
        if (e.target === previewOverlay) {
            closePreview();
        }
    });
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && previewOverlay && previewOverlay.classList.contains('active')) {
        closePreview();
    }
});
