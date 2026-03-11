"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "Map", path: "/map" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      {/* Pill container */}
      <nav
        className="
        flex items-center gap-8
        px-8 py-4
        rounded-full
        bg-[#000000]/80
        backdrop-blur-xl
        border border-[#14213d]/40
        shadow-xl
      "
      >
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          <span className="text-[#fca311]">Construct</span>
          <span className="text-white">-Eye</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-8">
          {links.map((link, i) => {
            const isActive = pathname === link.path;

            return (
              <Link
                key={i}
                href={link.path}
                className={`
                  relative
                  transition
                  font-medium
                  ${
                    isActive
                      ? "text-white"
                      : "text-[#e5e5e5] hover:text-white"
                  }
                `}
              >
                {link.name}

                {/* Active dot */}
                {isActive && (
                  <span
                    className="
                    absolute
                    left-1/2
                    -bottom-3
                    -translate-x-1/2
                    w-1.5 h-1.5
                    rounded-full
                    bg-[#fca311]
                  "
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <Link
          href="/reportissue"
          className="
            bg-[#14213d]
            text-white
            px-5 py-2
            rounded-full
            font-medium
            hover:bg-[#000000]
            border border-[#14213d]
            hover:border-[#fca311]
            transition
            duration-300
          "
        >
          Report Issue
        </Link>
      </nav>
    </div>
  );
}