# Professional Portfolio Build Instructions for Claude Code

## Project Overview
Build a modern, professional portfolio for Kellen Heraty that showcases real engineering work. This should look like a senior developer's portfolio - clean, technical, and focused on shipped products. NO purple gradients, NO particle effects, NO generic "passionate developer" copy.

## Initial Setup

### 1. Create Next.js Project with TypeScript
```bash
npx create-next-app@latest portfolio --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd portfolio
```

### 2. Install Critical Dependencies
```bash
npm install framer-motion@^12.0.0-alpha.1 lenis@latest @tabler/icons-react clsx tailwind-merge shiki react-intersection-observer
npm install -D @tailwindcss/typography
```

### 3. Update package.json for React 19 compatibility
```json
{
  "overrides": {
    "framer-motion": {
      "react": "19.0.0-rc-66855b96-20241106",
      "react-dom": "19.0.0-rc-66855b96-20241106"
    }
  }
}
```

## File Structure
```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── work/
│       └── [slug]/
│           └── page.tsx
├── components/
│   ├── ui/           # Aceternity components
│   ├── sections/     # Page sections
│   └── layout/       # Nav, footer
├── lib/
│   └── utils.ts
└── public/
    └── resume.pdf
```

## Core Configuration Files

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: {
          DEFAULT: "#0a0a0a",
          hover: "#141414",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.06)",
          hover: "rgba(255, 255, 255, 0.12)",
        }
      },
      animation: {
        "aurora": "aurora 60s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
        "fade-up": "fade-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
      keyframes: {
        aurora: {
          from: { backgroundPosition: "50% 50%, 50% 50%" },
          to: { backgroundPosition: "350% 50%, 350% 50%" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### lib/utils.ts
```typescript
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Component Implementation

### app/layout.tsx
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/providers/lenis-provider";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Kellen Heraty - Full-Stack Engineer",
  description: "Full-stack engineer specializing in enterprise software, AI systems, and real-time applications. Microsoft GSA contractor, Lakeside IT.",
  openGraph: {
    title: "Kellen Heraty - Full-Stack Engineer",
    description: "Building production systems at scale",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-black text-white antialiased`}>
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
```

### components/providers/lenis-provider.tsx
```typescript
"use client";
import { ReactNode, useEffect } from "react";
import Lenis from "lenis";

export default function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

### app/page.tsx - Main Portfolio Page
```typescript
import Navigation from "@/components/layout/navigation";
import HeroSection from "@/components/sections/hero";
import WorkSection from "@/components/sections/work";
import ProjectsGrid from "@/components/sections/projects-grid";
import ToolsSection from "@/components/sections/tools";
import ContactSection from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="relative">
        <HeroSection />
        <WorkSection />
        <ProjectsGrid />
        <ToolsSection />
        <ContactSection />
      </main>
    </>
  );
}
```

### components/layout/navigation.tsx
```typescript
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Tools", href: "#tools" },
  { label: "Blog", href: "/blog" },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className={cn(
        "max-w-fit mx-auto px-6 py-3 rounded-full border transition-all duration-300",
        isScrolled 
          ? "bg-black/80 backdrop-blur-xl border-white/10" 
          : "bg-transparent border-transparent"
      )}>
        <div className="flex items-center gap-8">
          <a href="#" className="font-semibold text-sm">KH</a>
          
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              
                key={item.label}
                href={item.href}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4 ml-8">
            
              href="https://github.com/kaileh57"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
            
              href="/resume.pdf"
              className="text-sm bg-white text-black px-4 py-1.5 rounded-full hover:bg-neutral-200 transition-colors"
            >
              Resume
            </a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
```

### components/sections/hero.tsx
```typescript
"use client";
import { motion } from "framer-motion";
import { IconBrandGithub, IconDownload, IconMail } from "@tabler/icons-react";
import GradientBackground from "@/components/ui/gradient-background";

const stats = [
  { label: "Production Systems", value: "5+" },
  { label: "Users Impacted", value: "10K+" },
  { label: "Open Source Projects", value: "12" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center">
      <GradientBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Kellen Heraty
          </h1>
          
          {/* Role */}
          <p className="text-xl md:text-2xl text-neutral-400 mb-8 max-w-2xl">
            Full-Stack Engineer building enterprise software and AI systems. 
            Currently at Lakeside School IT, previously Microsoft GSA.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mb-12">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            
              href="#work"
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors font-medium"
            >
              View Work
            </a>
            
              href="https://github.com/kaileh57"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition-colors font-medium flex items-center gap-2"
            >
              <IconBrandGithub size={20} />
              GitHub
            </a>
            
              href="/resume.pdf"
              className="px-6 py-3 text-neutral-400 hover:text-white transition-colors font-medium flex items-center gap-2"
            >
              <IconDownload size={20} />
              Resume
            </a>
          </div>
        </motion.div>

        {/* Terminal Preview - Shows technical skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 max-w-2xl"
        >
          <TerminalPreview />
        </motion.div>
      </div>
    </section>
  );
}

function TerminalPreview() {
  return (
    <div className="bg-surface rounded-lg border border-white/10 p-4 font-mono text-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <div className="text-neutral-400">
        <span className="text-green-500">$</span> cat skills.json
      </div>
      <pre className="text-neutral-300 mt-2">
{`{
  "languages": ["TypeScript", "Python", "Rust", "Go"],
  "frontend": ["React", "Next.js", "Three.js"],
  "backend": ["Node.js", "FastAPI", "GraphQL"],
  "infrastructure": ["AWS", "Docker", "Kubernetes"],
  "current": "Building AI tools at scale"
}`}
      </pre>
    </div>
  );
}
```

### components/sections/work.tsx - Bento Grid Layout
```typescript
"use client";
import { motion } from "framer-motion";
import ProjectCard from "@/components/ui/project-card";
import { IconBrandMicrosoft, IconSchool, IconRobot, IconCode } from "@tabler/icons-react";

const projects = [
  {
    id: "microsoft-graph",
    title: "Graph API Migration Tool",
    company: "Microsoft GSA",
    description: "Co-built enterprise migration utility handling 10K+ user accounts",
    icon: <IconBrandMicrosoft />,
    size: "large",
    metrics: {
      impact: "75% time reduction",
      scale: "10K+ accounts",
      adoption: "Company-wide"
    },
    tech: ["TypeScript", "Graph API", "Azure", "React"],
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    id: "lakeside-infra",
    title: "Campus Infrastructure",
    company: "Lakeside School",
    description: "Automated IT services and secure network deployment",
    icon: <IconSchool />,
    size: "medium",
    metrics: {
      users: "500+ daily",
      uptime: "99.9%",
    },
    tech: ["Python", "Bash", "Docker", "Network Security"],
    gradient: "from-purple-600 to-pink-600",
  },
  {
    id: "sculptor-ai",
    title: "Sculptor AI Suite",
    company: "Personal Project",
    description: "Open-source AI tools including chat interface and translation",
    icon: <IconRobot />,
    size: "medium",
    links: {
      live: "https://ai.kaileh.dev",
      github: "https://github.com/kaileh57/sculptor"
    },
    tech: ["Next.js", "OpenAI", "Claude", "Gemini"],
    gradient: "from-orange-600 to-red-600",
  },
  {
    id: "arcade-racing",
    title: "Multiplayer Racing Game",
    company: "Game Development",
    description: "Real-time multiplayer with VR steering wheel support",
    icon: <IconCode />,
    size: "small",
    tech: ["Godot 4.2", "GDScript", "WebRTC", "Physics"],
    gradient: "from-green-600 to-emerald-600",
  },
];

export default function WorkSection() {
  return (
    <section id="work" className="py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">Featured Work</h2>
          <p className="text-neutral-400 mb-12 max-w-2xl">
            Production systems, enterprise software, and technical experiments.
            Focus on performance, scale, and user impact.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-4">
          {projects.map((project, index) => {
            const colSpan = 
              project.size === "large" ? "col-span-12 md:col-span-8" :
              project.size === "medium" ? "col-span-12 md:col-span-6" :
              "col-span-12 md:col-span-4";

            return (
              <motion.div
                key={project.id}
                className={colSpan}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProjectCard {...project} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

### components/ui/project-card.tsx
```typescript
"use client";
import { cn } from "@/lib/utils";
import { IconArrowUpRight, IconBrandGithub } from "@tabler/icons-react";

interface ProjectCardProps {
  title: string;
  company: string;
  description: string;
  icon?: React.ReactNode;
  metrics?: Record<string, string>;
  tech?: string[];
  links?: {
    live?: string;
    github?: string;
  };
  gradient: string;
  size?: "small" | "medium" | "large";
}

export default function ProjectCard({
  title,
  company,
  description,
  icon,
  metrics,
  tech,
  links,
  gradient,
  size = "medium",
}: ProjectCardProps) {
  const height = 
    size === "large" ? "h-[400px]" :
    size === "medium" ? "h-[300px]" :
    "h-[250px]";

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border border-white/10 bg-surface hover:bg-surface-hover transition-all duration-300",
      height
    )}>
      {/* Gradient accent */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        `bg-gradient-to-br ${gradient}`
      )} style={{ opacity: 0.05 }} />

      <div className="relative h-full p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="text-neutral-400">
                {icon}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-neutral-500">{company}</p>
            </div>
          </div>
          
          {links && (
            <div className="flex gap-2">
              {links.github && (
                
                  href={links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <IconBrandGithub size={20} />
                </a>
              )}
              {links.live && (
                
                  href={links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <IconArrowUpRight size={20} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-neutral-400 mb-4 flex-grow">
          {description}
        </p>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key}>
                <div className="text-sm text-neutral-500 capitalize">{key}</div>
                <div className="font-semibold">{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tech Stack */}
        {tech && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {tech.map((item) => (
              <span
                key={item}
                className="px-2 py-1 text-xs rounded-full bg-white/5 text-neutral-400"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### components/ui/gradient-background.tsx
```typescript
"use client";

export default function GradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at top left, rgba(79, 70, 229, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(79, 70, 229, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at center, rgba(79, 70, 229, 0.05) 0%, transparent 70%)
          `,
        }}
      />
      
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
```

## Critical Design Rules

1. **NO PURPLE VAPORWAVE** - Use subtle blue/indigo (#4f46e5) as accent
2. **TRUE BLACK BACKGROUND** - #000000, not gray
3. **MINIMAL ANIMATIONS** - Only on scroll/hover, no constant motion
4. **PROFESSIONAL COPY** - Focus on metrics, impact, and technical details
5. **REAL PROJECTS ONLY** - Microsoft GSA, Lakeside IT, Sculptor AI, etc.
6. **TECHNICAL DEPTH** - Show actual code, architecture, performance metrics
7. **CLEAN TYPOGRAPHY** - Inter font, clear hierarchy, plenty of whitespace
8. **SUBTLE GRADIENTS** - Only as accents, never as main backgrounds
9. **PERFORMANCE FIRST** - Lazy load images, code split routes, optimize bundles
10. **MOBILE RESPONSIVE** - Must work perfectly on all devices

## Content to Include

### Experience Section
- **Lakeside School IT** - Current role, infrastructure automation
- **Microsoft GSA** - Graph API migration tool, enterprise software
- **Sculptor AI** - Open source AI tools suite
- **Game Development** - Arcade racing, Graftmancer

### Technical Skills (Be Specific)
- Languages: TypeScript, Python, Rust, Go, C++, Java
- Frontend: React, Next.js, Three.js, Godot
- Backend: Node.js, FastAPI, GraphQL
- Infrastructure: AWS, Docker, Kubernetes
- AI/ML: OpenAI, Claude, Gemini, HuggingFace

### Projects with Real Metrics
- Graph API Tool: 75% time reduction, 10K+ accounts
- Sculptor Chat: Real-time multi-model interface
- Campus Infrastructure: 500+ daily users, 99.9% uptime
- Ursa Minor LLM: 7B parameters, 1K+ downloads

## Testing Checklist
- [ ] Loads in under 2 seconds
- [ ] Smooth scroll at 60fps
- [ ] All links work
- [ ] Resume downloads properly
- [ ] GitHub links open in new tabs
- [ ] Mobile navigation works
- [ ] Dark mode only (no light mode toggle)
- [ ] No console errors
- [ ] SEO meta tags present
- [ ] Open Graph images configured

## Final Notes
This portfolio should feel like it was built by someone who ships production code at Microsoft, not a bootcamp graduate. Every design decision should reinforce technical competence and professional experience. The goal is to get hired at a top tech company or attract high-value consulting clients.