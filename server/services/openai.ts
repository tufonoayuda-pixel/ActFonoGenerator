import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ActivityGenerationRequest {
  patientAge: number;
  patientDescription: string;
  specificObjective: string;
  duration: number;
  sessionType: string;
  isPediatric: boolean;
  customContext?: string;
  pdfContents?: string[];
}

export interface GeneratedActivity {
  title: string;
  smartObjective: string;
  description: string;
  materials: string[];
  procedure: Array<{
    name: string;
    time: number;
    description: string;
  }>;
  evaluation: {
    criteria: string;
    methods: string[];
    feedback: string;
  };
  adaptations: string[];
  theoreticalFoundation: string;
}

export async function generateSpeechTherapyActivity(request: ActivityGenerationRequest): Promise<GeneratedActivity> {
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
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "Eres un fonoaudiólogo experto con experiencia en el sistema de salud chileno. Generas actividades terapéuticas basadas en evidencia científica actualizada."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const generatedContent = response.choices[0].message.content;
    if (!generatedContent) {
      throw new Error("No se recibió contenido de OpenAI");
    }

    const activity: GeneratedActivity = JSON.parse(generatedContent);
    
    // Validate the structure
    if (!activity.title || !activity.smartObjective || !activity.procedure || !Array.isArray(activity.materials)) {
      throw new Error("Estructura de actividad inválida recibida de OpenAI");
    }

    return activity;
  } catch (error) {
    console.error("Error generando actividad:", error);
    throw new Error(`Error al generar actividad: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}
