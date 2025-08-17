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
