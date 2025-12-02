"use client";

import Button from "../components/Button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AudioLines } from "lucide-react";

// Helper component for header links
const HeaderLink = ({
  children,
  href = "#",
}: {
  children: React.ReactNode;
  href?: string;
}) => (
  <a
    href={href}
    className="text-white/80 hover:text-white transition-colors text-sm font-medium"
  >
    {children}
  </a>
);

export default function Page() {
  const router = useRouter();

  const primaryBg = "bg-[#5D4A3C]";
  const accentColor = "bg-[#D89F5C]";
  const secondaryColor = "#A7612B";

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-[#5D4A3C] to-[#3E2F25] relative px-4">
      {/* Decorative floating shapes */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#D89F5C]/20 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#A7612B]/20 rounded-full filter blur-3xl animate-pulse" />

      {/* --- Header/Navbar --- */}
      <header className="flex justify-between items-center w-full py-4 px-4 md:px-12 relative z-10">
        {/* Logo / Left Links */}
        <div className="flex items-center space-x-6">
          {/* Left links: hidden on mobile */}
          <div className="hidden md:flex space-x-6">
            <HeaderLink>Use cases</HeaderLink>
            <HeaderLink>Pricing</HeaderLink>
            <HeaderLink>Enterprise</HeaderLink>
            <HeaderLink>Resources</HeaderLink>
            <HeaderLink>Affiliates</HeaderLink>
          </div>
        </div>

        {/* Right Buttons */}
        <div className="flex space-x-3">
          <Button
            className="bg-[#2D2D2D] text-white font-medium rounded-md py-2 px-4 hover:bg-[#3F3F3F] transition-transform hover:translate-x-1"
            onClick={() => router.push("/log-in")}
          >
            Login
          </Button>

          <Button
            variant="secondary"
            className="flex items-center gap-2 text-sm font-medium hover:text-[black] transition-transform hover:translate-x-1"
            onClick={() => router.push("/sign-up")}
          >
            Sign Up
          </Button>

          <Button
            className="bg-[#F59E0B] text-[#1A1A1A] font-semibold rounded-md py-2 px-4 hover:bg-[#D97706]  transition-transform hover:translate-x-1"
            onClick={() => router.push("/video-generation")}
          >
            Start Creating
          </Button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <section className="flex flex-col items-center justify-center flex-grow text-center relative z-10 pt-10 pb-20">
        <div className="bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide">
          Used by over 250,000 creatives & teams
        </div>

        <h1 className="text-5xl md:text-6xl font-normal max-w-5xl leading-tight mb-6">
          <span className="text-[#EFDECD]">
            Generate videos with camera control, style, and story -
          </span>{" "}
          <span className="text-[#CD853F] font-semibold">All in one click</span>
        </h1>

        <p className="text-white/80 text-lg md:text-xl mb-10">
          From stills to stories — bring every frame to life.
        </p>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-sm font-medium hover:text-[#F59E0B] transition-transform hover:translate-x-1"
          onClick={() => router.push("/video-generation")}
        >
          Start Creating
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
        <br />
        <p className="text-white/70 text-sm mb-16">Sign up for free</p>

        {/* Audio Wave */}
        <div className="w-full max-w-xl flex justify-center items-center">
          <AudioLines size={400} color="#EFDECD" />
        </div>
      </section>
    </main>
  );
}
