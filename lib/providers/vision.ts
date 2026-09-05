import { VisionDiagnosisResult, VisionProvider } from "./types";

export class DemoVisionAdapter implements VisionProvider {
  async analyzeCropImage(
    imageBufferOrBase64: string,
    cropName: string = "Paddy"
  ): Promise<VisionDiagnosisResult> {
    // Deterministic diagnosis for hackathon repeatability
    return {
      pestOrDiseaseName: "Paddy Leaf Blast (धान का झुलसा रोग - Pyricularia oryzae)",
      confidence: 0.78,
      severity: "MODERATE",
      symptoms: [
        "Spindle-shaped brown lesions with grayish centers on upper leaf blades",
        "Early yellow halos around older spots",
        "Isolated lesions on tiller leaf sheaths",
      ],
      requiresExpertReview: true, // Confidence < 0.85 requires review
      recommendedImmediateAction:
        "Avoid high nitrogen top-dressing. Prepare for targeted bio-fungicide (Pseudomonas fluorescens) or NSKE 5% spray.",
    };
  }
}

export class GeminiVisionAdapter implements VisionProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeCropImage(
    imageBufferOrBase64: string,
    cropName: string = "Paddy"
  ): Promise<VisionDiagnosisResult> {
    try {
      // In real mode, use Gemini vision via generateObject/AI SDK
      const { google } = await import("@ai-sdk/google");
      const { generateObject } = await import("ai");
      const { z } = await import("zod");

      const prompt = `You are a plant pathologist specializing in Indian agriculture. Analyze this image of a ${cropName} plant.
Identify whether there are visible pests, fungal/bacterial diseases, or nutrient deficiencies.
Output structured diagnosis including disease name, confidence (0.0 - 1.0), severity, symptoms, and immediate action.`;

      const result = await generateObject({
        model: google("gemini-1.5-flash"),
        schema: z.object({
          pestOrDiseaseName: z.string(),
          confidence: z.number().min(0).max(1),
          severity: z.enum(["LOW", "MODERATE", "HIGH"]),
          symptoms: z.array(z.string()),
          requiresExpertReview: z.boolean(),
          recommendedImmediateAction: z.string(),
        }),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image", image: imageBufferOrBase64 },
            ],
          },
        ],
      });

      return result.object;
    } catch (err) {
      console.warn("GeminiVisionAdapter failed, falling back to DemoVisionAdapter:", err);
      return new DemoVisionAdapter().analyzeCropImage(imageBufferOrBase64, cropName);
    }
  }
}

const isExplicitDemo = process.env.DEMO_MODE === "true";
const visionKey = process.env.VISION_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export const visionProvider: VisionProvider =
  !isExplicitDemo && visionKey
    ? new GeminiVisionAdapter(visionKey)
    : new DemoVisionAdapter();
