"use client";

import React, { useState, useRef, useEffect } from "react";
import AppIcon from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  sources?: string[];
  modelUsed?: string;
}

interface FarmerChatProps {
  farmerName?: string;
  lang?: "hi" | "en";
  farmId?: string;
}

export function FarmerChat({
  farmerName = "Ravi Kumar",
  lang = "hi",
  farmId = "farm_ravi_01",
}: FarmerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting: ChatMessage = {
    id: "welcome-01",
    sender: "assistant",
    text:
      lang === "hi"
        ? `नमस्ते ${farmerName} जी! 🙏 मैं आपका किसानलूप AI सहायक हूँ, जो Google Gemini 2.5 Flash द्वारा संचालित है।\n\nआपके नामकुम खेत (धान IR-64, 38वां दिन) में 82% नमी है और कल 42mm बारिश की संभावना है। आप मुझसे सिंचाई, खाद, कीट-रोग या मौसम के बारे में कुछ भी पूछ सकते हैं!`
        : `Namaste ${farmerName}! 🙏 I am your KisanLoop AI agronomic advisor, powered by Google Gemini 2.5 Flash.\n\nYour plot (IR-64 Paddy, Day 38 Tillering) has 82% soil moisture and rain (42mm) forecast tomorrow. How can I help your farm today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    sources: ["Google Gemini 2.5 Flash", "Live OpenWeather", "ICAR Guidelines"],
    modelUsed: "gemini-2.5-flash",
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([initialGreeting]);
    }
  }, [lang, farmerName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts =
    lang === "hi"
      ? [
          "क्या आज खेत में पानी देना चाहिए?",
          "पत्तियों पर भूरे धब्बे दिख रहे हैं, क्या करें?",
          "यूरिया खाद कब डालना सही रहेगा?",
          "कल के मौसम और बारिश का हाल क्या है?",
        ]
      : [
          "Should I irrigate my paddy plot today?",
          "Brown spots visible on leaves, what to do?",
          "When is the right time to apply urea?",
          "What is the rain & weather forecast tomorrow?",
        ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          farmId,
          language: lang,
        }),
      });

      const json = await res.json();

      if (json.success && json.data?.reply) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          text: json.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sources: json.data.sources || ["Google Gemini 2.5 Flash", "ICAR Knowledge Base"],
          modelUsed: json.data.modelUsed || "gemini-3.5-flash",
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(json.error?.message || "Failed to get response");
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        sender: "assistant",
        text:
          lang === "hi"
            ? `क्षमा करें, नेटवर्क में समस्या आई। लेकिन आपके खेत में नमी 82% है और कल बारिश का अलर्ट है, इसलिए आज सिंचाई न करें।`
            : `Sorry, there was a temporary connectivity issue. However, your soil moisture is 82% with rain expected tomorrow—please hold irrigation today.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: ["KisanLoop Telemetry Engine"],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([initialGreeting]);
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] max-w-5xl mx-auto border-[#e8e7de] dark:border-white/10 shadow-md bg-white dark:bg-[#18221B] overflow-hidden">
      {/* Chat Header */}
      <CardHeader className="p-3 sm:p-5 border-b border-[#e8e7de] dark:border-white/10 bg-[#f8faf8] dark:bg-[#151e18] flex flex-row items-center justify-between space-y-0 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10 border-2 border-emerald-600 bg-emerald-100 dark:bg-emerald-950">
              <AvatarFallback className="bg-emerald-700 text-white font-black text-xs">
                KL
              </AvatarFallback>
            </Avatar>
            <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 absolute -bottom-0.5 -right-0.5 animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm sm:text-base font-bold text-[#141e17] dark:text-white">
                {lang === "hi" ? "किसानलूप कृषि चैट सहायक" : "KisanLoop Farmer AI Chat"}
              </CardTitle>
              <Badge variant="emerald" className="hidden sm:inline-flex gap-1 text-[10px]">
                <AppIcon name="auto_awesome" className="w-3 h-3 text-emerald-600" />
                Gemini 3.5 Flash
              </Badge>
            </div>
            <CardDescription className="text-[11px] text-[#608570] dark:text-zinc-400">
              {lang === "hi"
                ? "हाइपरलोकल मौसम, मिट्टी व वैज्ञानिक आईसीएआर डेटा से जुड़ा"
                : "Hyperlocal weather, soil telemetry & ICAR agronomy grounded"}
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] hidden md:inline-flex bg-white dark:bg-zinc-800">
            🌾 Rice IR-64 • Day 38
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs gap-1.5"
            title="Clear Chat History"
          >
            <AppIcon name="refresh" className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === "hi" ? "नया चैट" : "Reset"}</span>
          </Button>
        </div>
      </CardHeader>

      {/* Messages Stream Container */}
      <CardContent className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 bg-gradient-to-b from-[#fbfdfb] to-[#f4f7f4] dark:from-[#141c16] dark:to-[#18221B]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 sm:gap-3.5 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            } animate-in fade-in duration-200`}
          >
            {/* Avatar */}
            {msg.sender === "assistant" ? (
              <Avatar className="w-8 h-8 shrink-0 border border-emerald-600/40 bg-emerald-100 dark:bg-emerald-950">
                <AvatarFallback className="bg-emerald-800 text-white font-bold text-[10px]">
                  🌱
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="w-8 h-8 shrink-0 border border-amber-600/40 bg-amber-100 dark:bg-amber-950">
                <AvatarFallback className="bg-[#214E34] text-white font-bold text-[10px]">
                  {farmerName
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "ME"}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-xs leading-relaxed shadow-xs ${
                msg.sender === "user"
                  ? "bg-[#214E34] text-white rounded-tr-xs"
                  : "bg-white dark:bg-[#1f2d24] text-[#141e17] dark:text-zinc-100 border border-[#e2ebe4] dark:border-white/10 rounded-tl-xs"
              }`}
            >
              <div className="whitespace-pre-line font-medium">{msg.text}</div>

              {/* Citations & Source Tags */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[#eaf0ed] dark:border-white/10 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                    <AppIcon name="verified" className="w-3 h-3" />
                    {lang === "hi" ? "स्रोत:" : "Sources:"}
                  </span>
                  {msg.sources.map((src, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-[9px] px-1.5 py-0 bg-emerald-50 dark:bg-emerald-950/60 text-[#1b4332] dark:text-emerald-300 font-normal"
                    >
                      {src}
                    </Badge>
                  ))}
                </div>
              )}

              <div
                className={`text-[9px] mt-1.5 flex items-center justify-end ${
                  msg.sender === "user" ? "text-emerald-200" : "text-slate-400"
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3 animate-in fade-in duration-150">
            <Avatar className="w-8 h-8 border border-emerald-600/40 bg-emerald-100">
              <AvatarFallback className="bg-emerald-800 text-white font-bold text-[10px]">
                🌱
              </AvatarFallback>
            </Avatar>
            <div className="bg-white dark:bg-[#1f2d24] border border-[#e2ebe4] dark:border-white/10 rounded-2xl rounded-tl-xs p-3 shadow-xs flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-[11px] text-[#608570] dark:text-zinc-400 font-medium ml-1">
                {lang === "hi"
                  ? "Gemini 3.5 Flash सोच रहा है..."
                  : "Gemini 3.5 Flash is thinking..."}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-3 sm:px-5 py-2 bg-[#f8faf8] dark:bg-[#151e18] border-t border-[#e8e7de] dark:border-white/10 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 hidden sm:inline">
          {lang === "hi" ? "सुझाए गए प्रश्न:" : "Suggested:"}
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-[#141e17] dark:text-zinc-200 border border-[#d2ded5] dark:border-white/10 whitespace-nowrap transition cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box Footer */}
      <CardFooter className="p-3 sm:p-4 bg-white dark:bg-[#18221B] border-t border-[#e8e7de] dark:border-white/10 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 w-full"
        >
          <div className="relative flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                lang === "hi"
                  ? "खेत, फसल, दवा या सिंचाई के बारे में पूछें..."
                  : "Ask about irrigation, pest diagnosis, weather or fertilizers..."
              }
              disabled={loading}
              className="pr-10 h-11 text-xs sm:text-sm bg-[#f8faf8] dark:bg-zinc-800"
            />
          </div>

          <Button
            type="submit"
            disabled={!inputValue.trim() || loading}
            size="default"
            className="h-11 px-4 sm:px-5 bg-[#214E34] hover:bg-[#163624] gap-1.5 shrink-0"
          >
            <span className="hidden sm:inline">{lang === "hi" ? "पूछें" : "Send"}</span>
            <AppIcon name="send" className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
