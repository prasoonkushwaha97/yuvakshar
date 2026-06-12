"use client";

import React, { useState } from "react";
import { Award, Download } from "lucide-react";
import { useCms, Profile, QuizCertificate } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";

interface CertificatesTabProps {
  currentUser: Profile;
}

export default function CertificatesTab({ currentUser }: CertificatesTabProps) {
  const cms = useCms();
  const [selectedCert, setSelectedCert] = useState<QuizCertificate | null>(null);

  let userCerts = cms.quizCertificates.filter(c => c.userId === (currentUser?.id || "anonymous-reader"));
  
  // Preseed one for demonstration if user has none
  if (userCerts.length === 0 && currentUser) {
    userCerts = [{
      id: "cert-demo-1",
      userId: currentUser.id,
      userName: currentUser.name,
      articleTitle: "भारत में डिजिटल संप्रभुता और सुपरकंप्यूटिंग क्रांति का भविष्य",
      score: 9,
      percentage: 90,
      date: "११ जून २०२६",
      certificateType: "उत्कृष्टता प्रमाणपत्र",
      badge: "विश्लेषक"
    }];
  }

  const drawCertificateOnCanvas = (cert: QuizCertificate, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#FAF8F3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Double borders
    ctx.strokeStyle = "#EA580C";
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.strokeStyle = "#FDBA74";
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

    const drawCorner = (x: number, y: number, r: number) => {
      ctx.fillStyle = "#EA580C";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCorner(32, 32, 10);
    drawCorner(canvas.width - 32, 32, 10);
    drawCorner(32, canvas.height - 32, 10);
    drawCorner(canvas.width - 32, canvas.height - 32, 10);

    ctx.textAlign = "center";

    // Title: "युवाक्षर स्वाध्याय पीठ"
    ctx.font = "bold 26px Georgia, serif";
    ctx.fillStyle = "#EA580C";
    ctx.fillText("युवाक्षर स्वाध्याय पीठ", canvas.width / 2, 85);

    ctx.font = "500 14px sans-serif";
    ctx.fillStyle = "#6B7280";
    ctx.fillText("स्वाध्याय एवं ज्ञान परख प्रमाणन", canvas.width / 2, 115);

    ctx.strokeStyle = "#E7E2D8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, 135);
    ctx.lineTo(canvas.width - 150, 135);
    ctx.stroke();

    // Certificate Type title
    ctx.font = "bold 34px Georgia, serif";
    ctx.fillStyle = "#1E1E1E";
    ctx.fillText(cert.certificateType, canvas.width / 2, 190);

    ctx.font = "italic 16px Georgia, serif";
    ctx.fillStyle = "#4B5563";
    ctx.fillText("यह प्रमाणित किया जाता है कि", canvas.width / 2, 240);

    // Candidate Name
    ctx.font = "bold 28px Georgia, serif";
    ctx.fillStyle = "#EA580C";
    ctx.fillText(cert.userName, canvas.width / 2, 290);

    ctx.font = "15px sans-serif";
    ctx.fillStyle = "#4B5563";
    ctx.fillText("ने सफलतापूर्वक साप्ताहिक शोध-परख आलेख:", canvas.width / 2, 335);

    // Article Title
    ctx.font = "bold italic 16px Georgia, serif";
    ctx.fillStyle = "#1E1E1E";
    const artTitle = cert.articleTitle;
    if (artTitle.length > 45) {
      ctx.fillText(`"${artTitle.substring(0, 42)}..."`, canvas.width / 2, 370);
    } else {
      ctx.fillText(`"${artTitle}"`, canvas.width / 2, 370);
    }

    ctx.font = "500 15px sans-serif";
    ctx.fillStyle = "#4B5563";
    ctx.fillText(`की परीक्षा में ${cert.score} अंक (${cert.percentage}%) प्राप्त कर पात्रता अर्जित की है।`, canvas.width / 2, 410);

    // Footer
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#9CA3AF";
    ctx.fillText(`जारी तिथि: ${cert.date}`, 160, 480);
    ctx.fillText(`प्रमाणपत्र क्रमांक: ${cert.id.toUpperCase()}`, 160, 500);

    // Signature
    ctx.font = "bold 14px Georgia, serif";
    ctx.fillStyle = "#EA580C";
    ctx.fillText("प्रधान संपादक", canvas.width - 160, 480);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#6B7280";
    ctx.fillText("युवाक्षर मीडिया डेस्क", canvas.width - 160, 500);

    // Seal
    ctx.strokeStyle = "#EA580C";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 480, 32, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#EA580C";
    ctx.fillText("सत्यापित", canvas.width / 2, 477);
    ctx.fillText("स्वाध्याय", canvas.width / 2, 489);
  };

  const handleDrawCertificate = (cert: QuizCertificate) => {
    setSelectedCert(cert);
    setTimeout(() => {
      const canvas = document.getElementById("certificate-view-canvas") as HTMLCanvasElement;
      if (canvas) {
        drawCertificateOnCanvas(cert, canvas);
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left list */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-serif font-bold text-slate-800 dark:text-white text-xs border-l-2 border-primary pl-2">अर्जित प्रमाणपत्र सूची</h3>
          
          {userCerts.length > 0 ? (
            <div className="space-y-3">
              {userCerts.map(cert => (
                <div 
                  key={cert.id}
                  onClick={() => handleDrawCertificate(cert)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-xs font-serif ${
                    selectedCert?.id === cert.id 
                      ? "bg-primary/5 border-primary shadow-sm" 
                      : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-350"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">{cert.certificateType}</span>
                    <span className="text-[10px] font-mono text-slate-400">{cert.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white mt-2 leading-snug line-clamp-1">{cert.articleTitle}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5">
                    <span>औसत अंक: {cert.percentage}%</span>
                    <span className="text-primary font-bold flex items-center gap-0.5">देखें और डाउनलोड करें →</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
              कोई प्रमाणपत्र उपलब्ध नहीं है।
            </div>
          )}
        </div>

        {/* Right preview canvas */}
        <div className="lg:col-span-7">
          {selectedCert ? (
            <GlassCard glow="gold" className="p-6 space-y-4 flex flex-col items-center">
              <div className="w-full flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                <span className="text-xs font-bold text-primary font-serif">{selectedCert.certificateType} - लाइव प्रीव्यू</span>
                <button 
                  onClick={() => {
                    const canvas = document.getElementById("certificate-view-canvas") as HTMLCanvasElement;
                    if (canvas) {
                      const link = document.createElement("a");
                      link.download = `yuvakshar_certificate_${selectedCert.id}.png`;
                      link.href = canvas.toDataURL("image/png");
                      link.click();
                    }
                  }}
                  className="bg-primary hover:bg-primary/95 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold shadow-md cursor-pointer flex items-center gap-1 font-serif"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>डाउनलोड (PNG)</span>
                </button>
              </div>

              <div className="w-full border rounded-xl shadow-md overflow-hidden bg-white">
                <canvas 
                  id="certificate-view-canvas" 
                  width="800" 
                  height="560" 
                  className="w-full h-auto object-contain bg-white"
                />
              </div>
            </GlassCard>
          ) : (
            <GlassCard glow="none" className="p-10 text-center flex flex-col items-center justify-center min-h-[300px] text-slate-400 text-xs font-serif space-y-2 border border-dashed border-slate-200 dark:border-slate-800">
              <Award className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <span>बाईं ओर दी गई सूची से प्रमाणपत्र का चयन करें।</span>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
