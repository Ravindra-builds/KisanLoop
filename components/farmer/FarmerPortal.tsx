"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useClerk } from "@clerk/nextjs";
import AppIcon from "@/components/shared/AppIcon";
import { ProfileSetupModal } from "@/components/shared/ProfileSetupModal";
import { useAppLogout } from "@/lib/auth/useAppLogout";

const FarmerChat = dynamic(
  () => import("@/components/farmer/FarmerChat").then((m) => m.FarmerChat),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full rounded-2xl bg-emerald-950/5 border border-dashed border-emerald-800/20 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        <span>Loading KisanLoop AI Chat...</span>
      </div>
    ),
  }
);

const CadastralLeafletMap = dynamic(
  () => import("@/components/map/CadastralLeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 w-full rounded-2xl bg-emerald-950/5 border-2 border-dashed border-emerald-800/20 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        <span>Loading Cadastral GIS Field Map...</span>
      </div>
    ),
  }
);

export function FarmerPortal() {
  const router = useRouter();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<"today" | "farm" | "actions" | "journey" | "expert" | "chat" | "profile">("today");

  // Language & Theme State
  const [lang, setLang] = useState<"hi" | "en">("en");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Backend Data State
  const [farmState, setFarmState] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [isActionCompleted, setIsActionCompleted] = useState(false);

  // Modals State
  const [showWhyDrawer, setShowWhyDrawer] = useState(false);
  const [showBarrierModal, setShowBarrierModal] = useState(false);
  const [showWalkthroughModal, setShowWalkthroughModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  // Walkthrough Modal Interactive State
  const [step1Checked, setStep1Checked] = useState(false);
  const [step2Checked, setStep2Checked] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<"healthy" | "mild" | "severe">("healthy");
  const [evidenceAttached, setEvidenceAttached] = useState(false);
  const [outcomeSuccess, setOutcomeSuccess] = useState(false);

  // Barrier Feedback State
  const [barrierAck, setBarrierAck] = useState(false);

  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('"खेत में Zone B में क्या छिड़काव करना है?"');
  const [voiceReply, setVoiceReply] = useState(
    '"रवि जी, आज कोई छिड़काव नहीं करना है! केवल 15 मिनट Zone B में जाकर पत्तों की जांच करें। सब साफ है तो आपके ₹1,200 बचेंगे।"'
  );

  // Cadastral Zone Selection State
  const [selectedZone, setSelectedZone] = useState<"A" | "B" | "C">("B");

  // Farmer Profile State
  const [farmerName, setFarmerName] = useState("Ravi Kumar (रवि कुमार)");
  const [farmTitle, setFarmTitle] = useState("Namkum Farm (नामकुम खेत)");
  const [acres, setAcres] = useState("1.2 Acres");
  const [phone, setPhone] = useState("+91 98321 44520");
  const [village, setVillage] = useState("Namkum Village, Ranchi District");
  const [userRole, setUserRole] = useState<"FARMER" | "EXPERT" | "GOVT" | "ADMIN">("FARMER");
  const [showProfileSetupModal, setShowProfileSetupModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedToast, setProfileSavedToast] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { logout: handleLogout } = useAppLogout();

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "FARMER",
          name: farmerName,
          phone,
          village,
          district: "Ranchi",
          state: "Jharkhand",
          farmName: farmTitle,
          acres: parseFloat(acres) || 1.2,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setProfileSavedToast(true);
        setTimeout(() => setProfileSavedToast(false), 3500);
        fetchData();
      }
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Fetch live backend data
  const fetchData = async () => {
    try {
      setLoading(true);
      let targetFarmId = "farm_ravi_01";
      let targetFarmerId = "frm_ravi";

      try {
        const meRes = await fetch("/api/auth/me").then((r) => r.json()).catch(() => null);
        if (meRes?.success && meRes.data?.user) {
          const u = meRes.data.user;
          const farmer = meRes.data.farmer;
          const farm = meRes.data.farm;

          if (u.role) setUserRole(u.role);
          if (u.name) setFarmerName(u.name);
          if (farmer?.phone) setPhone(farmer.phone);
          if (farmer?.village) setVillage(`${farmer.village}, ${farmer.district || "Ranchi"}`);
          else if (u.district) setVillage(u.district);

          if (farm?.name) setFarmTitle(farm.name);
          else if (u.name && u.name !== "Farmer") setFarmTitle(`${u.name}'s Farm`);

          if (farm?.totalAreaAcres) setAcres(`${farm.totalAreaAcres} Acres`);

          if (u.farmId) targetFarmId = u.farmId;
          if (u.id) targetFarmerId = u.id.startsWith("usr_") ? `frm_${u.id.slice(4)}` : u.id;

          // If first login and profile incomplete, prompt setup modal!
          if (meRes.data.isProfileComplete === false) {
            setShowProfileSetupModal(true);
          }
        }
      } catch {
        // Fallback to default farm
      }

      const [stateRes, recsRes, actsRes, outsRes] = await Promise.all([
        fetch(`/api/farm-state?farmId=${targetFarmId}`).then((r) => r.json()).catch(() => ({ success: false })),
        fetch(`/api/recommendations?farmId=${targetFarmId}`).then((r) => r.json()).catch(() => ({ success: false })),
        fetch(`/api/actions?farmerId=${targetFarmerId}`).then((r) => r.json()).catch(() => ({ success: false })),
        fetch(`/api/outcomes?farmId=${targetFarmId}`).then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      if (stateRes.success) setFarmState(stateRes.data);
      if (recsRes.success) setRecommendations(recsRes.data);
      if (actsRes.success) {
        setActions(actsRes.data);
        if (actsRes.data?.some((a: any) => a.status === "COMPLETED")) {
          setIsActionCompleted(true);
        }
      }
      if (outsRes.success) setOutcomes(outsRes.data);
    } catch (e) {
      console.error("Error fetching farmer telemetry:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      if (localStorage.getItem("kisanloop-task-completed") === "true") {
        setIsActionCompleted(true);
      }
    } catch {}

    fetchData();

    // Load language preference (defaults to "en" for first-time visitors)
    try {
      const savedLang = localStorage.getItem("kisanloop-lang");
      if (savedLang === "hi" || savedLang === "en") {
        setLang(savedLang);
      } else {
        setLang("en");
      }
    } catch {
      setLang("en");
    }

    // Load theme preference (defaults to light mode for first-time visitors)
    try {
      const savedTheme = localStorage.getItem("kisanloop-theme");
      if (savedTheme === "dark") {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove("dark");
      }
    } catch {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("kisanloop-theme", "dark");
      } catch {}
    } else {
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem("kisanloop-theme", "light");
      } catch {}
    }
  };

  const toggleLanguage = () => {
    setLang((prev) => {
      const next = prev === "en" ? "hi" : "en";
      try {
        localStorage.setItem("kisanloop-lang", next);
      } catch {}
      return next;
    });
  };

  // Cadastral Zone Data
  const zoneDetails = {
    A: {
      badge: lang === "hi" ? "जोन A चुना गया" : "ZONE A SELECTED",
      score: lang === "hi" ? "स्वास्थ्य: 88/100" : "Health: 88/100",
      title: lang === "hi" ? "जोन A (ऊपरी ढलान • 0.5 एकड़)" : "Zone A (Upper Plot • 0.5 ac)",
      desc:
        lang === "hi"
          ? "उच्च ऊंचाई वाला क्षेत्र जहां प्राकृतिक ढलान जल निकासी अच्छी है। स्वस्थ पौधे, कोई कीट लक्षण नहीं।"
          : "Higher elevation plot with good natural slope drainage. Healthy tillers with zero pest indication.",
      moisture: "52% (Optimal)",
      ndvi: "0.76 (Robust)",
      water: "1.8 cm",
      action: lang === "hi" ? "सब ठीक है ✓" : "All Clean ✓",
    },
    B: {
      badge: isActionCompleted
        ? (lang === "hi" ? "जोन B चुना गया (सत्यापित ✓)" : "ZONE B SELECTED (VERIFIED ✓)")
        : (lang === "hi" ? "जोन B चुना गया (सावधानी)" : "ZONE B SELECTED (ATTENTION)"),
      score: isActionCompleted
        ? (lang === "hi" ? "स्वास्थ्य: 88/100" : "Health: 88/100")
        : (lang === "hi" ? "स्वास्थ्य: 74/100" : "Health: 74/100"),
      title: lang === "hi" ? "जोन B (नहर का निचला भाग • 0.4 एकड़)" : "Zone B (Canal Depressed Basin • 0.4 ac)",
      desc: isActionCompleted
        ? (lang === "hi"
            ? "निरीक्षण पूर्ण: पत्तियां पूरी तरह स्वस्थ पाई गईं। कवक संक्रमण का कोई खतरा नहीं। ₹1,200 की बचत हुई।"
            : "Physical check complete: Healthy vegetative tillers verified. No emergency fungicide required. ₹1,200 saved.")
        : (lang === "hi"
            ? "पूर्वी नहर की मेड़ के निकट होने से अत्यधिक नमी बनी रहती है। पूरे खेत में सबसे अधिक आर्द्रता वाला कोना।"
            : "High soil moisture retention due to proximity to eastern canal bund. Highest humidity pocket in Plot."),
      moisture: isActionCompleted ? "56% (Optimal)" : "68% (High saturation)",
      ndvi: isActionCompleted ? "0.76 (Healthy)" : "0.71 (Vigorous canopy)",
      water: isActionCompleted ? "2.0 cm (Controlled)" : "2.2 cm",
      action: isActionCompleted
        ? (lang === "hi" ? "जांच पूर्ण ✓ (स्वस्थ)" : "Inspection Completed ✓")
        : (lang === "hi" ? "1 जांच लंबित" : "1 Inspection Pending"),
    },
    C: {
      badge: lang === "hi" ? "जोन C चुना गया" : "ZONE C SELECTED",
      score: lang === "hi" ? "स्वास्थ्य: 85/100" : "Health: 85/100",
      title: lang === "hi" ? "जोन C (बोरवेल का किनारा • 0.3 एकड़)" : "Zone C (Well-head Ridge • 0.3 ac)",
      desc:
        lang === "hi"
          ? "मजबूत मेड़बंदी, स्थिर नमी, और एकसमान हरी पत्तियां।"
          : "Good perimeter bunding, steady moisture, uniform green vegetative foliage.",
      moisture: "56% (Optimal)",
      ndvi: "0.75 (Healthy)",
      water: "2.0 cm",
      action: lang === "hi" ? "सब ठीक है ✓" : "All Clean ✓",
    },
  };

  // Handle Direct One-Click Completion of Action
  const handleDirectCompleteAction = async () => {
    setProcessingAction(true);
    try {
      const activeAction = actions[0] || { id: "act_ravi_01" };
      await fetch(`/api/actions/${activeAction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED", notes: "Completed and verified by farmer." }),
      }).catch(() => null);

      setIsActionCompleted(true);
      try {
        localStorage.setItem("kisanloop-task-completed", "true");
      } catch {}

      setToastMessage(
        lang === "hi"
          ? "शाबाश! खेत का कार्य पूर्ण हुआ और क्लोज्ड लूप बंद हुआ।"
          : "Action marked complete and closed loop verified!"
      );
      setTimeout(() => setToastMessage(null), 3500);
      fetchData();
    } catch (e) {
      console.error(e);
      setIsActionCompleted(true);
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle Resetting Action (for live testing)
  const handleResetActionState = () => {
    setIsActionCompleted(false);
    try {
      localStorage.removeItem("kisanloop-task-completed");
    } catch {}
    setToastMessage(lang === "hi" ? "कार्य पुनः लंबित स्थिति में सेट किया गया।" : "Task reset to pending state.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Completing Walkthrough Action
  const submitWalkthroughOutcome = async () => {
    setProcessingAction(true);
    try {
      const activeAction = actions[0] || { id: "act_ravi_01" };
      await fetch(`/api/actions/${activeAction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED", outcome: selectedOutcome }),
      }).catch(() => null);

      setIsActionCompleted(true);
      try {
        localStorage.setItem("kisanloop-task-completed", "true");
      } catch {}

      setOutcomeSuccess(true);
      setTimeout(() => {
        setShowWalkthroughModal(false);
        setOutcomeSuccess(false);
        setToastMessage(
          lang === "hi"
            ? "शाबाश! खेत का परिणाम सफलतापूर्वक दर्ज हुआ और लूप बंद हुआ।"
            : "Action verified and closed loop completed!"
        );
        setTimeout(() => setToastMessage(null), 3500);
        fetchData();
      }, 1200);
    } catch (e) {
      console.error(e);
      setIsActionCompleted(true);
      setShowWalkthroughModal(false);
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle Recording Adoption Barrier
  const handleRecordBarrier = async (reason: string) => {
    setBarrierAck(true);
    try {
      const activeAction = actions[0] || { id: "act_ravi_01" };
      await fetch(`/api/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId: "frm_ravi",
          recommendationId: "rec_ravi_01",
          status: "NOT_POSSIBLE",
          barrierReason: reason,
        }),
      });

      setTimeout(() => {
        setShowBarrierModal(false);
        setBarrierAck(false);
        setToastMessage(
          lang === "hi"
            ? "बाधा दर्ज की गई। किसानलूप ने कार्य योजना को स्वतः अनुकूलित कर दिया है।"
            : "Barrier recorded. KisanLoop adapted the action plan."
        );
        setTimeout(() => setToastMessage(null), 3500);
        fetchData();
      }, 1600);
    } catch (e) {
      console.error(e);
    }
  };

  // Voice Interaction
  const toggleVoiceRecording = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;

      if (!isListening) {
        recognition.start();
        setIsListening(true);
        setVoiceStatus(lang === "hi" ? "सुन रहे हैं... बोलिए (Listening...)" : "Listening... speak now");

        recognition.onresult = async (e: any) => {
          const spokenText = e.results[0][0].transcript;
          setIsListening(false);
          setVoiceStatus(`"${spokenText}"`);

          // Call backend chat API
          try {
            const chatRes = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: spokenText, farmId: "farm_ravi_01", language: lang }),
            }).then((r) => r.json());

            if (chatRes.success) {
              setVoiceReply(`"${chatRes.data.reply}"`);
              // Speak out
              if ("speechSynthesis" in window) {
                const utter = new SpeechSynthesisUtterance(chatRes.data.reply);
                utter.lang = lang === "hi" ? "hi-IN" : "en-IN";
                window.speechSynthesis.speak(utter);
              }
            }
          } catch (err) {
            setVoiceReply('"रवि जी, आज खेत में नमी 68% है और कोई अनावश्यक छिड़काव नहीं करना है।"');
          }
        };

        recognition.onerror = () => setIsListening(false);
      } else {
        recognition.stop();
        setIsListening(false);
      }
    } else {
      // Browser simulation
      setIsListening(!isListening);
      if (!isListening) {
        setVoiceStatus(lang === "hi" ? '"आज खेत में क्या करना है?"' : '"What should I do in the field today?"');
        setTimeout(() => {
          setVoiceReply(
            lang === "hi"
              ? '"रवि जी, आज केवल Zone B में 15 मिनट की पैदल जांच है। कोई स्प्रे या खाद नहीं डालना है। इससे आपके ₹1,200 बचेंगे।"'
              : '"Ravi ji, today only a 15-minute physical walk in Zone B is needed. No chemical sprays required."'
          );
          setIsListening(false);
        }, 1200);
      }
    }
  };

  const simulateVoiceQuery = (queryText: string) => {
    setVoiceStatus(`"${queryText}"`);
    if (queryText.includes("आज क्या करना है") || queryText.includes("today")) {
      setVoiceReply(
        lang === "hi"
          ? '"रवि जी, आज केवल Zone B में 15 मिनट की पैदल जांच है। कोई स्प्रे या खाद नहीं डालना है।"'
          : '"Ravi ji, only a 15-minute physical walk in Zone B is needed today. Zero spend."'
      );
    } else if (queryText.includes("मौसम") || queryText.includes("weather")) {
      setVoiceReply(
        lang === "hi"
          ? '"आज दिन का तापमान 29°C रहेगा, हल्की धूप है और हवा में नमी 78% है। कल 85% बारिश की संभावना है।"'
          : '"Forecast is 29°C, 78% humidity, and 85% chance of rain tomorrow (42mm). Hold off on irrigation."'
      );
    } else {
      setVoiceReply(
        lang === "hi"
          ? '"बिना लक्षण देखे दवा न छिड़कने से आपके ₹1,200 की सीधी बचत हो रही है।"'
          : '"Avoiding prophylactic spray saves ₹1,200 directly for your farm."'
      );
    }
  };

  return (
    <div className="bg-[#F6F5EF] text-charcoal font-sans antialiased transition-colors duration-200 selection:bg-emerald-200 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#214E34] text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <AppIcon name="check_circle" className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================== LEFT NAVIGATION SIDEBAR ==================== */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white z-40 flex-col justify-between border-r border-[#ebeae2] shadow-sm transition-colors duration-200">
        <div className="flex flex-col flex-1 min-h-0">
          {/* App Header & Brand */}
          <div className="h-20 px-5 flex items-center justify-between border-b border-[#ebeae2]">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab("today")}>
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
                <AppIcon name="eco" className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-lg text-charcoal leading-tight tracking-tight">
                  Kisan<span className="text-[#214E34]">LOOP</span>
                </span>
                <span className="text-[10px] text-secondary font-medium">Action & Outcome Layer</span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-[#214E34] text-[10px] font-bold rounded-full uppercase tracking-wider">
              v2.5 Live
            </span>
          </div>

          {/* Main Navigation Menu */}
          <nav className="flex-1 px-3.5 py-5 flex flex-col gap-1.5 overflow-y-auto">
            <button
              className={`nav-item flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-left cursor-pointer ${
                currentTab === "today"
                  ? "bg-[#214E34] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-[#F6F5EF]"
              }`}
              onClick={() => setCurrentTab("today")}
            >
              <AppIcon name="cottage" className="w-5 h-5" />
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">
                  {lang === "hi" ? "खेत आज" : "Today"}
                </span>
                <span className="text-[11px] opacity-80 font-normal">
                  {lang === "hi" ? "दैनिक कार्य योजना" : "Daily Simple View"}
                </span>
              </div>
            </button>

            <button
              className={`nav-item flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-left cursor-pointer ${
                currentTab === "farm"
                  ? "bg-[#214E34] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-[#F6F5EF]"
              }`}
              onClick={() => setCurrentTab("farm")}
            >
              <AppIcon name="map" className="w-5 h-5" />
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">
                  {lang === "hi" ? "मेरा खेत व नक्शा" : "My Farm & Map"}
                </span>
                <span className="text-[11px] text-secondary font-normal">
                  {lang === "hi" ? "प्लॉट 2 • 3 जोन" : "Plot 2 • 3 Cadastral Zones"}
                </span>
              </div>
            </button>

            <button
              className={`nav-item flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-left cursor-pointer ${
                currentTab === "actions"
                  ? "bg-[#214E34] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-[#F6F5EF]"
              }`}
              onClick={() => setCurrentTab("actions")}
            >
              <div className="relative">
                <AppIcon name="check_circle" className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500"></span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">
                  {lang === "hi" ? "काम सूची" : "Actions & Tasks"}
                </span>
                <span className="text-[11px] text-secondary font-normal">
                  {lang === "hi" ? "1 कार्य आज आवश्यक" : "1 Action Due Today"}
                </span>
              </div>
            </button>

            <button
              className={`nav-item flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-left cursor-pointer ${
                currentTab === "journey"
                  ? "bg-[#214E34] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-[#F6F5EF]"
              }`}
              onClick={() => setCurrentTab("journey")}
            >
              <AppIcon name="all_inclusive" className="w-5 h-5" />
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">
                  {lang === "hi" ? "सफ़र व सीख" : "Farm Journey"}
                </span>
                <span className="text-[11px] text-secondary font-normal">
                  {lang === "hi" ? "7-चरणीय लूप व परिणाम" : "7-Stage Closed Loop"}
                </span>
              </div>
            </button>

            <button
              className={`nav-item flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-left cursor-pointer ${
                currentTab === "expert"
                  ? "bg-[#214E34] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-[#F6F5EF]"
              }`}
              onClick={() => setCurrentTab("expert")}
            >
              <AppIcon name="support_agent" className="w-5 h-5" />
              <div className="flex flex-col flex-1">
                <span className="font-bold text-sm leading-tight">
                  {lang === "hi" ? "कृषि विशेषज्ञ व KVK" : "Expert Help"}
                </span>
                <span className="text-[11px] text-secondary font-normal">
                  {lang === "hi" ? "डॉ. पटेल (KVK कृषि केंद्र)" : "Dr. Patel • KVK Ranchi"}
                </span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            <button
              className={`nav-item flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-left cursor-pointer ${
                currentTab === "chat"
                  ? "bg-[#214E34] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-[#F6F5EF]"
              }`}
              onClick={() => setCurrentTab("chat")}
            >
              <div className="relative">
                <AppIcon name="forum" className="w-5 h-5" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 animate-pulse"></span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">
                  {lang === "hi" ? "किसान AI चैट" : "Farmer AI Chat"}
                </span>
                <span className="text-[11px] text-secondary font-normal">
                  {lang === "hi" ? "Gemini 3.5 Flash सलाह" : "Gemini 3.5 Assistant"}
                </span>
              </div>
            </button>

            <button
              className={`nav-item flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-left cursor-pointer ${
                currentTab === "profile"
                  ? "bg-[#214E34] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-[#F6F5EF]"
              }`}
              onClick={() => setCurrentTab("profile")}
            >
              <AppIcon name="badge" className="w-5 h-5" />
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">
                  {lang === "hi" ? "किसान प्रोफाइल" : "Farm Profile"}
                </span>
                <span className="text-[11px] text-secondary font-normal">
                  {lang === "hi" ? "जानकारी संपादन" : "Edit Details & Settings"}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Bottom Controls: Language Toggle, Theme Toggle & Farmer Card */}
        <div className="p-4 flex flex-col gap-3 bg-white border-t border-[#ebeae2] transition-colors">
          <div className="flex items-center justify-between gap-2">
            {/* Bilingual Toggle */}
            <button
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-[#F6F5EF] rounded-xl text-xs font-bold text-charcoal hover:bg-emerald-100 transition-colors cursor-pointer"
              onClick={toggleLanguage}
              title="Toggle English / हिन्दी"
            >
              <AppIcon name="translate" className="w-4 h-4  text-primary" />
              <span>{lang === "hi" ? "English" : "हिन्दी"}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              className="p-2 bg-[#F6F5EF] text-charcoal rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center cursor-pointer"
              onClick={toggleDarkMode}
              title="Toggle Theme"
            >
              <AppIcon name={isDarkMode ? "light_mode" : "dark_mode"} className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Farmer Mini Profile Card */}
          <div
            className="flex items-center gap-3 p-2.5 bg-[#F6F5EF] rounded-xl hover:bg-emerald-50 cursor-pointer transition-colors group"
            onClick={() => setCurrentTab("profile")}
          >
            <img
              alt={farmerName}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary shadow-xs shrink-0"
              src={avatarUrl}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80";
              }}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-charcoal truncate group-hover:text-primary">
                {farmerName}
              </span>
              <span className="text-[11px] text-secondary truncate">
                {farmTitle} • {acres}
              </span>
            </div>
            <AppIcon name="chevron_right" className="w-[18px] h-[18px] text-secondary group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Sidebar Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-red-200"
            title="Log Out"
          >
            <AppIcon name="logout" className="w-[18px] h-[18px]" />
            <span>{lang === "hi" ? "लॉगआउट (Logout)" : "Log Out"}</span>
          </button>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT WRAPPER ==================== */}
      <div className="lg:pl-72 pl-0 min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
        {/* Top Utility Bar */}
        <header className="h-16 px-3 sm:px-6 lg:px-8 bg-[#F6F5EF]/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between border-b border-[#ebeae2] transition-colors w-full">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Brand Logo */}
            <div className="lg:hidden flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setCurrentTab("today")}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs">
                <AppIcon name="eco" className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-base text-charcoal leading-none">
                Kisan<span className="text-[#214E34]">LOOP</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-2.5 sm:px-3 py-1 bg-white rounded-full border border-[#ebeae2] shadow-xs shrink-0">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] sm:text-xs font-semibold text-primary truncate">
                {lang === "hi" ? "ऑफलाइन तैयार • सिंक" : "Offline Ready • Synced"}
              </span>
            </div>
            <span className="text-xs text-secondary hidden xl:inline">|</span>
            <span className="text-xs text-secondary font-medium hidden xl:inline truncate">
              {lang === "hi"
                ? "मौसम: 29°C, 78% आर्द्रता, कल 42mm बारिश की चेतावनी"
                : "Weather Forecast: 29°C, 78% Humidity, 42mm rain tomorrow"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#214E34] hover:bg-[#163624] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              onClick={() => setShowVoiceModal(true)}
              title={lang === "hi" ? "बोलकर पूछें" : "Ask KisanLoop Voice"}
            >
              <AppIcon name="mic" className="w-4 h-4  animate-pulse" />
              <span className="hidden sm:inline">{lang === "hi" ? "बोलकर पूछें" : "Ask KisanLoop"}</span>
              <span className="sm:hidden">{lang === "hi" ? "आवाज" : "Voice"}</span>
            </button>
            <div className="hidden md:flex px-3 py-1 bg-white border border-[#ebeae2] rounded-full text-xs font-semibold text-charcoal shadow-xs">
              🌾 <span>{lang === "hi" ? "धान (IR-64) • कल्ले फूटने की अवस्था" : "Rice (धान) • Day 38 (Tillering)"}</span>
            </div>
            {/* Quick Header Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-full border border-red-200 text-xs font-bold shadow-xs transition-all cursor-pointer hover:shadow-sm"
              title="Log Out / बाहर निकलें"
            >
              <AppIcon name="logout" className="w-4 h-4 text-red-600" />
              <span>{lang === "hi" ? "लॉगआउट" : "Log Out"}</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-8 max-w-6xl mx-auto w-full space-y-5 sm:space-y-7 pb-24 lg:pb-8 overflow-x-hidden">
          {/* =============================================================== */}
          {/* TAB 1: TODAY (खेत आज)                                           */}
          {/* =============================================================== */}
          {currentTab === "today" && (
            <div className="space-y-7 animate-in fade-in duration-300">
              {/* Hero Banner with Health Score Badge */}
              <section className="relative rounded-20px overflow-hidden shadow-sm border border-[#e8e7de] bg-white">
                <div className="relative min-h-[19rem] sm:min-h-[18rem] sm:h-72 w-full overflow-hidden">
                  <img
                    alt="Lush green paddy fields in Namkum, Ranchi"
                    className="w-full h-full object-cover object-[center_35%] scale-105 transition-transform duration-700"
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1600&q=85";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#072315]/95 via-[#072315]/50 to-black/20"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-7 lg:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
                    <div className="space-y-1.5 drop-shadow-sm">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/25 text-xs font-semibold text-white">
                        <AppIcon name="wb_sunny" className="w-4 h-4 text-amber-300" />
                        <span>
                          {lang === "hi"
                            ? "आज • 29°C धूप और अधिक नमी (78%)"
                            : "Today • 29°C Mild Sunlight, High Humidity"}
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight drop-shadow-md">
                        {lang === "hi" ? `नमस्ते ${farmerName}! 👋 🌾` : `Namaste ${farmerName}! 👋 🌾`}
                      </h1>
                      <p className="text-white/95 text-sm sm:text-base font-medium max-w-xl drop-shadow-sm">
                        {farmTitle} • {acres}. {isActionCompleted
                          ? (lang === "hi"
                              ? "आज के सभी कार्य पूरे हुए! तीनों जोन स्वस्थ हैं।"
                              : "All actions completed today! All 3 zones are optimal.")
                          : (lang === "hi"
                              ? "कल्ले फूट रहे हैं। आज केवल 1 छोटी जांच जरूरी है।"
                              : "Crop is tillering well. Only 1 quick check required.")}
                      </p>
                    </div>

                    {/* Big Farm Health Score Circle */}
                    <div className="bg-white/95 text-charcoal backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/40 flex items-center gap-3.5 self-start sm:self-auto shrink-0">
                      <div className={`relative w-13 h-13 rounded-full flex items-center justify-center font-display font-black text-xl ${
                        isActionCompleted ? "bg-emerald-200 text-emerald-900" : "bg-emerald-100 text-primary"
                      }`}>
                        {isActionCompleted ? "88" : "82"}
                        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                          {lang === "hi" ? "खेत की स्थिति" : "Farm Health Score"}
                        </span>
                        <span className="text-base font-bold text-primary leading-tight">
                          {isActionCompleted
                            ? (lang === "hi" ? "उत्कृष्ट (88/100) ✓" : "Optimal (88/100) ✓")
                            : (lang === "hi" ? "अच्छी स्थिति (82/100)" : "Good Shape (82/100)")}
                        </span>
                        <span className="text-[11px] text-secondary font-medium">
                          {isActionCompleted
                            ? (lang === "hi" ? "तीनों जोन स्वस्थ • लूप बंद" : "All 3 Zones Clean • Closed Loop")
                            : (lang === "hi" ? "जोन A व C स्वस्थ • जोन B जांचें" : "Zone A & C Optimal • Zone B Needs Check")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* THE HERO ACTION CARD (DYNAMIC STATE REFLECTION) */}
              {isActionCompleted ? (
                <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border-2 border-emerald-600/60 relative overflow-hidden animate-in fade-in zoom-in-98 duration-300">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>
                  <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
                    <div className="flex-1 space-y-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs uppercase tracking-wide shadow-xs">
                          <AppIcon name="verified" className="w-4 h-4 text-white" />
                          <span>{lang === "hi" ? "कार्य पूर्ण व लूप बंद ✓" : "Closed Loop Verified ✓"}</span>
                        </span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                          {lang === "hi" ? "स्थान: जोन B (निरीक्षण पूर्ण)" : "Location: Zone B (Verified Clean)"}
                        </span>
                        <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                          ₹1,200 Cost Saved ✓
                        </span>
                      </div>

                      <div>
                        <h2 className="text-2xl lg:text-3xl font-display font-extrabold text-[#113a24] tracking-tight leading-snug">
                          {lang === "hi"
                            ? "शाबाश! आज का निरीक्षण पूर्ण हुआ और खेत सुरक्षित है 🎉"
                            : "All Actions Completed Today! Farm Health Verified 🎉"}
                        </h2>
                        <p className="text-sm sm:text-base font-bold text-emerald-800 mt-1">
                          {lang === "hi"
                            ? "जोन B में कोई कवक संक्रमण नहीं मिला। अनावश्यक कीटनाशक से खेत व मिट्टी दोनों सुरक्षित।"
                            : "Physical walk completed: Zero blight symptoms found. Root zone and tillers verified robust."}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg shrink-0">💰</div>
                          <div>
                            <span className="text-[10px] font-semibold text-secondary block uppercase">{lang === "hi" ? "बचत" : "Saved"}</span>
                            <span className="text-sm font-black text-emerald-700">₹1,200 (100%)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-lg shrink-0">🌾</div>
                          <div>
                            <span className="text-[10px] font-semibold text-secondary block uppercase">{lang === "hi" ? "खेत स्वास्थ्य" : "Health"}</span>
                            <span className="text-sm font-black text-teal-700">88/100 (Optimal)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                          <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-lg shrink-0">📅</div>
                          <div>
                            <span className="text-[10px] font-semibold text-secondary block uppercase">{lang === "hi" ? "अगली जांच" : "Next Check"}</span>
                            <span className="text-sm font-black text-sky-800">In 3 Days</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentTab("journey")}
                          className="px-5 py-2.5 rounded-xl bg-[#214e34] hover:bg-[#163624] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <AppIcon name="all_inclusive" className="w-4 h-4" />
                          <span>{lang === "hi" ? "क्लोज्ड लूप ऑडिट देखें" : "View Closed Loop Audit"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowWalkthroughModal(true)}
                          className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 cursor-pointer shadow-2xs"
                        >
                          {lang === "hi" ? "जांच पुनः दर्ज करें" : "Re-open Walkthrough"}
                        </button>
                        <button
                          type="button"
                          onClick={handleResetActionState}
                          className="px-3 py-2.5 text-secondary hover:text-charcoal font-semibold text-xs cursor-pointer"
                          title="Reset for Demo"
                        >
                          ↺ Reset Demo
                        </button>
                      </div>
                    </div>

                    <div className="w-full lg:w-72 shrink-0 bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl mb-2">
                        ✓
                      </div>
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        {lang === "hi" ? "परिणाम ऑडिट पूर्ण" : "Audit Log Updated"}
                      </span>
                      <p className="text-[11px] text-secondary mt-1 leading-snug">
                        {lang === "hi"
                          ? "KVK वैज्ञानिक व जिला डैशबोर्ड पर आपका परिणाम सिंक हो चुका है।"
                          : "Synchronized to KVK Expert Portal and District Agri Dashboard in real time."}
                      </p>
                    </div>
                  </div>
                </section>
              ) : (
                <section className="bg-white rounded-2xl p-4 sm:p-6 lg:p-9 shadow-sm border-2 border-emerald-800/20 card-hover relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-emerald-600 to-amber-500"></div>
                  <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-light border border-amber-500/30 text-amber-900 font-bold text-xs uppercase tracking-wide">
                          <span>⚠️</span>
                          <span>{lang === "hi" ? "आज 1 कार्य आवश्यक" : "1 Action Due Today"}</span>
                        </span>
                        <span className="text-xs font-semibold text-secondary bg-[#F6F5EF] px-3 py-1 rounded-full">
                          {lang === "hi" ? "स्थान: जोन B (नहर वाला कोना)" : "Location: Zone B (Near Canal Gate)"}
                        </span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          4-Point Feasibility Passed ✓
                        </span>
                      </div>

                      <div>
                        <h2 className="text-2xl lg:text-3xl font-display font-extrabold text-primary tracking-tight leading-snug">
                          {lang === "hi"
                            ? "जोन B में पत्तियों के पीले या धब्बेदार सिरों की जांच करें"
                            : "Inspect Zone B for Yellow or Pale Leaf Tips"}
                        </h2>
                        <p className="text-base font-bold text-emerald-800 mt-1">
                          {lang === "hi"
                            ? "निचली मेंड़ पर 15 मिनट की पैदल जांच ताकि बिना किसी दवाई के शुरुआती लक्षण रोके जा सकें"
                            : "15-Minute physical walk along the lower ridge to catch early blight before spray is needed"}
                        </p>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-2xl">
                        {lang === "hi"
                          ? "कल की 18mm बारिश और 78% नमी से जोन B में पानी रुकने से फंगस का खतरा हो सकता है। अभी 15 मिनट देख लेने से अगले हफ्ते ₹1,200 की अनावश्यक कीटनाशक की बचत होगी।"
                          : "Yesterday's 18mm rainfall and 78% relative humidity created temporary moisture pooling in Zone B. A quick visual check now avoids spending ₹1,200 on emergency fungicide next week."}
                      </p>

                      {/* 3 Feasibility Pills */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F6F5EF] border border-[#e8e7de]">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-xs shrink-0">⏱️</div>
                          <div>
                            <span className="text-[11px] font-semibold text-secondary block uppercase">{lang === "hi" ? "समय" : "Time Needed"}</span>
                            <span className="text-sm font-bold text-charcoal">15-20 Mins</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F6F5EF] border border-[#e8e7de]">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-xs shrink-0">💰</div>
                          <div>
                            <span className="text-[11px] font-semibold text-secondary block uppercase">{lang === "hi" ? "लागत" : "Cost Today"}</span>
                            <span className="text-sm font-bold text-emerald-800">{lang === "hi" ? "₹0 मुफ्त" : "₹0 Free"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F6F5EF] border border-[#e8e7de]">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-xs shrink-0">👨‍🌾</div>
                          <div>
                            <span className="text-[11px] font-semibold text-secondary block uppercase">{lang === "hi" ? "मेहनत" : "Labour Effort"}</span>
                            <span className="text-sm font-bold text-charcoal">{lang === "hi" ? "आसान (पैदल जांच)" : "Easy (Walk)"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Main Action Buttons */}
                      <div className="pt-3 flex flex-wrap items-center gap-3">
                        <button
                          className="px-6 py-3.5 rounded-xl bg-primary hover:bg-[#163624] text-white font-display font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
                          onClick={() => setShowWalkthroughModal(true)}
                        >
                          <span>{lang === "hi" ? "3-कदम जांच शुरू करें" : "Start 3-Step Walkthrough"}</span>
                          <AppIcon name="arrow_forward" className="w-[18px] h-[18px]" />
                        </button>

                        <button
                          className="px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                          disabled={processingAction}
                          onClick={handleDirectCompleteAction}
                        >
                          <AppIcon name="check_circle" className="w-4 h-4 text-white" />
                          <span>{lang === "hi" ? "जांच पूर्ण (1-क्लिक)" : "Mark Completed (1-Click)"}</span>
                        </button>

                        <button
                          className="px-4 py-3 rounded-xl bg-[#F6F5EF] hover:bg-emerald-100 text-primary font-bold text-xs flex items-center gap-1.5 border border-[#e8e7de] transition-colors cursor-pointer"
                          onClick={() => setShowWhyDrawer(true)}
                        >
                          <AppIcon name="info" className="w-[18px] h-[18px]" />
                          <span>{lang === "hi" ? "यह सलाह क्यों?" : "Why this recommendation?"}</span>
                        </button>

                        <button
                          className="px-4 py-3 rounded-xl bg-[#F6F5EF] hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 border border-amber-200 transition-colors cursor-pointer"
                          onClick={() => setShowBarrierModal(true)}
                        >
                          <AppIcon name="help_outline" className="w-[18px] h-[18px]" />
                          <span>{lang === "hi" ? "बाधा दर्ज करें" : "Can't do this?"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Right Leaf Visual Reference */}
                    <div className="w-full lg:w-80 shrink-0 bg-[#F6F5EF] p-4 rounded-2xl border border-[#e8e7de] flex flex-col items-center">
                      <div className="w-full relative rounded-xl overflow-hidden shadow-sm aspect-[4/3]">
                        <img
                          alt="Reference leaf inspection"
                          className="w-full h-full object-cover"
                          src="https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                        <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                          <AppIcon name="search" className="w-4 h-4 text-amber-300" />
                          <span>{lang === "hi" ? "पत्ती के निचले हिस्से पर धब्बे देखें" : "Inspect lower collar for spots"}</span>
                        </div>
                      </div>
                      <p className="text-xs text-center font-medium text-secondary mt-3 leading-snug">
                        {lang === "hi"
                          ? "लक्ष्य: नहर के किनारे 5-6 पौधों की निचली पत्तियों पर हल्के पीले या भूरे निशान देखें"
                          : "Target: Check 5-6 stems near canal water border for pale yellowish lesions"}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* 3-STEP DIRECT WALKTHROUGH CARDS */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                      {lang === "hi" ? "सरल 3-कदम विधि" : "Tactile Guide"}
                    </span>
                    <h3 className="text-xl font-display font-bold text-primary">
                      {lang === "hi" ? "15 मिनट में आज की जांच कैसे पूरी करें" : "How to Complete Today's Check in 15 Minutes"}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    Step 1 of 3
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Step 1 */}
                  <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e8e7de] shadow-xs flex flex-col justify-between card-hover">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-primary flex items-center justify-center font-display font-black text-lg">1</div>
                      <div>
                        <h4 className="text-base font-bold text-charcoal">{lang === "hi" ? "जोन B पर जाएं" : "Walk to Zone B"}</h4>
                        <p className="text-xs font-semibold text-emerald-800">{lang === "hi" ? "नहर के गेट के पास" : "Near Canal Sluice Gate"}</p>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {lang === "hi"
                          ? "मेड़ से लगभग 40 कदम आगे उस ढलान वाले कोने पर जाएं जहाँ पानी रुका था।"
                          : "Take approximately 40 paces from your irrigation bund towards the low ridge."}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#ebeae2] flex items-center gap-1.5 text-xs font-semibold text-secondary">
                      <AppIcon name="pin_drop" className="w-4 h-4  text-emerald-700" />
                      <span>40 paces from sluice</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e8e7de] shadow-xs flex flex-col justify-between card-hover">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-primary flex items-center justify-center font-display font-black text-lg">2</div>
                      <div>
                        <h4 className="text-base font-bold text-charcoal">{lang === "hi" ? "निचले पत्तों को देखें" : "Inspect Leaf Collars"}</h4>
                        <p className="text-xs font-semibold text-emerald-800">{lang === "hi" ? "5 से 6 पौधे देखें" : "Check 5 to 6 Plants"}</p>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {lang === "hi"
                          ? "पानी के स्तर के पास के पत्तों को पलटकर देखें। क्या वे साफ हरे हैं या कोई दाग है?"
                          : "Gently turn leaf blades near the water level. Are they pure green or do you see spots?"}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#ebeae2] flex items-center gap-1.5 text-xs font-semibold text-secondary">
                      <AppIcon name="visibility" className="w-4 h-4  text-emerald-700" />
                      <span>Water level leaves</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-dashed border-primary/40 bg-emerald-50/30 shadow-xs flex flex-col justify-between card-hover">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-display font-black text-lg">3</div>
                      <div>
                        <h4 className="text-base font-bold text-charcoal">{lang === "hi" ? "नतीजा दर्ज करें" : "Record Outcome"}</h4>
                        <p className="text-xs font-semibold text-emerald-800">{lang === "hi" ? "फोटो या आवाज से बताएं" : "Photo, Clean, or Voice"}</p>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {lang === "hi"
                          ? "अगर सब साफ है तो 'सब ठीक है' दबाएं। अगर दाग दिखे तो एक फोटो खींचें।"
                          : "If clean green, tap 'All Clear'. If you notice lesions, take 1 quick photo to close the loop."}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 flex items-center gap-2">
                      <button
                        className="flex-1 py-2 px-3 bg-primary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#163624] transition-colors cursor-pointer"
                        onClick={() => setShowWalkthroughModal(true)}
                      >
                        <AppIcon name="fact_check" className="w-4 h-4" />
                        <span>{lang === "hi" ? "दर्ज करें" : "Record Now"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* KVK Call Banner */}
              <section className="bg-primary text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
                <div className="flex items-center gap-4 z-10">
                  <div className="relative flex items-center justify-center shrink-0">
                    <span className="ripple-ring absolute w-14 h-14 rounded-full bg-emerald-400/40"></span>
                    <button
                      className="relative w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                      onClick={() => setShowVoiceModal(true)}
                      title="Speak in Hindi/English"
                    >
                      <AppIcon name="mic" className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-base font-display font-bold">
                      {lang === "hi"
                        ? "तुरंत बोलकर पूछें या कृषि वैज्ञानिक से बात करें"
                        : "Need instant voice guidance or KVK consultation?"}
                    </h4>
                    <p className="text-xs text-emerald-100/90">
                      {lang === "hi"
                        ? "डॉ. पटेल (कृषि विज्ञान केंद्र) आज ड्यूटी पर उपलब्ध हैं।"
                        : "Dr. Patel (Block Agronomist, KVK Ranchi) is on duty today."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 z-10 w-full md:w-auto justify-end">
                  <button
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-charcoal font-bold text-xs shadow-md transition-all cursor-pointer"
                    onClick={() => setShowCallModal(true)}
                  >
                    <AppIcon name="call" className="w-[18px] h-[18px]" />
                    <span>{lang === "hi" ? "मुफ्त कॉल करें" : "Free Call Agronomist"}</span>
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: MY FARM & MAP (मेरा खेत व नक्शा)                         */}
          {/* =============================================================== */}
          {currentTab === "farm" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    {lang === "hi" ? "खेत का नक्शा और जोन स्थिति" : "Cadastral Zones & Spatial Health"}
                  </span>
                  <h2 className="text-2xl font-display font-extrabold text-primary">
                    {lang === "hi" ? "नामकुम खेत • प्लॉट 2 (1.2 एकड़)" : "Namkum Farm • Plot 2 (1.2 Acres)"}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white border border-[#ebeae2] rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
                    🛰️ Sentinel-2 L2A Normalized (NDVI 0.74)
                  </span>
                </div>
              </div>

              {/* Interactive Cadastral Map Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-[#e8e7de] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                      {lang === "hi" ? "जोन चुनें (क्लिक करें)" : "Interactive Zone Selector (Click a zone)"}
                    </span>
                    <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      NDVI: 0.74 (Optimal Tillering)
                    </span>
                  </div>

                  {/* Real Interactive Leaflet Cadastral Map */}
                  <CadastralLeafletMap
                    selectedZone={selectedZone}
                    onSelectZone={setSelectedZone}
                    lang={lang}
                  />

                  {/* 3 Zone Selector Cards below map */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedZone("A")}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                        selectedZone === "A"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 font-bold ring-1 ring-emerald-500 shadow-xs"
                          : "bg-muted/20 border-[#e5ece7] dark:border-white/10 hover:bg-muted/40"
                      }`}
                    >
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">ZONE A</div>
                      <div className="text-xs text-foreground font-semibold truncate">Upper Plot</div>
                      <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium">0.5 ac • 88% Healthy</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedZone("B")}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                        selectedZone === "B"
                          ? "bg-amber-50 dark:bg-amber-950/60 border-amber-500 font-bold ring-2 ring-amber-500 shadow-xs"
                          : "bg-muted/20 border-[#e5ece7] dark:border-white/10 hover:bg-muted/40"
                      }`}
                    >
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                        <span>ZONE B</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      </div>
                      <div className="text-xs text-foreground font-semibold truncate">Canal Basin</div>
                      <div className="text-[10px] text-amber-900 dark:text-amber-300 font-semibold">0.4 ac • Blast Alert</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedZone("C")}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                        selectedZone === "C"
                          ? "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 font-bold ring-1 ring-cyan-500 shadow-xs"
                          : "bg-muted/20 border-[#e5ece7] dark:border-white/10 hover:bg-muted/40"
                      }`}
                    >
                      <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold">ZONE C</div>
                      <div className="text-xs text-foreground font-semibold truncate">Well-head Ridge</div>
                      <div className="text-[10px] text-cyan-800 dark:text-cyan-300 font-medium">0.3 ac • Saturated</div>
                    </button>
                  </div>


                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-secondary pt-2 gap-1">
                    <span>📍 Lat: 23.3441° N, Lon: 85.3096° E (Namkum, Ranchi)</span>
                    <span>Soil: Clay-loam alluvial with adequate nitrogen</span>
                  </div>
                </div>

                {/* Zone Detailed Breakdown Panel */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e8e7de] shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-xs">
                        {zoneDetails[selectedZone].badge}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {zoneDetails[selectedZone].score}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-charcoal">{zoneDetails[selectedZone].title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {zoneDetails[selectedZone].desc}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <div className="flex justify-between text-xs py-1.5 border-b border-[#ebeae2]">
                        <span className="text-secondary">Soil Moisture</span>
                        <span className="font-bold text-charcoal">{zoneDetails[selectedZone].moisture}</span>
                      </div>
                      <div className="flex justify-between text-xs py-1.5 border-b border-[#ebeae2]">
                        <span className="text-secondary">NDVI Index</span>
                        <span className="font-bold text-charcoal">{zoneDetails[selectedZone].ndvi}</span>
                      </div>
                      <div className="flex justify-between text-xs py-1.5 border-b border-[#ebeae2]">
                        <span className="text-secondary">Standing Water</span>
                        <span className="font-bold text-charcoal">{zoneDetails[selectedZone].water}</span>
                      </div>
                      <div className="flex justify-between text-xs py-1.5">
                        <span className="text-secondary">Action Status</span>
                        <span className="font-bold text-amber-700">{zoneDetails[selectedZone].action}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#ebeae2]">
                    <button
                      className="w-full py-3 rounded-xl bg-primary hover:bg-[#163624] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      onClick={() => setShowWalkthroughModal(true)}
                    >
                      <AppIcon name="search" className="w-[18px] h-[18px]" />
                      <span>{lang === "hi" ? "इस जोन की जांच शुरू करें" : "Start Inspection for this Zone"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: ACTIONS & TASKS (काम सूची)                               */}
          {/* =============================================================== */}
          {currentTab === "actions" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    {lang === "hi" ? "खेत कार्य व प्राथमिकता" : "Field Operational Queue"}
                  </span>
                  <h2 className="text-2xl font-display font-extrabold text-primary">
                    {lang === "hi" ? "काम सूची व निरीक्षण" : "Farm Action Checklist"}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isActionCompleted ? "bg-zinc-100 text-zinc-500" : "bg-amber-100 text-amber-900"
                  }`}>
                    {isActionCompleted ? "0 Due Today" : "1 Due Today"}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-primary rounded-full">
                    {isActionCompleted ? "3 Completed ✓" : "2 Completed"}
                  </span>
                </div>
              </div>

              {/* Task Item 1 */}
              <div className={`bg-white rounded-2xl p-4 sm:p-6 border-2 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 card-hover ${
                isActionCompleted ? "border-emerald-500/40 bg-emerald-50/20" : "border-amber-500/40"
              }`}>
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isActionCompleted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    <AppIcon name={isActionCompleted ? "verified" : "pest_control"} className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 font-bold text-[11px] rounded-full uppercase ${
                        isActionCompleted ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-900"
                      }`}>
                        {isActionCompleted ? "Completed ✓" : "Due Today"}
                      </span>
                      <span className="text-xs font-medium text-secondary">
                        Zone B • {isActionCompleted ? "₹1,200 Saved" : "15 Mins • ₹0 Cost"}
                      </span>
                    </div>
                    <h4 className={`text-lg font-bold text-charcoal ${isActionCompleted ? "line-through opacity-80" : ""}`}>
                      {lang === "hi" ? "जोन B में पीले / हल्के पत्तों की जांच करें" : "Inspect Zone B for Yellow / Pale Leaf Blades"}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {isActionCompleted
                        ? (lang === "hi"
                            ? "सत्यापित: जोन B में पत्तियों का निरीक्षण पूर्ण हुआ। कोई फंगस नहीं मिला। क्लोज्ड लूप ऑडिट दर्ज।"
                            : "Verified: Physical inspection complete. Foliage healthy. Outcome recorded in closed loop audit trail.")
                        : (lang === "hi"
                            ? "निचली मेड़ पर 15 मिनट की पैदल जांच ताकि बिना किसी दवाई के शुरुआती लक्षण रोके जा सकें। 4-बिंदु व्यवहार्यता परीक्षण द्वारा सत्यापित।"
                            : "Quick field walk to detect early blight before any spray requirement. Validated by 4-point feasibility test.")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {isActionCompleted ? (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-300 flex items-center gap-1.5">
                      <AppIcon name="done_all" className="w-4 h-4 text-emerald-700" />
                      <span>Closed Loop Verified</span>
                    </span>
                  ) : (
                    <>
                      <button
                        className="px-3.5 py-2.5 bg-[#F6F5EF] hover:bg-emerald-100 text-primary font-bold text-xs rounded-xl border border-[#e8e7de] transition-colors cursor-pointer"
                        onClick={() => setShowWhyDrawer(true)}
                      >
                        Why?
                      </button>
                      <button
                        className="px-5 py-2.5 bg-primary hover:bg-[#163624] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                        onClick={() => setShowWalkthroughModal(true)}
                      >
                        <AppIcon name="play_circle" className="w-4 h-4" />
                        <span>Execute Task</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Task Item 2 */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e8e7de] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-95">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                    <AppIcon name="water_drop" className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-sky-100 text-sky-900 font-bold text-[11px] rounded-full uppercase">In Progress</span>
                      <span className="text-xs font-medium text-secondary">All Zones • Daily check</span>
                    </div>
                    <h4 className="text-base font-bold text-charcoal">Water Cushion Maintenance (2-3 cm)</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Maintain shallow water layer during tillering to stimulate maximum productive shoots per hill.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
                    Sensor active: 2.2 cm ✓
                  </span>
                </div>
              </div>

              {/* Task Item 3 */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e8e7de] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-80">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <AppIcon name="done_all" className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[11px] rounded-full uppercase">Completed (Sep 02)</span>
                      <span className="text-xs font-medium text-secondary">Zone A & C • ₹0 Cost</span>
                    </div>
                    <h4 className="text-base font-bold text-charcoal line-through">Check Perimeter Bunds for Rodent Burrows</h4>
                    <p className="text-xs text-secondary">Verified intact by Ravi Kumar via photo. Prevented water runoff.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Verified ✓
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 4: FARM JOURNEY & 7-STAGE CLOSED LOOP                       */}
          {/* =============================================================== */}
          {currentTab === "journey" && (
            <div className="space-y-7 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    {lang === "hi" ? "क्लोज्ड लूप वास्तुकला" : "The Closed Loop Architecture"}
                  </span>
                  <h2 className="text-2xl font-display font-extrabold text-primary">
                    {lang === "hi" ? "7-चरणीय सीख व सत्यापन लूप" : "7-Stage Learning Loop & Audit Trail"}
                  </h2>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-primary rounded-full">
                  Autonomous Learning Active
                </span>
              </div>

              {/* 7-Stage KisanLoop Diagram */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e8e7de] shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">
                  How Every Recommendation Evolves into Farm Wisdom
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2 text-center">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-lg">📡</span>
                    <h5 className="text-xs font-bold text-primary mt-1">1. DETECT</h5>
                    <p className="text-[10px] text-secondary mt-0.5">Weather & Satellite</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-lg">🧠</span>
                    <h5 className="text-xs font-bold text-primary mt-1">2. UNDERSTAND</h5>
                    <p className="text-[10px] text-secondary mt-0.5">Stage Vulnerability</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-lg">💡</span>
                    <h5 className="text-xs font-bold text-primary mt-1">3. RECOMMEND</h5>
                    <p className="text-[10px] text-secondary mt-0.5">Simple Field Action</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border-2 border-amber-400">
                    <span className="text-lg">⚖️</span>
                    <h5 className="text-xs font-bold text-amber-900 mt-1">4. FEASIBILITY</h5>
                    <p className="text-[10px] text-amber-800 mt-0.5">Cost & Labor Gate</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-lg">🚶‍♂️</span>
                    <h5 className="text-xs font-bold text-primary mt-1">5. ACT</h5>
                    <p className="text-[10px] text-secondary mt-0.5">Farmer Executes</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-lg">📸</span>
                    <h5 className="text-xs font-bold text-primary mt-1">6. VERIFY</h5>
                    <p className="text-[10px] text-secondary mt-0.5">Photo / Ground Truth</p>
                  </div>
                  <div className="p-3 bg-emerald-900 text-white rounded-xl shadow-xs">
                    <span className="text-lg">🔄</span>
                    <h5 className="text-xs font-bold text-emerald-200 mt-1">7. LEARN</h5>
                    <p className="text-[10px] text-emerald-300 mt-0.5">System Self-Updates</p>
                  </div>
                </div>
              </div>

              {/* Chronological Audit Trail */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e8e7de] shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-charcoal">Real Field Outcomes & Savings Log</h4>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Cumulative Saved: ₹2,040
                  </span>
                </div>
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#e8e7de]">
                  <div className="relative pl-8 space-y-1">
                    <div className={`absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      isActionCompleted ? "bg-emerald-600" : "bg-primary"
                    }`}></div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">Today, 08:30 AM</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        isActionCompleted ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                      }`}>
                        {isActionCompleted ? "Loop Closed & Verified ✓" : "Loop In Progress"}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-charcoal">
                      {isActionCompleted
                        ? "Zone B Visual Scouting Completed → Closed Loop Verified"
                        : "Precipitation Spike → Zone B Inspection Triggered"}
                    </h5>
                    <p className="text-xs text-secondary">
                      {isActionCompleted
                        ? "Farmer completed physical walk in Zone B. Zero blight symptoms confirmed. Prevented ₹1,200 chemical spray expenditure. System telemetry synced."
                        : "Rainfall (18mm) flagged early blight risk. Feasibility gate filtered out ₹1,200 prophylactic spray recommendation due to zero detected symptoms."}
                    </p>
                  </div>

                  <div className="relative pl-8 space-y-1">
                    <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white"></div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800">Aug 28 • Day 27</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded">Loop Closed & Verified</span>
                    </div>
                    <h5 className="text-sm font-bold text-charcoal">Stem Borer Early Scouting → Bio-Pheromone Trap Installed</h5>
                    <p className="text-xs text-secondary">
                      Farmer uploaded trap photo. Verified 0 larvae threshold. Saved ₹840 on unnecessary chemical insecticide.
                    </p>
                  </div>

                  <div className="relative pl-8 space-y-1">
                    <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white"></div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-800">Aug 18 • Day 17</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-bold rounded">System Learned from Barrier</span>
                    </div>
                    <h5 className="text-sm font-bold text-charcoal">Learning Engine Update: Urea Granules 45kg</h5>
                    <p className="text-xs text-secondary">
                      Farmer reported "Input Unavailable at Namkum Cooperative". KisanLoop updated village-level supply chain mapping and replaced with split compost top-dressing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 5: EXPERT HELP & KVK TRIAGE                                 */}
          {/* =============================================================== */}
          {currentTab === "expert" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    {lang === "hi" ? "कृषि विज्ञान केंद्र सीधा संपर्क" : "Human-in-the-Loop Safeguard"}
                  </span>
                  <h2 className="text-2xl font-display font-extrabold text-primary">
                    {lang === "hi" ? "विशेषज्ञ कृषि वैज्ञानिक सलाह" : "Expert Agronomist Consultation & Triage"}
                  </h2>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full font-bold text-xs">
                  Direct Helpline: 1800-180-1551 Free
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-emerald-800/20 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ebeae2]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-display font-bold text-lg">
                      KP
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-charcoal">Dr. K. Patel</h4>
                      <p className="text-xs text-secondary">Senior Plant Pathologist • Krishi Vigyan Kendra (KVK Ranchi)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-800">Available Now (9 AM - 6 PM)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F6F5EF] border border-[#e8e7de] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded uppercase">
                      Guardrail Trigger #KL-024
                    </span>
                    <span className="text-xs font-semibold text-secondary">Model Confidence: 78% (&lt; 85% Threshold)</span>
                  </div>
                  <p className="text-xs text-charcoal leading-relaxed">
                    When AI confidence falls below 85% or an unusual symptom pattern occurs, KisanLoop automatically routes the case to your assigned KVK Agronomist for secondary human verification before any costly intervention is suggested.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    className="px-5 py-3 rounded-xl bg-primary hover:bg-[#163624] text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                    onClick={() => setShowCallModal(true)}
                  >
                    <AppIcon name="call" className="w-[18px] h-[18px]" />
                    <span>1-Tap Audio Call (निःशुल्क फोन करें)</span>
                  </button>
                  <button
                    className="px-4 py-3 rounded-xl bg-[#F6F5EF] hover:bg-emerald-100 text-primary font-bold text-xs border border-[#e8e7de] flex items-center gap-1.5 transition-colors cursor-pointer"
                    onClick={() => setShowWalkthroughModal(true)}
                  >
                    <AppIcon name="add_a_photo" className="w-[18px] h-[18px]" />
                    <span>Attach Leaf Photo for Doctor</span>
                  </button>
                  <button
                    className="px-4 py-3 rounded-xl bg-[#F6F5EF] hover:bg-slate-200 text-charcoal font-bold text-xs border border-[#e8e7de] flex items-center gap-1.5 transition-colors cursor-pointer"
                    onClick={() => alert("SMS summary dispatched to Dr. Patel at KVK Ranchi desk.")}
                  >
                    <AppIcon name="sms" className="w-[18px] h-[18px]" />
                    <span>Send SMS Summary</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 6: FARM PROFILE & EDIT DETAILS                             */}
          {/* =============================================================== */}
          {currentTab === "profile" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    {lang === "hi" ? "किसान जानकारी व सेटिंग्स" : "Farmer Information & Preferences"}
                  </span>
                  <h2 className="text-2xl font-display font-extrabold text-primary">
                    {lang === "hi" ? "प्रोफ़ाइल व खेत विवरण" : "Profile & Farm Configuration"}
                  </h2>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-primary rounded-full">
                  Kisan ID: KL-JH-88219
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e8e7de] shadow-sm flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <img
                      alt={farmerName}
                      className="w-28 h-28 rounded-full object-cover border-4 border-primary shadow-md"
                      src={avatarUrl}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-charcoal">{farmerName}</h3>
                    <p className="text-xs text-secondary">{village}</p>
                  </div>
                  <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-[#ebeae2]">
                    <div className="p-2.5 bg-[#F6F5EF] rounded-xl">
                      <span className="text-[10px] font-semibold text-secondary uppercase block">Total Land</span>
                      <span className="text-sm font-bold text-primary">{acres}</span>
                    </div>
                    <div className="p-2.5 bg-[#F6F5EF] rounded-xl">
                      <span className="text-[10px] font-semibold text-secondary uppercase block">Active Crop</span>
                      <span className="text-sm font-bold text-primary">Rice (धान)</span>
                    </div>
                  </div>
                  <div className="w-full text-left pt-2 space-y-2 text-xs">
                    <div className="flex justify-between text-secondary">
                      <span>Soil Health Card:</span>
                      <span className="font-bold text-emerald-800">Verified (2024)</span>
                    </div>
                    <div className="flex justify-between text-secondary">
                      <span>Kisan Credit Card:</span>
                      <span className="font-bold text-charcoal">Linked</span>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-[#e8e7de] shadow-sm space-y-5">
                  <h4 className="text-base font-bold text-charcoal border-b border-[#ebeae2] pb-3">
                    Edit Details (विवरण संपादित करें)
                  </h4>
                  <form
                    className="space-y-4"
                    onSubmit={handleSaveProfile}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-secondary mb-1">Full Name (किसान का नाम)</label>
                        <input
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e7de] bg-[#F6F5EF] text-sm font-medium text-charcoal focus:ring-2 focus:ring-primary focus:outline-hidden"
                          value={farmerName}
                          onChange={(e) => setFarmerName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-secondary mb-1">Farm / Plot Name (खेत का नाम)</label>
                        <input
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e7de] bg-[#F6F5EF] text-sm font-medium text-charcoal focus:ring-2 focus:ring-primary focus:outline-hidden"
                          value={farmTitle}
                          onChange={(e) => setFarmTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-secondary mb-1">Land Holding (एकड़)</label>
                        <input
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e7de] bg-[#F6F5EF] text-sm font-medium text-charcoal focus:ring-2 focus:ring-primary focus:outline-hidden"
                          value={acres}
                          onChange={(e) => setAcres(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-secondary mb-1">Phone Number (मोबाइल नंबर)</label>
                        <input
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e7de] bg-[#F6F5EF] text-sm font-medium text-charcoal focus:ring-2 focus:ring-primary focus:outline-hidden"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-secondary mb-1">Village & District (गाँव व जिला)</label>
                        <input
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e7de] bg-[#F6F5EF] text-sm font-medium text-charcoal focus:ring-2 focus:ring-primary focus:outline-hidden"
                          value={village}
                          onChange={(e) => setVillage(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#ebeae2]">
                      <span className={`text-xs font-semibold text-emerald-800 transition-opacity ${profileSavedToast ? "opacity-100" : "opacity-0"}`}>
                        Profile saved to database ✓
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowProfileSetupModal(true)}
                          className="px-4 py-2.5 bg-[#ebf7eb] dark:bg-emerald-950/40 hover:bg-[#d8edd8] text-[#1b4332] dark:text-emerald-300 font-bold text-xs rounded-xl border border-[#d2ded5] dark:border-emerald-800 transition-all cursor-pointer"
                        >
                          {lang === "hi" ? "रोल बदलें / पूर्ण सेटअप" : "Switch Role / Full Setup"}
                        </button>
                        <button
                          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-[#163624] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60"
                          type="submit"
                          disabled={savingProfile}
                        >
                          {savingProfile && <AppIcon name="sync" className="w-3.5 h-3.5 animate-spin" />}
                          <span>
                            {savingProfile
                              ? lang === "hi"
                                ? "सहेज रहा है..."
                                : "Saving..."
                              : lang === "hi"
                              ? "परिवर्तन सुरक्षित करें"
                              : "Save Changes"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 7: CHAT (किसान AI चैट - Gemini 3.5 Flash)                  */}
          {/* =============================================================== */}
          {currentTab === "chat" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <FarmerChat
                farmerName={farmerName}
                lang={lang}
                farmId={farmState?.id || "farm_ravi_01"}
              />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="py-6 px-4 sm:px-10 text-center border-t border-[#ebeae2] mt-auto">
          <p className="text-xs text-secondary font-medium flex items-center justify-center gap-1.5">
            <AppIcon name="eco" className="w-4 h-4  text-emerald-700" />
            <span>KisanLoop Master • Action & Outcome Layer for Sustainable Smallholder Agriculture</span>
          </p>
        </footer>
      </div>

      {/* Floating Voice Assistant Button */}
      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40">
        <button
          className="relative flex items-center gap-2 px-3.5 sm:px-5 py-3 sm:py-3.5 rounded-full bg-primary hover:bg-[#163624] text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          onClick={() => setShowVoiceModal(true)}
        >
          <span className="ripple-ring absolute inset-0 rounded-full bg-emerald-400/30"></span>
          <AppIcon name="mic" className="w-5 h-5  sm:text-[22px] group-hover:rotate-12 transition-transform" />
          <span className="font-display font-bold text-xs tracking-wide">
            {lang === "hi" ? "बोलकर पूछें" : "Ask KisanLoop"}
          </span>
        </button>
      </div>

      {/* ==================== MOBILE BOTTOM APP DOCK ==================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ebeae2] px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => setCurrentTab("today")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            currentTab === "today"
              ? "text-[#214E34] bg-emerald-50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <AppIcon name="cottage" className="w-5 h-5" />
          <span>{lang === "hi" ? "खेत" : "Today"}</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab("farm")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            currentTab === "farm"
              ? "text-[#214E34] bg-emerald-50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <AppIcon name="map" className="w-5 h-5" />
          <span>{lang === "hi" ? "नक्शा" : "Map"}</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab("actions")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            currentTab === "actions"
              ? "text-[#214E34] bg-emerald-50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <AppIcon name="assignment_turned_in" className="w-5 h-5" />
          <span>{lang === "hi" ? "कार्य" : "Tasks"}</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab("expert")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            currentTab === "expert"
              ? "text-[#214E34] bg-emerald-50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <AppIcon name="support_agent" className="w-5 h-5" />
          <span>{lang === "hi" ? "सलाहकार" : "Expert"}</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab("chat")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            currentTab === "chat"
              ? "text-[#214E34] bg-emerald-50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <div className="relative">
            <AppIcon name="forum" className="w-5 h-5" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5"></span>
          </div>
          <span>{lang === "hi" ? "चैट" : "Chat"}</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab("profile")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            currentTab === "profile"
              ? "text-[#214E34] bg-emerald-50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <AppIcon name="account_circle" className="w-5 h-5" />
          <span>{lang === "hi" ? "प्रोफ़ाइल" : "Profile"}</span>
        </button>
      </nav>

      {/* =============================================================== */}
      {/* MODALS & DRAWERS                                                */}
      {/* =============================================================== */}

      {/* 1. WHY THIS RECOMMENDATION? DRAWER */}
      {showWhyDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl border-l border-[#e8e7de] animate-in slide-in-from-right duration-300">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#ebeae2]">
                <div className="flex items-center gap-2">
                  <AppIcon name="psychology" className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-bold text-lg text-charcoal">Decision Intelligence Trace</h3>
                </div>
                <button
                  className="p-1.5 rounded-lg hover:bg-[#F6F5EF] text-secondary cursor-pointer"
                  onClick={() => setShowWhyDrawer(false)}
                >
                  <AppIcon name="close" className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-1">1. Meteorological Sensor Signal</span>
                  <p className="text-secondary leading-relaxed">
                    Yesterday localized rain gauge registered 18.2mm, followed by sustained relative humidity &gt;75% for 9 continuous hours.
                  </p>
                </div>
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-1">2. Crop Stage Vulnerability</span>
                  <p className="text-secondary leading-relaxed">
                    Paddy is at Day 38 (Active Tillering). Leaf tissue is soft and nitrogen absorption is high, making lower sheaths susceptible to wet-spotting.
                  </p>
                </div>
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-900 block mb-1">3. The 4-Point Feasibility Gate Passed</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 mt-1">
                    <li><strong>Cost:</strong> ₹0 free (No chemical purchases needed)</li>
                    <li><strong>Labor:</strong> 1 person walk (Ravi Kumar himself)</li>
                    <li><strong>Input availability:</strong> Not required at this phase</li>
                    <li><strong>Timing:</strong> Morning between 8:00 AM - 11:00 AM</li>
                  </ul>
                </div>
                <div className="p-3.5 bg-[#F6F5EF] rounded-xl border border-[#e8e7de]">
                  <span className="font-bold text-charcoal block mb-1">Financial Return on Action</span>
                  <p className="text-secondary">
                    Taking 15 minutes to confirm healthy status prevents an unjustified prophylactic chemical spray costing ₹850 to ₹1,400.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#ebeae2]">
              <button
                className="w-full py-3 bg-primary hover:bg-[#163624] text-white rounded-xl font-bold text-xs cursor-pointer"
                onClick={() => {
                  setShowWhyDrawer(false);
                  setShowWalkthroughModal(true);
                }}
              >
                Proceed to Inspection Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CAN'T DO THIS? / WHAT STOPPED YOU? (Barrier Modal) */}
      {showBarrierModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-[#e8e7de] space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ebeae2]">
              <div className="flex items-center gap-2">
                <AppIcon name="troubleshoot" className="w-6 h-6 text-amber-600" />
                <div>
                  <h3 className="font-display font-bold text-lg text-charcoal">
                    {lang === "hi" ? "क्या रुकावट आई?" : "What stopped you?"}
                  </h3>
                  <p className="text-xs text-secondary">KisanLoop adapts when real life doesn't match the plan.</p>
                </div>
              </div>
              <button
                className="p-1 rounded-lg hover:bg-[#F6F5EF] text-secondary cursor-pointer"
                onClick={() => setShowBarrierModal(false)}
              >
                <AppIcon name="close" className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <button
                className="p-3 rounded-xl border border-[#e8e7de] bg-[#F6F5EF] hover:bg-amber-50 hover:border-amber-400 text-left transition-colors cursor-pointer"
                onClick={() => handleRecordBarrier("cost")}
              >
                <span className="text-lg">💰</span>
                <span className="block text-xs font-bold text-charcoal mt-1">₹ Too expensive</span>
                <span className="text-[10px] text-secondary">पैसे का खर्च ज्यादा</span>
              </button>
              <button
                className="p-3 rounded-xl border border-[#e8e7de] bg-[#F6F5EF] hover:bg-amber-50 hover:border-amber-400 text-left transition-colors cursor-pointer"
                onClick={() => handleRecordBarrier("supply")}
              >
                <span className="text-lg">🛒</span>
                <span className="block text-xs font-bold text-charcoal mt-1">Input unavailable</span>
                <span className="text-[10px] text-secondary">दुकान पर सामान नहीं मिला</span>
              </button>
              <button
                className="p-3 rounded-xl border border-[#e8e7de] bg-[#F6F5EF] hover:bg-amber-50 hover:border-amber-400 text-left transition-colors cursor-pointer"
                onClick={() => handleRecordBarrier("labor")}
              >
                <span className="text-lg">👨‍🌾</span>
                <span className="block text-xs font-bold text-charcoal mt-1">No labor today</span>
                <span className="text-[10px] text-secondary">मजदूर नहीं मिले</span>
              </button>
              <button
                className="p-3 rounded-xl border border-[#e8e7de] bg-[#F6F5EF] hover:bg-amber-50 hover:border-amber-400 text-left transition-colors cursor-pointer"
                onClick={() => handleRecordBarrier("weather")}
              >
                <span className="text-lg">🌧</span>
                <span className="block text-xs font-bold text-charcoal mt-1">Field too muddy</span>
                <span className="text-[10px] text-secondary">खेत में कीचड़ / बारिश</span>
              </button>
              <button
                className="p-3 rounded-xl border border-[#e8e7de] bg-[#F6F5EF] hover:bg-amber-50 hover:border-amber-400 text-left transition-colors cursor-pointer"
                onClick={() => handleRecordBarrier("time")}
              >
                <span className="text-lg">⏰</span>
                <span className="block text-xs font-bold text-charcoal mt-1">No time today</span>
                <span className="text-[10px] text-secondary">आज समय नहीं मिला</span>
              </button>
              <button
                className="p-3 rounded-xl border border-[#e8e7de] bg-[#F6F5EF] hover:bg-amber-50 hover:border-amber-400 text-left transition-colors cursor-pointer"
                onClick={() => handleRecordBarrier("understand")}
              >
                <span className="text-lg">❓</span>
                <span className="block text-xs font-bold text-charcoal mt-1">Didn't understand</span>
                <span className="text-[10px] text-secondary">सलाह समझ नहीं आई</span>
              </button>
            </div>

            {barrierAck && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold animate-fade-in">
                Feedback logged! KisanLoop has automatically adapted the action schedule and informed Dr. Patel.
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-charcoal rounded-xl text-xs font-bold cursor-pointer"
                onClick={() => setShowBarrierModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACTION WALKTHROUGH & OUTCOME RECORDING MODAL */}
      {showWalkthroughModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl p-4 sm:p-6 shadow-2xl border border-[#e8e7de] space-y-5 sm:space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ebeae2]">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                  Field Action Execution
                </span>
                <h3 className="font-display font-bold text-xl text-charcoal mt-1">Inspect Zone B Checklist</h3>
              </div>
              <button
                className="p-1 rounded-lg hover:bg-[#F6F5EF] text-secondary cursor-pointer"
                onClick={() => setShowWalkthroughModal(false)}
              >
                <AppIcon name="close" className="w-5 h-5" />
              </button>
            </div>

            {/* Checklist Steps */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 bg-[#F6F5EF] rounded-xl border border-[#e8e7de] cursor-pointer hover:bg-emerald-50 transition-colors">
                <input
                  type="checkbox"
                  checked={step1Checked}
                  onChange={(e) => setStep1Checked(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-xs font-bold text-charcoal">Step 1: Walked to Zone B Canal Ridge</span>
                  <p className="text-[11px] text-secondary">Reached low-lying boundary near water inflow point.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 bg-[#F6F5EF] rounded-xl border border-[#e8e7de] cursor-pointer hover:bg-emerald-50 transition-colors">
                <input
                  type="checkbox"
                  checked={step2Checked}
                  onChange={(e) => setStep2Checked(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-xs font-bold text-charcoal">Step 2: Inspected 5 Rice Tillers at Water Level</span>
                  <p className="text-[11px] text-secondary">Examined sheath collars for any early brown or yellow lesions.</p>
                </div>
              </label>
            </div>

            {/* Outcome Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-secondary uppercase block">
                What did you find? (खेत में क्या दिखा?)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                <button
                  type="button"
                  className={`p-3 rounded-xl text-center font-bold text-xs transition-all cursor-pointer ${
                    selectedOutcome === "healthy"
                      ? "border-2 border-emerald-600 bg-emerald-50 text-primary"
                      : "border border-[#e8e7de] bg-[#F6F5EF] text-charcoal hover:bg-amber-50"
                  }`}
                  onClick={() => setSelectedOutcome("healthy")}
                >
                  <span className="text-base block">🟢</span>
                  <span>All Clean & Healthy</span>
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-xl text-center font-bold text-xs transition-all cursor-pointer ${
                    selectedOutcome === "mild"
                      ? "border-2 border-amber-600 bg-amber-50 text-amber-900"
                      : "border border-[#e8e7de] bg-[#F6F5EF] text-charcoal hover:bg-amber-50"
                  }`}
                  onClick={() => setSelectedOutcome("mild")}
                >
                  <span className="text-base block">🟡</span>
                  <span>Small Spots Found</span>
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-xl text-center font-bold text-xs transition-all cursor-pointer ${
                    selectedOutcome === "severe"
                      ? "border-2 border-rose-600 bg-rose-50 text-rose-900"
                      : "border border-[#e8e7de] bg-[#F6F5EF] text-charcoal hover:bg-rose-50"
                  }`}
                  onClick={() => setSelectedOutcome("severe")}
                >
                  <span className="text-base block">🔴</span>
                  <span>Serious Blight</span>
                </button>
              </div>
            </div>

            {/* Evidence Attachment */}
            <div className="p-3 sm:p-3.5 bg-[#F6F5EF] rounded-xl border border-[#e8e7de] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AppIcon name="photo_camera" className="w-5 h-5 text-primary" />
                <div className="text-xs">
                  <span className="font-bold text-charcoal block">Attach Evidence (Optional)</span>
                  <span className={`text-secondary ${evidenceAttached ? "text-emerald-700 font-bold" : ""}`}>
                    {evidenceAttached ? "IMG_ZONE_B_PADDY.JPG attached (680 KB) ✓" : "Leaf photograph or audio voice note"}
                  </span>
                </div>
              </div>
              <button
                className="px-3 py-1.5 bg-white border border-[#e8e7de] hover:bg-emerald-50 text-primary font-bold text-xs rounded-lg cursor-pointer shrink-0"
                onClick={() => setEvidenceAttached(true)}
              >
                📷 Simulate Snap
              </button>
            </div>

            {/* Outcome Success Banner */}
            {outcomeSuccess && (
              <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-center space-y-1 animate-fade-in">
                <span className="text-sm font-bold text-primary block">Outcome Recorded Successfully! ✓</span>
                <p className="text-xs text-emerald-800">Closed Loop verified. Farm score updated to 85/100. ₹0 spend confirmed.</p>
              </div>
            )}

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ebeae2]">
              <button
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-secondary hover:bg-[#F6F5EF] cursor-pointer"
                onClick={() => setShowWalkthroughModal(false)}
              >
                Cancel
              </button>
              <button
                disabled={processingAction}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#163624] text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                onClick={submitWalkthroughOutcome}
              >
                {processingAction && <AppIcon name="sync" className="w-4 h-4  animate-spin" />}
                <span>Save & Complete Loop</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. VOICE ASSISTANT MODAL */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#e8e7de] text-center space-y-5 sm:space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                KisanLoop Voice AI
              </span>
              <button
                className="p-1 text-secondary hover:text-charcoal rounded-lg cursor-pointer"
                onClick={() => setShowVoiceModal(false)}
              >
                <AppIcon name="close" className="w-5 h-5" />
              </button>
            </div>

            {/* Microphone Button with Ripple Animation */}
            <div className="relative flex items-center justify-center py-4">
              <span className="ripple-ring absolute w-24 h-24 rounded-full bg-emerald-400/40"></span>
              <span className="ripple-ring-delayed absolute w-32 h-32 rounded-full bg-emerald-400/20"></span>
              <button
                className={`relative w-20 h-20 rounded-full text-white flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                  isListening ? "bg-amber-600 ring-4 ring-amber-300" : "bg-primary"
                }`}
                onClick={toggleVoiceRecording}
              >
                <AppIcon name="mic" className="w-9 h-9" />
              </button>
            </div>

            {/* Animated Soundwave */}
            <div className="flex items-center justify-center gap-1.5 h-8">
              <div className="w-1.5 bg-emerald-600 rounded-full soundwave-bar" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-1.5 bg-emerald-600 rounded-full soundwave-bar" style={{ animationDelay: "0.3s" }}></div>
              <div className="w-1.5 bg-emerald-600 rounded-full soundwave-bar" style={{ animationDelay: "0.5s" }}></div>
              <div className="w-1.5 bg-emerald-600 rounded-full soundwave-bar" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-1.5 bg-emerald-600 rounded-full soundwave-bar" style={{ animationDelay: "0.4s" }}></div>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-charcoal">{voiceStatus}</h4>
              <p className="text-xs text-secondary leading-relaxed">{voiceReply}</p>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                className="px-3 py-1.5 bg-[#F6F5EF] hover:bg-emerald-100 rounded-full text-xs font-semibold text-charcoal border border-[#e8e7de] transition-colors cursor-pointer"
                onClick={() => simulateVoiceQuery("आज क्या करना है?")}
              >
                "आज क्या करना है?"
              </button>
              <button
                className="px-3 py-1.5 bg-[#F6F5EF] hover:bg-emerald-100 rounded-full text-xs font-semibold text-charcoal border border-[#e8e7de] transition-colors cursor-pointer"
                onClick={() => simulateVoiceQuery("मौसम का हाल क्या है?")}
              >
                "मौसम का हाल क्या है?"
              </button>
              <button
                className="px-3 py-1.5 bg-[#F6F5EF] hover:bg-emerald-100 rounded-full text-xs font-semibold text-charcoal border border-[#e8e7de] transition-colors cursor-pointer"
                onClick={() => simulateVoiceQuery("दवा का खर्च कितना बचेगा?")}
              >
                "दवा का खर्च कितना बचेगा?"
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CALL SIMULATOR MODAL */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#163624] text-white max-w-sm w-full rounded-3xl p-8 text-center space-y-6 shadow-2xl border border-emerald-700 animate-in zoom-in-95 duration-200">
            <div className="w-24 h-24 rounded-full bg-primary mx-auto border-4 border-emerald-400/40 flex items-center justify-center text-3xl font-display font-bold shadow-lg">
              KP
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold">Dr. K. Patel</h3>
              <p className="text-xs text-emerald-200">Krishi Vigyan Kendra (KVK Ranchi)</p>
              <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold rounded-full animate-pulse">
                Connecting call... 00:04
              </span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Calling with your farm ID (KL-JH-88219). Dr. Patel has your field moisture telemetry and Zone B coordinates on his screen.
            </p>
            <div className="pt-4 flex items-center justify-center gap-6">
              <button
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                onClick={() => alert("Microphone muted")}
              >
                <AppIcon name="mic_off" className="w-5 h-5" />
              </button>
              <button
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                onClick={() => setShowCallModal(false)}
              >
                <AppIcon name="call_end" className="w-7 h-7" />
              </button>
              <button
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                onClick={() => alert("Speaker mode active")}
              >
                <AppIcon name="volume_up" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. PROFILE SETUP / ROLE SWITCHER MODAL */}
      <ProfileSetupModal
        isOpen={showProfileSetupModal}
        onClose={() => setShowProfileSetupModal(false)}
        initialData={{
          name: farmerName,
          phone,
          village,
          farmName: farmTitle,
          acres,
          role: userRole,
        }}
        onSaved={(data) => {
          if (data?.user?.name) setFarmerName(data.user.name);
          if (data?.farmer?.phone) setPhone(data.farmer.phone);
          if (data?.farmer?.village) setVillage(data.farmer.village);
          if (data?.farm?.name) setFarmTitle(data.farm.name);
          if (data?.farm?.totalAreaAcres) setAcres(`${data.farm.totalAreaAcres} Acres`);
          if (data?.user?.role) setUserRole(data.user.role);
          fetchData();
        }}
      />
    </div>
  );
}
