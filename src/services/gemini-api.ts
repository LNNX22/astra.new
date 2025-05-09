
import { Message } from "@/types/chat";
import { toast } from "@/hooks/use-toast";

// Get API key from environment variable if available
export const getEnvApiKey = () => {
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  return "";
};

export const callGeminiAPI = async (content: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key Required");
  }

  const API_REQUEST_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(API_REQUEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: content }]
        }
      ]
    })
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  let aiResponse = "No response received from API";
  
  if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
    aiResponse = data.candidates[0].content.parts[0].text || "Empty response received";
  }
  
  return aiResponse;
};

export const callGeminiAPIWithFile = async (
  prompt: string,
  apiKey: string,
  fileBase64: string,
  fileType: "image" | "pdf",
  mimeType: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key Required");
  }

  console.log("Sending request to Gemini with prompt:", prompt);

  // Gemini 1.5 supports both images and PDFs
  const API_REQUEST_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  // Prepare the request body based on file type
  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: fileBase64
            }
          }
        ]
      }
    ]
  };

  const response = await fetch(API_REQUEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API Error:", errorData);
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  let aiResponse = "No response received from API";
  
  if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
    aiResponse = data.candidates[0].content.parts[0].text || "Empty response received";
  }
  
  return aiResponse;
};

export const generateChatTitle = (content: string): string => {
  return content.slice(0, 30) + (content.length > 30 ? "..." : "");
};
