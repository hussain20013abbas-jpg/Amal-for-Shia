import { GoogleGenAI } from '@google/genai';

export interface AiConsultationOptions {
  school: string;
  scholar: string;
}

export const askGeminiChat = async (prompt: string, options: AiConsultationOptions) => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
    
    const systemInstruction = `You are a knowledgeable and respectful Islamic scholar assistant. 
You are providing guidance based on the ${options.school} school of thought, specifically referencing the views of ${options.scholar} where applicable.
Always be respectful, cite your sources (Quranic verses, Hadith, or scholarly works) when possible, and clarify that your advice is for educational purposes and users should consult their local Marja or scholar for definitive religious rulings (Fatwas).
Format your response using Markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "I'm sorry, I couldn't generate a response at this time.";
    
    // Extract sources if available from grounding metadata
    const sources: { title: string; url: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({ title: chunk.web.title, url: chunk.web.uri });
        }
      });
    }

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to consult the AI scholar.");
  }
};
