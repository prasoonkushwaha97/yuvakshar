"use client";

import React, { useState, useEffect } from "react";
import { User, Camera, Upload, Check, Laptop, Smartphone, Lock } from "lucide-react";
import { useCms, Profile } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";

interface ProfileTabProps {
  currentUser: Profile;
  translateRole: (role?: string | null) => string;
}

export default function ProfileTab({ currentUser, translateRole }: ProfileTabProps) {
  const cms = useCms();

  const [nameInput, setNameInput] = useState(currentUser.name || "");
  const [avatarUrlInput, setAvatarUrlInput] = useState(currentUser.avatar_url || "");
  const [mobileInput, setMobileInput] = useState(currentUser.mobile || "");
  const [emailInputState, setEmailInputState] = useState(currentUser.email || "");
  const [bioInput, setBioInput] = useState(currentUser.bio || "");
  const [interestsInput, setInterestsInput] = useState<string[]>(currentUser.interests || []);

  const [dobInput, setDobInput] = useState(currentUser.dob || "");
  const [genderInput, setGenderInput] = useState(currentUser.gender || "");
  const [locationInput, setLocationInput] = useState(currentUser.location || "");
  const [socialLinksInput, setSocialLinksInput] = useState({
    twitter: currentUser.social_links?.twitter || "",
    facebook: currentUser.social_links?.facebook || "",
    youtube: currentUser.social_links?.youtube || "",
    linkedin: currentUser.social_links?.linkedin || "",
    website: currentUser.social_links?.website || ""
  });

  const [verificationRequested, setVerificationRequested] = useState(false);
  const [sessions, setSessions] = useState([
    { id: "s1", device: "Windows 11 - Chrome (Current)", ip: "192.168.1.100", active: true },
    { id: "s2", device: "Android 14 - OnePlus 11", ip: "192.168.1.102", active: false },
    { id: "s3", device: "iPadOS 17 - Safari", ip: "192.168.1.105", active: false }
  ]);

  // Photo Crop/Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Check verification state
    const verifiedSaved = localStorage.getItem(`yuvakshar_verification_${currentUser.id}`);
    if (verifiedSaved) {
      setVerificationRequested(true);
    }
  }, [currentUser]);

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrlInput(reader.result as string);
      setCropZoom(1);
      setCropOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setIsCameraOpen(true);
    } catch (err) {
      alert("कैमरा एक्सेस करने में विफल!");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = document.getElementById("camera-stream-video") as HTMLVideoElement;
    if (video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        setAvatarUrlInput(canvas.toDataURL("image/jpeg"));
        setCropZoom(1);
        setCropOffset({ x: 0, y: 0 });
      }
    }
    stopCamera();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      alert("नाम अनिवार्य है!");
      return;
    }
    await cms.updateUserProfile({
      name: nameInput,
      avatar_url: avatarUrlInput,
      mobile: mobileInput,
      bio: bioInput,
      interests: interestsInput,
      dob: dobInput,
      gender: genderInput,
      location: locationInput,
      social_links: socialLinksInput
    });
    alert("प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Photo Manager & Verification */}
      <div className="lg:col-span-4 space-y-6">
        <GlassCard glow="gold" className="p-6 flex flex-col items-center text-center space-y-4">
          <span className="text-xs font-bold text-primary font-serif">प्रोफ़ाइल चित्र प्रबंधक</span>
          
          {/* Photo Viewport */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handlePhotoDrop}
            className={`relative w-48 h-48 rounded-full border-4 ${dragOver ? 'border-primary bg-primary/5' : 'border-primary/20 dark:border-primary/40'} overflow-hidden cursor-move bg-slate-105 dark:bg-slate-800 flex items-center justify-center`}
            onMouseDown={(e) => {
              if (!isCameraOpen && avatarUrlInput) {
                setIsDraggingCanvas(true);
                setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
              }
            }}
            onMouseMove={(e) => {
              if (isDraggingCanvas && !isCameraOpen && avatarUrlInput) {
                setCropOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
              }
            }}
            onMouseUp={() => setIsDraggingCanvas(false)}
            onMouseLeave={() => setIsDraggingCanvas(false)}
          >
            {isCameraOpen ? (
              <video 
                id="camera-stream-video" 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
                ref={(el) => {
                  if (el && cameraStream && el.srcObject !== cameraStream) {
                    el.srcObject = cameraStream;
                  }
                }}
              />
            ) : avatarUrlInput ? (
              <img 
                src={avatarUrlInput} 
                alt="Profile" 
                style={{
                  transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                  transition: isDraggingCanvas ? "none" : "transform 0.1s ease-out"
                }}
                className="w-full h-full object-cover pointer-events-none select-none"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-slate-400">
                <User className="w-12 h-12 text-slate-300 mb-1" />
                <span className="text-[10px] leading-tight font-serif">चित्र यहाँ ड्रैग करें या नीचे से चुनें</span>
              </div>
            )}
          </div>

          {/* Zoom Slider */}
          {!isCameraOpen && avatarUrlInput && (
            <div className="w-full space-y-1 text-xs">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>ज़ूम (Zoom)</span>
                <span>{Math.round(cropZoom * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="3" 
                step="0.05" 
                value={cropZoom} 
                onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          )}

          {/* Actions */}
          <div className="w-full flex flex-col gap-2">
            {isCameraOpen ? (
              <div className="flex gap-2">
                <button 
                  onClick={capturePhoto} 
                  className="flex-grow bg-primary text-white py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  कैप्चर करें
                </button>
                <button 
                  onClick={stopCamera} 
                  className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  रद्द करें
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={startCamera} 
                  className="flex-grow bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>कैमरा खोलें</span>
                </button>
                <label className="flex-grow bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 text-center">
                  <Upload className="w-3.5 h-3.5" />
                  <span>अपलोड करें</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelected(file);
                    }}
                  />
                </label>
              </div>
            )}

            {/* Quick Avatars */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-850 w-full items-start">
              <span className="text-[10px] text-slate-400 font-serif">त्वरित अवतार चयन:</span>
              <div className="flex gap-2.5">
                {[
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                ].map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAvatarUrlInput(url);
                      setCropZoom(1);
                      setCropOffset({ x: 0, y: 0 });
                    }}
                    className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 hover:border-primary transition-all cursor-pointer"
                  >
                    <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Verification Status */}
        <GlassCard glow="none" className="p-5 space-y-4">
          <h4 className="font-serif font-bold text-slate-800 dark:text-white text-xs border-l-2 border-primary pl-2">खाता सत्यापन (Verification Status)</h4>
          {verificationRequested ? (
            <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/50 dark:border-orange-900/30 p-3.5 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-primary text-xs font-bold font-serif">
                <Check className="w-4 h-4 bg-primary/10 rounded-full p-0.5" />
                <span>सत्यापन प्रक्रियाधीन (In Review)</span>
              </div>
              <p className="text-[10px] text-slate-400 font-serif leading-relaxed">आपका सत्यापन अनुरोध संपादकीय बोर्ड के पास समीक्षाधीन है। सत्यापन पूर्ण होने पर आपके प्रोफ़ाइल पर एक ब्लू बैज जोड़ा जाएगा।</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] text-slate-400 font-serif leading-relaxed">सत्यापित पाठक बनने के लिए अनुरोध भेजें। सत्यापित पाठकों के पास आलेखों पर विशेष समीक्षा, चर्चा मंच और संपादकीय संवाद तक सीधी पहुंच होती है।</p>
              <button 
                onClick={() => {
                  setVerificationRequested(true);
                  localStorage.setItem(`yuvakshar_verification_${currentUser.id}`, "true");
                  alert("सत्यापन अनुरोध सफलतापूर्वक भेजा गया!");
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                वेरिफिकेशन अनुरोध भेजें
              </button>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Right Column: Form details */}
      <div className="lg:col-span-8 space-y-6">
        <GlassCard glow="none" className="p-6">
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-serif">
            <h4 className="font-serif font-bold text-slate-800 dark:text-white text-sm border-l-2 border-primary pl-2 pb-1">व्यक्तिगत विवरण (Personal Details)</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-450 font-medium">नाम (Full Name)</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="उदा. राहुल शर्मा"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-serif font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-450 font-medium">भूमिका (Role)</label>
                <input
                  type="text"
                  value={translateRole(currentUser?.role)}
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-400 text-xs cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-450 font-medium">ईमेल (Email Address)</label>
                <input
                  type="email"
                  value={emailInputState}
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-400 text-xs cursor-not-allowed"
                  disabled
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-450 font-medium">मोबाइल नंबर (Mobile Number)</label>
                <input
                  type="tel"
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="१०-अंकीय मोबाइल संख्या"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-slate-455">जन्म तिथि (Date of Birth)</label>
                <input
                  type="date"
                  value={dobInput}
                  onChange={(e) => setDobInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-455">लिंग (Gender)</label>
                <select
                  value={genderInput}
                  onChange={(e) => setGenderInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-serif"
                >
                  <option value="">चुनें...</option>
                  <option value="पुरुष">पुरुष (Male)</option>
                  <option value="महिला">महिला (Female)</option>
                  <option value="अन्य">अन्य (Other)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-455">स्थान (Location)</label>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="उदा. नई दिल्ली, भारत"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-serif"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-455">संक्षिप्त परिचय (Bio)</label>
              <textarea
                rows={3}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="अपने बारे में संक्षिप्त परिचय..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-serif leading-relaxed"
              />
            </div>

            {/* Social profiles */}
            <div className="space-y-3 pt-2">
              <span className="text-slate-450 font-medium block">सोशल मीडिया प्रोफाइल लिंक्स</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(socialLinksInput).map((platform) => (
                  <div key={platform} className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
                    <span className="text-[10px] text-slate-400 font-sans pr-2 border-r border-slate-200 dark:border-slate-800 capitalize min-w-[60px]">{platform}</span>
                    <input 
                      type="text" 
                      value={(socialLinksInput as any)[platform]}
                      onChange={(e) => setSocialLinksInput({...socialLinksInput, [platform]: e.target.value})}
                      placeholder="URL या @username"
                      className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none text-[11px] font-sans pl-2 flex-grow"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Areas of Interest */}
            <div className="space-y-2">
              <label className="text-slate-450 font-medium block">रूचि के क्षेत्र (Areas of Interest)</label>
              <div className="flex flex-wrap gap-2.5">
                {["साहित्य", "पर्यावरण", "इतिहास", "विज्ञान", "सामयिक", "संविधान", "शिक्षा"].map((interest) => {
                  const isChecked = interestsInput.includes(interest);
                  return (
                    <label
                      key={interest}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border cursor-pointer select-none transition-all ${
                        isChecked
                          ? "bg-primary/10 border-primary text-primary font-bold"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-500 hover:border-slate-350"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setInterestsInput(interestsInput.filter(x => x !== interest));
                          } else {
                            setInterestsInput([...interestsInput, interest]);
                          }
                        }}
                        className="hidden"
                      />
                      <span>{interest}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1"
            >
              <span>प्रोफ़ाइल सुरक्षित करें</span>
            </button>
          </form>
        </GlassCard>

        {/* Change password */}
        <GlassCard glow="none" className="p-6 space-y-4">
          <h4 className="font-serif font-bold text-slate-800 dark:text-white text-sm border-l-2 border-primary pl-2 pb-1">सुरक्षा एवं पासवर्ड (Change Password)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-serif text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">वर्तमान पासवर्ड</label>
              <input type="password" id="old-pass" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5" />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">नया पासवर्ड</label>
              <input type="password" id="new-pass" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5" />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">पुष्टि करें</label>
              <input type="password" id="new-pass-confirm" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5" />
            </div>
          </div>
          <button 
            onClick={async () => {
              const oldP = (document.getElementById("old-pass") as HTMLInputElement)?.value;
              const newP = (document.getElementById("new-pass") as HTMLInputElement)?.value;
              const confP = (document.getElementById("new-pass-confirm") as HTMLInputElement)?.value;
              
              if (!oldP || !newP || !confP) {
                alert("कृपया सभी पासवर्ड फ़ील्ड भरें!");
                return;
              }
              if (newP !== confP) {
                alert("नया पासवर्ड और पुष्टि मेल नहीं खाते!");
                return;
              }
              await cms.updateUserProfile({ password: newP });
              alert("पासवर्ड सफलतापूर्वक बदल दिया गया है!");
              (document.getElementById("old-pass") as HTMLInputElement).value = "";
              (document.getElementById("new-pass") as HTMLInputElement).value = "";
              (document.getElementById("new-pass-confirm") as HTMLInputElement).value = "";
            }}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-serif"
          >
            पासवर्ड अपडेट करें
          </button>
        </GlassCard>

        {/* Device Sessions */}
        <GlassCard glow="none" className="p-6 space-y-4 font-serif text-xs">
          <div>
            <h4 className="font-serif font-bold text-slate-800 dark:text-white text-sm border-l-2 border-primary pl-2">सक्रिय डिवाइस लॉग (Active Sessions)</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">आपके अकाउंट में वर्तमान में लॉग इन सभी डिवाइस। आप अन्य डिवाइस से लॉग-आउट कर सकते हैं।</p>
          </div>

          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{s.device}</p>
                    <span className="text-[10px] text-slate-400 font-mono">IP: {s.ip}</span>
                  </div>
                </div>
                {s.active ? (
                  <span className="text-[9px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">सक्रिय</span>
                ) : (
                  <button 
                    onClick={() => {
                      setSessions(sessions.filter(x => x.id !== s.id));
                      alert("डिवाइस सफलतापूर्वक बाहर (terminate) किया गया!");
                    }}
                    className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    समाप्त करें
                  </button>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
