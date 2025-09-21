import { GoogleGenAI } from "@google/genai";
import { type ActivityGenerationRequest, type GeneratedActivity } from "./openai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"

export async function validateGeminiKey(apiKey: string): Promise<boolean> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Test with a simple generation request
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Test",
    });
    
    return true;
  } catch (error) {
    console.error("Gemini API validation error:", error);
    return false;
  }
}

export async function generateSpeechTherapyActivityWithGemini(request: ActivityGenerationRequest, apiKey: string): Promise<GeneratedActivity> {
  const ai = new GoogleGenAI({ apiKey });
  
  const isChild = request.patientAge < 18 || request.isPediatric;
  
  let prompt = `
Eres un fonoaudiólogo experto en Chile. Genera una actividad terapéutica detallada y profesional considerando el contexto chileno.

DATOS DEL PACIENTE:
- Edad: ${request.patientAge} años
- Descripción: ${request.patientDescription}
- Objetivo específico: ${request.specificObjective}
- Duración: ${request.duration} minutos
- Tipo de sesión: ${request.sessionType}
- Sesión pediátrica: ${request.isPediatric ? 'Sí' : 'No'}
${request.customContext ? `- Contexto adicional: ${request.customContext}` : ''}

${request.pdfContents?.length ? `
REFERENCIAS PDF PROPORCIONADAS:
${request.pdfContents.join('\n\n')}
Utiliza estas referencias para fundamentar y enriquecer la actividad.
` : ''}

INSTRUCCIONES ESPECÍFICAS:
1. Adapta el lenguaje ${isChild ? 'de manera lúdica y motivadora para niños' : 'de forma profesional para adultos'}
2. Considera el contexto sociocultural chileno
3. Usa terminología fonoaudiológica apropiada
4. Incluye modismos o expresiones chilenas cuando sea relevante
5. Adapta a la realidad del sistema de salud chileno

Responde ÚNICAMENTE con un JSON válido en este formato exacto:
{
  "title": "Título de la actividad",
  "smartObjective": "Objetivo SMART específico y medible",
  "description": "Descripción general de la actividad",
  "materials": ["Material 1", "Material 2", "Material 3"],
  "procedure": [
    {
      "name": "Fase de calentamiento",
      "time": 10,
      "description": "Descripción detallada de esta fase"
    },
    {
      "name": "Fase principal",
      "time": 25,
      "description": "Descripción detallada de esta fase"
    },
    {
      "name": "Fase de cierre",
      "time": 10,
      "description": "Descripción detallada de esta fase"
    }
  ],
  "evaluation": {
    "criteria": "Criterios específicos de evaluación",
    "methods": ["Método 1", "Método 2"],
    "feedback": "Tipo de retroalimentación a proporcionar"
  },
  "adaptations": ["Adaptación 1", "Adaptación 2", "Adaptación 3"],
  "theoreticalFoundation": "Fundamentación teórica basada en evidencia actualizada"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: "Eres un fonoaudiólogo experto con experiencia en el sistema de salud chileno. Generas actividades terapéuticas basadas en evidencia científica actualizada.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            smartObjective: { type: "string" },
            description: { type: "string" },
            materials: { 
              type: "array", 
              items: { type: "string" } 
            },
            procedure: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  time: { type: "number" },
                  description: { type: "string" }
                },
                required: ["name", "time", "description"]
              }
            },
            evaluation: {
              type: "object",
              properties: {
                criteria: { type: "string" },
                methods: { 
                  type: "array", 
                  items: { type: "string" } 
                },
                feedback: { type: "string" }
              },
              required: ["criteria", "methods", "feedback"]
            },
            adaptations: { 
              type: "array", 
              items: { type: "string" } 
            },
            theoreticalFoundation: { type: "string" }
          },
          required: ["title", "smartObjective", "description", "materials", "procedure", "evaluation", "adaptations", "theoreticalFoundation"]
        }
      },
      contents: prompt,
    });

    const generatedContent = response.text;
    if (!generatedContent) {
      throw new Error("No se recibió contenido de Gemini");
    }

    const activity: GeneratedActivity = JSON.parse(generatedContent);
    
    // Validate the structure
    if (!activity.title || !activity.smartObjective || !activity.procedure || !Array.isArray(activity.materials)) {
      throw new Error("Estructura de actividad inválida recibida de Gemini");
    }

    return activity;
  } catch (error) {
    console.error("Error generando actividad con Gemini:", error);
    throw new Error(`Error al generar actividad con Gemini: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}
