// Progress bar and scroll effects
const floatElements = document.querySelectorAll('.float-element');
const artworkSections = document.querySelectorAll('.artwork-section');

function updateProgress() {
    const scrolled = window.pageYOffset;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const percentage = (scrolled / maxScroll) * 100;
    document.getElementById('progress').style.width = percentage + '%';
}

// Parallax effects
function parallax() {
    const scrolled = window.pageYOffset;
    
    // Floating elements
    floatElements.forEach((el, index) => {
        const speed = 0.2 * (index + 1);
        const yPos = scrolled * speed;
        const rotation = scrolled * 0.1;
        el.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
    });
    
    // Artwork sections parallax
    artworkSections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const speed = 0.1;
            const yPos = -(scrolled - section.offsetTop) * speed;
            section.style.transform = `rotate(-1deg) translateY(${yPos}px)`;
        }
    });
}

// Scroll to top button visibility
function updateScrollButton() {
    const scrollTop = document.getElementById('scrollTop');
    if (window.pageYOffset > 300) {
        scrollTop.classList.add('visible');
    } else {
        scrollTop.classList.remove('visible');
    }
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mouse trail effect
let mouseTrail = [];
const maxTrailSize = 20;

document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.95) {
        const trail = document.createElement('div');
        trail.className = 'trail-dot';
        trail.style.left = e.clientX + 'px';
        trail.style.top = e.clientY + 'px';
        trail.style.background = Math.random() > 0.5 ? '#ff0000' : '#ffcc00';
        trail.style.width = trail.style.height = Math.random() * 15 + 5 + 'px';
        document.body.appendChild(trail);
        
        mouseTrail.push(trail);
        
        if (mouseTrail.length > maxTrailSize) {
            const oldTrail = mouseTrail.shift();
            oldTrail.remove();
        }
        
        setTimeout(() => {
            trail.style.transition = 'all 1s ease-out';
            trail.style.transform = `translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) scale(0)`;
            trail.style.opacity = '0';
        }, 10);
        
        setTimeout(() => trail.remove(), 1000);
    }
});

// Scroll event listeners
let isScrolling = false;
window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            updateProgress();
            updateScrollButton();
            parallax();
            isScrolling = false;
        });
        isScrolling = true;
    }
});

// Initialize
window.addEventListener('load', () => {
    updateProgress();
    updateScrollButton();
}); 