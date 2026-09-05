"use client";

import React, { useState } from "react";
import { Mic, MicOff, Send, Sparkles, BookOpen, Volume2 } from "lucide-react";
import { useLanguage } from "../shared/LanguageContext";
import { AudioPlayer } from "../shared/AudioPlayer";

export function VoiceAssistant() {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  // Preset quick questions tailored for Ravi Kumar
  const quickQuestions = [
    {
      hi: "क्या मुझे आज अपने धान में पानी देना चाहिए?",
      en: "Should I irrigate my paddy field today?",
    },
    {
      hi: "पत्तियों पर भूरे धब्बों के लिए क्या स्प्रे करें?",
      en: "What should I spray for brown spots on leaves?",
    },
    {
      hi: "कल के मौसम का पूर्वानुमान क्या है?",
      en: "What is tomorrow's weather forecast?",
    },
  ];

  const handleAsk = async (textToAsk: string) => {
    if (!textToAsk.trim()) return;
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToAsk,
          farmId: "farm_ravi_01",
          language,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setResponse(json.data);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    // Check if browser supports Web Speech API Recognition
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleAsk(transcript);
      };
      recognition.onerror = () => {
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      // Fallback voice simulation
      const sample = language === "hi"
        ? "क्या मुझे आज अपने धान में पानी देना चाहिए?"
        : "Should I irrigate my paddy field today?";
      setQuery(sample);
      handleAsk(sample);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-bold text-lg text-foreground">
            {language === "hi"
              ? "किसान मित्र आवाज सहायक (Voice AI)"
              : "Voice Agronomic Assistant"}
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
          Grounded with Farm Telemetry & RAG
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        {language === "hi"
          ? "अपने खेत की नमी, बारिश, या फसल सुरक्षा से जुड़ा कोई भी सवाल बोलकर पूछें:"
          : "Ask any question about watering, rainfall, or disease management:"}
      </p>

      {/* Voice & Input Bar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleMicClick}
          className={`p-3.5 rounded-xl text-white shadow-md transition-all flex items-center justify-center shrink-0 ${
            isListening
              ? "bg-red-500 animate-pulse ring-4 ring-red-200"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
          title={isListening ? "Listening..." : "Tap to speak"}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk(query)}
            placeholder={
              isListening
                ? language === "hi"
                  ? "सुन रहा हूँ, बोलिए..."
                  : "Listening..."
                : language === "hi"
                ? "यहाँ लिखें या माइक दबाएं..."
                : "Type question or tap mic..."
            }
            className="w-full py-3 pl-4 pr-12 text-sm rounded-xl border border-input bg-background focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            type="button"
            onClick={() => handleAsk(query)}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-2 p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Questions Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {quickQuestions.map((q, i) => {
          const text = language === "hi" ? q.hi : q.en;
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuery(text);
                handleAsk(text);
              }}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/30 hover:bg-emerald-50 hover:border-emerald-300 text-foreground transition"
            >
              💬 {text}
            </button>
          );
        })}
      </div>

      {/* Response Box */}
      {isLoading && (
        <div className="p-4 rounded-xl bg-muted/40 border text-center text-sm text-muted-foreground animate-pulse">
          {language === "hi"
            ? "खेत के सेंसर और ICAR ज्ञानकोश की जांच हो रही है..."
            : "Checking live farm sensors & ICAR knowledge database..."}
        </div>
      )}

      {response && (
        <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
              {language === "hi" ? "सत्यापित परामर्श (Verified Advisory)" : "KisanLoop Verified Advisory"}
            </span>
            <AudioPlayer textToSpeak={response.reply} language={language} />
          </div>

          <p className="text-sm font-medium text-foreground whitespace-pre-line leading-relaxed">
            {response.reply}
          </p>

          {response.sources && response.sources.length > 0 && (
            <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-1.5 text-xs text-emerald-800/80 dark:text-emerald-300/80">
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>
                Sources: {response.sources.join(" • ")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
