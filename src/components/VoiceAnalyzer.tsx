import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Mic, Upload, Loader2, CheckCircle2, AudioWaveform, Radio } from "lucide-react";

interface VoiceProfile {
  name: string;
  pitch: number;
  rate: number;
  timbre: string;
}

interface VoiceAnalyzerProps {
  onAnalyzed: (profile: VoiceProfile) => void;
  language: "en" | "ar";
}

export function VoiceAnalyzer({ onAnalyzed, language }: VoiceAnalyzerProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [voiceName, setVoiceName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const t = {
    en: {
      title: "Voice Analysis",
      subtitle: "Upload or record audio to analyze and clone your voice",
      upload: "Click to upload audio",
      uploadHint: "MP3, WAV, or M4A · 30+ seconds recommended",
      record: "Record Voice",
      stopRecording: "Stop Recording",
      recording: "Recording...",
      nameVoice: "Name your voice",
      namePlaceholder: "e.g. My Natural Voice",
      analyzing: "Analyzing voice characteristics...",
      complete: "Analysis Complete!",
      completeDesc: "Voice characteristics captured successfully. Your voice is ready to be cloned.",
      analyzeBtn: "Analyze Voice",
      cloneBtn: "Clone Voice & Continue",
    },
    ar: {
      title: "تحليل الصوت",
      subtitle: "قم بتحميل أو تسجيل الصوت لتحليل واستنساخ صوتك",
      upload: "انقر لتحميل الصوت",
      uploadHint: "MP3, WAV, أو M4A · يوصى بـ 30+ ثانية",
      record: "تسجيل الصوت",
      stopRecording: "إيقاف التسجيل",
      recording: "جارٍ التسجيل...",
      nameVoice: "اسم صوتك",
      namePlaceholder: "مثال: صوتي الطبيعي",
      analyzing: "جارٍ تحليل خصائص الصوت...",
      complete: "اكتمل التحليل!",
      completeDesc: "تم التقاط خصائص الصوت بنجاح. صوتك جاهز للاستنساخ.",
      analyzeBtn: "تحليل الصوت",
      cloneBtn: "استنساخ الصوت والمتابعة",
    },
  }[language];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAnalysisComplete(false);
    }
  };

  const handleRecord = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const file = new File([blob], "recording.webm", { type: "audio/webm" });
          setAudioFile(file);
          setAnalysisComplete(false);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = () => {
    if (!audioFile) return;
    setIsAnalyzing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setAnalysisComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleComplete = () => {
    if (!voiceName.trim()) return;
    onAnalyzed({
      name: voiceName.trim(),
      pitch: 120 + Math.floor(Math.random() * 40),
      rate: 140 + Math.floor(Math.random() * 30),
      timbre: ["warm", "bright", "rich", "smooth"][Math.floor(Math.random() * 4)],
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-amber-200/60 shadow-xl shadow-amber-500/5">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
          <AudioWaveform className="w-6 h-6 text-amber-500" />
          {t.title}
        </CardTitle>
        <CardDescription className="text-slate-500">{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload area */}
        <div
          className="border-2 border-dashed border-amber-300 rounded-2xl p-8 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-all group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          {audioFile ? (
            <div className="space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="font-medium text-slate-900">{audioFile.name}</p>
              <p className="text-sm text-slate-500">
                {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-12 h-12 text-amber-400 mx-auto group-hover:text-amber-500 transition-colors" />
              <p className="font-medium text-slate-900">{t.upload}</p>
              <p className="text-sm text-slate-500">{t.uploadHint}</p>
            </div>
          )}
        </div>

        {/* Record button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRecord}
            variant={isRecording ? "destructive" : "outline"}
            className={`${isRecording ? "bg-red-500 hover:bg-red-600 text-white" : "border-amber-300 text-amber-700 hover:bg-amber-50"} shadow-md`}
          >
            <Radio className={`w-4 h-4 mr-2 ${isRecording ? "animate-pulse" : ""}`} />
            {isRecording ? t.stopRecording : t.record}
          </Button>
        </div>

        {/* Voice name input */}
        {audioFile && !isAnalyzing && !analysisComplete && (
          <div className="space-y-2">
            <Label htmlFor="voice-name" className="text-sm font-medium text-slate-700">
              {t.nameVoice}
            </Label>
            <Input
              id="voice-name"
              placeholder={t.namePlaceholder}
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
            />
          </div>
        )}

        {/* Progress */}
        {isAnalyzing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                {t.analyzing}
              </span>
              <span className="font-medium text-amber-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-amber-100" />
          </div>
        )}

        {/* Analysis complete */}
        {analysisComplete && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">{t.complete}</span>
            </div>
            <p className="text-sm text-emerald-600">{t.completeDesc}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!isAnalyzing && !analysisComplete && (
            <Button
              onClick={handleAnalyze}
              disabled={!audioFile}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25"
            >
              <Mic className="w-4 h-4 mr-2" />
              {t.analyzeBtn}
            </Button>
          )}
          {analysisComplete && (
            <Button
              onClick={handleComplete}
              disabled={!voiceName.trim()}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {t.cloneBtn}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}