import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, Upload, Loader2, CheckCircle2, AudioWaveform } from "lucide-react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { ProcessingPanel } from "@/components/ProcessingPanel";

type Language = "en" | "ar";
type Step = "upload" | "processing";

export default function App() {
  const [language, setLanguage] = useState<Language>("ar");
  const [step, setStep] = useState<Step>("upload");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [userAudioBlob, setUserAudioBlob] = useState<Blob | null>(null);
  const [voiceProfile, setVoiceProfile] = useState<any>(null);

  const t = {
    ar: {
      title: "استوديو الصوت الذكي",
      subtitle: "حلّل صوتك واقرأ أي مستند بصوتك الحقيقي",
      uploadStep: "1. ارفع المستند",
      recordStep: "2. سجّل صوتك",
      processStep: "3. المعالجة والنتيجة",
      uploadLabel: "اختر ملف PDF",
      dropHere: "أفلت الملف هنا",
      or: "أو",
      browse: "تصفح الملفات",
      fileSelected: "تم اختيار الملف",
      processButton: "ابدأ المعالجة",
      noFile: "يرجى رفع ملف PDF أولاً",
      noAudio: "يرجى تسجيل صوتك أولاً",
      arabic: "العربية",
      english: "English",
    },
    en: {
      title: "Smart Voice Studio",
      subtitle: "Analyze your voice and read any document in your real voice",
      uploadStep: "1. Upload Document",
      recordStep: "2. Record Your Voice",
      processStep: "3. Process & Result",
      uploadLabel: "Choose PDF File",
      dropHere: "Drop file here",
      or: "or",
      browse: "Browse Files",
      fileSelected: "File Selected",
      processButton: "Start Processing",
      noFile: "Please upload a PDF file first",
      noAudio: "Please record your voice first",
      arabic: "Arabic",
      english: "English",
    },
  }[language];

  const handleFileUpload = (file: File) => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setPdfFile(file);
    }
  };

  const handleAudioRecorded = (audioBlob: Blob) => {
    setUserAudioBlob(audioBlob);
    setVoiceProfile({ audioBlob });
  };

  const handleProcess = () => {
    if (!pdfFile) {
      alert(t.noFile);
      return;
    }
    if (!userAudioBlob) {
      alert(t.noAudio);
      return;
    }
    setStep("processing");
  };

  const handleReset = () => {
    setStep("upload");
    setPdfFile(null);
    setUserAudioBlob(null);
    setVoiceProfile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <AudioWaveform className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 font-serif">{t.title}</h1>
                <p className="text-sm text-slate-500">{t.subtitle}</p>
              </div>
            </div>

            <RadioGroup
              value={language}
              onValueChange={(value) => setLanguage(value as Language)}
              className="flex gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ar" id="ar" />
                <Label htmlFor="ar" className="cursor-pointer">{t.arabic}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en" className="cursor-pointer">{t.english}</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center gap-4 mb-8">
            {[t.uploadStep, t.recordStep, t.processStep].map((stepLabel, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step === "upload" && index < 2
                      ? "bg-amber-500 text-white"
                      : step === "processing" && index === 2
                      ? "bg-amber-500 text-white"
                      : "bg-white text-slate-400 border border-slate-200"
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`text-sm ${step === "upload" && index < 2 ? "font-semibold text-slate-900" : "text-slate-500"}`}>
                  {stepLabel}
                </span>
                {index < 2 && <div className="w-8 h-px bg-slate-300" />}
              </div>
            ))}
          </div>
        </header>

        {step === "upload" && (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-amber-200/60 shadow-xl shadow-amber-500/5">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    {t.uploadLabel}
                  </h2>
                  <label
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-amber-300 rounded-2xl bg-amber-50/50 hover:bg-amber-100/50 transition-colors cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) handleFileUpload(file);
                    }}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                    {pdfFile ? (
                      <div className="text-center space-y-2">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                        <p className="font-semibold text-slate-800">{t.fileSelected}</p>
                        <p className="text-sm text-slate-500">{pdfFile.name}</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <Upload className="w-12 h-12 text-amber-500 mx-auto" />
                        <p className="font-semibold text-slate-700">{t.dropHere}</p>
                        <p className="text-sm text-slate-500">{t.or}</p>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Upload className="w-4 h-4" />
                          {t.browse}
                        </Button>
                      </div>
                    )}
                  </label>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-amber-200/60 shadow-xl shadow-amber-500/5">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <AudioWaveform className="w-5 h-5 text-amber-600" />
                    {language === "ar" ? "سجّل صوتك" : "Record Your Voice"}
                  </h2>
                  <VoiceRecorder
                    onAudioRecorded={handleAudioRecorded}
                    language={language}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleProcess}
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-white gap-2 shadow-lg shadow-amber-500/30 px-10 py-4 rounded-xl font-bold text-lg transition-all active:scale-95"
              >
                <Loader2 className="w-5 h-5" />
                {t.processButton}
              </Button>
            </div>
          </>
        )}

        {step === "processing" && (
          <ProcessingPanel
            userAudioBlob={userAudioBlob}
            voiceProfile={voiceProfile}
            pdfFile={pdfFile}
            language={language}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}