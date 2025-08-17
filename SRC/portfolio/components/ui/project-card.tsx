"use client";
import { cn } from "@/lib/utils";
import { IconArrowUpRight, IconBrandGithub } from "@tabler/icons-react";

interface ProjectCardProps {
  title: string;
  company: string;
  description: string;
  icon?: React.ReactNode;
  metrics?: { [key: string]: string };
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
                <a
                  href={links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <IconBrandGithub size={20} />
                </a>
              )}
              {links.live && (
                <a
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