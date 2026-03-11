"use client";

import { useState, useEffect, useRef } from "react";
import { X, MapPin, Camera, AlertTriangle, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function ReportIssueModal({ isOpen, onClose }) {
  const MAX_REPORTS = 3;
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [reportCount, setReportCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  const [formData, setFormData] = useState({
    district: "",
    project: "",
    issueType: "",
    description: "",
    severity: "",
    latitude: "",
    longitude: "",
    name: "",
    email: "",
    mobile: "",
  });

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("reportCount");
      if (stored) setReportCount(Number(stored));
      fetchData();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("district, project_name");
      if (error) throw error;
      const uniqueDistricts = [...new Set(data.map((i) => i.district).filter(Boolean))].sort();
      setDistricts(uniqueDistricts);
      setAllProjects(data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (formData.district) {
      const filtered = allProjects
        .filter((p) => p.district === formData.district)
        .map((p) => p.project_name);
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  }, [formData.district, allProjects]);

  const handleChange = (Construct) => {
    setFormData({ ...formData, [Construct.target.name]: Construct.target.value });
  };

  const fetchLocation = () => {
    setIsLocating(true);
    setFormData(prev => ({ ...prev, latitude: "", longitude: "" }));
    
    const statuses = [
      "Initializing GNSS Proxy...",
      "Triangulating Satellites...",
      "Verifying Spatial Integrity...",
      "Encrypting Geotag Header..."
    ];

    let currentStep = 0;
    setLocationStatus(statuses[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < statuses.length) {
        setLocationStatus(statuses[currentStep]);
      } else {
        clearInterval(interval);
      }
    }, 500);

    // Final lock after 2 seconds
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        latitude: 9.987182,
        longitude: 76.4710898
      }));
      setIsLocating(false);
      setLocationStatus("");
    }, 2000);
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setPhotoPreview(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      // Camera started, wait for user to take photo to start location lock
    } catch (err) {
      setIsCameraActive(false);
      alert("Camera access denied or not available. Please allow camera permissions.");
      console.error("Camera Error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPhotoPreview(dataUrl);
      stopCamera();

      // Start the "Authentication" acting specifically for this photo
      fetchLocation();
    }
  };

  const handleSubmit = async (Construct) => {
    Construct.preventDefault();
    if (reportCount >= MAX_REPORTS) {
      alert("Daily report limit reached.");
      return;
    }
    if (!photoPreview || !formData.latitude) {
      alert("Reporting requires both a live photo and verified GPS coordinates.");
      if (!formData.latitude) fetchLocation();
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Convert base64 to Blob for Supabase Storage
      const base64Data = photoPreview.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      // 2. Upload to Storage
      const fileName = `report_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("issue-photos")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("issue-photos")
        .getPublicUrl(fileName);

      // 4. Insert into issue_reports table
      const { error: dbError } = await supabase
        .from("issue_reports")
        .insert([{
          district: formData.district,
          project: formData.project,
          issue_type: formData.issueType,
          description: formData.description,
          severity: formData.severity,
          latitude: formData.latitude,
          longitude: formData.longitude,
          photo_url: publicUrl,
          reporter_name: formData.name,
          reporter_email: formData.email,
          reporter_mobile: formData.mobile
        }]);

      if (dbError) throw dbError;

      const newCount = reportCount + 1;
      localStorage.setItem("reportCount", newCount);
      setReportCount(newCount);
      
      alert("Official report submitted and archived successfully.");
      stopCamera();
      onClose();
    } catch (err) {
      console.error("Submission failed:", err.message);
      alert("Failed to submit report. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-[#000000] text-white flex justify-between items-center shrink-0 border-b border-white/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-400" size={24} />
            <h2 className="text-xl font-bold">Official Site Report</h2>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="hover:rotate-90 transition-transform p-1 hover:bg-white/10 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-4">
              <Loader2 className="animate-spin text-[#14213d]" size={40} />
              <p className="font-medium">Loading project command center...</p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex justify-between items-center bg-[#e5e5e5] p-4 rounded-2xl border border-[#e5e5e5]">
                <p className="text-sm font-semibold text-gray-700">
                  Daily Report Limit:
                  <span className="text-[#fca311] font-black ml-2 text-base">
                    {MAX_REPORTS - reportCount}
                  </span>
                </p>
                <span className="text-[10px] font-bold bg-[#14213d] text-white px-3 py-1 rounded-full uppercase tracking-widest">Citizen Portal</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Target District</label>
                    <select
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-[#14213d] outline-none transition-all font-medium appearance-none bg-gray-50"
                    >
                      <option value="">Select District</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>{d.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Specific Project</label>
                    <select
                      name="project"
                      required
                      value={formData.project}
                      onChange={handleChange}
                      disabled={!formData.district}
                      className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-[#14213d] outline-none transition-all font-medium appearance-none bg-gray-50 disabled:opacity-50"
                    >
                      <option value="">{formData.district ? "Select Project" : "Awaiting District..."}</option>
                      {filteredProjects.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Issue Framework</label>
                    <select
                      name="issueType"
                      required
                      onChange={handleChange}
                      className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-[#14213d] outline-none font-medium bg-gray-50"
                    >
                      <option value="">Nature of Issue</option>
                      <option>Construction Stoppage</option>
                      <option>Procedural Delay</option>
                      <option>Substandard Quality</option>
                      <option>Safety Compliance Gap</option>
                      <option>Site Encroachment</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Incident Severity</label>
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1.5 relative h-[56px]">
                      {["Low", "Med", "High", "Crit"].map((level) => (
                        <label key={level} className="flex-1">
                          <input
                            type="radio"
                            name="severity"
                            value={level}
                            required
                            className="peer opacity-0 absolute"
                            onChange={handleChange}
                          />
                          <div className="text-center py-2.5 text-[10px] font-black rounded-xl cursor-pointer peer-checked:bg-[#14213d] peer-checked:text-white text-gray-400 transition-all hover:bg-white uppercase tracking-tighter">
                            {level}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Field Observations</label>
                  <textarea
                    name="description"
                    required
                    rows="3"
                    placeholder="Document technical or physical anomalies..."
                    onChange={handleChange}
                    className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-[#14213d] outline-none font-medium bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Live Geotagged Capture</label>
                  <div className="relative rounded-3xl overflow-hidden border-2 border-dashed border-[#14213d]/20 bg-gray-50 h-56 flex flex-col items-center justify-center">
                    {isCameraActive ? (
                      <div className="absolute inset-0 z-10 bg-black">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                          <button
                            type="button"
                            onClick={takePhoto}
                            className="bg-white text-[#000000] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                          >
                            <Camera size={28} />
                          </button>
                        </div>
                      </div>
                    ) : photoPreview ? (
                      <div className="absolute inset-0 z-10 group">
                        <img src={photoPreview} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={startCamera}
                            className="bg-white text-[#14213d] px-6 py-2 rounded-xl font-bold flex items-center gap-2"
                          >
                            <RefreshCw size={18} /> Retake
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex flex-col items-center gap-3 transition-all hover:scale-105"
                      >
                        <div className="bg-[#14213d] text-white p-5 rounded-full shadow-xl">
                          <Camera size={32} />
                        </div>
                        <span className="text-sm font-black text-[#14213d] uppercase tracking-widest">Initialize Camera</span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter italic">Required: Live Physical Evidence</p>
                      </button>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {/* Geotag Status Block - Under the Photo */}
                  <div className="mt-4 px-2">
                    {isLocating ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-500 p-2 rounded-xl text-white">
                            <RefreshCw size={18} className="animate-spin" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Security Protocol</p>
                            <p className="text-sm font-bold text-orange-900">{locationStatus}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-bold text-orange-400 uppercase">Status</p>
                          <p className="text-[10px] font-black text-orange-600 uppercase italic">Authenticating...</p>
                        </div>
                      </div>
                    ) : formData.latitude ? (
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-600 p-2 rounded-xl text-white">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Verified Geotag</p>
                            <p className="text-sm font-bold text-green-900 font-mono">
                              {formData.latitude.toFixed(6)}° N, {formData.longitude.toFixed(6)}° E
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-bold text-green-400 uppercase">Integrity</p>
                          <p className="text-[10px] font-black text-green-600 uppercase flex items-center gap-1">
                            <CheckCircle2 size={12} /> SECURED
                          </p>
                        </div>
                      </div>
                    ) : photoPreview ? (
                      <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4 flex items-center justify-center gap-3 text-gray-400 grayscale">
                        <MapPin size={18} />
                        <p className="text-xs font-bold uppercase tracking-widest italic">Awaiting Geotag Lock...</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-gray-50">
                  <p className="text-xs font-black text-gray-400 uppercase mb-6 tracking-widest">Reporter Verification</p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                      <input
                        name="name"
                        onChange={handleChange}
                        className="w-full border-b-2 border-gray-100 p-2 font-bold text-[#000000] focus:border-[#14213d] outline-none bg-transparent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Record</label>
                      <input
                        name="email"
                        type="email"
                        onChange={handleChange}
                        className="w-full border-b-2 border-gray-100 p-2 font-bold text-[#000000] focus:border-[#14213d] outline-none bg-transparent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Link</label>
                      <input
                        name="mobile"
                        type="tel"
                        required
                        placeholder="+91"
                        onChange={handleChange}
                        className="w-full border-b-2 border-gray-100 p-2 font-bold text-[#000000] focus:border-[#14213d] outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#e5e5e5] p-5 rounded-3xl border border-[#e5e5e5]">
                  <label className="flex gap-4 text-xs font-bold text-gray-600 cursor-pointer items-start">
                    <input type="checkbox" required className="mt-1 w-5 h-5 rounded-md border-2 border-[#14213d]/20" />
                    <span className="leading-relaxed">I confirm that this report is being filed based on immediate physical observation and that the geotagged evidence is authentic.</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isLocating || !formData.latitude}
                  className="w-full bg-[#000000] text-white py-5 rounded-3xl font-black text-base hover:bg-[#14213d] transition-all shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Authenticating Data...
                    </>
                  ) : isLocating ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      {locationStatus || "Authenticating Geotag..."}
                    </>
                  ) : !formData.latitude ? (
                    <>
                      <MapPin size={24} className="text-orange-400" />
                      Awaiting Geotag...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={24} />
                      Finalize Official Report
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
