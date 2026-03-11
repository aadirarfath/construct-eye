"use client";

import { FileCheck, Camera, LineChart, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function Capabilities() {
  const features = [
    {
      title: "Plan Verification",
      desc: "Project plans are checked against project data, seasonal conditions, and execution timelines to identify unrealistic expectations early.",
      icon: FileCheck,
    },
    {
      title: "Progress Verification",
      desc: "Site photos and updates provide visual confirmation of work completed, reducing dependence on manual reporting alone.",
      icon: Camera,
    },
    {
      title: "Risk Monitoring",
      desc: "Work progress is continuously tracked to identify delays early and help authorities take corrective action in time.",
      icon: LineChart,
    },
    {
      title: "Issue Alerts",
      desc: "When progress slows or deviations occur, responsible officials are notified immediately to ensure timely response.",
      icon: Bell,
    },
  ];

  return (
    <section className="relative py-28 px-6 bg-black overflow-hidden">

      {/* background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#14213d] blur-[120px] opacity-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#fca311] blur-[120px] opacity-10" />

      {/* heading */}
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-4xl font-bold text-white mb-4">
          How Construct-Eye Strengthens Oversight
        </h2>

        <p className="text-[#e5e5e5] max-w-xl mx-auto">
          Ensuring projects stay on track through continuous verification and
          monitoring
        </p>
      </div>

      {/* cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 relative z-10">

        {features.map((feature, i) => {
          const Icon = feature.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >

              <div
                className="group relative rounded-xl p-[1px]"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();

                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;

                  e.currentTarget.style.setProperty("--x", `${x}px`);
                  e.currentTarget.style.setProperty("--y", `${y}px`);
                }}
              >

                {/* glow border */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300"
                  style={{
                    background:
                      "radial-gradient(300px circle at var(--x) var(--y), rgba(252,163,17,0.6), transparent 50%)",
                  }}
                />

                {/* inner card */}
                <div
                  className="
                  relative
                  bg-[#0a0f1a]
                  border border-[#1f2a3a]
                  rounded-xl
                  p-8
                  hover:bg-[#101726]
                  transition
                "
                >

                  <Icon className="text-[#fca311] mb-4" size={28} />

                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-[#e5e5e5] leading-relaxed">
                    {feature.desc}
                  </p>

                </div>

              </div>

            </motion.div>
          );
        })}

      </div>

      {/* bottom text */}
      <div className="text-center mt-16 text-[#e5e5e5] relative z-10">
        Supporting transparent and accountable public infrastructure delivery
      </div>

    </section>
  );
}