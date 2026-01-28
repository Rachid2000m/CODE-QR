import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please set the API_KEY environment variable.");
  }
  return new GoogleGenAI({ apiKey });
};

export const parseNaturalLanguageToQR = async (prompt: string): Promise<AIResponse> => {
  const ai = getClient();
  
  const systemInstruction = `
    You are an expert QR Code Data Formatter. Your job is to take natural language user requests and convert them into the standard string formats used by QR code scanners.
    
    Supported Formats and Examples:
    1. URL: https://example.com
    2. WIFI: WIFI:T:WPA;S:MyNetwork;P:MyPassword;; (Handle WPA/WEP/nopass)
    3. EMAIL: mailto:user@example.com?subject=Hello&body=World
    4. SMS: smsto:+1234567890:Message body
    5. PHONE: tel:+1234567890
    6. GEO: geo:37.7749,-122.4194
    7. VCARD: BEGIN:VCARD\nVERSION:3.0\nN:Doe;John\nTEL:5555555555\nEMAIL:john@example.com\nEND:VCARD (Format minimally but correctly)
    8. EVENT (iCal): BEGIN:VEVENT\nSUMMARY:Party\nDTSTART:20240101T120000Z\nEND:VEVENT
    9. TEXT: Just plain text if no other format matches.

    Rules:
    - Extract the intent and details.
    - If information is missing (e.g., wifi password), do your best or leave it empty if the format allows.
    - If the request is ambiguous, default to TEXT.
    - Return a JSON object with the formatted string, the detected type, and a short explanation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            formattedString: { type: Type.STRING, description: "The exact raw string to be encoded into the QR code." },
            explanation: { type: Type.STRING, description: "Brief description of what was created (e.g., 'WiFi Network Configuration')." },
            type: { 
              type: Type.STRING, 
              enum: ['text', 'url', 'wifi', 'email', 'phone', 'sms', 'vcard', 'geo', 'event'],
              description: "The category of the QR code."
            }
          },
          required: ["formattedString", "explanation", "type"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to interpret request. Please try again.");
  }
};
