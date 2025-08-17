"use client";
import { motion } from "framer-motion";
import { IconCode, IconBrandGithub, IconArrowUpRight } from "@tabler/icons-react";

const additionalProjects = [
  {
    title: "Ursa Minor LLM",
    description: "7B parameter language model with 1K+ downloads",
    tech: ["Python", "PyTorch", "HuggingFace", "Transformers"],
    links: {
      github: "https://github.com/kaileh57/ursa-minor",
      live: "https://huggingface.co/kaileh/ursa-minor"
    }
  },
  {
    title: "Graftmancer",
    description: "3D turn-based strategy game with procedural generation",
    tech: ["Godot 4", "GDScript", "3D Graphics", "Procedural Gen"],
    links: {
      github: "https://github.com/kaileh57/graftmancer"
    }
  },
  {
    title: "Campus Network Tools",
    description: "Automated network configuration and monitoring suite",
    tech: ["Python", "Network Programming", "SSH", "Monitoring"],
    links: {
      github: "https://github.com/kaileh57/network-tools"
    }
  }
];

export default function ProjectsGrid() {
  return (
    <section id="projects" className="py-16 sm:py-24 md:py-32 bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">Additional Projects</h2>
          <p className="text-neutral-400 mb-12 max-w-2xl">
            Open source contributions and technical experiments showcasing diverse skills.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {additionalProjects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-surface border border-white/10 rounded-xl p-6 hover:bg-surface-hover transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <IconCode className="text-neutral-400" size={20} />
                  <h3 className="font-semibold">{project.title}</h3>
                </div>
                
                <div className="flex gap-2">
                  {project.links.github && (
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-white transition-colors"
                    >
                      <IconBrandGithub size={18} />
                    </a>
                  )}
                  {project.links.live && (
                    <a
                      href={project.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-white transition-colors"
                    >
                      <IconArrowUpRight size={18} />
                    </a>
                  )}
                </div>
              </div>

              <p className="text-neutral-400 mb-4 text-sm">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tech.map((item) => (
                  <span
                    key={item}
                    className="px-2 py-1 text-xs rounded-full bg-white/5 text-neutral-400"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}