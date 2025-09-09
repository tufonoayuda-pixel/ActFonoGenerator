document.addEventListener('DOMContentLoaded', () => {
  const formSection = document.getElementById('form-section');
  const loadingSection = document.getElementById('loading');
  const resultSection = document.getElementById('result-section');
  const resultContent = document.getElementById('result-content');
  const generarBtn = document.getElementById('generarBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const body = document.body;

  // Ocultar secciones iniciales
  loadingSection.classList.add('hidden');
  resultSection.classList.add('hidden');

  // ✨ INICIAR ANIMACIÓN DE ICONOS FONOAUDIOLÓGICOS CAYENDO
  iniciarAnimacionIconos();

  generarBtn.addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const edad = document.getElementById('edad').value;
    const diagnostico = document.getElementById('diagnostico').value.trim();
    const nivel = document.getElementById('nivel').value;
    const objetivo = document.getElementById('objetivo').value.trim();

    if (!nombre || !edad || !diagnostico || !nivel || !objetivo) {
      alert('⚠️ Por favor completa todos los campos.');
      return;
    }

    // Mostrar loading
    formSection.style.display = 'none';
    loadingSection.classList.remove('hidden');

    let actividad = '';

    try {
      if (apiKey) {
        actividad = await generarActividadConGemini(apiKey, { nombre, edad, diagnostico, nivel, objetivo });
      } else {
        throw new Error("Modo DEMO activado");
      }
    } catch (error) {
      console.warn("Usando modo simulado:", error.message);
      actividad = generarActividadSimulada({ nombre, edad, diagnostico, nivel, objetivo });
    }

    // Mostrar resultado
    loadingSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    resultContent.textContent = actividad;

    // Configurar descarga
    downloadBtn.onclick = () => {
      const blob = new Blob([actividad], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Actividad_Fonoaudiologica_${nombre}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
  });

  // 🌐 Función para llamar a la API de Google Gemini
  async function generarActividadConGemini(apiKey, datos) {
    const { nombre, edad, diagnostico, nivel, objetivo } = datos;

    const prompt = `
      Como fonoaudiólogo experto, genera una actividad terapéutica detallada para un paciente con las siguientes características:
      Nombre: ${nombre}
      Edad: ${edad} años
      Diagnóstico: ${diagnostico}
      Nivel: ${nivel}
      Objetivo: ${objetivo}

      Incluye:
      - Nombre de la actividad
      - Materiales necesarios
      - Instrucciones paso a paso
      - Duración estimada
      - Objetivos SMART
      - Nivel de la Taxonomía de Bloom aplicado
      - Adaptaciones pediátricas sugeridas

      Formato claro, profesional y listo para imprimir.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // 🧪 Función de respaldo (simulada)
  function generarActividadSimulada(datos) {
    const { nombre, edad, diagnostico, nivel, objetivo } = datos;

    const smart = [
      `Específico: ${objetivo}.`,
      `Medible: Registro de % de aciertos en producción del fonema objetivo.`,
      `Alcanzable: Actividad adaptada a edad y nivel de ${nombre}.`,
      `Relevante: Vinculado directamente al diagnóstico de ${diagnostico}.`,
      `Temporal: Evaluar avances en 4 sesiones.`
    ].join('\n');

    const bloom = "Nivel: Aplicación (el niño aplica el fonema en contextos estructurados).";
    const pediatrica = edad < 8
      ? "Adaptación: Uso de juegos, títeres y refuerzo positivo con stickers."
      : "Adaptación: Uso de role-playing y ejercicios contextualizados.";

    return `
🎯 ACTIVIDAD FONOAUDIOLÓGICA GENERADA (SIMULADA)

Paciente: ${nombre}
Edad: ${edad} años
Diagnóstico: ${diagnostico}
Nivel: ${nivel}
Objetivo: ${objetivo}

----------------------------------------

🧠 NOMBRE DE LA ACTIVIDAD:
"La Carrera de los Sonidos"

📦 MATERIALES:
- Tarjetas con imágenes que contengan el fonema objetivo
- Dado gigante
- Tablero de juego impreso
- Temporizador
- Stickers de recompensa

📝 INSTRUCCIONES:
1. El niño lanza el dado y avanza casilleros.
2. En cada casillero, debe decir el nombre de la imagen mostrando el fonema correctamente.
3. Si acierta, gana un sticker. Si no, repite con ayuda del terapeuta.
4. Duración: 20-25 minutos.

⏱️ DURACIÓN ESTIMADA: 25 minutos

📈 OBJETIVOS SMART:
${smart}

📚 TAXONOMÍA DE BLOOM:
${bloom}

🧸 ADAPTACIÓN PEDIÁTRICA:
${pediatrica}

----------------------------------------
✨ Generado por IA Simulada para Fonoaudiología Clínica
© GeneradorActFonoIA - Modo DEMO
    `.trim();
  }

  // 🎊 ANIMACIÓN DE ICONOS DE FONOAUDIOLOGÍA CAYENDO
  function iniciarAnimacionIconos() {
    const iconos = ['🧠', '🗣️', '👂', '🎯', '🧩', '🎭', '📝', '🔤', '👶', '🎲', '📚', '🎧', '🪄', '🌈', '⭐'];
    
    setInterval(() => {
      const icono = document.createElement('div');
      icono.textContent = iconos[Math.floor(Math.random() * iconos.length)];
      icono.style.position = 'fixed';
