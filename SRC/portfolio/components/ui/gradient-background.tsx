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