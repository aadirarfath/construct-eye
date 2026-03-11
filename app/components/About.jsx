"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { motion, useScroll, useTransform } from "framer-motion";

export default function About() {
  const router = useRouter();
  const [totalProjects, setTotalProjects] = useState(0);

  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const { count, error } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });

    if (!error) setTotalProjects(count);
  }

  return (
    <section
      ref={ref}
      className="bg-white py-32 px-8 relative overflow-hidden"
    >
      <div className="absolute -right-40 -top-40 w-[600px] h-[600px] bg-[#14213d]/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-24 items-center relative z-10">

        {/* IMAGE SIDE */}
        <motion.div
          style={{ y }}
          className="relative"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-[#e5e5e5]">
            <img src="hum.jpeg" className="w-full object-cover" />
          </div>

          <div className="absolute -bottom-8 -left-8 bg-white shadow-xl rounded-xl px-6 py-5 border border-[#e5e5e5]">
            <div className="text-sm text-gray-500 mb-1">
              Projects Monitored
            </div>

            <div className="text-3xl font-bold text-black">
              {totalProjects}+
            </div>
          </div>
        </motion.div>

        {/* TEXT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-semibold tracking-wider text-[#14213d] mb-4">
            ABOUT PLATFORM
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight mb-6">
            Infrastructure Intelligence
            <span className="block text-[#14213d]">
              for Public Transparency
            </span>
          </h2>

          <p className="text-gray-600 text-lg leading-relaxed mb-10">
            Construct-Eye provides real-time visibility into infrastructure
            projects across districts. Detect delays, monitor execution, and
            ensure government accountability using live project intelligence.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <Feature text="Live project monitoring" />
            <Feature text="Delay & risk detection" />
            <Feature text="District dashboards" />
            <Feature text="Citizen transparency" />
          </div>

          <button
            onClick={() => router.push("/projects")}
            className="bg-[#14213d] text-white px-8 py-4 rounded-xl font-semibold hover:bg-black transition shadow-lg"
          >
            Explore Projects →
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-center gap-3 bg-[#e5e5e5]/40 px-4 py-3 rounded-lg">
      <div className="w-2.5 h-2.5 bg-[#fca311] rounded-full" />
      <div className="text-black font-medium text-sm">{text}</div>
    </div>
  );
}