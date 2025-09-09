document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const userDescription = document.getElementById('userDescription');
  const isPediatric = document.getElementById('isPediatric');
  const specificObjective = document.getElementById('specificObjective');
  const duration = document.getElementById('duration');
  const sessionType = document.getElementById('sessionType');
  const customContext = document.getElementById('customContext');
  const toggleAdvanced = document.getElementById('toggleAdvanced');
  const advancedSection = document.getElementById('advancedSection');
  const chevronIcon = document.getElementById('chevronIcon');
  const generateBtn = document.getElementById('generateBtn');
  const resultPlaceholder = document.getElementById('resultPlaceholder');
  const resultContent = document.getElementById('resultContent');
  const resultTitle = document.getElementById('resultTitle');
  const resultBody = document.getElementById('resultBody');
  const downloadBtn = document.getElementById('downloadBtn');

  // Elementos para PDFs
  const fileInput = document.getElementById('fileInput');
  const dropZone = document.getElementById('dropZone');
  const selectFilesBtn = document.getElementById('selectFilesBtn');
  const fileList = document.getElementById('fileList');

  const apiKey = document.getElementById('apiKey');

  let isAdvancedOpen = false;
  let uploadedFiles = [];

  // ✅ ARREGLADO: Toggle Contexto Adicional
  toggleAdvanced.addEventListener('click', () => {
    isAdvancedOpen = !isAdvancedOpen;
    if (isAdvancedOpen) {
      advancedSection.classList.remove('hidden');
      chevronIcon.textContent = '▲';
    } else {
      advancedSection.classList.add('hidden');
      chevronIcon.textContent = '▼';
    }
  });

  // ✅ ARREGLADO: Subir archivos
  selectFilesBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', handleFiles);

  function handleFiles(e) {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files).filter(file => 
      file.type === 'application/pdf' && file.size <= 50 * 1024 * 1024
    );

    files.forEach(file => {
      uploadedFiles.push(file);
      addFileToList(file);
    });

    fileInput.value = '';
  }

  function addFileToList(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
      <span>${file.name}</span>
      <button class="remove-file" data-index="${uploadedFiles.length - 1}">×</button>
    `;

    const removeBtn = fileItem.querySelector('.remove-file');
    removeBtn.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      uploadedFiles.splice(index, 1);
      fileItem.remove();
    });

    fileList.appendChild(fileItem);
  }

  // ✅ ARREGLADO: Arrastrar y soltar
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
  });

  function highlight() {
    dropZone.style.borderColor = '#667eea';
    dropZone.style.background = '#eef2ff';
  }

  function unhighlight() {
    dropZone.style.borderColor = '#667eea';
    dropZone.style.background = '#f8f9fa';
  }

  dropZone.addEventListener('drop', handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files } });
  }

  // ✅ ARREGLADO: Generar Actividad
  generateBtn.addEventListener('click', async () => {
    // Validación mejorada
    if (!userDescription.value.trim()) {
      alert('⚠️ Por favor ingresa la descripción del usuario');
      userDescription.focus();
      return;
    }
    
    if (!specificObjective.value.trim()) {
      alert('⚠️ Por favor ingresa el objetivo específico');
      specificObjective.focus();
      return;
    }
    
    if (!duration.value) {
      alert('⚠️ Por favor ingresa la duración');
      duration.focus();
      return;
    }

    // Mostrar loading
    resultPlaceholder.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 20px;">🧠</div>
        <p style="font-size: 18px; color: #666;">Generando actividad...</p>
      </div>
    `;
    resultContent.classList.add('hidden');

    try {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extraer edad
      const ageMatch = userDescription.value.match(/\d+/);
      const age = ageMatch ? parseInt(ageMatch[0]) : 60;
      const isChild = age < 144 || isPediatric.checked;
      const dur = parseInt(duration.value) || 30;

      // Generar actividad
      const activity = generateSimulatedActivity({
        userDescription: userDescription.value,
        specificObjective: specificObjective.value,
        duration: duration.value,
        sessionType: sessionType.value,
        isPediatric: isPediatric.checked,
        customContext: customContext.value
      }, isChild, age, dur);

      // Renderizar resultado
      renderResult(activity);

      // Configurar descarga
      downloadBtn.onclick = () => exportActivity(activity);

    } catch (error) {
      console.error("Error:", error);
      resultPlaceholder.innerHTML = `<p style="color: #ff0000; text-align: center; font-size: 18px;">Error: ${error.message}</p>`;
    }
  });

  // Funciones de generación
  function generateSimulatedActivity(data, isChild, age, duration) {
    return {
      title: isChild ? `🎮 Aventura: ${data.specificObjective}` : `Actividad: ${data.specificObjective}`,
      description: isChild ? 
        `¡Hola! Vamos a jugar y aprender juntos durante ${duration} minutos.` :
        `Actividad estructurada de ${duration} minutos para trabajar ${data.specificObjective}.`,
      materials: [
        isChild ? '🎨 Materiales coloridos' : 'Material visual estructurado',
        isChild ? '🧩 Juegos interactivos' : 'Protocolos de evaluación',
        '📝 Hojas de registro'
      ],
      procedure: [
        {
          name: isChild ? '🚀 ¡Despegue!' : 'Calentamiento',
          time: Math.round(duration * 0.2),
          description: isChild ? 'Juegos de calentamiento divertidos' : 'Ejercicios preparatorios'
        },
        {
          name: isChild ? '🎯 ¡Misión Principal!' : 'Desarrollo',
          time: Math.round(duration * 0.6),
          description: isChild ? 'Actividades súper cool que te encantarán' : 'Implementación sistemática de técnicas'
        },
        {
          name: isChild ? '🌟 ¡Victoria!' : 'Cierre',
          time: Math.round(duration * 0.2),
          description: isChild ? '¡Celebramos tus logros!' : 'Síntesis y retroalimentación'
        }
      ],
      evaluation: {
        criteria: isChild ? '8 de 10 intentos con sonrisa' : '80% de respuestas correctas',
        methods: isChild ? ['⭐ Estrellas por logros', '🎵 Canciones de celebración'] : ['Registro cuantitativo', 'Análisis cualitativo'],
        feedback: isChild ? 'Te contaremos lo genial que hiciste' : 'Retroalimentación sobre fortalezas y áreas de mejora'
      },
      adaptations: isChild ? ['🧸 Juguetes para bebés', '🎨 Actividades con colores'] : ['Adaptación profesional 1', 'Adaptación profesional 2']
    };
  }

  function renderResult(activity) {
    resultTitle.textContent = activity.title;

    resultBody.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-weight: 600; color: #333; margin-bottom: 10px;">📝 Descripción:</h3>
        <p>${activity.description}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="font-weight: 600; color: #333; margin-bottom: 10px;">🎯 Materiales:</h3>
        <ul style="padding-left: 20px;">
          ${activity.materials.map(m => `<li>${m}</li>`).join('')}
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="font-weight: 600; color: #333; margin-bottom: 10px;">⚡ Procedimiento:</h3>
        ${activity.procedure.map(p => `
          <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
            <div style="font-weight: 600; color: #333;">${p.name} (${p.time} min)</div>
            <p>${p.description}</p>
          </div>
        `).join('')}
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="font-weight: 600; color: #333; margin-bottom: 10px;">📊 Evaluación:</h3>
        <div style="background: #fff3cd; padding: 15px; border-radius: 10px;">
          <p><strong>Criterio:</strong> ${activity.evaluation.criteria}</p>
          <p><strong>Métodos:</strong></p>
          <ul style="padding-left: 20px;">
            ${activity.evaluation.methods.map(m => `<li>${m}</li>`).join('')}
          </ul>
          <p><strong>Retroalimentación:</strong> ${activity.evaluation.feedback}</p>
        </div>
      </div>

      <div>
        <h3 style="font-weight: 600; color: #333; margin-bottom: 10px;">🔧 Adaptaciones:</h3>
        <ul style="padding-left: 20px;">
          ${activity.adaptations.map(a => `<li>${a}</li>`).join('')}
        </ul>
      </div>
    `;

    resultPlaceholder.style.display = 'none';
    resultContent.classList.remove('hidden');
  }

  function exportActivity(activity) {
    const content = `
ACTIVIDAD FONOAUDIOLÓGICA GENERADA
${activity.title}

DESCRIPCIÓN:
${activity.description}

MATERIALES:
${activity.materials.map(m => `• ${m}`).join('\n')}

PROCEDIMIENTO:
${activity.procedure.map(p => `${p.name} (${p.time} min): ${p.description}`).join('\n')}

EVALUACIÓN:
Criterio: ${activity.evaluation.criteria}
Métodos: ${activity.evaluation.methods.map(m => `• ${m}`).join('\n')}
Retroalimentación: ${activity.evaluation.feedback}

ADAPTACIONES:
${activity.adaptations.map(a => `• ${a}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'actividad_fonoaudiologica.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Animación de iconos (opcional)
  function iniciarAnimacionIconos() {
    // Esta función puede estar vacía si no es crítica
    console.log("Animación de iconos iniciada");
  }
});
