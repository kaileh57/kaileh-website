export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-32 pt-40">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
          Kellen Heraty
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">
          Full-Stack Engineer building enterprise software and AI systems. 
          Currently at Lakeside School IT, previously Microsoft GSA.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-12 max-w-lg sm:max-w-none mx-auto sm:mx-0">
          <div className="text-center sm:text-left">
            <div className="text-3xl sm:text-3xl font-bold text-white">5+</div>
            <div className="text-sm sm:text-sm text-gray-400">Production Systems</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-3xl sm:text-3xl font-bold text-white">10K+</div>
            <div className="text-sm sm:text-sm text-gray-400">Users Impacted</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-3xl sm:text-3xl font-bold text-white">12</div>
            <div className="text-sm sm:text-sm text-gray-400">Open Source Projects</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-12 sm:mb-16">
          <a
            href="#work"
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
          >
            View Work
          </a>
          <a
            href="https://github.com/kaileh57"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-center"
          >
            GitHub
          </a>
          <a
            href="/resume.pdf"
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors font-medium text-center"
          >
            Resume
          </a>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 sm:p-6 font-mono text-sm w-full sm:max-w-2xl overflow-x-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="text-gray-400 mb-2">
            <span className="text-green-400">$</span> cat skills.json
          </div>
          <pre className="text-gray-300 text-xs whitespace-pre-wrap break-words">
{`{
  "languages": ["TypeScript", "Python", "Rust", "Go"],
  "frontend": ["React", "Next.js", "Three.js"],
  "backend": ["Node.js", "FastAPI", "GraphQL"],
  "infrastructure": ["AWS", "Docker", "Kubernetes"],
  "current": "Building AI tools at scale"
}`}
          </pre>
        </div>
      </div>
    </section>
  );
}