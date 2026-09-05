import { NextRequest, NextResponse } from "next/server";
import { farmStateService } from "@/lib/services/farm-state.service";
import { knowledgeService } from "@/lib/services/knowledge.service";

export async function POST(request: NextRequest) {
  try {
    const { message, farmId = "farm_ravi_01", language = "hi" } = await request.json();

    // 1. Enrich with real-time farm context & sensor telemetry
    const farmState = await farmStateService.getFarmState(farmId);

    // 2. Retrieve grounded knowledge chunks via RAG
    const knowledgeDocs = await knowledgeService.searchKnowledge(message, 2);
    const knowledgeContext = knowledgeDocs.map((k) => k.text).join("\n");

    // 3. Check if real AI provider is configured
    if (
      process.env.AI_PROVIDER === "google" &&
      process.env.GOOGLE_GENERATIVE_AI_API_KEY
    ) {
      try {
        const { google } = await import("@ai-sdk/google");
        const { generateText } = await import("ai");

        const prompt = `You are KisanLoop, an empathetic and practical agricultural advisor for Indian farmers.
Farmer Profile: Ravi Kumar, Ranchi, Jharkhand.
Crop: ${farmState.cropName} (${farmState.cropStage} stage).
Current Weather: Temp ${farmState.weather.temperatureC}°C, Humidity ${farmState.weather.humidityPercent}%, Forecast: ${farmState.weather.condition}, Rain probability: ${farmState.weather.rainProbabilityPercent}%, Rainfall expected: ${farmState.weather.rainfallMm}mm.
Soil Moisture: ${farmState.soil.moisturePercent}% (${farmState.soilMoisture}).
Retrieved Agronomic Knowledge:
${knowledgeContext}

Farmer's Question: "${message}"

Respond directly to the farmer in simple, clear ${language === "hi" ? "Hindi (Devanagari script)" : "English"}.
Structure:
- Direct, clear answer in 1-2 short sentences.
- Specific action to take today.
- What to monitor next.
Do not mention database or technical internals.`;

        const result = await generateText({
          model: google("gemini-1.5-flash"),
          prompt,
        });

        return NextResponse.json({
          success: true,
          data: {
            reply: result.text,
            sources: knowledgeDocs.map((k) => k.metadata.filename || k.documentId),
          },
        });
      } catch (aiErr) {
        console.warn("Google Gemini API error, falling back to deterministic answer:", aiErr);
      }
    }

    // 4. Deterministic Demo Mode response for Hero Farmer Ravi Kumar
    const isWateringQuestion =
      message.toLowerCase().includes("water") ||
      message.toLowerCase().includes("irrigate") ||
      message.includes("पानी") ||
      message.includes("सिंचाई");

    const reply = isWateringQuestion
      ? language === "hi"
        ? `आपके खेत में पहले से पर्याप्त नमी (${farmState.soil.moisturePercent}%) मौजूद है और कल भारी वर्षा (85% संभावना, ${farmState.weather.rainfallMm}mm) का पूर्वानुमान है।

**आज का सुझाव:** आज सिंचाई बिल्कुल न करें। 
**अगला कदम:** बारिश के बाद खेत की मेड़ और जल निकासी की जांच करें।`
        : `Your field already has adequate soil moisture (${farmState.soil.moisturePercent}%) and heavy rainfall is forecasted tomorrow (${farmState.weather.rainfallMm}mm, 85% probability).

**Today's Action:** Do not irrigate today.
**Next Step:** Inspect field drainage bunds after the rainfall.`
      : language === "hi"
      ? `नमस्ते रवि जी, आपके धान की फसल (IR-64, वानस्पतिक अवस्था) स्वस्थ स्थिति में है। कल भारी वर्षा का अनुमान है, इसलिए किसी भी प्रकार के रासायनिक छिड़काव या सिंचाई से बचें।`
      : `Namaste Ravi Kumar, your paddy crop (IR-64, vegetative stage) is in good health. Heavy rain is expected tomorrow, so please hold irrigation and chemical sprays.`;

    return NextResponse.json({
      success: true,
      data: {
        reply,
        sources: [
          "ICAR Package of Practices for Kharif Rice 2024",
          "IMD Ranchi Agro-Meteorological Advisory",
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "CHAT_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
