// Simple, functional JavaScript for the blog
document.addEventListener('DOMContentLoaded', function () {

    // Add some basic functionality without being fancy
    addKeyboardShortcuts();
    improveLinks();

});

// Basic keyboard shortcuts
function addKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
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

// Metadata generation helper (for development/content creation)
function generateMetadata(postData) {
    const {
        title,
        description,
        url,
        publishedDate,
        section = "AI & Tech",
        tags = [],
        author = "Kellen H (Kaileh57)",
        twitterHandle = "@kaileh57"
    } = postData;

    const keywords = tags.concat(['AI', 'artificial intelligence', 'technology', 'blog']).join(', ');

    return `    <!-- SEO Meta Tags -->
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="${author}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://kaileh.dev/blog/posts/${url}">
    <meta property="og:site_name" content="Kellen Heraty">
    <meta property="og:locale" content="en_US">
    <meta property="article:published_time" content="${publishedDate}">
    <meta property="article:author" content="${author}">
    <meta property="article:section" content="${section}">
    ${tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n    ')}
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description.substring(0, 160)}">
    <meta name="twitter:creator" content="${twitterHandle}">`;
}

// Example usage (uncomment and run in console to generate metadata):
/*
console.log(generateMetadata({
    title: "Your Post Title Here",
    description: "A compelling description of your post that will appear in social media previews.",
    url: "your-post-filename.html",
    publishedDate: "2025-01-01",
    section: "AI Research",
    tags: ["OpenAI", "GPT", "AI Safety"]
}));
*/ 