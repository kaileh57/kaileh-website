export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="#" className="font-bold text-lg text-white">KH</a>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#work" className="text-gray-300 hover:text-white transition-colors">Work</a>
            <a href="#projects" className="text-gray-300 hover:text-white transition-colors">Projects</a>
            <a href="#tools" className="text-gray-300 hover:text-white transition-colors">Tools</a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/kaileh57"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="/resume.pdf"
              className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors font-medium"
            >
              Resume
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}