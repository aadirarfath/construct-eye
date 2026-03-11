"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function CivilianDashboard() {
  const [projects, setProjects] = useState([]);

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("contractor_projects")
      .select("*")
      .order("project_id", { ascending: false });

    if (!error) {
      setProjects(data);

      setSelected(data[0]);
    }
  }

  if (!selected) return null;

  // parse fields safely

  const gemini =
    typeof selected.gemini_suggestions === "string"
      ? JSON.parse(selected.gemini_suggestions)
      : selected.gemini_suggestions;

  const photo =
    typeof selected.latest_photo === "string"
      ? JSON.parse(selected.latest_photo)
      : selected.latest_photo;

  const timeline =
    typeof selected.contractor_report_timeline === "string"
      ? JSON.parse(selected.contractor_report_timeline)
      : selected.contractor_report_timeline;

  const completion = gemini?.completionPercent || 0;

  const expected = gemini?.expectedProgress || 0;

  const imageUrl =
    photo?.url ||
    supabase.storage
      .from("project-photos")
      .getPublicUrl(photo?.storage_path || "").data.publicUrl;

  return (
    <div className="min-h-screen flex bg-[#e5e5e5]">
      {/* SIDEBAR */}

      <div className="w-80 bg-[#000000] text-white shadow-xl flex flex-col">
        {/* Sidebar Heading */}

        <div className="p-6 border-b border-[#fca311]">
          <h1 className="text-xl font-bold tracking-wide">Civilian Portal</h1>

          <p className="text-[#e5e5e5] text-xs mt-1">Infrastructure Projects</p>
        </div>

        {/* Project List */}

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {projects.map((p) => (
            <div
              key={p.project_id}
              onClick={() => setSelected(p)}
              className={`p-3 rounded-lg cursor-pointer transition

              ${
                selected.project_id === p.project_id
                  ? "bg-[#14213d] shadow-md"
                  : "hover:bg-[#14213d]/40"
              }`}
            >
              <div className="font-semibold text-sm">{p.project_name}</div>

              <div className="text-xs text-[#e5e5e5]">ID: {p.project_id}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}

      <div className="flex-1">
        {/* HEADER */}

        <div className="bg-[#000000] text-white py-6 shadow border-b-4 border-[#fca311]">
          <h1 className="text-center text-2xl font-bold tracking-wide">
            Infrastructure Transparency Dashboard
          </h1>
        </div>

        {/* DASHBOARD */}

        <div className="max-w-6xl mx-auto mt-8 px-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-[#e5e5e5] p-10">
            {/* TITLE */}

            <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-[#e5e5e5] pb-6 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#000000]">
                  Project ID: {selected.project_id} | {selected.project_name}
                </h2>

                <p className="flex items-center gap-2 text-[#14213d] mt-2 font-medium">
                  <MapPin size={16} />

                  {selected.location}
                </p>
              </div>

              <div className="mt-4 md:mt-0 text-right">
                <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 px-6 py-2 rounded-full font-bold text-sm shadow-sm">
                  Status: {gemini?.status || "Unknown"}
                </span>

                <p className="text-xs text-[#fca311] mt-3 italic flex items-center justify-end gap-1">
                  <Clock size={12} />
                  Last updated: {new Date().toDateString()}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* LEFT */}

              <div>
                <label className="text-xs font-bold uppercase text-[#fca311] tracking-wider">
                  Physical Progress
                </label>

                <div className="flex items-center gap-5 mt-4 mb-10">
                  <div className="flex-1 bg-[#e5e5e5] h-7 rounded-full overflow-hidden shadow-inner border border-[#e5e5e5]">
                    <div
                      className="bg-[#14213d] h-full transition-all duration-1000 shadow-md"
                      style={{ width: `${completion}%` }}
                    />
                  </div>

                  <span className="font-bold text-2xl text-[#000000]">
                    {completion}%
                  </span>
                </div>

                {/* SUMMARY */}

                <div className="bg-white border border-[#e5e5e5] rounded-xl p-6 mb-10 shadow-sm">
                  <h4 className="font-bold text-sm mb-3 uppercase text-[#14213d] tracking-wide">
                    Executive Summary
                  </h4>

                  <p className="text-sm italic text-[#000000] leading-relaxed">
                    "{gemini?.progress}"
                  </p>
                </div>

                {/* TIMELINE */}

                <h4 className="font-bold text-sm mb-4 uppercase text-[#14213d] border-b border-[#e5e5e5] pb-2">
                  Milestone Timeline
                </h4>

                <div className="space-y-3">
                  {timeline?.map((t, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-white border border-[#e5e5e5] rounded-xl px-5 py-3 hover:shadow-md hover:scale-[1.01] transition"
                    >
                      {t.phase}
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT */}

              <div>
                <img
                  src={imageUrl}
                  className="w-full mb-8 rounded-xl shadow-lg border border-[#e5e5e5]"
                />

                <table className="w-full text-sm border border-[#e5e5e5] rounded-xl overflow-hidden shadow-sm">
                  <tbody>
                    <tr className="bg-[#e5e5e5]/20">
                      <td className="border p-4 font-semibold text-[#000000]">
                        Start Date
                      </td>

                      <td className="border p-4">{selected.start_date}</td>
                    </tr>

                    <tr>
                      <td className="border p-4 font-semibold text-[#000000]">
                        Expected Completion
                      </td>

                      <td className="border p-4">{selected.end_date}</td>
                    </tr>

                    <tr className="bg-[#e5e5e5]/20">
                      <td className="border p-4 font-semibold text-[#000000]">
                        Planned Progress
                      </td>

                      <td className="border p-4 text-red-600 font-bold">
                        {expected}%
                      </td>
                    </tr>

                    <tr>
                      <td className="border p-4 font-semibold text-[#000000]">
                        Variance
                      </td>

                      <td className="border p-4 text-green-600 font-bold">
                        +{completion - expected}% Ahead
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
