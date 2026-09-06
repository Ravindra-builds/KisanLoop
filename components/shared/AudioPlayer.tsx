"use client";

import React, { useState } from "react";
import { Volume2, Square, Sparkles } from "lucide-react";

interface AudioPlayerProps {
  textToSpeak: string;
  language?: "hi" | "en";
  className?: string;
}

export function AudioPlayer({ textToSpeak, language = "hi", className = "" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-Speech is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;

    utterance.onend = () => {
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handleToggleSpeech}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer select-none ${
        isPlaying
          ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-400/50"
          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/25"
      } ${className}`}
      title={isPlaying ? "Stop Voice" : "Listen in Hindi/English"}
    >
      {isPlaying ? (
        <>
          {/* Animated sound wave bars */}
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_infinite_100ms] h-full" />
            <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_infinite_200ms] h-2/3" />
            <span className="w-1 bg-white rounded-full animate-[bounce_0.6s_infinite_300ms] h-full" />
          </div>
          <span>रुकें / Stop</span>
          <Square className="w-3 h-3 fill-current ml-0.5" />
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>सुनें / Listen</span>
        </>
      )}
    </button>
  );
}
