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
