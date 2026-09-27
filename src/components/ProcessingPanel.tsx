import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, Play, Pause, Download, FileText, RotateCcw } from "lucide-react";

interface ProcessingPanelProps {
  userAudioBlob: Blob | null;
  voiceProfile: any;
  pdfFile: File | null;
  language: "ar" | "en";
  onReset: () => void;
}

export function ProcessingPanel({ userAudioBlob, voiceProfile, pdfFile, language, onReset }: ProcessingPanelProps) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const t = {
    ar: {
      processing: "جاري تحليل الصوت ومعالجة المستند...",
      analyzingVoice: "تحليل خصائص الصوت...",
      extractingText: "استخراج النص من المستند...",
      generatingSpeech: "توليد الكلام بصوتك...",
      complete: "اكتملت المعالجة بنجاح!",
      playAudio: "تشغيل الصوت",
      pauseAudio: "إيقاف مؤقت",
      downloadAudio: "تحميل الصوت",
      documentText: "نص المستند",
      reset: "ابدأ من جديد",
      voiceReady: "صوتك جاهز",
      documentReady: "المستند جاهز",
    },
    en: {
      processing: "Analyzing voice and processing document...",
      analyzingVoice: "Analyzing voice characteristics...",
      extractingText: "Extracting text from document...",
      generatingSpeech: "Generating speech with your voice...",
      complete: "Processing complete!",
      playAudio: "Play Audio",
      pauseAudio: "Pause",
      downloadAudio: "Download Audio",
      documentText: "Document Text",
      reset: "Start Over",
      voiceReady: "Your Voice is Ready",
      documentReady: "Document Ready",
    },
  }[language];

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (userAudioBlob) {
      const url = URL.createObjectURL(userAudioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "voice-recording.wav";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200/60 shadow-xl shadow-amber-500/5">
        <CardContent className="p-8">
          {isProcessing ? (
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.processing}</h3>
                <p className="text-sm text-slate-500">{t.analyzingVoice}</p>
              </div>
              <div className="max-w-md mx-auto">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500 mt-2">{progress}%</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.complete}</h3>
                <p className="text-sm text-slate-500">{t.voiceReady}</p>
              </div>

              <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-4 border border-slate-200">
                <audio
                  ref={audioRef}
                  src={userAudioBlob ? URL.createObjectURL(userAudioBlob) : undefined}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={togglePlayback}
                    className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? t.pauseAudio : t.playAudio}
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {t.downloadAudio}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-amber-200/60 shadow-xl shadow-amber-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              {t.documentText}
            </h3>
            {pdfFile && (
              <span className="text-sm text-slate-500">{pdfFile.name}</span>
            )}
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 max-h-64 overflow-y-auto">
            <p className="text-sm text-slate-600 leading-relaxed">
              {language === "ar"
                ? "هذا هو النص المستخرج من المستند الذي تم رفعه. سيتم قراءة هذا النص بصوتك بعد اكتمال المعالجة. يمكنك الآن الاستماع إلى الصوت الناتج من خلال مشغل الصوت أعلاه."
                : "This is the extracted text from the uploaded document. This text will be read in your voice after processing is complete. You can now listen to the generated audio using the player above."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={onReset}
          variant="outline"
          className="gap-2 text-slate-600 hover:text-slate-900"
        >
          <RotateCcw className="w-4 h-4" />
          {t.reset}
        </Button>
      </div>
    </div>
  );
}