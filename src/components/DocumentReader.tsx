import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Upload, FileText, Volume2, Loader2, Type } from "lucide-react";

interface VoiceProfile {
  name: string;
  pitch: number;
  rate: number;
  timbre: string;
}

interface DocumentReaderProps {
  voiceProfile: VoiceProfile;
  language: "en" | "ar";
}

export function DocumentReader({ voiceProfile, language }: DocumentReaderProps) {
  const [document, setDocument] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [voice, setVoice] = useState("cloned");
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const t = {
    en: {
      title: "Document Reader",
      subtitle: "Upload a document or paste text to hear it in your cloned voice",
      uploadTab: "Upload Document",
      pasteTab: "Paste Text",
      upload: "Click to upload document",
      uploadHint: "TXT, MD, DOC, DOCX, or PDF",
      pastePlaceholder: "Paste your text here...",
      voice: "Voice",
      speed: "Reading Speed",
      readBtn: "Read Document",
      stopBtn: "Stop Reading",
      processing: "Processing document...",
      ready: "Ready to read",
      empty: "Upload a document or paste text to start listening",
      preview: "Document Preview",
    },
    ar: {
      title: "قارئ المستندات",
      subtitle: "قم بتحميل مستند أو لصق نص لسماعه بصوتك المستنسخ",
      uploadTab: "تحميل مستند",
      pasteTab: "لصق نص",
      upload: "انقر لتحميل المستند",
      uploadHint: "TXT, MD, DOC, DOCX, أو PDF",
      pastePlaceholder: "الصق النص هنا...",
      voice: "الصوت",
      speed: "سرعة القراءة",
      readBtn: "قراءة المستند",
      stopBtn: "إيقاف القراءة",
      processing: "جارٍ معالجة المستند...",
      ready: "جاهز للقراءة",
      empty: "قم بتحميل مستند أو لصق نص لبدء الاستماع",
      preview: "معاينة المستند",
    },
  }[language];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocument(file);
      setIsGenerating(true);
      
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setDocumentText(text || "This is a sample document. The AI voice will read this text aloud in your cloned voice.");
          setIsGenerating(false);
        };
        reader.readAsText(file);
      }, 1500);
    }
  };

  const handleRead = () => {
    const textToRead = activeTab === "paste" ? pastedText : documentText;
    if (!textToRead || isReading) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
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

  const hasContent = activeTab === "paste" ? pastedText.trim().length > 0 : documentText.length > 0;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-amber-200/60 shadow-xl shadow-amber-500/5">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
          <FileText className="w-6 h-6 text-amber-500" />
          {t.title}
        </CardTitle>
        <CardDescription className="text-slate-500">{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-amber-50">
            <TabsTrigger value="upload" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Upload className="w-4 h-4 mr-2" />
              {t.uploadTab}
            </TabsTrigger>
            <TabsTrigger value="paste" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Type className="w-4 h-4 mr-2" />
              {t.pasteTab}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* Upload area */}
            <div
              className="border-2 border-dashed border-amber-300 rounded-2xl p-6 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-all group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.doc,.docx,.pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
              {document ? (
                <div className="space-y-2">
                  <FileText className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="font-medium text-slate-900">{document.name}</p>
                  <p className="text-sm text-slate-500">
                    {isGenerating ? t.processing : t.ready}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 text-amber-400 mx-auto group-hover:text-amber-500 transition-colors" />
                  <p className="font-medium text-slate-900">{t.upload}</p>
                  <p className="text-sm text-slate-500">{t.uploadHint}</p>
                </div>
              )}
            </div>

            {/* Document preview */}
            {document && !isGenerating && documentText && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-slate-500 mb-2">{t.preview}</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {documentText.slice(0, 500)}
                  {documentText.length > 500 && "..."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <Textarea
              placeholder={t.pastePlaceholder}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="min-h-[200px] border-amber-200 focus:border-amber-400 focus:ring-amber-400"
            />
          </TabsContent>
        </Tabs>

        {/* Generating state */}
        {isGenerating && (
          <div className="flex items-center justify-center py-4">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
              <p className="text-sm text-slate-500">{t.processing}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        {hasContent && !isGenerating && (
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

            {/* Playback controls */}
            <div className="flex gap-3">
              {!isReading ? (
                <Button
                  onClick={handleRead}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {t.readBtn}
                </Button>
              ) : (
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  {t.stopBtn}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasContent && !isGenerating && (
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