import {
  SpeechToTextProvider,
  TextToSpeechProvider,
  TranscriptionResult,
  TextToSpeechResult,
} from "./types";

export class DemoSpeechToTextAdapter implements SpeechToTextProvider {
  async transcribe(audioBlobOrBase64: string): Promise<TranscriptionResult> {
    // Default demonstration voice prompt for Ravi Kumar
    return {
      text: "क्या मुझे आज अपने धान के खेत में पानी देना चाहिए?", // "Should I irrigate my paddy field today?"
      confidence: 0.95,
      language: "hi",
    };
  }
}

export class DemoTextToSpeechAdapter implements TextToSpeechProvider {
  async synthesize(text: string, language: string = "hi"): Promise<TextToSpeechResult> {
    // Returns instruction to use client-side Web Speech Synthesis (SpeechSynthesisUtterance)
    return {
      mimeType: "audio/webm",
      // Client-side fallback handles this via window.speechSynthesis
    };
  }
}

export const sttProvider: SpeechToTextProvider = new DemoSpeechToTextAdapter();
export const ttsProvider: TextToSpeechProvider = new DemoTextToSpeechAdapter();
