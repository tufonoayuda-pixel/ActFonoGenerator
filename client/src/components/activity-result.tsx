import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type GeneratedActivity } from "@shared/schema";

interface ActivityResultProps {
  activity: GeneratedActivity | null;
}

export default function ActivityResult({ activity }: ActivityResultProps) {
  const downloadActivity = () => {
    if (!activity) return;

    const content = `
GENERADOR DE ACTIVIDADES FONOAUDIOLÓGICAS - TUFONOAYUDA
========================================================

${activity.title}

OBJETIVO SMART:
${activity.smartObjective}

DESCRIPCIÓN GENERAL:
${activity.description}

MATERIALES NECESARIOS:
${activity.materials.map(m => `• ${m}`).join('\n')}

PROCEDIMIENTO PASO A PASO:
${activity.procedure.map(p => `${p.name} (${p.time} min): ${p.description}`).join('\n\n')}

EVALUACIÓN DEL PROGRESO:
Criterios de éxito: ${activity.evaluation.criteria}
Métodos de evaluación: ${activity.evaluation.methods.join(', ')}
Retroalimentación: ${activity.evaluation.feedback}

ADAPTACIONES SUGERIDAS:
${activity.adaptations.map(a => `• ${a}`).join('\n')}

FUNDAMENTACIÓN TEÓRICA:
${activity.theoreticalFoundation}

Fecha de generación: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Generado por: TuFonoAyuda - Generador IA Fonoaudiológico
Creado por: Flgo. Cristóbal San Martín
Instagram: @tufonoayuda
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activity.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Actividad Generada</h2>
        {activity && (
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadActivity}
            title="Descargar actividad"
            data-testid="button-download-activity"
          >
            <i className="fas fa-download text-xl"></i>
          </Button>
        )}
      </div>

      {!activity ? (
        <div className="text-center py-12" data-testid="result-placeholder">
          <i className="fas fa-brain text-4xl text-muted-foreground mb-4"></i>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Listo para generar</h3>
          <p className="text-muted-foreground text-sm">
            Completa el formulario y haz clic en "Generar Actividad" para obtener una actividad personalizada con IA.
          </p>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none custom-scrollbar max-h-96 overflow-y-auto" data-testid="result-content">
          <h3 className="text-lg font-semibold text-primary mb-3">{activity.title}</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-primary">🎯 Objetivo SMART</h4>
              <p className="text-sm">{activity.smartObjective}</p>
            </div>

            <div>
              <h4 className="font-semibold text-primary">📋 Información General</h4>
              <p className="text-sm">{activity.description}</p>
            </div>

            <div>
              <h4 className="font-semibold text-primary">🛠️ Materiales Necesarios</h4>
              <ul className="text-sm">
                {activity.materials.map((material, index) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-primary">⚡ Procedimiento Paso a Paso</h4>
              {activity.procedure.map((step, index) => (
                <div 
                  key={index}
                  className="bg-accent/10 border-l-4 border-accent p-3 rounded mb-3"
                >
                  <h5 className="font-medium text-accent">{step.name} ({step.time} min)</h5>
                  <p className="text-sm mt-1">{step.description}</p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-semibold text-primary">📊 Evaluación del Progreso</h4>
              <div className="bg-secondary/10 border-l-4 border-secondary p-3 rounded">
                <p className="text-sm"><strong>Criterio de éxito:</strong> {activity.evaluation.criteria}</p>
                <p className="text-sm mt-2"><strong>Métodos de evaluación:</strong></p>
                <ul className="text-sm">
                  {activity.evaluation.methods.map((method, index) => (
                    <li key={index}>{method}</li>
                  ))}
                </ul>
                <p className="text-sm mt-2"><strong>Retroalimentación:</strong> {activity.evaluation.feedback}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-primary">🔧 Adaptaciones Sugeridas</h4>
              <ul className="text-sm">
                {activity.adaptations.map((adaptation, index) => (
                  <li key={index}>{adaptation}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-primary">📚 Fundamentación Teórica</h4>
              <p className="text-sm">{activity.theoreticalFoundation}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
