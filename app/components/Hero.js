"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) return;
    router.push(`/projects?search=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative min-h-screen flex items-center px-8 md:px-16 overflow-hidden">
      {/* VIDEO BACKGROUND */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/jcb.mp4" type="video/mp4" />
      </video>

      {/* Dark navy overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-[#001F3F]/90 via-[#001F3F]/70 to-transparent" /> */}

      {/* Brand black/prussian-blue tint */}
      <div className="absolute inset-0 bg-[#000000]/40" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-3xl text-left">
        <p className="text-[#fca311] text-lg mb-4 font-bold uppercase tracking-widest">
          Public Monitoring Platform
        </p>

        <h1 className="text-6xl md:text-7xl font-black text-white mb-6">
          Construct-Eye
        </h1>

        <p className="text-gray-200 text-lg mb-10 max-w-xl">
          Monitor public projects with transparency, accountability, and
          real-time citizen participation.
        </p>

        {/* SEARCH */}
        <div className="flex max-w-xl backdrop-blur-xl bg-white/95 rounded-full overflow-hidden shadow-2xl border border-[#14213d]/40">
          <input
            value={query}
            onChange={(Construct) => setQuery(Construct.target.value)}
            placeholder="Search any public project"
            className="flex-1 px-6 py-4 outline-none text-[#000000]"
          />

          <button
            onClick={handleSearch}
            className="bg-[#14213d] text-white px-8 font-semibold hover:bg-[#000000] transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
