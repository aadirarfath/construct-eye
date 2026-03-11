"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { motion } from "framer-motion";

/* COUNT UP ANIMATION */

function CountUp({ end, duration = 1.5 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);

    const timer = setInterval(() => {
      start += increment;

      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end]);

  return count.toLocaleString();
}

export default function Stats() {
  const [stats, setStats] = useState([
    { value: 0, label: "TOTAL PROJECTS" },
    { value: 0, label: "ONGOING PROJECTS" },
    { value: 0, label: "COMPLETED PROJECTS" },
    { value: 0, label: "DELAYED PROJECTS" },
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const { count: total } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });

    const { count: ongoing } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .ilike("status", "ongoing");

    const { count: completed } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .ilike("status", "completed");

    const { count: delayed } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .or("status.ilike.delayed,status.ilike.risk");

    setStats([
      { value: total || 0, label: "TOTAL PROJECTS" },
      { value: ongoing || 0, label: "ONGOING PROJECTS" },
      { value: completed || 0, label: "COMPLETED PROJECTS" },
      { value: delayed || 0, label: "DELAYED PROJECTS" },
    ]);
  }

  return (
    <section className="relative bg-[#000000] py-24 px-8 text-white overflow-hidden">

      {/* Background glow */}
      <div className="absolute w-[600px] h-[600px] bg-[#14213d] opacity-30 blur-[200px] -top-40 -left-40"></div>
      <div className="absolute w-[600px] h-[600px] bg-[#fca311] opacity-20 blur-[200px] bottom-0 right-0"></div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* TOP SECTION */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-5 gap-10 items-center"
        >

          <div className="md:col-span-2">
            <h2 className="text-3xl md:text-4xl font-bold leading-snug">
              Bringing transparency and accountability to public infrastructure.
            </h2>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">

            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="group cursor-default"
              >

                {/* Accent line */}
                <div className="w-10 h-[2px] bg-[#fca311] mb-4 transition-all group-hover:w-16" />

                {/* Number */}
                <h3 className="text-4xl font-bold mb-2 group-hover:text-[#fca311] transition">
                  <CountUp end={stat.value} />+
                </h3>

                {/* Label */}
                <p className="text-[#e5e5e5] text-sm tracking-wider">
                  {stat.label}
                </p>

              </motion.div>
            ))}

          </div>
        </motion.div>

        {/* CTA */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-[#e5e5e5]/20 pt-8"
        >

          <p className="text-[#e5e5e5]">
            Strengthening governance through real-time monitoring
          </p>

          <Link
            href="/projects"
            className="group border border-[#fca311] px-6 py-3 rounded-full transition hover:bg-[#fca311] hover:text-black"
          >
            <span className="flex items-center gap-2">
              View All Projects
              <span className="transform transition group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>

        </motion.div>

      </div>
    </section>
  );
}