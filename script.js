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

  let isAdvancedOpen = false;

  // Iniciar animación de iconos
  iniciarAnimacionIconos();

  // Toggle Advanced
  toggleAdvanced.addEventListener('click', () => {
    isAdvancedOpen = !isAdvancedOpen;
    advancedSection.classList.toggle('hidden', !isAdvancedOpen);
    chevronIcon.style.transform = isAdvancedOpen ? 'rotate(180deg)' : 'rotate(0deg)';
  });

  // Generar Actividad
  generateBtn.addEventListener('click', async () => {
    if (!userDescription.value || !specificObjective.value || !duration.value) {
      alert('⚠️ Por favor completa los campos obligatorios.');
      return;
    }

    // Mostrar loading (simulado con placeholder)
    resultPlaceholder.innerHTML = `
      <div class="loading">
        <div class="loading-icon">🧠</div>
        <p>Generando actividad con IA...</p>
      </div>
    `;
    resultContent.classList.add('hidden');

    let activityData;

    try {
      // Extraer edad
      const age = parseInt(userDescription.value.match(/\d+/)?.[0] || 60);
      const isChild = age < 144 || isPediatric.checked;
      const dur = parseInt(duration.value) || 30;

      // Generar objetivo SMART
      const smartObjective = generateSMARTObjective(specificObjective.value, age, dur);

      // Analizar contexto
      const contextInfo = analyzeAdditionalContext(customContext.value);

      // Generar actividad
      const activities = generateActivityContent({
        userDescription: userDescription.value,
        specificObjective: specificObjective.value,
        duration: duration.value,
        sessionType: sessionType.value,
        isPediatric: isPediatric.checked,
        additionalContext: { customContext: customContext.value }
      }, isChild, age, dur, contextInfo);

      activityData = {
        title: activities.title,
        smartObjective,
        description: activities.description,
        materials: activities.materials,
        procedure: activities.procedure,
        evaluation: activities.evaluation,
        adaptations: activities.adaptations,
        theoreticalFoundation: activities.theoreticalFoundation
      };

      // Renderizar resultado
      renderResult(activityData);

      // Configurar descarga
      downloadBtn.onclick = () => exportActivity(activityData);

    } catch (error) {
      console.error("Error:", error);
      resultPlaceholder.innerHTML = `<p style="color:red;">Error al generar la actividad: ${error.message}</p>`;
    }
  });

  // Funciones de generación (copiadas y adaptadas del original)

  function generateSMARTObjective(objective, age, duration) {
    const ageGroup = age < 36 ? 'preescolar' : age < 144 ? 'escolar' : 'adolescente/adulto';
    const timeFrame = duration < 30 ? 'corto plazo' : duration < 60 ? 'mediano plazo' : 'largo plazo';
    return `El paciente ${ageGroup} logrará ${objective} con un 80% de precisión durante ${duration} minutos, utilizando apoyo visual/auditivo según necesidad, medible a través de registro de respuestas correctas en ${timeFrame}.`;
  }

  function analyzeAdditionalContext(contextText) {
    if (!contextText) return {};
    const context = contextText.toLowerCase();
    const info = {};

    const materialKeywords = {
      'visual': ['tarjetas visuales', 'imágenes', 'pictogramas', 'láminas', 'fotos', 'dibujos', 'visual'],
      'auditivo': ['grabaciones', 'música', 'sonidos', 'audio', 'canciones', 'melodías', 'auditivo'],
      'táctil': ['texturas', 'objetos', 'táctil', 'manipulativo', 'concreto', 'palpar', 'tocar'],
      'digital': ['aplicaciones', 'apps', 'tablet', 'computadora', 'software', 'digital', 'tecnología', 'dispositivo']
    };

    for (const [type, keywords] of Object.entries(materialKeywords)) {
      if (keywords.some(keyword => context.includes(keyword))) {
        info.materialType = type;
        const materialMatch = contextText.match(new RegExp(`(${keywords.join('|')}).{0,30}`, 'i'));
        if (materialMatch) info.materialDetails = materialMatch[0];
        break;
      }
    }

    const strategyKeywords = {
      'Terapia Miofuncional': ['miofuncional', 'orofacial', 'muscular oral'],
      'Método Bobath': ['bobath', 'neurodesarrollo', 'neuromotor'],
      'Prompt': ['prompt', 'táctil-kinestésico', 'apoyo táctil'],
      'Melodic Intonation Therapy': ['melodic intonation', 'mit', 'terapia melódica', 'entonación melódica'],
      'Lee Silverman Voice Treatment': ['lsvt', 'lee silverman', 'voz fuerte', 'parkinson'],
      'Comunicación Total': ['comunicación total', 'multimodal', 'signos'],
      'Sistemas Aumentativos': ['saac', 'aumentativo', 'alternativo', 'comunicación aumentativa'],
      'VitalStim': ['vitalstim', 'estimulación eléctrica', 'disfagia'],
      'Terapia de Ritmo': ['ritmo', 'melodía', 'musical', 'rítmica'],
      'Método Multisensorial': ['multisensorial', 'varios sentidos', 'integración sensorial']
    };

    for (const [strategy, keywords] of Object.entries(strategyKeywords)) {
      if (keywords.some(keyword => context.includes(keyword))) {
        info.strategy = strategy;
        break;
      }
    }

    if (!info.strategy) {
      const strategyMatch = contextText.match(/estrategia[:\s]+([^.,
]+)/i);
      if (strategyMatch) {
        info.strategy = strategyMatch[1].trim();
      }
    }

    const criteriaPatterns = [
      /(\d+%[^.]*)/i,
      /(criterio[^.]*logro[^.]*)/i,
      /(logro[^.]*criterio[^.]*)/i,
      /(éxito[^.]*)/i,
      /(\d+\s*(de|en|sobre)\s*\d+[^.]*)/i
    ];

    for (const pattern of criteriaPatterns) {
      const match = contextText.match(pattern);
      if (match) {
        info.criteria = match[1].trim();
        break;
      }
    }

    const creativityKeywords = ['creativ', 'innovador', 'libre', 'original', 'imaginación', 'inventar', 'crear'];
    if (creativityKeywords.some(keyword => context.includes(keyword))) {
      info.creativity = true;
      const creativityMatch = contextText.match(new RegExp(`(${creativityKeywords.join('|')}).{0,40}`, 'i'));
      if (creativityMatch) info.creativityDetails = creativityMatch[0];
    }

    const environmentKeywords = {
      'domiciliario': ['hogar', 'casa', 'domicilio', 'familiar', 'domiciliario'],
      'clínico': ['clínica', 'consultorio', 'hospital', 'centro médico', 'clínico'],
      'educativo': ['escuela', 'colegio', 'aula', 'educativo', 'salón de clases'],
      'comunitario': ['parque', 'biblioteca', 'centro comunitario', 'público']
    };

    for (const [env, keywords] of Object.entries(environmentKeywords)) {
      if (keywords.some(keyword => context.includes(keyword))) {
        info.environment = env;
        break;
      }
    }

    const sensoryKeywords = {
      'multisensorial': ['multisensorial', 'todos los sentidos', 'integración sensorial'],
      'kinestésica': ['kinestésico', 'motor', 'movimiento', 'corporal'],
      'auditivo-musical': ['musical', 'ritmo', 'melodía', 'canción'],
      'visual-espacial': ['espacial', 'visual', 'imágenes']
    };

    for (const [sensory, keywords] of Object.entries(sensoryKeywords)) {
      if (keywords.some(keyword => context.includes(keyword))) {
        info.sensory = sensory;
        break;
      }
    }

    const interestMatch = contextText.match(/(interés|motivación|gusta).{0,50}/i);
    if (interestMatch) info.interests = interestMatch[0];

    const adaptationMatch = contextText.match(/(adaptación|modificación|ajuste).{0,50}/i);
    if (adaptationMatch) info.adaptations = adaptationMatch[0];

    info.fullContext = contextText;
    return info;
  }

  function generateMaterials(contextInfo, isChild) {
    const baseMaterials = isChild ? [
      '🎨 Materiales coloridos y atractivos',
      '🧩 Juegos interactivos',
      '📱 Recursos digitales adaptados',
      '🎭 Elementos lúdicos temáticos',
      '📝 Registro de logros visual'
    ] : [
      'Material visual estructurado',
      'Protocolos de evaluación',
      'Recursos auditivos calibrados',
      'Instrumentos de medición',
      'Hojas de registro'
    ];

    if (contextInfo.materialType === 'táctil') {
      baseMaterials.push(isChild ? '👐 Texturas y objetos para tocar' : 'Material táctil especializado');
      if (contextInfo.materialDetails) {
        baseMaterials.push(isChild ? `🔍 ${contextInfo.materialDetails}` : `Material específico: ${contextInfo.materialDetails}`);
      }
    }

    if (contextInfo.materialType === 'digital') {
      baseMaterials.push(isChild ? '💻 Apps y juegos digitales' : 'Software especializado');
      if (contextInfo.materialDetails) {
        baseMaterials.push(isChild ? `📲 ${contextInfo.materialDetails}` : `Recursos digitales: ${contextInfo.materialDetails}`);
      }
    }

    if (contextInfo.materialType === 'visual') {
      baseMaterials.push(isChild ? '🖼️ Imágenes súper cool' : 'Material visual específico');
      if (contextInfo.materialDetails) {
        baseMaterials.push(isChild ? `🎨 ${contextInfo.materialDetails}` : `Recursos visuales: ${contextInfo.materialDetails}`);
      }
    }

    if (contextInfo.materialType === 'auditivo') {
      baseMaterials.push(isChild ? '🎵 Sonidos y música especial' : 'Material auditivo especializado');
      if (contextInfo.materialDetails) {
        baseMaterials.push(isChild ? `🎶 ${contextInfo.materialDetails}` : `Recursos auditivos: ${contextInfo.materialDetails}`);
      }
    }

    if (contextInfo.sensory === 'multisensorial') {
      baseMaterials.push(isChild ? '🌈 Estímulos para todos los sentidos' : 'Kit multisensorial');
    }

    if (contextInfo.interests) {
      baseMaterials.push(isChild ? `⭐ Materiales sobre tus temas favoritos` : `Material temático según intereses identificados`);
    }

    return baseMaterials;
  }

  function generateProcedure(data, isChild, duration, contextInfo) {
    return [
      {
        name: isChild ? '🚀 ¡Despegue!' : 'Fase de Calentamiento',
        time: Math.round(duration * 0.15),
        description: isChild ? 
          `Comenzamos con juegos de calentamiento para preparar nuestra voz y cuerpo. ¡Es como hacer ejercicio pero súper divertido!${contextInfo?.environment === 'domiciliario' ? ' Puedes hacerlo en tu lugar favorito de casa.' : ''}` :
          `Ejercicios preparatorios para activar las estructuras orofaciales y establecer rapport terapéutico.${contextInfo?.strategy ? ` Aplicando principios de ${contextInfo.strategy}.` : ''}`
      },
      {
        name: isChild ? '🎯 ¡Misión Principal!' : 'Desarrollo de la Actividad',
        time: Math.round(duration * 0.65),
        description: isChild ? 
          `Aquí es donde ocurre la magia. Trabajaremos en ${data.specificObjective.toLowerCase()} a través de juegos, canciones y actividades súper cool que te encantarán.${contextInfo?.creativity ? ' ¡Y podrás usar toda tu imaginación!' : ''}${contextInfo?.sensory === 'multisensorial' ? ' Usaremos todos nuestros sentidos para aprender mejor.' : ''}` :
          `Implementación sistemática de técnicas específicas para ${data.specificObjective}, con progresión gradual de complejidad.${contextInfo?.materialType ? ` Utilizando recursos ${contextInfo.materialType}es especializados.` : ''}${contextInfo?.fullContext ? ` Considerando: ${contextInfo.fullContext.substring(0, 100)}...` : ''}`
      },
      {
        name: isChild ? '🌟 ¡Victoria!' : 'Cierre y Evaluación',
        time: Math.round(duration * 0.2),
        description: isChild ? 
          '¡Celebramos todos tus logros! Repasamos lo que aprendiste y te llevas premios especiales por tu esfuerzo.' :
          `Síntesis de logros, retroalimentación y planificación de próximas sesiones.${contextInfo?.criteria ? ` Aplicando ${contextInfo.criteria}.` : ''}`
      }
    ];
  }

  function generateEvaluation(data, isChild, contextInfo) {
    const defaultCriteria = isChild ? 
      'Observamos si puedes hacer la actividad con una sonrisa y logrando al menos 8 de cada 10 intentos' :
      'Criterio de logro del 80% de respuestas correctas con apoyo mínimo';

    return {
      criteria: contextInfo?.criteria || defaultCriteria,
      methods: isChild ? [
        '⭐ Sistema de estrellas por logros',
        '🎵 Canciones de celebración',
        '📸 Fotos de los momentos especiales',
        '🏆 Certificados de súper héroe',
        ...(contextInfo?.materialType === 'digital' ? ['📱 Registro digital interactivo'] : [])
      ] : [
        'Registro cuantitativo de respuestas',
        'Análisis cualitativo del desempeño',
        'Escalas de valoración específicas',
        'Documentación audiovisual',
        ...(contextInfo?.strategy ? [`Evaluación específica para ${contextInfo.strategy}`] : [])
      ],
      feedback: isChild ? 
        `Te contaremos todo lo genial que hiciste y qué aventuras tendremos la próxima vez${contextInfo?.environment === 'domiciliario' ? ', y le contaremos a tu familia para que te feliciten' : ''}` :
        `Retroalimentación específica sobre fortalezas y áreas de mejora identificadas${contextInfo?.fullContext ? ', considerando el contexto personalizado proporcionado' : ''}`
    };
  }

  function generateAdaptations(data, age, isChild, contextInfo) {
    const adaptations = [];
    if (age < 36) {
      adaptations.push(isChild ? 
        '🧸 Usamos juguetes y canciones para bebés' : 
        'Adaptación para desarrollo temprano con estímulos multisensoriales');
    } else if (age < 72) {
      adaptations.push(isChild ? 
        '🎨 Actividades con colores y formas divertidas' : 
        'Metodología lúdica con componentes visuales estructurados');
    }
    if (contextInfo?.creativity) {
      adaptations.push(isChild ? 
        '✨ ¡Podemos crear nuestras propias historias!' : 
        'Incorporación de elementos creativos y expresivos');
    }
    if (data.sessionType === 'grupal') {
      adaptations.push(isChild ? 
        '👫 Juegos con todos tus amigos' : 
        'Dinámicas grupales con roles diferenciados');
    }
    if (contextInfo?.environment === 'domiciliario') {
      adaptations.push(isChild ? 
        '🏠 Actividades que puedes hacer en casa con tu familia' : 
        'Adaptaciones para entorno domiciliario y participación familiar');
    }
    if (contextInfo?.materialType) {
      adaptations.push(isChild ? 
        `🎯 Materiales especiales ${contextInfo.materialType}es que te van a encantar` : 
        `Optimización para recursos ${contextInfo.materialType}es específicos`);
    }
    if (contextInfo?.sensory === 'multisensorial') {
      adaptations.push(isChild ? 
        '🌟 Usamos todos nuestros sentidos: vista, oído, tacto ¡y más!' : 
        'Enfoque multisensorial integral para potenciar el aprendizaje');
    }
    return adaptations;
  }

  function generateTheoreticalFoundation(data, contextInfo) {
    const foundations = [];
    if (contextInfo?.strategy) {
      foundations.push(`Estrategia principal: ${contextInfo.strategy}`);
    }
    foundations.push('Taxonomía de Bloom: Progresión cognitiva estructurada');
    foundations.push('Metodología SMART: Objetivos específicos y medibles');
    foundations.push('Neuroplasticidad: Estimulación repetida y estructurada');
    foundations.push('Aprendizaje significativo: Conexión con experiencias previas');
    if (data.isPediatric) {
      foundations.push('Teoría del juego: Aprendizaje a través de la experiencia lúdica');
    }
    if (contextInfo?.sensory === 'multisensorial') {
      foundations.push('Teoría multisensorial: Integración de modalidades sensoriales');
    }
    if (contextInfo?.environment === 'domiciliario') {
      foundations.push('Enfoque ecológico: Intervención en contextos naturales');
    }
    if (contextInfo?.creativity) {
      foundations.push('Pedagogía creativa: Estimulación de procesos imaginativos');
    }
    if (contextInfo?.fullContext) {
      foundations.push('Personalización basada en contexto específico del usuario');
    }
    return foundations;
  }

  function generateActivityContent(data, isChild, age, duration, contextInfo) {
    return {
      title: isChild ? 
        `🎮 Aventura de Comunicación: ${data.specificObjective}` : 
        `Actividad Terapéutica: ${data.specificObjective}`,
      description: isChild ? 
        `¡Hola pequeño/a explorador/a! Hoy vamos a jugar y aprender juntos. Esta actividad especial está diseñada para ayudarte a ${data.specificObjective.toLowerCase()} de una manera súper divertida. Durante ${duration} minutos, serás el protagonista de tu propia aventura de comunicación.` :
        `Actividad estructurada de ${duration} minutos diseñada para trabajar ${data.specificObjective} en modalidad ${data.sessionType}. La intervención se centra en el desarrollo progresivo de habilidades comunicativas mediante estrategias basadas en evidencia${contextInfo.strategy ? `, utilizando ${contextInfo.strategy}` : ''}.`,
      materials: generateMaterials(contextInfo, isChild),
      procedure: generateProcedure(data, isChild, duration, contextInfo),
      evaluation: generateEvaluation(data, isChild, contextInfo),
      adaptations: generateAdaptations(data, age, isChild, contextInfo),
      theoreticalFoundation: generateTheoreticalFoundation(data, contextInfo)
    };
  }

  function renderResult(activity) {
    resultTitle.textContent = activity.title;

    resultBody.innerHTML = `
      <div class="section-title">📋 Objetivo SMART:</div>
      <div class="smart-objective">${activity.smartObjective}</div>

      <div class="section-title">📝 Descripción:</div>
      <p>${activity.description}</p>

      <div class="section-title">🎯 Materiales:</div>
      <div>
        ${activity.materials.map(m => `<div class="list-item">${m}</div>`).join('')}
      </div>

      <div class="section-title">⚡ Procedimiento:</div>
      <div>
        ${activity.procedure.map(p => `
          <div class="procedure-phase">
            <h4>${p.name} (${p.time} min)</h4>
            <p>${p.description}</p>
          </div>
        `).join('')}
      </div>

      <div class="section-title">📊 Evaluación:</div>
      <div class="evaluation-box">
        <p><strong>Criterio:</strong> ${activity.evaluation.criteria}</p>
        <p><strong>Métodos:</strong></p>
        <div>
          ${activity.evaluation.methods.map(m => `<div class="list-item">${m}</div>`).join('')}
        </div>
        <p><strong>Retroalimentación:</strong> ${activity.evaluation.feedback}</p>
      </div>

      <div class="section-title">🔧 Adaptaciones:</div>
      <div>
        ${activity.adaptations.map(a => `<div class="list-item">${a}</div>`).join('')}
      </div>

      <div class="section-title">📚 Fundamentación Teórica:</div>
      <div>
        ${activity.theoreticalFoundation.map(f => `<div class="list-item">${f}</div>`).join('')}
      </div>
    `;

    resultPlaceholder.style.display = 'none';
    resultContent.classList.remove('hidden');
  }

  function exportActivity(activity) {
    const content = `
ACTIVIDAD FONOAUDIOLÓGICA GENERADA
${activity.title}

OBJETIVO SMART:
${activity.smartObjective}

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

FUNDAMENTACIÓN TEÓRICA:
${activity.theoreticalFoundation.map(f => `• ${f}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'actividad_fonoaudiologica.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 🎊 ANIMACIÓN DE ICONOS DE FONOAUDIOLOGÍA CAYENDO
  function iniciarAnimacionIconos() {
    const iconos = ['🧠', '🗣️', '👂', '🎯', '🧩', '🎭', '📝', '🔤', '👶', '🎲', '📚', '🎧', '🪄', '🌈', '⭐', '🧑‍🏫', '🧒', '💬', '✅'];
    
    setInterval(() => {
      const icono = document.createElement('div');
      icono.textContent = iconos[Math.floor(Math.random() * iconos.length)];
      icono.style.position = 'fixed';
      icono.style.top = '-50px';
      icono.style.left = Math.random() * 100 + 'vw';
      icono.style.fontSize = Math.random() * 20 + 20 + 'px';
      icono.style.opacity = '0.7';
      icono.style.pointerEvents = 'none';
      icono.style.zIndex = '1000';
      icono.style.userSelect = 'none';
      icono.style.textShadow = '0 0 5px rgba(255,255,255,0.8)';
      
      const duracion = Math.random() * 5 + 5;
      icono.style.transition = `top ${duracion}s ease-in, opacity 1s ease-out ${duracion - 1}s`;
      
      document.body.appendChild(icono);
      
      setTimeout(() => {
        icono.style.top = '100vh';
        icono.style.opacity = '0';
      }, 50);
      
      setTimeout(() => {
        if (icono.parentNode) {
          icono.parentNode.removeChild(icono);
        }
      }, duracion * 1000 + 1000);
    }, 800);
  }
});
