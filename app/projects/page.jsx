"use client";

import Link from "next/link";
import { MapPin, ChevronRight, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import ReportIssueModal from "../components/ReportIssueModal";

export default function ProjectsPage() {
  const [districts, setDistricts] = useState([]);
  const [counts, setCounts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDistricts();
  }, []);

  // Capitalize function

  function capitalize(text) {
    if (!text) return "";

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  async function fetchDistricts() {
    const { data, error } = await supabase.from("projects").select("district");

    if (error) return;

    const unique = [...new Set(data.map((i) => i.district).filter(Boolean))];

    // count projects per district

    const countMap = {};

    data.forEach((p) => {
      if (!p.district) return;

      countMap[p.district] = (countMap[p.district] || 0) + 1;
    });

    setDistricts(unique);
    setCounts(countMap);
  }

  return (
    <div className="min-h-screen bg-[#e5e5e5] pt-32 pb-20 px-8">
      {/* HEADER */}

      <div className="max-w-7xl mx-auto mb-14 flex justify-between items-end">
        <div>
          <p className="text-[#fca311] text-sm mb-2 uppercase font-bold tracking-wider">Infrastructure Monitoring</p>
          <h1 className="text-4xl font-bold text-[#000000] mb-2">
            District Command Center
          </h1>
          <p className="text-gray-600">
            Select a district to view and monitor public infrastructure projects
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white border-2 border-[#14213d] text-[#14213d] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#14213d] hover:text-white transition-all shadow-sm active:scale-95"
        >
          <AlertTriangle size={20} />
          Report Issue
        </button>
      </div>

      {/* GRID */}

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {districts.map((district, index) => (
          <Link
            key={district}
            href={`/projects/${district.toLowerCase()}`}
            className="group"
          >
            <div
              className="


bg-white

rounded-xl

p-6

border border-[#e5e5e5]

shadow-sm

hover:shadow-lg

hover:border-[#14213d]

transition

duration-300

flex

justify-between

items-center

"
            >
              {/* LEFT */}

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <MapPin size={18} className="text-[#14213d]" />

                  <h2
                    className="

text-lg

font-semibold

text-[#000000]
 
group-hover:text-[#14213d]

transition

"
                  >
                    {capitalize(district)}
                  </h2>
                </div>

                <p className="text-sm text-gray-500">
                  {counts[district] || 0} Projects
                </p>
              </div>

              {/* RIGHT */}

              <div className="flex items-center gap-4">
                <div
                  className="

text-xs

text-[#4B8BBE]

font-medium

"
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                <ChevronRight
                  className="

text-[#4B8BBE]

group-hover:translate-x-1

transition

"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <ReportIssueModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
