// Progress bar and scroll effects
const artworkSections = document.querySelectorAll('.artwork-section');

// Throttle function for better performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Debounce function for resize events
function debounce(func, wait) {
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

function updateProgress() {
    const scrolled = window.pageYOffset;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const percentage = (scrolled / maxScroll) * 100;
    const progressBar = document.getElementById('progress');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
}

// Intersection Observer for parallax effects
const parallaxObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.1;
            entry.target.style.transform = `rotate(-1deg) translateY(${rate}px)`;
        }
    });
}, {
    threshold: 0
});

// Apply observer to artwork sections
artworkSections.forEach(section => {
    parallaxObserver.observe(section);
});

// Scroll to top button visibility
function updateScrollButton() {
    const scrollTop = document.getElementById('scrollTop');
    if (scrollTop) {
        if (window.pageYOffset > 300) {
            scrollTop.classList.add('visible');
        } else {
            scrollTop.classList.remove('visible');
        }
    }
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Optimized mouse trail effect
let mouseTrailEnabled = true;
let lastTrailTime = 0;
const trailInterval = 100; // Minimum time between trail creation (ms)

// Check if user prefers reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    mouseTrailEnabled = false;
}

if (mouseTrailEnabled) {
    document.addEventListener('mousemove', throttle((e) => {
        const currentTime = Date.now();
        if (currentTime - lastTrailTime < trailInterval) return;
        
        if (Math.random() > 0.9) { // Reduced frequency
            const trail = document.createElement('div');
            trail.className = 'trail-dot';
            trail.style.cssText = `
                left: ${e.clientX}px;
                top: ${e.clientY}px;
                background: ${Math.random() > 0.5 ? 'var(--color-primary)' : 'var(--color-secondary)'};
                width: ${Math.random() * 15 + 5}px;
                height: ${Math.random() * 15 + 5}px;
            `;
            document.body.appendChild(trail);
            
            // Animate and remove
            requestAnimationFrame(() => {
                trail.style.transition = 'all 1s ease-out';
                trail.style.transform = `translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) scale(0)`;
                trail.style.opacity = '0';
            });
            
            setTimeout(() => trail.remove(), 1000);
            lastTrailTime = currentTime;
        }
    }, 50)); // Throttle mouse movement
}

// Optimized scroll handler
const handleScroll = throttle(() => {
    updateProgress();
    updateScrollButton();
}, 16); // ~60fps

window.addEventListener('scroll', handleScroll, { passive: true });

// Handle resize events
const handleResize = debounce(() => {
    updateProgress();
}, 250);

window.addEventListener('resize', handleResize);

// Initialize on load
window.addEventListener('load', () => {
    updateProgress();
    updateScrollButton();
});

// Clean up on page unload
window.addEventListener('unload', () => {
    // Remove all trail dots
    document.querySelectorAll('.trail-dot').forEach(dot => dot.remove());
}); 