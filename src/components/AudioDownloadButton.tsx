import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileAudio, CheckCircle2 } from "lucide-react";

interface AudioDownloadButtonProps {
  text: string;
  language: "en" | "ar";
  voiceProfile: {
    name: string;
    pitch: number;
    rate: number;
    timbre: string;
  };
  fileName?: string;
  className?: string;
}

export function AudioDownloadButton({ 
  text, 
  language, 
  voiceProfile, 
  fileName = "voiceforge-narration.wav",
  className 
}: AudioDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const translations = {
    en: {
      download: "Download Audio (.wav)",
      generating: "Generating audio...",
      ready: "Download Ready!",
      clickToDownload: "Click to download",
    },
    ar: {
      download: "تحميل الصوت (.wav)",
      generating: "جاري إنشاء الصوت...",
      ready: "جاهز للتحميل!",
      clickToDownload: "انقر للتحميل",
    },
  };

  const t = translations[language];

  // Convert AudioBuffer to WAV Blob
  const bufferToWav = useCallback((audioBuffer: AudioBuffer): Blob => {
    const numOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const numFrames = audioBuffer.length;
    
    // Create a Float32Array with all audio data
    const audioData = new Float32Array(numFrames * numOfChannels);
    
    // Interleave channels
    for (let channel = 0; channel < numOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < numFrames; i++) {
        audioData[i * numOfChannels + channel] = channelData[i];
      }
    }
    
    // Create WAV file
    const buffer = new ArrayBuffer(44 + audioData.length * 2);
    const view = new DataView(buffer);
    
    // Write WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };
    
    writeString(0, "RIFF");
    view.setUint32(4, 36 + audioData.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numOfChannels, true); // Number of channels
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numOfChannels * 2, true); // Byte rate
    view.setUint16(32, numOfChannels * 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, "data");
    view.setUint32(40, audioData.length * 2, true);
    
    // Write audio data
    let offset = 44;
    for (let i = 0; i < audioData.length; i++) {
      const sample = Math.max(-1, Math.min(1, audioData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([buffer], { type: "audio/wav" });
  }, []);

  // Generate audio and return AudioBuffer
  const generateAudioBuffer = useCallback(async (): Promise<AudioBuffer> => {
    return new Promise((resolve, reject) => {
      try {
        // Create audio context
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        
        // Create a MediaStreamDestination to capture the audio
        const destination = audioContext.createMediaStreamDestination();
        
        // Create a MediaRecorder to record the audio
        const mediaRecorder = new MediaRecorder(destination.stream);
        const audioChunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunks.push(e.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          try {
            // Combine all chunks into a single blob
            const blob = new Blob(audioChunks, { type: "audio/wav" });
            
            // Convert blob to ArrayBuffer
            const arrayBuffer = await blob.arrayBuffer();
            
            // Decode the audio data
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Close the audio context
            audioContext.close();
            
            resolve(audioBuffer);
          } catch (error) {
            reject(error);
          }
        };
        
        // Start recording
        mediaRecorder.start();
        
        // Create and configure the utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language
        if (language === "ar") {
          utterance.lang = "ar-SA";
        } else {
          utterance.lang = "en-US";
        }
        
        // Apply voice profile characteristics
        utterance.rate = voiceProfile.rate / 200;
        utterance.pitch = voiceProfile.pitch / 100;
        
        // Find and use appropriate voice
        const voices = window.speechSynthesis.getVoices();
        if (language === "ar") {
          const arabicVoice = voices.find(v => v.lang.startsWith("ar"));
          if (arabicVoice) utterance.voice = arabicVoice;
        } else {
          const englishVoice = voices.find(v => v.lang.startsWith("en"));
          if (englishVoice) utterance.voice = englishVoice;
        }
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 5;
          });
        }, 100);
        
        utterance.onend = () => {
          clearInterval(progressInterval);
          setProgress(100);
          // Stop recording after a short delay to ensure all audio is captured
          setTimeout(() => {
            mediaRecorder.stop();
          }, 500);
        };
        
        utterance.onerror = (e) => {
          clearInterval(progressInterval);
          reject(new Error("Speech synthesis failed"));
        };
        
        window.speechSynthesis.speak(utterance);
        
      } catch (error) {
        reject(error);
      }
    });
  }, [text, language, voiceProfile]);

  // Trigger the actual download
  const downloadAudio = useCallback((audioBuffer: AudioBuffer) => {
    // 1. Convert AudioBuffer to WAV Blob
    const wavBlob = bufferToWav(audioBuffer);
    
    // 2. Create Object URL
    const url = URL.createObjectURL(wavBlob);
    
    // 3. Trigger actual browser download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [bufferToWav, fileName]);

  const handleDownload = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setProgress(0);
    setIsReady(false);
    
    try {
      // Generate the audio buffer
      const audioBuffer = await generateAudioBuffer();
      
      // Verify the buffer is valid
      if (audioBuffer.length === 0) {
        throw new Error("Generated audio is empty");
      }
      
      // Trigger the download
      downloadAudio(audioBuffer);
      
      setIsReady(true);
      setProgress(100);
      
      // Reset ready state after 3 seconds
      setTimeout(() => {
        setIsReady(false);
        setProgress(0);
      }, 3000);
      
    } catch (error) {
      console.error("Error generating audio:", error);
      // Show error state
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  }, [generateAudioBuffer, downloadAudio, isGenerating]);

  return (
    <div className="space-y-2">
      <Button
        onClick={handleDownload}
        disabled={isGenerating}
        className={`w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all ${
          isReady ? "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20" : ""
        } ${className || ""}`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {t.generating} {progress}%
          </>
        ) : isReady ? (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {t.ready}
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            {t.download}
          </>
        )}
      </Button>
      
      {/* Progress bar */}
      {isGenerating && (
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {/* File info */}
      {!isGenerating && !isReady && (
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <FileAudio className="w-3.5 h-3.5" />
          {fileName}
        </p>
      )}
      
      {/* Ready message */}
      {isReady && (
        <p className="text-xs text-emerald-600 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {t.clickToDownload}
        </p>
      )}
    </div>
  );
}