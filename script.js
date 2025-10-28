// Portfolio Website JavaScript
// Handles animations, interactions, and form functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initNavigation();
    initScrollAnimations();
    initSkillBars();
    initContactForm();
    initSmoothScrolling();
    initParallax();
    forceVideoPlayback();
});

// BULLETPROOF iOS video playback - SINGLE VIDEO APPROACH
function forceVideoPlayback() {
    const videoElement = document.getElementById('hero-video');
    
    if (!videoElement) {
        console.error('❌ Video element not found!');
        return;
    }
    
    // Determine which video to load based on screen width
    const isMobile = window.innerWidth <= 768;
    const videoSrc = isMobile ? 'venturesmain.mp4' : 'desktopheroventures.mp4';
    
    console.log('🎥 Mobile detected:', isMobile);
    console.log('🎥 Loading video:', videoSrc);
    console.log('🎥 Window width:', window.innerWidth);
    
    // Set the video source dynamically
    videoElement.innerHTML = `<source src="${videoSrc}" type="video/mp4">`;
    
    // Force video attributes
    videoElement.muted = true;
    videoElement.defaultMuted = true;
    videoElement.setAttribute('muted', '');
    videoElement.setAttribute('playsinline', '');
    videoElement.setAttribute('webkit-playsinline', '');
    
    // Load the video
    videoElement.load();
    
    const activeVideo = videoElement;
    
    // Function to attempt video play
    function attemptPlay(video) {
        if (!video) {
            console.log('No video element provided');
            return;
        }
        
        console.log('Attempting to play video:', video.id);
        console.log('Video ready state:', video.readyState);
        console.log('Video paused:', video.paused);
        
        // Force attributes
        video.muted = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.defaultMuted = true;
        
        // Force load
        video.load();
        
        // Small delay then play
        setTimeout(() => {
            const playPromise = video.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('✅ Video playing successfully!', video.id);
                    })
                    .catch(err => {
                        console.error('❌ Autoplay prevented for', video.id, err);
                    });
            }
        }, 100);
    }
    
    // Wait for video to be ready before playing
    if (activeVideo) {
        if (activeVideo.readyState >= 3) {
            // Video is ready, play now
            attemptPlay(activeVideo);
        } else {
            // Wait for video to load enough data
            activeVideo.addEventListener('canplay', function() {
                console.log('🎬 Video canplay event fired for:', activeVideo.id);
                attemptPlay(activeVideo);
            }, { once: true });
            
            activeVideo.addEventListener('loadedmetadata', function() {
                console.log('📊 Video metadata loaded for:', activeVideo.id);
            }, { once: true });
        }
    }
    
    // Also try immediately in case it's already ready
    setTimeout(() => attemptPlay(activeVideo), 500);
    
    // Retry on ANY user interaction (multiple events for iOS)
    const events = ['touchstart', 'touchend', 'click', 'scroll'];
    let played = false;
    
    events.forEach(eventType => {
        document.addEventListener(eventType, function handler() {
            if (!played && activeVideo) {
                attemptPlay(activeVideo);
                played = true;
                
                // Remove all event listeners after first successful play
                events.forEach(e => {
                    document.removeEventListener(e, handler);
                });
            }
        }, { once: true, passive: true });
    });
    
    // Also try when video is in viewport
    if (activeVideo && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    attemptPlay(activeVideo);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(activeVideo);
    }
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            attemptPlay(activeVideo);
        }, 300);
    });
    
    // Fallback: Keep trying every 2 seconds for first 10 seconds
    let attempts = 0;
    const maxAttempts = 5;
    const retryInterval = setInterval(() => {
        if (activeVideo && activeVideo.paused && attempts < maxAttempts) {
            attemptPlay(activeVideo);
            attempts++;
        } else {
            clearInterval(retryInterval);
        }
    }, 2000);
}

// Navigation functionality
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Menu toggle clicked!');
            
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
                console.log('Menu opened');
            } else {
                document.body.style.overflow = 'auto';
                console.log('Menu closed');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const navContent = document.querySelector('.nav-content');
            if (!navContent.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Close mobile menu when clicking on links - SIMPLIFIED
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            console.log('Nav link clicked:', link.getAttribute('href'));
            
            // Close menu
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = 'auto';
                console.log('Menu closed after click');
            }
        }, { passive: false });
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = link.getAttribute('href');
            
            // Skip if it's just "#" or empty
            if (!targetId || targetId === '#') {
                e.preventDefault();
                return;
            }
            
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                e.preventDefault();
                
                // Close mobile menu if open
                const navMenu = document.querySelector('.nav-menu');
                const navToggle = document.querySelector('.nav-toggle');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
                
                // Calculate position
                const navHeight = 160; // Fixed height for glass nav
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                // Smooth scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                console.log('Navigating to:', targetId);
            }
        });
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // Trigger skill bar animations
                if (entry.target.classList.contains('skills')) {
                    animateSkillBars();
                }
                
                // Add staggered animation to portfolio items
                if (entry.target.classList.contains('portfolio-grid')) {
                    animatePortfolioItems();
                }
                
                // Add animation to stats
                if (entry.target.classList.contains('about-stats')) {
                    animateStats();
                }
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('animate-on-scroll');
        observer.observe(section);
    });
    
    // Observe individual elements
    const animateElements = document.querySelectorAll('.portfolio-grid, .about-stats, .skills-grid');
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// Animate portfolio items with stagger effect
function animatePortfolioItems() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Animate statistics with counting effect
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.textContent.replace(/\D/g, ''));
        const suffix = stat.textContent.replace(/[0-9]/g, '');
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current) + suffix;
        }, 40);
    });
}

// Skill bars animation
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    skillBars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.setProperty('--progress-width', width + '%');
    });
}

function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    skillBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.classList.add('animate');
            const width = bar.getAttribute('data-width');
            bar.style.width = width + '%';
        }, index * 100);
    });
}

// Contact form functionality
function initContactForm() {
    const form = document.querySelector('.contact-form');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
        
        // Add floating label effect
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
            
            // Check if input has value on load
            if (input.value) {
                input.parentElement.classList.add('focused');
            }
        });
    }
}

async function handleFormSubmission(e) {
    // Don't prevent default - let Formspree handle it
    const form = e.target;
    const button = form.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    
    // Show loading state
    button.textContent = 'Sending...';
    button.disabled = true;
    form.classList.add('loading');
    
    // Set a timeout to reset button state and show message
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        form.classList.remove('loading');
        showNotification('Message sent successfully! I\'ll get back to you within 24 hours.', 'success');
    }, 2000);
}

// Simulate form submission (replace with actual API call)
function simulateFormSubmission(formData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Randomly succeed or fail for demo purposes
            Math.random() > 0.1 ? resolve() : reject(new Error('Simulated error'));
        }, 2000);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Parallax effect for hero section (disabled for fixed background)
function initParallax() {
    // Disabled to keep floating cards in their animated positions
    // Fixed background handles the parallax effect
}

// Enhanced hover effects for portfolio items
document.addEventListener('DOMContentLoaded', () => {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        const mockup = item.querySelector('.project-mockup');
        
        item.addEventListener('mouseenter', () => {
            // Add subtle scaling and glow effect
            if (mockup) {
                mockup.style.filter = 'brightness(1.05) drop-shadow(0 10px 30px rgba(44, 62, 80, 0.15))';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            if (mockup) {
                mockup.style.filter = 'none';
            }
        });
    });
});

// Floating cards removed - no longer needed

// Button hover effects
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                left: ${x}px;
                top: ${y}px;
            `;
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
    }
    
    .notification-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
`;
document.head.appendChild(style);

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll events
const throttledScrollHandler = throttle(() => {
    // Your scroll handling code here
}, 16); // ~60fps

// Accessibility improvements
document.addEventListener('DOMContentLoaded', () => {
    // Add skip link for screen readers
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--accent-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10001;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content id if it doesn't exist
    const hero = document.querySelector('.hero');
    if (hero && !document.getElementById('main-content')) {
        hero.id = 'main-content';
    }
});

// Error handling for images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', () => {
            img.style.display = 'none';
            console.warn('Failed to load image:', img.src);
        });
    });
});

// Console easter egg for fellow developers
console.log(`
    ╔══════════════════════════════════════════════╗
    ║                                              ║
    ║        👋 Hello, fellow developer!           ║
    ║                                              ║
    ║    Impressed by the code? Let's connect!     ║
    ║    📧 hello@salekhmahmood.com                ║
    ║    📱 07383 547 801                          ║
    ║                                              ║
    ║         Built with ❤️ by Salekh              ║
    ║                                              ║
    ╚══════════════════════════════════════════════╝
`);

// Service Worker registration for PWA (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker would be implemented here for offline functionality
        // navigator.serviceWorker.register('/sw.js');
    });
}
