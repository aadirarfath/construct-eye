"use client";

import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  CloudSun,
} from "lucide-react";

export default function Updates() {
  const projectData = {
    project_name: "Bridge Restoration",
    location: "Munnar",
    weather: { condition: "Clear", description: "clear sky" },
    ai: {
      status: "on_track",
      progress:
        "Foundation work is complete. Steel sections of the bridge are now being lifted into position.",
      delayRisk: "medium",
      completionPercent: 40,
      expectedProgress: 24,
    },
  };

  const updates = [
    {
      title: `${projectData.project_name} Progress`,
      type: projectData.ai.status === "on_track" ? "success" : "delay",
      time: "Now",
      description: projectData.ai.progress,
      meta: `${projectData.ai.completionPercent}% complete`,
    },
    {
      title: `Weather at ${projectData.location}`,
      type: "weather",
      time: "Live",
      description: `Current condition: ${projectData.weather.description}.`,
      meta: "Clear sky",
    },
    {
      title: "Risk Check",
      type: "delay",
      time: "Analysis",
      description:
        "Heavy lifting operations require careful alignment and monitoring.",
      meta: "Medium risk",
    },
  ];

  return (
    <section className="bg-[#ffffff] py-24 px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-[#000000] flex items-center gap-3">
              <Bell className="text-[#fca311]" size={30} />
              Project Updates
            </h2>

            <p className="text-[#14213d] mt-2">
              Live updates for {projectData.location}
            </p>
          </div>
        </div>

        {/* Updates */}
        <div className="space-y-4">
          {updates.map((update, i) => (
            <div
              key={i}
              className="bg-[#ffffff] border border-[#e5e5e5] p-6 rounded-2xl flex items-start gap-5"
            >
              {/* Icon */}
              <div
                className={`mt-1 p-3 rounded-xl ${
                  update.type === "delay"
                    ? "bg-[#fca311]/10 text-[#fca311]"
                    : update.type === "success"
                    ? "bg-[#14213d]/10 text-[#14213d]"
                    : update.type === "weather"
                    ? "bg-[#14213d]/10 text-[#14213d]"
                    : "bg-[#14213d]/10 text-[#14213d]"
                }`}
              >
                {update.type === "delay" ? (
                  <AlertCircle size={22} />
                ) : update.type === "success" ? (
                  <CheckCircle2 size={22} />
                ) : update.type === "weather" ? (
                  <CloudSun size={22} />
                ) : (
                  <Clock size={22} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-[#000000]">
                    {update.title}
                  </h3>

                  <span className="text-xs text-[#14213d] uppercase">
                    {update.time}
                  </span>
                </div>

                <p className="text-[#14213d] text-sm leading-relaxed mb-3">
                  {update.description}
                </p>

                <span className="text-xs font-semibold px-2 py-1 bg-[#e5e5e5] text-[#000000] rounded">
                  {update.meta}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}