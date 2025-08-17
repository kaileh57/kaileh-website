# Professional Portfolio Implementation Guide - Kellen Heraty

## The Problem With Your Current Site
Your site looks like a junior developer followed a "cool portfolio tutorial" from 2022. The purple particles, generic gradients, and "passionate developer" messaging scream bootcamp graduate, not someone who's shipped production code at Microsoft.

## What Actually Works in 2025

Based on analysis of top portfolios (Rauno Freiberg, Lee Robinson, Josh Comeau):

### Core Design Principles
1. **True black backgrounds** (#000 or #0a0a0a) with high contrast
2. **Monospace fonts for technical content** (JetBrains Mono, SF Mono)
3. **Inter or similar for body text** (clean, modern, readable)
4. **Subtle animations only on interaction** (no constant motion)
5. **Grid-based layouts** with clear visual hierarchy
6. **Focus on metrics and impact**, not descriptions

## Complete Implementation

### 1. Color System (Steal This Exactly)

```css
:root {
  /* Backgrounds - True blacks for OLED */
  --bg-primary: #000000;
  --bg-secondary: #050505;
  --bg-tertiary: #0a0a0a;
  --bg-card: #111111;
  --bg-card-hover: #1a1a1a;
  
  /* Text - High contrast but not harsh */
  --text-primary: #fafafa;
  --text-secondary: #a1a1a1;
  --text-tertiary: #6b6b6b;
  
  /* Borders - Barely visible */
  --border-primary: rgba(255, 255, 255, 0.08);
  --border-secondary: rgba(255, 255, 255, 0.04);
  --border-hover: rgba(255, 255, 255, 0.12);
  
  /* Accent - Single color, used sparingly */
  --accent: #3b82f6; /* Blue, not purple */
  --accent-dimmed: rgba(59, 130, 246, 0.1);
  
  /* Status colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
}
```

### 2. Typography System

```css
/* Import these exact fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

/* Typography scale */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-5xl { font-size: 3rem; line-height: 1; }
.text-6xl { font-size: 3.75rem; line-height: 1; }

/* Font families */
body { font-family: 'Inter', -apple-system, sans-serif; }
.font-mono { font-family: 'JetBrains Mono', 'SF Mono', monospace; }
```

### 3. The Hero Section That Actually Works

```tsx
// components/sections/hero.tsx
export default function Hero() {
  return (
    <section className="min-h-screen flex items-center px-6">
      <div className="max-w-6xl mx-auto w-full">
        {/* No "Hi, I'm" bullshit */}
        <div className="space-y-8">
          {/* Name with subtle animation */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-bold tracking-tight"
          >
            Kellen Heraty
          </motion.h1>
          
          {/* One-liner that shows seniority */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-text-secondary max-w-2xl"
          >
            Full-Stack Engineer specializing in enterprise software and AI systems.
            Previously Microsoft GSA. Currently Lakeside School IT.
          </motion.p>
          
          {/* Real metrics, not fluff */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-12 pt-4"
          >
            <Metric value="10K+" label="Users Impacted" />
            <Metric value="75%" label="Migration Time Reduced" />
            <Metric value="3" label="Production AI Tools" />
            <Metric value="100K+" label="Lines Shipped" />
          </motion.div>
          
          {/* Simple CTAs */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 pt-8"
          >
            <a 
              href="#work" 
              className="px-5 py-2.5 bg-white text-black font-medium rounded-md hover:bg-neutral-200 transition-colors"
            >
              View Work
            </a>
            <a 
              href="/resume.pdf" 
              className="px-5 py-2.5 text-text-secondary hover:text-white transition-colors"
            >
              Resume →
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold font-mono">{value}</div>
      <div className="text-sm text-text-tertiary mt-1">{label}</div>
    </div>
  );
}
```

### 4. Work Section - Grid Layout That Shows Real Impact

```tsx
// components/sections/work.tsx
const PROJECTS = [
  {
    id: 'microsoft-graph',
    title: 'Graph API Migration Tool',
    company: 'Microsoft GSA',
    year: '2024',
    description: 'Enterprise migration utility adopted company-wide',
    impact: {
      primary: '75% faster migrations',
      secondary: '10K+ accounts processed',
    },
    tech: ['TypeScript', 'Graph API', 'Azure'],
    gradient: 'from-blue-500/10 to-cyan-500/10',
  },
  {
    id: 'sculptor-ai',
    title: 'Sculptor AI Suite',
    company: 'Open Source',
    year: '2024-Present',
    description: 'Multi-model AI interface and tools',
    impact: {
      primary: 'Real-time streaming',
      secondary: '<100ms response time',
    },
    tech: ['Next.js', 'OpenAI', 'Claude API'],
    gradient: 'from-orange-500/10 to-red-500/10',
    live: 'https://ai.kaileh.dev',
  },
  // Add more projects...
];

export default function Work() {
  return (
    <section id="work" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Simple header */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-4">Work</h2>
          <p className="text-text-secondary">
            Production systems and shipped code.
          </p>
        </div>
        
        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ 
  title, 
  company, 
  year, 
  description, 
  impact, 
  tech, 
  gradient,
  live 
}: Project) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative p-6 bg-bg-card rounded-lg border border-border-primary hover:border-border-hover transition-all duration-300"
    >
      {/* Subtle gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-lg`} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-sm text-text-tertiary">{company} · {year}</p>
          </div>
          {live && (
            <a 
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-tertiary hover:text-white transition-colors"
            >
              <IconArrowUpRight size={20} />
            </a>
          )}
        </div>
        
        {/* Description */}
        <p className="text-text-secondary mb-6">{description}</p>
        
        {/* Impact metrics */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-success rounded-full" />
            <span className="text-sm">{impact.primary}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-success rounded-full" />
            <span className="text-sm">{impact.secondary}</span>
          </div>
        </div>
        
        {/* Tech stack */}
        <div className="flex flex-wrap gap-2">
          {tech.map((item) => (
            <span 
              key={item}
              className="px-2 py-1 text-xs font-mono bg-bg-primary rounded border border-border-secondary"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
```

### 5. Terminal Component (Shows Technical Depth)

```tsx
// components/ui/terminal.tsx
export default function Terminal() {
  const [isTyping, setIsTyping] = useState(true);
  
  return (
    <div className="bg-black rounded-lg border border-border-primary p-4 font-mono text-sm">
      {/* Terminal header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-text-tertiary text-xs">kellen@dev</span>
      </div>
      
      {/* Terminal content */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-green-400">$</span>
          <TypeAnimation
            sequence={[
              'cat current_stack.json',
              1000,
            ]}
            wrapper="span"
            cursor={false}
            className="text-text-secondary"
          />
        </div>
        
        {!isTyping && (
          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-text-primary"
          >
{`{
  "languages": ["TypeScript", "Python", "Rust", "Go"],
  "frontend": ["React", "Next.js", "Three.js", "Tailwind"],
  "backend": ["Node.js", "FastAPI", "GraphQL", "PostgreSQL"],
  "infra": ["AWS", "Docker", "Vercel", "Kubernetes"],
  "currently": "Building AI tools and enterprise software"
}`}
          </motion.pre>
        )}
      </div>
    </div>
  );
}
```

### 6. Navigation (Minimal and Functional)

```tsx
// components/layout/navigation.tsx
export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "py-4 bg-bg-primary/80 backdrop-blur-xl border-b border-border-primary" : "py-6"
    )}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        {/* Logo/Name */}
        <a href="/" className="font-semibold">
          KH
        </a>
        
        {/* Nav items */}
        <div className="flex items-center gap-8">
          <a href="#work" className="text-text-secondary hover:text-white transition-colors text-sm">
            Work
          </a>
          <a href="#projects" className="text-text-secondary hover:text-white transition-colors text-sm">
            Projects
          </a>
          <a href="/blog" className="text-text-secondary hover:text-white transition-colors text-sm">
            Writing
          </a>
          <div className="w-px h-4 bg-border-primary" />
          <a 
            href="https://github.com/kaileh57" 
            target="_blank"
            className="text-text-secondary hover:text-white transition-colors"
          >
            <IconBrandGithub size={18} />
          </a>
          <a 
            href="/resume.pdf"
            className="px-3 py-1.5 text-sm bg-white text-black rounded hover:bg-neutral-200 transition-colors"
          >
            Resume
          </a>
        </div>
      </div>
    </nav>
  );
}
```

### 7. Smooth Scroll with Lenis (Must Have)

```tsx
// app/layout.tsx
'use client';
import Lenis from 'lenis';

export default function RootLayout({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });
    
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);
    
    return () => lenis.destroy();
  }, []);
  
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
```

### 8. Hover Effects That Feel Premium

```css
/* Card hover with glow */
.card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card::before {
  content: '';
  position: absolute;
  inset: -1px;
  background: linear-gradient(45deg, var(--accent), transparent);
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: -1;
}

.card:hover {
  transform: translateY(-4px);
  border-color: var(--border-hover);
}

.card:hover::before {
  opacity: 0.1;
}

/* Text link with underline animation */
.link {
  position: relative;
  color: var(--text-secondary);
  transition: color 0.3s;
}

.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--accent);
  transition: width 0.3s;
}

.link:hover {
  color: var(--text-primary);
}

.link:hover::after {
  width: 100%;
}
```

### 9. Project Case Study Template

```tsx
// app/work/[slug]/page.tsx
export default function CaseStudy({ params }) {
  return (
    <article className="max-w-4xl mx-auto px-6 py-32">
      {/* Hero */}
      <header className="mb-16">
        <div className="mb-8">
          <span className="text-sm text-text-tertiary">Microsoft GSA · 2024</span>
        </div>
        <h1 className="text-5xl font-bold mb-6">
          Graph API Migration Tool
        </h1>
        <p className="text-xl text-text-secondary">
          Reducing enterprise account migration time from hours to minutes
        </p>
      </header>
      
      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-8 py-12 border-y border-border-primary">
        <div>
          <div className="text-3xl font-bold font-mono">75%</div>
          <div className="text-sm text-text-tertiary mt-1">Time Reduction</div>
        </div>
        <div>
          <div className="text-3xl font-bold font-mono">10K+</div>
          <div className="text-sm text-text-tertiary mt-1">Accounts Migrated</div>
        </div>
        <div>
          <div className="text-3xl font-bold font-mono">0</div>
          <div className="text-sm text-text-tertiary mt-1">Data Loss</div>
        </div>
      </div>
      
      {/* Content sections */}
      <div className="prose prose-invert max-w-none mt-16">
        <h2>The Problem</h2>
        <p>Manual migration process taking 4+ hours per batch...</p>
        
        <h2>Technical Approach</h2>
        <CodeBlock language="typescript">
{`// Batch processing with Graph API
async function migrateBatch(accounts: Account[]) {
  const batch = accounts.map(account => ({
    id: account.id,
    method: 'PATCH',
    url: \`/users/\${account.id}\`,
    body: transformAccount(account)
  }));
  
  return await graphClient.api('/$batch').post({ requests: batch });
}`}
        </CodeBlock>
        
        <h2>Impact</h2>
        <p>Adopted company-wide within 2 weeks of deployment...</p>
      </div>
    </article>
  );
}
```

### 10. Footer (Simple and Professional)

```tsx
// components/layout/footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-border-primary py-12 px-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="text-sm text-text-tertiary">
          © 2025 Kellen Heraty
        </div>
        
        <div className="flex items-center gap-6">
          <a href="mailto:kellen@example.com" className="text-sm text-text-secondary hover:text-white transition-colors">
            Email
          </a>
          <a href="https://github.com/kaileh57" className="text-sm text-text-secondary hover:text-white transition-colors">
            GitHub
          </a>
          <a href="https://linkedin.com/in/kellen" className="text-sm text-text-secondary hover:text-white transition-colors">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
```

## Critical Implementation Rules

### DO:
- Use true black (#000000) background
- Keep animations subtle and only on interaction
- Focus on metrics and impact, not descriptions
- Use monospace fonts for technical content
- Show real code snippets from actual projects
- Keep navigation minimal and functional
- Use high contrast but not harsh (avoid pure white)
- Add smooth scrolling with Lenis
- Include terminal/CLI aesthetics sparingly
- Make everything keyboard accessible

### DON'T:
- No gradients as main backgrounds
- No particle effects or constant animations
- No "passionate developer" copy
- No stock illustrations or generic icons
- No light mode (dark only)
- No fancy loading screens
- No scroll-jacking
- No background music or sounds
- No "Hi, I'm..." introductions
- No testimonials (you're not a freelancer)

## Content That Actually Matters

### Projects to Feature:
1. **Microsoft Graph API Tool** - Lead with this, it's enterprise level
2. **Sculptor AI Suite** - Shows you can build consumer products
3. **Lakeside Infrastructure** - Current role, shows responsibility
4. **Arcade Racing Game** - Shows technical breadth
5. **Ursa Minor LLM** - Open source contribution

### Skills to Highlight (Be Specific):
- "TypeScript, React, Next.js" not "Frontend Development"
- "Graph API, Azure Functions" not "Cloud Technologies"
- "10K+ users, 75% time reduction" not "Improved efficiency"

### Blog Posts (Already Good):
- Keep your existing AI articles
- Add technical deep-dives on projects
- Write about specific problems you solved

## Performance Checklist

```javascript
// Run these checks
- Lighthouse score > 95 on all metrics
- First Contentful Paint < 1s
- Time to Interactive < 2s
- No layout shift (CLS = 0)
- Bundle size < 200KB (excluding fonts)
- Images: WebP with AVIF fallback
- Fonts: Variable fonts with font-display: swap
- Code splitting on routes
- Lazy load below the fold
```

## Deployment

```bash
# Use Vercel for deployment
vercel --prod

# Set up analytics
npm install @vercel/analytics

# Add speed insights
npm install @vercel/speed-insights
```

## Final Result Should Feel Like:

- **Lee Robinson's Portfolio**: Focus on impact and shipped products
- **Rauno Freiberg's Site**: Attention to micro-interactions and polish
- **Linear.app**: Clean, technical, modern without being trendy
- **Vercel's Design**: Professional, fast, accessible

Remember: You're competing with people who have CS degrees from top schools. Your portfolio needs to show you can ship production code, not that you completed a bootcamp. Every design decision should reinforce technical competence and professional experience.