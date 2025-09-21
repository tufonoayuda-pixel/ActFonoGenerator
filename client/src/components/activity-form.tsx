import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateActivitySchema, type GenerateActivityRequest } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import PDFUpload from "@/components/pdf-upload";
import { generateActivity } from "@/lib/api";

interface ActivityFormProps {
  onActivityGenerated: (activity: any) => void;
}

export default function ActivityForm({ onActivityGenerated }: ActivityFormProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const { toast } = useToast();

  const form = useForm<GenerateActivityRequest>({
    resolver: zodResolver(generateActivitySchema),
    defaultValues: {
      patientAge: 35,
      patientDescription: "",
      specificObjective: "",
      duration: 45,
      sessionType: "individual",
      isPediatric: false,
      customContext: "",
    },
  });

  const watchDescription = form.watch("patientDescription");
  const charCount = watchDescription?.length || 0;

  const onSubmit = async (data: GenerateActivityRequest) => {
    if (keyValidationStatus !== "valid") {
      toast({
        variant: "destructive",
        title: "API Key no validada",
        description: "Por favor valida tu API key antes de generar la actividad",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      
      // Add form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      // Add AI provider and API key
      formData.append('aiProvider', selectedProvider);
      formData.append('apiKey', apiKey);

      // Add PDF files
      uploadedFiles.forEach((file) => {
        formData.append('pdfs', file);
      });

      const result = await generateActivity(formData);
      
      if (result.success) {
        onActivityGenerated(result.activity);
        toast({
          title: "¡Actividad generada con éxito!",
          description: "Tu actividad fonoaudiológica ha sido creada.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error generating activity:", error);
      toast({
        variant: "destructive",
        title: "Error al generar actividad",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getCounterClass = () => {
    if (charCount > 250) return "word-counter error";
    if (charCount > 200) return "word-counter warning";
    return "word-counter";
  };

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        variant: "destructive",
        title: "API Key requerida",
        description: "Por favor ingresa una API key para validar",
      });
      return;
    }

    setIsValidatingKey(true);
    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider, apiKey }),
      });

      const result = await response.json();
      
      if (result.valid) {
        setKeyValidationStatus("valid");
        toast({
          title: "API Key válida",
          description: `La clave de ${selectedProvider.toUpperCase()} es válida y está lista para usar`,
        });
      } else {
        setKeyValidationStatus("invalid");
        toast({
          variant: "destructive",
          title: "API Key inválida",
          description: result.error || "La API key no es válida",
        });
      }
    } catch (error) {
      setKeyValidationStatus("invalid");
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "No se pudo validar la API key",
      });
    } finally {
      setIsValidatingKey(false);
    }
  };

  const getProviderPlaceholder = () => {
    switch (selectedProvider) {
      case "openai": return "sk-...";
      case "groq": return "gsk_...";
      case "gemini": return "AI...";
      case "deepseek": return "sk-...";
      default: return "Ingresa tu API key";
    }
  };

  const getValidationIcon = () => {
    if (keyValidationStatus === "valid") return "fas fa-check-circle text-green-500";
    if (keyValidationStatus === "invalid") return "fas fa-times-circle text-red-500";
    return "fas fa-key text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* API Key Section */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <i className="fas fa-brain text-primary mr-3 text-xl"></i>
          <h2 className="text-xl font-semibold">Configuración de IA</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Proveedor de IA</label>
            <Select value={selectedProvider} onValueChange={(value) => {
              setSelectedProvider(value);
              setKeyValidationStatus("idle");
              setApiKey("");
            }}>
              <SelectTrigger data-testid="select-ai-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input 
                  type="password" 
                  placeholder={getProviderPlaceholder()} 
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setKeyValidationStatus("idle");
                  }}
                  data-testid="input-api-key"
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <i className={getValidationIcon()}></i>
                </div>
              </div>
              <Button 
                type="button"
                data-testid="button-validate-key"
                className="px-4"
                onClick={validateApiKey}
                disabled={isValidatingKey || !apiKey.trim()}
              >
                {isValidatingKey ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  "Validar"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedProvider === "groq" && "¡Perfecto! Tienes acceso a modelos súper rápidos"}
              {selectedProvider === "openai" && "GPT-4 y modelos avanzados disponibles"}
              {selectedProvider === "gemini" && "Modelos multimodales de Google"}
              {selectedProvider === "deepseek" && "Modelos de código abierto potentes"}
            </p>
          </div>
        </div>
      </Card>

      {/* Patient Data Form */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <i className="fas fa-user-md text-primary mr-3 text-xl"></i>
          <h2 className="text-xl font-semibold">Datos del Paciente</h2>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad del Paciente</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="120" 
                        placeholder="Ej: 35"
                        data-testid="input-patient-age"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sessionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Sesión</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-session-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="grupal">Grupal</SelectItem>
                        <SelectItem value="familiar">Familiar</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isPediatric"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-pediatric"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm">
                      Sesión pediátrica (adaptar lenguaje lúdico)
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patientDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Usuario/Paciente</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Describe brevemente el perfil del paciente, diagnóstico, características relevantes..."
                      maxLength={300}
                      className="resize-none"
                      data-testid="textarea-patient-description"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      Máximo 300 caracteres para mejor procesamiento de IA
                    </span>
                    <span className={getCounterClass()} data-testid="text-char-counter">
                      {charCount}/300
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="specificObjective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo Específico</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: Mejorar articulación de /r/"
                        data-testid="input-specific-objective"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (minutos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="10" 
                        max="120" 
                        placeholder="45"
                        data-testid="input-duration"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* PDF Upload Section */}
            <PDFUpload onFilesChange={setUploadedFiles} />

            {/* Advanced Options */}
            <Card className="p-6">
              <button 
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="flex items-center justify-between w-full text-left"
                data-testid="button-toggle-advanced"
              >
                <div className="flex items-center">
                  <i className="fas fa-cog text-primary mr-3 text-xl"></i>
                  <h2 className="text-xl font-semibold">Contexto Adicional (Opcional)</h2>
                </div>
                <i className={`fas fa-chevron-down text-muted-foreground transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              {isAdvancedOpen && (
                <div className="mt-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="customContext"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Contexto adicional, consideraciones especiales, antecedentes clínicos relevantes..."
                            data-testid="textarea-custom-context"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium text-sm mb-2">💡 Tips para Fonoaudiología en Chile</h4>
                    <div className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>• Incluye modismos chilenos relevantes</div>
                      <div>• Considera el contexto sociocultural</div>
                      <div>• Adapta a realidad del sistema de salud</div>
                      <div>• Usa terminología MINSAL cuando corresponda</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Generate Button */}
            <Button 
              type="submit" 
              className="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl"
              disabled={isGenerating}
              data-testid="button-generate-activity"
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Generando Actividad...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  Generar Actividad Fonoaudiológica
                </>
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
