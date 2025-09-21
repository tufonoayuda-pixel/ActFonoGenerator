import { generateSpeechTherapyActivity } from "./openai";
// import { generateSpeechTherapyActivityWithGroq, validateGroqKey } from "./groq";
import { generateSpeechTherapyActivityWithGemini, validateGeminiKey } from "./gemini";
import { generateSpeechTherapyActivityWithDeepseek, validateDeepseekKey } from "./deepseek";
import { type ActivityGenerationRequest, type GeneratedActivity } from "./openai";

export type AIProvider = "openai" | "groq" | "gemini" | "deepseek";

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
}

export async function validateAPIKey(provider: AIProvider, apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    switch (provider) {
      case "openai":
        // Use existing OpenAI validation logic
        const OpenAI = require("openai");
        const openai = new OpenAI({ apiKey });
        await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Test" }],
          max_tokens: 5,
        });
        return { valid: true };
        
      case "groq":
        // Temporarily disable Groq validation due to module loading issue
        // const groqValid = await validateGroqKey(apiKey);
        // return { valid: groqValid };
        return { valid: apiKey.startsWith("gsk_") && apiKey.length > 50, error: "Validación básica de formato" };
        
      case "gemini":
        const geminiValid = await validateGeminiKey(apiKey);
        return { valid: geminiValid };
        
      case "deepseek":
        const deepseekValid = await validateDeepseekKey(apiKey);
        return { valid: deepseekValid };
        
      default:
        return { valid: false, error: "Proveedor no soportado" };
    }
  } catch (error) {
    console.error(`Error validating ${provider} API key:`, error);
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : "Error desconocido durante la validación" 
    };
  }
}

export async function generateActivityWithProvider(
  provider: AIProvider,
  apiKey: string,
  request: ActivityGenerationRequest
): Promise<GeneratedActivity> {
  switch (provider) {
    case "openai":
      // Use existing OpenAI service with provided API key
      const originalKey = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = apiKey;
      try {
        const result = await generateSpeechTherapyActivity(request);
        return result;
      } finally {
        // Restore original key
        if (originalKey) {
          process.env.OPENAI_API_KEY = originalKey;
        }
      }
      
    case "groq":
      // Temporarily return a mock response for Groq due to module loading issue
      throw new Error("Groq no está disponible temporalmente. Por favor usa otro proveedor.");
      // return await generateSpeechTherapyActivityWithGroq(request, apiKey);
      
    case "gemini":
      return await generateSpeechTherapyActivityWithGemini(request, apiKey);
      
    case "deepseek":
      return await generateSpeechTherapyActivityWithDeepseek(request, apiKey);
      
    default:
      throw new Error(`Proveedor ${provider} no soportado`);
  }
}

export function getProviderInfo(provider: AIProvider) {
  switch (provider) {
    case "openai":
      return {
        name: "OpenAI",
        models: ["GPT-4o", "GPT-4o-mini"],
        description: "Modelos avanzados de OpenAI con capacidades de razonamiento"
      };
    case "groq":
      return {
        name: "Groq",
        models: ["Llama 3.1 70B", "Llama 3.1 8B"],
        description: "Modelos ultrarrápidos optimizados para velocidad"
      };
    case "gemini":
      return {
        name: "Google Gemini",
        models: ["Gemini 2.5 Pro", "Gemini 2.5 Flash"],
        description: "Modelos multimodales de Google con capacidades avanzadas"
      };
    case "deepseek":
      return {
        name: "DeepSeek",
        models: ["DeepSeek Chat"],
        description: "Modelos de código abierto potentes y eficientes"
      };
    default:
      return { name: "Desconocido", models: [], description: "" };
  }
}
