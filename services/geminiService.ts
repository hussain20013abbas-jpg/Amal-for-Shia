
import { GoogleGenAI, Modality, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PRO_MODEL = 'gemini-3-pro-preview';
const FLASH_MODEL = 'gemini-3-flash-preview';
const FLASH_LITE_MODEL = 'gemini-2.5-flash-lite-latest';
const IMAGE_GEN_MODEL = 'gemini-3-pro-image-preview';
const VIDEO_GEN_MODEL = 'veo-3.1-fast-generate-preview';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

/**
 * Advanced Chat with Thinking Mode
 */
export const askGeminiChat = async (message: string) => {
  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: [{ role: 'user', parts: [{ text: message }] }],
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });
  return response.text;
};

/**
 * Quick Response with Flash Lite
 */
export const getFastResponse = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: FLASH_LITE_MODEL,
    contents: prompt,
  });
  return response.text;
};

/**
 * Image Generation with Gemini 3 Pro Image
 */
export const generateDivineImage = async (prompt: string, size: '1K' | '2K' | '4K' = '1K', aspectRatio: string = "1:1") => {
  const response = await ai.models.generateContent({
    model: IMAGE_GEN_MODEL,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: aspectRatio as any
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

/**
 * Image Analysis
 */
export const analyzeImage = async (base64: string, prompt: string) => {
  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: {
      parts: [
        { inlineData: { data: base64.split(',')[1], mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    }
  });
  return response.text;
};

/**
 * Video Generation with Veo
 */
export const generateVeoVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  let operation = await ai.models.generateVideos({
    model: VIDEO_GEN_MODEL,
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

/**
 * Text to Speech
 */
export const speakText = async (text: string) => {
  const response = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return null;

  return base64Audio;
};

/**
 * Maps Grounding with User Location
 */
export const searchMaps = async (query: string, lat: number, lng: number) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    }
  });

  const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => chunk.maps)
    .filter(Boolean) || [];

  return { text: response.text, links };
};

export const getIslamicGuidance = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `Provide an advanced, deep-diving response based on Shia Ja'fari school of thought (Ahlulbayt path). 
      Query: ${query}`,
      config: {
        systemInstruction: "You are the Ultimate Shia Clerical Assistant. Ground your answer strictly in primary Shia sources.",
        tools: [{ googleSearch: {} }],
      }
    });

    return { 
      text: response.text || "No response received.", 
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web).filter(Boolean) || []
    };
  } catch (error) {
    console.error("Advanced AI Error:", error);
    throw error;
  }
};
