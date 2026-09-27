import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Upload, FileText, Loader2, Download, Volume2, BookOpen } from "lucide-react";

interface VoiceProfile {
  name: string;
  pitch: number;
  rate: number;
  timbre: string;
}

interface PdfReaderProps {
  voiceProfile: VoiceProfile;
  language: "en" | "ar";
}

export function PdfReader({ voiceProfile, language }: PdfReaderProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [voice, setVoice] = useState("cloned");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const t = {
    en: {
      title: "PDF Audio Reader",
      subtitle: "Upload a PDF and download the audio read in your cloned voice",
      upload: "Click to upload PDF",
      uploadHint: "PDF files only · Max 50MB",
      processing: "Extracting text from PDF...",
      generating: "Generating audio with your voice...",
      ready: "Ready to generate audio",
      voice: "Voice",
      speed: "Reading Speed",
      generateBtn: "Generate Audio",
      downloadBtn: "Download Audio",
      preview: "Extracted Text Preview",
      empty: "Upload a PDF to extract text and generate audio",
      pages: "pages",
      chars: "characters",
    },
    ar: {
      title: "قارئ PDF الصوتي",
      subtitle: "قم بتحميل PDF وقم بتنزيل الصوت المقروء بصوتك المستنسخ",
      upload: "انقر لتحميل PDF",
      uploadHint: "ملفات PDF فقط · الحد الأقصى 50MB",
      processing: "جارٍ استخراج النص من PDF...",
      generating: "جارٍ إنشاء الصوت بصوتك...",
      ready: "جاهز لإنشاء الصوت",
      voice: "الصوت",
      speed: "سرعة القراءة",
      generateBtn: "إنشاء الصوت",
      downloadBtn: "تنزيل الصوت",
      preview: "معاينة النص المستخرج",
      empty: "قم بتحميل PDF لاستخراج النص وإنشاء الصوت",
      pages: "صفحات",
      chars: "حروف",
    },
  }[language];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setAudioUrl(null);
      setIsProcessing(true);
      setProgress(0);

      // Simulate PDF text extraction
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsProcessing(false);
            setExtractedText(
              "This is the extracted text from your PDF document. The AI voice will read this text aloud in your cloned voice. The system has analyzed your voice characteristics and will now generate speech that matches your tone, pitch, and speaking style. This is a sample of the text that would be extracted from your uploaded PDF file. The full document would be read naturally using your generated voice profile."
            );
            return 100;
          }
          return prev + 5;
        });
      }, 200);
    }
  };

  const handleGenerateAudio = () => {
    if (!extractedText) return;
    setIsGenerating(true);
    setProgress(0);

    // Simulate audio generation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          
          // Create a downloadable audio file (simulated)
          const blob = new Blob([extractedText], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handlePreview = () => {
    if (!extractedText || isReading) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(extractedText);
      utterance.rate = speed;
      utterance.pitch = voiceProfile.pitch / 200;
      utterance.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find((v) => v.lang.includes(language === "ar" ? "ar" : "en"));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  const handleStop = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    }
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const wordCount = extractedText ? extractedText.split(/\s+/).length : 0;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-amber-200/60 shadow-xl shadow-amber-500/5">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-500" />
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
            accept=".pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
          {pdfFile ? (
            <div className="space-y-2">
              <FileText className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="font-medium text-slate-900">{pdfFile.name}</p>
              <p className="text-sm text-slate-500">
                {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
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

        {/* Processing state */}
        {isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                {t.processing}
              </span>
              <span className="font-medium text-amber-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-amber-100" />
          </div>
        )}

        {/* Extracted text preview */}
        {extractedText && !isProcessing && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-48 overflow-y-auto">
              <p className="text-xs font-semibold text-slate-500 mb-2">{t.preview}</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {extractedText.slice(0, 500)}
                {extractedText.length > 500 && "..."}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <span className="font-semibold text-amber-700">{wordCount}</span>
                <span className="text-slate-500 ml-1">{t.chars}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Voice selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{t.voice}</label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger className="w-full border-amber-200 focus:border-amber-400 focus:ring-amber-400">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cloned">Cloned Voice ({voiceProfile.name})</SelectItem>
                    <SelectItem value="natural">Natural Voice</SelectItem>
                    <SelectItem value="deep">Deep Voice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Speed control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">{t.speed}</label>
                  <span className="text-sm font-semibold text-amber-600">{speed}x</span>
                </div>
                <Slider
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="bg-amber-100"
                />
              </div>

              {/* Preview playback */}
              <div className="flex gap-3">
                {!isReading ? (
                  <Button
                    onClick={handlePreview}
                    variant="outline"
                    className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                ) : (
                  <Button
                    onClick={handleStop}
                    variant="destructive"
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                )}
              </div>

              {/* Generate audio */}
              {!isGenerating && !audioUrl && (
                <Button
                  onClick={handleGenerateAudio}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  {t.generateBtn}
                </Button>
              )}

              {/* Generation progress */}
              {isGenerating && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      {t.generating}
                    </span>
                    <span className="font-medium text-amber-600">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-amber-100" />
                </div>
              )}

              {/* Download button */}
              {audioUrl && !isGenerating && (
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = audioUrl;
                    link.download = `${pdfFile?.name.replace(".pdf", "") || "document"}-audio.txt`;
                    link.click();
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadBtn}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!pdfFile && !isProcessing && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Volume2 className="w-8 h-8 text-amber-300 mx-auto" />
              <p className="text-sm text-slate-400">{t.empty}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}