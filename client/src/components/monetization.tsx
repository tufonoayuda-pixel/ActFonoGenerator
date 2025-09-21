import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Monetization() {
  return (
    <div className="space-y-6">
      {/* Ad Space 1 */}
      <div className="ad-space rounded-xl p-6 text-center" data-testid="ad-space-1">
        <div className="text-muted-foreground">
          <i className="fas fa-ad text-2xl mb-2"></i>
          <p className="font-medium">Espacio Publicitario</p>
          <p className="text-sm">300x250</p>
        </div>
      </div>

      {/* Ad Space 2 */}
      <div className="ad-space rounded-xl p-6 text-center" data-testid="ad-space-2">
        <div className="text-muted-foreground">
          <i className="fas fa-bullhorn text-2xl mb-2"></i>
          <p className="font-medium">Publicidad</p>
          <p className="text-sm">300x200</p>
        </div>
      </div>

      {/* Support Section */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 p-6">
        <div className="text-center">
          <i className="fas fa-heart text-red-500 text-2xl mb-3"></i>
          <h3 className="font-semibold text-yellow-900 mb-2">Apoya TuFonoAyuda</h3>
          <p className="text-yellow-800 text-sm mb-4">
            Tu donación ayuda a mantener esta herramienta gratuita para todos los fonoaudiólogos de Chile.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-medium text-sm"
              data-testid="button-donate-2000"
            >
              $2.000
            </Button>
            <Button 
              className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-medium text-sm"
              data-testid="button-donate-5000"
            >
              $5.000
            </Button>
          </div>
          <Button 
            variant="outline"
            className="w-full mt-2 border border-yellow-400 text-yellow-800 hover:bg-yellow-100 font-medium text-sm"
            data-testid="button-donate-custom"
          >
            Otra cantidad
          </Button>
        </div>
      </Card>
    </div>
  );
}
