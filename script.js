// Portfolio Website JavaScript
// Handles animations, interactions, and form functionality

// Force scroll to top on page load/reload
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Immediate scroll to top (before DOM loads)
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', function() {
    // Force scroll to top again when DOM is ready
    window.scrollTo(0, 0);
    
    // Initialize all features
    initNavigation();
    initScrollAnimations();
    initSkillBars();
    initContactForm();
    initSmoothScrolling();
    initParallax();
    forceVideoPlayback();
});

// Also handle page show event (for back/forward navigation)
window.addEventListener('pageshow', function(event) {
    // If page is loaded from cache (back/forward button)
    if (event.persisted) {
        window.scrollTo(0, 0);
    }
});

// BULLETPROOF iOS video playback with enhanced mobile support
function forceVideoPlayback() {
    const desktopVideo = document.getElementById('desktop-video');
    const mobileVideo = document.getElementById('mobile-video');
    
    // Detect iOS specifically
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isMobile = window.innerWidth <= 768;
    const activeVideo = isMobile ? mobileVideo : desktopVideo;
    const inactiveVideo = isMobile ? desktopVideo : mobileVideo;
    
    console.log('🎥 Device Info:', {
        isIOS,
        isMobile,
        width: window.innerWidth,
        userAgent: navigator.userAgent,
        activeVideoId: activeVideo ? activeVideo.id : 'none'
    });
    
    // Completely disable inactive video to prevent conflicts
    if (inactiveVideo) {
        inactiveVideo.pause();
        inactiveVideo.removeAttribute('src');
        inactiveVideo.load();
    }
    
    // Enhanced iOS video setup
    function setupIOSVideo(video) {
        if (!video) return;
        
        // Critical iOS attributes
        video.muted = true;
        video.defaultMuted = true;
        video.volume = 0;
        video.playsInline = true;
        
        // Set all possible muted attributes
        video.setAttribute('muted', 'muted');
        video.setAttribute('playsinline', 'playsinline');
        video.setAttribute('webkit-playsinline', 'webkit-playsinline');
        video.setAttribute('x5-playsinline', 'x5-playsinline');
        
        // Remove controls to prevent iOS interference
        video.removeAttribute('controls');
        
        console.log('📱 iOS video setup complete for:', video.id);
    }
    
    // Function to attempt video play with extensive error handling
    function attemptPlay(video, attemptNum = 1) {
        if (!video) {
            console.log('❌ No video element provided');
            return Promise.reject('No video');
        }
        
        console.log(`🎬 Attempt ${attemptNum} to play:`, video.id, {
            readyState: video.readyState,
            paused: video.paused,
            currentSrc: video.currentSrc,
            networkState: video.networkState,
            error: video.error
        });
        
        // If there's a video error, try to recover
        if (video.error) {
            console.error('❌ Video error detected:', video.error);
            video.load(); // Try reloading
        }
        
        // Setup iOS-specific attributes every time
        if (isIOS) {
            setupIOSVideo(video);
        }
        
        // Force reload if not loaded
        if (video.readyState < 2) {
            video.load();
        }
        
        return new Promise((resolve, reject) => {
            // Try playing after a small delay
            setTimeout(() => {
                const playPromise = video.play();
                
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            console.log('✅ Video playing successfully!', video.id);
                            resolve();
                        })
                        .catch(err => {
                            console.error(`❌ Play failed (attempt ${attemptNum}):`, video.id, err.name, err.message);
                            reject(err);
                        });
                } else {
                    console.log('⚠️ No play promise returned');
                    resolve();
                }
            }, 150);
        });
    }
    
    // Initial setup
    if (isIOS && activeVideo) {
        setupIOSVideo(activeVideo);
    }
    
    // CRITICAL: Wait for video to be ready before trying to play
    // This is the fix for the "works on reload but not first load" issue
    if (activeVideo) {
        // If video is already loaded (cached), play immediately
        if (activeVideo.readyState >= 3) { // HAVE_FUTURE_DATA or better
            console.log('✅ Video already loaded (cached), playing now');
            attemptPlay(activeVideo, 1).catch(err => {
                console.log('Initial play failed, waiting for user interaction...');
            });
        } else {
            // Video not loaded yet - wait for it
            console.log('⏳ Video not loaded yet, waiting for canplay event...');
            
            activeVideo.addEventListener('canplay', function onCanPlay() {
                console.log('✅ Video can play now, attempting playback');
                attemptPlay(activeVideo, 1).catch(err => {
                    console.log('Play after canplay failed, waiting for interaction...');
                });
                // Remove listener after first trigger
                activeVideo.removeEventListener('canplay', onCanPlay);
            }, { once: true });
            
            // Also listen for loadeddata as a backup
            activeVideo.addEventListener('loadeddata', function onLoadedData() {
                console.log('✅ Video data loaded, attempting playback');
                attemptPlay(activeVideo, 1).catch(err => {
                    console.log('Play after loadeddata failed, waiting for interaction...');
                });
            }, { once: true });
        }
    }
    
    // AGGRESSIVE user interaction detection for iOS
    let hasPlayed = false;
    const interactionEvents = ['touchstart', 'touchend', 'touchmove', 'click', 'scroll', 'gesturestart'];
    
    function playOnInteraction(event) {
        if (hasPlayed || !activeVideo) return;
        
        console.log('🎯 User interaction detected:', event.type);
        
        attemptPlay(activeVideo, 2).then(() => {
            hasPlayed = true;
            // Clean up event listeners
            interactionEvents.forEach(evt => {
                document.removeEventListener(evt, playOnInteraction);
            });
        }).catch(err => {
            console.log('Play on interaction failed, will keep trying...');
        });
    }
    
    // Attach to all interaction events
    interactionEvents.forEach(eventType => {
        document.addEventListener(eventType, playOnInteraction, { passive: true, once: false });
    });
    
    // Intersection Observer to play when visible
    if (activeVideo && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasPlayed) {
                    console.log('📍 Video in viewport, attempting play...');
                    attemptPlay(activeVideo, 3);
                }
            });
        }, { threshold: 0.25 });
        
        observer.observe(activeVideo);
    }
    
    // Handle orientation change (important for your issue!)
    window.addEventListener('orientationchange', () => {
        console.log('📱 Orientation changed, reloading video...');
        setTimeout(() => {
            if (activeVideo) {
                activeVideo.load();
                attemptPlay(activeVideo, 4);
            }
        }, 500);
    });
    
    // Handle visibility change (when user returns to tab)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && activeVideo && activeVideo.paused) {
            console.log('👁️ Tab visible, attempting play...');
            attemptPlay(activeVideo, 5);
        }
    });
    
    // Persistent retry for mobile (more aggressive)
    if (isMobile && activeVideo) {
        let retryCount = 0;
        const maxRetries = 10;
        
        const retryInterval = setInterval(() => {
            if (activeVideo.paused && retryCount < maxRetries && !hasPlayed) {
                console.log(`🔄 Retry ${retryCount + 1}/${maxRetries}...`);
                attemptPlay(activeVideo, 6 + retryCount);
                retryCount++;
            } else {
                clearInterval(retryInterval);
                if (hasPlayed) {
                    console.log('✅ Video successfully playing, stopping retries');
                }
            }
        }, 3000);
    }
    
    // Listen for video errors
    if (activeVideo) {
        activeVideo.addEventListener('error', (e) => {
            console.error('❌ Video error event:', {
                error: activeVideo.error,
                code: activeVideo.error ? activeVideo.error.code : null,
                message: activeVideo.error ? activeVideo.error.message : null,
                src: activeVideo.currentSrc
            });
        });
        
        // Monitor when video actually starts playing
        activeVideo.addEventListener('playing', () => {
            console.log('✅ Video is now playing!');
            hasPlayed = true;
        });
    }
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
