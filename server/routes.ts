import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateActivitySchema } from "@shared/schema";
import { generateSpeechTherapyActivity } from "./services/openai";
import { upload, extractTextFromPDF } from "./services/pdf-processor";
import { validateAPIKey, generateActivityWithProvider, type AIProvider } from "./services/ai-coordinator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate speech therapy activity
  app.post("/api/generate-activity", upload.array('pdfs', 10), async (req, res) => {
    try {
      const { aiProvider, apiKey, ...formData } = req.body;
      
      if (!aiProvider || !apiKey) {
        return res.status(400).json({
          success: false,
          error: "Proveedor de IA y API key son requeridos"
        });
      }

      const validatedData = generateActivitySchema.parse(formData);
      
      // Process uploaded PDFs if any
      let pdfContents: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          try {
            const text = await extractTextFromPDF(file.buffer);
            pdfContents.push(text);
          } catch (error) {
            console.error('Error processing PDF:', error);
            // Continue without this PDF rather than failing entirely
          }
        }
      }

      // Generate activity using selected provider
      const activity = await generateActivityWithProvider(
        aiProvider as AIProvider,
        apiKey,
        {
          ...validatedData,
          pdfContents: pdfContents.length > 0 ? pdfContents : undefined,
        }
      );

      // Store the activity
      const savedActivity = await storage.createActivity({
        ...validatedData,
        generatedActivity: activity,
      });

      res.json({ 
        success: true, 
        activity,
        activityId: savedActivity.id,
        provider: aiProvider
      });
    } catch (error) {
      console.error("Error generating activity:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      });
    }
  });

  // Get activity by ID
  app.get("/api/activities/:id", async (req, res) => {
    try {
      const activity = await storage.getActivity(req.params.id);
      if (!activity) {
        return res.status(404).json({ 
          success: false, 
          error: 'Actividad no encontrada' 
        });
      }
      res.json({ success: true, activity });
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al obtener la actividad' 
      });
    }
  });

  // Validate API key for different providers
  app.post("/api/validate-key", async (req, res) => {
    try {
      const { provider, apiKey } = req.body;
      
      if (!provider || !apiKey) {
        return res.status(400).json({
          success: false,
          valid: false,
          error: "Proveedor y API key son requeridos"
        });
      }

      const validation = await validateAPIKey(provider as AIProvider, apiKey);
      
      res.json({
        success: true,
        valid: validation.valid,
        provider: provider,
        error: validation.error,
        message: validation.valid 
          ? `API Key de ${provider.toUpperCase()} válida` 
          : `API Key de ${provider.toUpperCase()} inválida`
      });
    } catch (error) {
      console.error("Error validating API key:", error);
      res.status(500).json({
        success: false,
        valid: false,
        error: error instanceof Error ? error.message : 'Error validando API Key'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
