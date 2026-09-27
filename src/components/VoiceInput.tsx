import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Upload, X, CheckCircle2, Loader2, AudioLines } from "lucide-react";

interface VoiceInputProps {
  onAnalyzed: (profile: { name: string; pitch: number; rate: number; timbre: string }) => void;
  language: "en" | "ar";
}

export function VoiceInput({ onAnalyzed, language }: VoiceInputProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const translations = {
    en: {
      title: "Upload Your Voice Sample",
      subtitle: "We'll analyze your voice to create your unique voice profile",
      dropzone: "Drag & drop your audio file here or",
      browse: "browse files",
      analyzing: "Analyzing your voice...",
      success: "Voice analysis complete!",
      error: "Please upload a valid audio file (MP3, WAV, M4A)",
      supported: "Supported formats: MP3, WAV, M4A",
      continue: "Continue to PDF Upload",
      voiceName: "Voice Profile Name",
      voiceNamePlaceholder: "Enter a name for your voice profile",
    },
    ar: {
      title: "قم بتحميل عينة صوتك",
      subtitle: "سنقوم بتحليل صوتك لإنشاء ملف صوتي فريد خاص بك",
      dropzone: "اسحب وأفلت ملف الصوت هنا أو",
      browse: "تصفح الملفات",
      analyzing: "جاري تحليل صوتك...",
      success: "تم تحليل الصوت بنجاح!",
      error: "يرجى تحميل ملف صوتي صالح (MP3, WAV, M4A)",
      supported: "الصيغ المدعومة: MP3, WAV, M4A",
      continue: "متابعة إلى تحميل PDF",
      voiceName: "اسم ملف الصوت",
      voiceNamePlaceholder: "أدخل اسماً لملف الصوت الخاص بك",
    },
  };

  const t = translations[language];
  const [voiceName, setVoiceName] = useState("");

  const handleFile = (selectedFile: File) => {
    setError(null);
    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", "audio/mp3"];
    const validExtension = /\.(mp3|wav|m4a)$/i.test(selectedFile.name);
    
    if (!validTypes.includes(selectedFile.type) && !validExtension) {
      setError(t.error);
      return;
    }
    
    setFile(selectedFile);
    setIsAnalyzing(true);
    
    // Simulate voice analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      const profile = {
        name: voiceName || (language === "ar" ? "صوتي" : "My Voice"),
        pitch: 120 + Math.random() * 40,
        rate: 150 + Math.random() * 30,
        timbre: ["warm", "bright", "deep", "soft"][Math.floor(Math.random() * 4)],
      };
      onAnalyzed(profile);
    }, 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleRemove = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-amber-200/60 shadow-xl shadow-amber-500/5">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">{t.title}</h2>
            <p className="text-sm text-slate-500">{t.subtitle}</p>
          </div>
        </div>

        {/* Voice name input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t.voiceName}
          </label>
          <input
            type="text"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            placeholder={t.voiceNamePlaceholder}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
          />
        </div>

        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-amber-500 bg-amber-50 scale-[1.02]"
                : "border-slate-300 hover:border-amber-400 hover:bg-amber-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,audio/*"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) handleFile(selected);
              }}
            />
            <AudioLines className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <p className="text-lg font-medium text-slate-700 mb-2">
              {t.dropzone} <span className="text-amber-600 underline">{t.browse}</span>
            </p>
            <p className="text-sm text-slate-400">{t.supported}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-3">
                <AudioLines className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="font-medium text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
                <button
                  onClick={handleRemove}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {isAnalyzing && (
              <p className="text-sm text-amber-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.analyzing}
              </p>
            )}
            {!isAnalyzing && (
              <Button
                onClick={() => file && onAnalyzed({
                  name: voiceName || (language === "ar" ? "صوتي" : "My Voice"),
                  pitch: 120 + Math.random() * 40,
                  rate: 150 + Math.random() * 30,
                  timbre: ["warm", "bright", "deep", "soft"][Math.floor(Math.random() * 4)],
                })}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              >
                {t.continue}
              </Button>
            )}
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}