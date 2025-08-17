"use client";
import { motion } from "framer-motion";
import { IconMail, IconBrandGithub, IconBrandLinkedin, IconDownload } from "@tabler/icons-react";

export default function ContactSection() {
  return (
    <section className="py-32 bg-surface/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold mb-6">Get In Touch</h2>
          <p className="text-neutral-400 mb-12 max-w-2xl mx-auto">
            Currently open to new opportunities in full-stack development, 
            AI/ML engineering, and technical leadership roles.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <a
              href="mailto:kellen@kaileh.dev"
              className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors font-medium"
            >
              <IconMail size={20} />
              Email Me
            </a>
            
            <a
              href="https://github.com/kaileh57"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition-colors font-medium"
            >
              <IconBrandGithub size={20} />
              GitHub
            </a>
            
            <a
              href="https://linkedin.com/in/kellen-heraty"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition-colors font-medium"
            >
              <IconBrandLinkedin size={20} />
              LinkedIn
            </a>
            
            <a
              href="/resume.pdf"
              className="flex items-center gap-3 px-6 py-3 text-neutral-400 hover:text-white transition-colors font-medium"
            >
              <IconDownload size={20} />
              Resume
            </a>
          </div>

          <div className="border-t border-white/10 pt-8">
            <p className="text-neutral-500 text-sm">
              Built with Next.js, TypeScript, and Tailwind CSS • Deployed on GitHub Pages
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}