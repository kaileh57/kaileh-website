// Simple, functional JavaScript for the blog
document.addEventListener('DOMContentLoaded', function() {
    
    // Add some basic functionality without being fancy
    addKeyboardShortcuts();
    improveLinks();
    
});

// Basic keyboard shortcuts
function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Press 'h' to go home
        if (e.key === 'h' && !e.ctrlKey && !e.metaKey && !isTyping()) {
            window.location.href = '../index.html';
        }
    });
}

// Check if user is typing in an input field
function isTyping() {
    const activeElement = document.activeElement;
    return activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
    );
}

// Improve external links
function improveLinks() {
    const links = document.querySelectorAll('a[href^="http"]');
    links.forEach(link => {
        if (!link.hostname.includes(window.location.hostname)) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
} 