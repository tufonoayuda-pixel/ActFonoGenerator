import { useState } from "react";
import FallingIcons from "@/components/falling-icons";
import ActivityForm from "@/components/activity-form";
import ActivityResult from "@/components/activity-result";
import Monetization from "@/components/monetization";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [generatedActivity, setGeneratedActivity] = useState(null);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FallingIcons />
      
      {/* Header with Logo */}
      <header className="logo-header text-white py-6 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-lg p-2">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="#1976D2"/>
                  <path d="M15 12H25V16H15V12Z" fill="white"/>
                  <path d="M12 20H28V24H12V20Z" fill="white"/>
                  <path d="M15 28H25V32H15V28Z" fill="white"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">TuFonoAyuda</h1>
                <p className="text-blue-100 text-sm">Generador IA de Actividades Fonoaudiológicas</p>
              </div>
            </div>
            <button 
              data-testid="button-donate-header"
              className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              <i className="fas fa-heart mr-2"></i>Donar
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <ActivityForm onActivityGenerated={setGeneratedActivity} />
          </div>

          {/* Right Column - Results & Ads */}
          <div className="space-y-6">
            <Monetization />
            <ActivityResult activity={generatedActivity} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted mt-16 py-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="#1976D2"/>
                  <path d="M15 12H25V16H15V12Z" fill="white"/>
                  <path d="M12 20H28V24H12V20Z" fill="white"/>
                  <path d="M15 28H25V32H15V28Z" fill="white"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold">TuFonoAyuda</p>
                <p className="text-sm text-muted-foreground">Herramientas IA para Fonoaudiología</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Creado por:</strong> Flgo. Cristóbal San Martín</p>
              <div className="flex items-center justify-center space-x-2">
                <i className="fab fa-instagram text-pink-500"></i>
                <a 
                  href="https://instagram.com/tufonoayuda" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                  data-testid="link-instagram"
                >
                  @tufonoayuda
                </a>
              </div>
              <p className="mt-4">© 2024 TuFonoAyuda. Desarrollado para la comunidad fonoaudiológica de Chile.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
