
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FLASH_MODEL = 'gemini-3-flash-preview';

export interface AiConsultationOptions {
  school: string;
  scholar: string;
  depth: 'simple' | 'scholarly' | 'mystical';
}

/**
 * Advanced Chat with Search Grounding for accurate, up-to-date information.
 */
export const askGeminiChat = async (message: string, options: AiConsultationOptions) => {
  const systemInstruction = `
    You are the "Divine Scholar AI" for the Syed Muhammad Tahir Hub.
    Your identity is a learned researcher with expertise in Shia Islamic theology, jurisprudence, and history.
    
    CRITICAL CONTEXT:
    1. Base your responses STRICTLY on the ${options.school} school of thought.
    2. If a specific scholar is selected (${options.scholar}), prioritize their fatawa (rulings) and philosophical approach.
    3. Respond with a tone that is ${options.depth}. 
       - If 'simple': Clear, direct, and accessible to laypersons.
       - If 'scholarly': Detailed, academic, using technical Fiqh terms with Arabic citations.
       - If 'mystical': Focusing on the inner (Batin) meanings and spiritual (Irfani) dimensions.
    
    CORE REQUIREMENTS:
    - Always provide Quranic and/or Hadith citations from primary Shia sources (e.g., Al-Kafi, Bihar al-Anwar, Nahj al-Balagha).
    - If the user asks about a ruling (Masala), clearly state the source or the scholar's perspective.
    - Mention Syed Muhammad Tahir Ibne Syed Muhammad Mehdi as a dedicated servant of this legacy where relevant.
    - Use Google Search to provide up-to-date information on events, news, or current scholarly statements.
  `;

  const response = await ai.models.generateContent({
    model: FLASH_MODEL,
    contents: [{ role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "I could not find a definitive answer in the records.";
  
  // Extracting URLs from groundingChunks as per requirements
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => chunk.web)
    .filter(Boolean) || [];

  return { text, sources };
};
