import { useState, useRef } from "react";
import { Mic, Square, AlertCircle, CheckCircle2 } from "lucide-react";

interface VoiceRecorderProps {
  onAudioRecorded?: (audioBlob: Blob) => void;
  language?: "ar" | "en";
}

export function VoiceRecorder({ onAudioRecorded, language = "ar" }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setPermissionError(null);
    setIsSuccess(false);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        if (onAudioRecorded) {
          onAudioRecorded(audioBlob);
        }
        setIsSuccess(true);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setIsRecording(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionError(
          language === "ar"
            ? "يرجى السماح للموقع بالوصول إلى الميكروفون من إعدادات المتصفح."
            : "Please allow microphone access in browser settings."
        );
      } else {
        setPermissionError(
          language === "ar"
            ? "تعذر الوصول إلى الميكروفون. تأكد من إذن الصفحة وتوصيل الجهاز."
            : "Cannot access microphone."
        );
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <button
        onClick={toggleRecording}
        type="button"
        className={`group flex flex-col items-center justify-center p-6 rounded-2xl transition-all cursor-pointer border select-none ${
          isRecording
            ? "bg-red-50 border-red-300 shadow-lg shadow-red-500/10 scale-105"
            : "bg-white hover:bg-slate-50 border-slate-200/80 hover:border-amber-300 shadow-sm hover:shadow-md"
        }`}
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-transform ${
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : "bg-slate-100 group-hover:bg-amber-100 text-slate-800 group-hover:text-amber-600 group-hover:scale-110"
          }`}
        >
          {isRecording ? <Square className="w-7 h-7" /> : <Mic className="w-8 h-8" />}
        </div>

        <p className="text-base font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
          {isRecording
            ? language === "ar" ? "جاري التسجيل... اضغط للإيقاف" : "Recording... Click to stop"
            : language === "ar" ? "تحدث بوضوح لتحديث تحليل صوتك بدقة" : "Speak clearly to analyze your voice"}
        </p>

        {isRecording && (
          <span className="mt-2 text-sm font-bold text-red-600 font-mono">
            ● {formatTime(recordingTime)}
          </span>
        )}
      </button>

      {permissionError && (
        <div className="flex items-center gap-2 p-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {isSuccess && !isRecording && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{language === "ar" ? "تم التقاط التسجيل بنقاء!" : "Recording captured successfully!"}</span>
        </div>
      )}
    </div>
  );
}