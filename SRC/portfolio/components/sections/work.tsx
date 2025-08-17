"use client";
import { motion } from "framer-motion";
import ProjectCard from "@/components/ui/project-card";
import { IconBuilding, IconSchool, IconRobot, IconCode } from "@tabler/icons-react";

const projects = [
  {
    id: "microsoft-graph",
    title: "Graph API Migration Tool",
    company: "Microsoft GSA",
    description: "Co-built enterprise migration utility handling 10K+ user accounts",
    icon: <IconBuilding />,
    size: "large" as const,
    metrics: {
      "Impact": "75% time reduction",
      "Scale": "10K+ accounts", 
      "Adoption": "Company-wide"
    },
    links: undefined,
    tech: ["TypeScript", "Graph API", "Azure", "React"],
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    id: "lakeside-infra",
    title: "Campus Infrastructure",
    company: "Lakeside School",
    description: "Automated IT services and secure network deployment",
    icon: <IconSchool />,
    size: "medium" as const,
    metrics: {
      "Users": "500+ daily",
      "Uptime": "99.9%"
    },
    links: undefined,
    tech: ["Python", "Bash", "Docker", "Network Security"],
    gradient: "from-purple-600 to-pink-600",
  },
  {
    id: "sculptor-ai",
    title: "Sculptor AI Suite",
    company: "Personal Project",
    description: "Open-source AI tools including chat interface and translation",
    icon: <IconRobot />,
    size: "medium" as const,
    metrics: undefined,
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
    size: "small" as const,
    metrics: undefined,
    links: undefined,
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
                <ProjectCard 
                  title={project.title}
                  company={project.company}
                  description={project.description}
                  icon={project.icon}
                  size={project.size}
                  metrics={project.metrics as { [key: string]: string } | undefined}
                  tech={project.tech}
                  links={project.links}
                  gradient={project.gradient}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}