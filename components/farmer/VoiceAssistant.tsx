"use client";

import React, { useState } from "react";
import { Mic, MicOff, Send, Sparkles, BookOpen, Volume2, Waves } from "lucide-react";
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
    <div className="bg-card/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-emerald-500/20 shadow-xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-foreground tracking-tight">
              {language === "hi"
                ? "किसान मित्र आवाज सहायक (Voice AI)"
                : "Voice Agronomic Assistant"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {language === "hi"
                ? "खेत टेलीमेट्री और RAG ज्ञानकोश से सत्यापित"
                : "Grounded with Live Farm Sensors & ICAR Package of Practices"}
            </p>
          </div>
        </div>

        <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold">
          Gemini 2.5 Flash • Bilingual
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {language === "hi"
          ? "अपने खेत की नमी, बारिश, या फसल सुरक्षा से जुड़ा कोई भी सवाल बोलकर पूछें:"
          : "Ask any question about watering, rainfall, fertilizer doses, or pest control:"}
      </p>

      {/* Voice & Input Bar */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleMicClick}
          className={`w-14 h-14 rounded-2xl text-white shadow-lg transition-all flex items-center justify-center shrink-0 cursor-pointer ${
            isListening
              ? "bg-rose-600 animate-pulse ring-4 ring-rose-400/40 scale-105"
              : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-600/25"
          }`}
          title={isListening ? "Listening..." : "Tap to speak"}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
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
                  : "Listening... speak now"
                : language === "hi"
                ? "यहाँ लिखें या माइक दबाकर पूछें..."
                : "Type agronomic question or tap microphone..."
            }
            className="w-full py-3.5 pl-4 pr-12 text-sm rounded-2xl border border-border bg-background focus:ring-2 focus:ring-emerald-500 outline-hidden shadow-xs"
          />
          <button
            type="button"
            onClick={() => handleAsk(query)}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-2 p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 disabled:opacity-30 cursor-pointer transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dynamic Sound Wave indicator when listening */}
      {isListening && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center gap-2 text-xs font-bold text-rose-600">
          <div className="flex items-center gap-1 h-4">
            <span className="w-1 bg-rose-500 rounded-full animate-[bounce_0.6s_infinite_100ms] h-full" />
            <span className="w-1 bg-rose-500 rounded-full animate-[bounce_0.6s_infinite_200ms] h-2/3" />
            <span className="w-1 bg-rose-500 rounded-full animate-[bounce_0.6s_infinite_300ms] h-full" />
            <span className="w-1 bg-rose-500 rounded-full animate-[bounce_0.6s_infinite_150ms] h-4/5" />
          </div>
          <span>{language === "hi" ? "आवाज सुनी जा रही है..." : "Listening to audio..."}</span>
        </div>
      )}

      {/* Quick Questions Pills */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
          Quick Inquiries (सुझाए गए सवाल)
        </span>
        <div className="flex flex-wrap gap-2">
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
                className="text-xs px-3.5 py-2 rounded-2xl border border-emerald-500/20 bg-background hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 text-foreground transition cursor-pointer shadow-xs"
              >
                💬 {text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Response Box */}
      {isLoading && (
        <div className="p-6 rounded-3xl bg-muted/40 border text-center text-sm text-muted-foreground animate-pulse flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500 animate-spin" />
          <span>
            {language === "hi"
              ? "खेत के सेंसर और ICAR ज्ञानकोश से विश्लेषण हो रहा है..."
              : "Synthesizing real-time farm telemetry & ICAR guidelines..."}
          </span>
        </div>
      )}

      {response && (
        <div className="p-6 rounded-3xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/40 space-y-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {language === "hi" ? "सत्यापित परामर्श (Verified Advisory)" : "KisanLoop Verified Advisory"}
            </span>
            <AudioPlayer textToSpeak={response.reply} language={language} />
          </div>

          <p className="text-sm font-medium text-foreground whitespace-pre-line leading-relaxed">
            {response.reply}
          </p>

          {response.sources && response.sources.length > 0 && (
            <div className="pt-3 border-t border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-800/80 dark:text-emerald-300/80">
              <BookOpen className="w-4 h-4 shrink-0" />
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
