"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "hi" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  hi: {
    appName: "किसानलूप (KisanLoop)",
    tagline: "कृषि सूचना से व्यावहारिक कदम तक",
    farmer: "किसान (Farmer)",
    expert: "कृषि विशेषज्ञ (Expert)",
    government: "सरकारी / प्रसार डैशबोर्ड (Govt)",
    knowledge: "ज्ञान एवं डेटा केंद्र (Knowledge & Data)",
    namaste: "नमस्ते",
    todayAction: "आज का प्रमुख कदम",
    cropHealth: "फसल स्वास्थ्य",
    soilMoisture: "मृदा नमी",
    weatherRisk: "मौसम जोखिम",
    pestRisk: "कीट / रोग जोखिम",
    done: "कर लिया (Done)",
    couldNotDo: "यह नहीं कर सके",
    listen: "सुनें (Listen)",
    askQuestion: "किसान मित्र से पूछें",
    speakPrompt: "माइक दबाकर बोलें...",
    checkCrop: "फसल की जांच करें (Check Crop)",
    takePhoto: "पत्ती की तस्वीर लें / अपलोड करें",
    analyzing: "विश्लेषण हो रहा है...",
    myFarm: "मेरा खेत (My Farm)",
    recommendationPassport: "सिफारिश पासपोर्ट (Passport)",
    resetDemo: "डेमो रीसेट करें",
    themeProfessional: "व्यावसायिक (Professional)",
    themeFarmer: "किसान-मित्र (Farmer Friendly)",
    themePremium: "प्रीमियम (Premium)",
    actionableAdvisoryRate: "कार्रवाई योग्य परामर्श दर (Actionable Advisory Rate)",
  },
  en: {
    appName: "KisanLoop",
    tagline: "From Agricultural Intelligence to Agricultural Action",
    farmer: "Farmer Portal",
    expert: "Agricultural Expert",
    government: "Government / Extension",
    knowledge: "Knowledge & Datasets",
    namaste: "Namaste",
    todayAction: "Today's Recommended Action",
    cropHealth: "Crop Health",
    soilMoisture: "Soil Moisture",
    weatherRisk: "Weather Risk",
    pestRisk: "Pest / Disease Risk",
    done: "Done",
    couldNotDo: "I couldn't do this",
    listen: "Listen",
    askQuestion: "Ask KisanLoop AI",
    speakPrompt: "Tap microphone to speak...",
    checkCrop: "Check Crop (Vision AI)",
    takePhoto: "Take photo or upload leaf image",
    analyzing: "Analyzing with Vision Model...",
    myFarm: "My Farm",
    recommendationPassport: "Recommendation Passport",
    resetDemo: "Reset Demo Data",
    themeProfessional: "Professional",
    themeFarmer: "Farmer Friendly",
    themePremium: "Premium",
    actionableAdvisoryRate: "Actionable Advisory Rate",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "hi",
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("hi");

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
