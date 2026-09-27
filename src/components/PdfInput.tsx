import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X, CheckCircle2, Loader2 } from "lucide-react";

interface PdfInputProps {
  onPdfUploaded: (file: File) => void;
  language: "en" | "ar";
}

export function PdfInput({ onPdfUploaded, language }: PdfInputProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const translations = {
    en: {
      title: "Upload Your PDF Document",
      subtitle: "The system will extract the text and narrate it in your cloned voice",
      dropzone: "Drag & drop your PDF here or",
      browse: "browse files",
      processing: "Extracting text from PDF...",
      success: "PDF uploaded successfully!",
      error: "Please upload a valid PDF file",
      supported: "Supported format: PDF",
      continue: "Continue to Audio Generation",
    },
    ar: {
      title: "قم بتحميل مستند PDF الخاص بك",
      subtitle: "سيقوم النظام باستخراج النص وروايته بصوتك المستنسخ",
      dropzone: "اسحب وأفلت ملف PDF هنا أو",
      browse: "تصفح الملفات",
      processing: "جاري استخراج النص من PDF...",
      success: "تم تحميل PDF بنجاح!",
      error: "يرجى تحميل ملف PDF صالح",
      supported: "الصيغة المدعومة: PDF",
      continue: "متابعة إلى إنشاء الصوت",
    },
  };

  const t = translations[language];

  const handleFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError(t.error);
      return;
    }
    setFile(selectedFile);
    setIsProcessing(true);
    // Simulate PDF text extraction
    setTimeout(() => {
      setIsProcessing(false);
      onPdfUploaded(selectedFile);
    }, 1500);
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">{t.title}</h2>
            <p className="text-sm text-slate-500">{t.subtitle}</p>
          </div>
        </div>

        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-50 scale-[1.02]"
                : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) handleFile(selected);
              }}
            />
            <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-medium text-slate-700 mb-2">
              {t.dropzone} <span className="text-blue-600 underline">{t.browse}</span>
            </p>
            <p className="text-sm text-slate-400">{t.supported}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
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
            {isProcessing && (
              <p className="text-sm text-blue-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.processing}
              </p>
            )}
            {!isProcessing && (
              <Button
                onClick={() => onPdfUploaded(file)}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
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