"use client";
import { motion } from "framer-motion";

const toolCategories = [
  {
    category: "Languages",
    items: ["TypeScript", "Python", "Rust", "Go", "C++", "Java", "GDScript"]
  },
  {
    category: "Frontend",
    items: ["React", "Next.js", "Three.js", "Tailwind CSS", "Framer Motion"]
  },
  {
    category: "Backend",
    items: ["Node.js", "FastAPI", "GraphQL", "REST APIs", "WebSockets"]
  },
  {
    category: "Infrastructure",
    items: ["AWS", "Docker", "Kubernetes", "Linux", "Network Security"]
  },
  {
    category: "AI/ML",
    items: ["OpenAI", "Claude", "Gemini", "HuggingFace", "PyTorch"]
  },
  {
    category: "Game Dev",
    items: ["Godot 4", "Unity", "3D Graphics", "Physics", "WebRTC"]
  }
];

export default function ToolsSection() {
  return (
    <section id="tools" className="py-16 sm:py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">Technical Skills</h2>
          <p className="text-neutral-400 mb-12 max-w-2xl">
            Technologies and tools I use to build production systems and ship features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {toolCategories.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface border border-white/10 rounded-xl p-6"
            >
              <h3 className="font-semibold text-lg mb-4">{category.category}</h3>
              <div className="flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 text-sm rounded-full bg-white/5 text-neutral-300 hover:bg-white/10 transition-colors"
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