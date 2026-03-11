"use client";

import Link from "next/link";
import { UserCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#000000] text-white px-8 py-16 relative overflow-hidden">

      {/* subtle background glow */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#14213d] opacity-30 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#fca311] opacity-10 blur-3xl"></div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 relative z-10">

        {/* Logo + About */}
        <div>
          <Link href="/">
            <h2 className="text-2xl font-bold mb-4 cursor-pointer group">
              <span className="text-[#fca311] transition group-hover:text-white">
                Construct
              </span>
              -Eye
            </h2>
          </Link>

          <p className="text-[#e5e5e5] text-sm">
            Public infrastructure monitoring platform for transparency,
            accountability, and citizen participation.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-4 text-[#fca311]">Quick Links</h3>

          <ul className="space-y-2 text-[#e5e5e5]">
            {[
              { name: "Home", link: "/" },
              { name: "Projects", link: "/projects" },
              { name: "Map", link: "/map" },
              { name: "Dashboard", link: "/dashboard" },
              { name: "Report Issue", link: "/reportissue" },
            ].map((item) => (
              <li key={item.name}>
                <Link
                  href={item.link}
                  className="relative inline-block hover:text-white transition"
                >
                  {item.name}

                  {/* animated underline */}
                  <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-[#fca311] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            ))}

            {/* Contractor Login */}
            <li className="pt-4">
              <Link href="/login">
                <button className="flex items-center gap-2 bg-[#14213d] hover:bg-[#000000] hover:scale-105 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-lg border border-[#14213d] hover:border-[#fca311]">
                  <UserCircle size={18} />
                  Contractor Login
                </button>
              </Link>
            </li>
          </ul>
        </div>

        {/* Platform */}
        <div>
          <h3 className="font-semibold mb-4 text-[#fca311]">Platform</h3>

          <ul className="space-y-2 text-[#e5e5e5]">
            <li>
              <Link href="/dashboard" className="hover:text-white transition">
                Transparency Index
              </Link>
            </li>

            <li>
              <Link href="/map" className="hover:text-white transition">
                Live Tracking
              </Link>
            </li>

            <li>
              <Link href="/projects" className="hover:text-white transition">
                All Projects
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-4 text-[#fca311]">Contact</h3>

          <p className="text-[#e5e5e5] text-sm">
            Public Works Department
          </p>

          <p className="text-[#e5e5e5] text-sm">
            support@enirikshan.gov.in
          </p>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-[#14213d] mt-12 pt-6 text-center text-[#e5e5e5] text-sm flex items-center justify-center gap-2">

        © 2026 Construct-Eye Government of India

        {/* fun pulse dot */}
        <span className="w-2 h-2 bg-[#fca311] rounded-full animate-pulse"></span>

      </div>
    </footer>
  );
}