"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, Play, Square } from "lucide-react";

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
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium transition-all shadow-sm ${
        isPlaying
          ? "bg-amber-500 text-white animate-pulse"
          : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300"
      } ${className}`}
      title={isPlaying ? "Stop Voice" : "Listen in Hindi/English"}
    >
      {isPlaying ? (
        <>
          <Square className="w-4 h-4 fill-current" />
          <span>रुकें (Stop)</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4" />
          <span>सुनें (Listen)</span>
        </>
      )}
    </button>
  );
}
