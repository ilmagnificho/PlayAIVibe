import { GoogleGenAI, Type } from "@google/genai";
import { BeatmapNote } from "../types";

// This service handles the "AI" part: Converting Audio context/description to Beatmap JSON
// Note: Real audio processing happens on backend or via WebAudio API analysis -> Text Prompt
// Here we assume we send a text description of the music to Gemini to get the rhythm pattern.

// Ensure API key is handled correctly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBeatmapFromDescription = async (songDescription: string): Promise<BeatmapNote[]> => {
  if (!process.env.API_KEY) {
      console.warn("No API Key found. Returning empty.");
      return [];
  }

  // Updated to recommended model for text tasks
  const model = "gemini-3-flash-preview"; 
  
  const systemInstruction = `
    You are a rhythm game level designer. 
    Create a JSON beatmap for a 4-key rhythm game based on the song description.
    Lanes are 0, 1, 2, 3.
    Time is in seconds.
    The song is approx 60 seconds long.
    Output pure JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Song style: ${songDescription}. Generate 20-30 notes.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.NUMBER },
              lane: { type: Type.INTEGER }, // 0-3
              type: { type: Type.STRING }, // 'short' or 'long'
              duration: { type: Type.NUMBER }
            },
            required: ["time", "lane", "type"]
          }
        }
      }
    });

    const text = response.text;
    if (text) {
        return JSON.parse(text) as BeatmapNote[];
    }
    return [];

  } catch (error) {
    console.error("Gemini Beatmap Generation Failed:", error);
    return [];
  }
};