import Groq from "groq-sdk";
import { type ActivityGenerationRequest, type GeneratedActivity } from "./openai";

export async function validateGroqKey(apiKey: string): Promise<boolean> {
  try {
    const groq = new Groq({ apiKey });
    
    // Test with a simple completion request
    await groq.chat.completions.create({
      messages: [{ role: "user", content: "Test" }],
      model: "llama-3.1-8b-instant",
      max_tokens: 5,
    });
    
    return true;
  } catch (error) {
    console.error("Groq API validation error:", error);
    return false;
  }
}

export async function generateSpeechTherapyActivityWithGroq(request: ActivityGenerationRequest, apiKey: string): Promise<GeneratedActivity> {
  const groq = new Groq({ apiKey });
  
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
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un fonoaudiólogo experto con experiencia en el sistema de salud chileno. Generas actividades terapéuticas basadas en evidencia científica actualizada. Responde SOLO con JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const generatedContent = response.choices[0].message.content;
    if (!generatedContent) {
      throw new Error("No se recibió contenido de Groq");
    }

    const activity: GeneratedActivity = JSON.parse(generatedContent);
    
    // Validate the structure
    if (!activity.title || !activity.smartObjective || !activity.procedure || !Array.isArray(activity.materials)) {
      throw new Error("Estructura de actividad inválida recibida de Groq");
    }

    return activity;
  } catch (error) {
    console.error("Error generando actividad con Groq:", error);
    throw new Error(`Error al generar actividad con Groq: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}
