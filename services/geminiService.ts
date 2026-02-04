
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Transaction, ChatMessage, ImageSize } from "../types";

export const getGeminiChatResponse = async (
  message: string,
  history: ChatMessage[],
  transactions: Transaction[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const context = `
    You are a financial assistant for an app called "ช่วยเก็บตัง".
    Current User Data:
    Transactions: ${JSON.stringify(transactions)}
    Total Balance: ${transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0)}
    
    Answer user queries in Thai professionally and helpfully.
  `;

  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: context,
    },
  });

  // Convert history to Gemini format if needed, but for simplicity we'll just send current message
  return await chat.sendMessageStream({ message });
};

export const generateFinancialImage = async (prompt: string, size: ImageSize) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
