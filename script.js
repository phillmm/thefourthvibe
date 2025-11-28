// Variables globales
let metronomoActivo = false;
let intervaloMetronomo = null;
let combinadoActivo = false;
let intervaloCombinado = null;
let audioContext = null;

// Notas musicales - Incluye tanto sostenidos como bemoles
const notasCompletas = [
    'Do', 
    { sostenido: 'Do#', bemol: 'Reb' },
    'Re', 
    { sostenido: 'Re#', bemol: 'Mib' },
    'Mi', 
    'Fa', 
    { sostenido: 'Fa#', bemol: 'Solb' },
    'Sol', 
    { sostenido: 'Sol#', bemol: 'Lab' },
    'La', 
    { sostenido: 'La#', bemol: 'Sib' },
    'Si'
];
const notasNaturales = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

// Cuerdas del bajo
const cuerdasBase = [
    { numero: 1, nombre: '1ª cuerda (Sol)' },
    { numero: 2, nombre: '2ª cuerda (Re)' },
    { numero: 3, nombre: '3ª cuerda (La)' },
    { numero: 4, nombre: '4ª cuerda (Mi)' }
];

const quintaCuerda = { numero: 5, nombre: '5ª cuerda (Si)' };

// Función para actualizar el favicon
function actualizarFavicon(ruta) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = ruta + '?v=' + new Date().getTime(); // Cache bust
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    inicializarAudio();
    configurarEventos();
    
    // Establecer el favicon inicial según el modo
    if (document.body.classList.contains('dark-mode')) {
        actualizarFavicon('assets/thefourthvibe_mini_dark.png');
    }
});

// Configurar eventos
function configurarEventos() {
    // Toggle de modo oscuro
    document.getElementById('toggleDarkMode').addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
            actualizarFavicon('assets/thefourthvibe_mini_dark.png');
        } else {
            document.body.classList.remove('dark-mode');
            actualizarFavicon('assets/thefourthvibe_mini.png');
        }
    });

    // Botones del menú
    document.getElementById('btnNotasAzar').addEventListener('click', () => {
        cambiarEjercicio('notasAzar');
    });

    document.getElementById('btnMetronomo').addEventListener('click', () => {
        cambiarEjercicio('metronomo');
    });

    document.getElementById('btnCombinado').addEventListener('click', () => {
        cambiarEjercicio('combinado');
    });

    // Ejercicio 1: Nota al Azar
    document.getElementById('btnGenerarNota').addEventListener('click', generarNotaAzar);
    document.getElementById('toggleAlteraciones').addEventListener('change', generarNotaAzar);

    // Ejercicio 2: Metrónomo
    document.getElementById('tempoSlider').addEventListener('input', (e) => {
        const bpm = e.target.value;
        document.getElementById('bpmValue').textContent = bpm;
        document.getElementById('bpmInput').value = bpm;
        
        // Si el metrónomo está activo, reiniciarlo con el nuevo tempo
        if (metronomoActivo) {
            detenerMetronomo();
            iniciarMetronomo();
        }
    });

    document.getElementById('bpmInput').addEventListener('input', (e) => {
        let bpm = parseInt(e.target.value) || 120;
        bpm = Math.max(40, Math.min(240, bpm)); // Limitar entre 40 y 240
        
        document.getElementById('tempoSlider').value = bpm;
        document.getElementById('bpmValue').textContent = bpm;
        
        // Si el metrónomo está activo, reiniciarlo con el nuevo tempo
        if (metronomoActivo) {
            detenerMetronomo();
            iniciarMetronomo();
        }
    });

    document.getElementById('btnToggleMetronomo').addEventListener('click', toggleMetronomo);

    // Ejercicio 3: Combinado
    document.getElementById('tempoSliderCombinado').addEventListener('input', (e) => {
        const bpm = e.target.value;
        document.getElementById('bpmValueCombinado').textContent = bpm;
        document.getElementById('bpmInputCombinado').value = bpm;
        
        // Si el ejercicio combinado está activo, reiniciarlo con el nuevo tempo
        if (combinadoActivo) {
            detenerCombinado();
            iniciarCombinado();
        }
    });

    document.getElementById('bpmInputCombinado').addEventListener('input', (e) => {
        let bpm = parseInt(e.target.value) || 120;
        bpm = Math.max(40, Math.min(240, bpm)); // Limitar entre 40 y 240
        
        document.getElementById('tempoSliderCombinado').value = bpm;
        document.getElementById('bpmValueCombinado').textContent = bpm;
        
        // Si el ejercicio combinado está activo, reiniciarlo con el nuevo tempo
        if (combinadoActivo) {
            detenerCombinado();
            iniciarCombinado();
        }
    });

    document.getElementById('btnToggleCombinado').addEventListener('click', toggleCombinado);
    document.getElementById('toggleAlteracionesCombinado').addEventListener('change', () => {
        // Si está activo el ejercicio, reiniciarlo con las nuevas notas
        if (combinadoActivo) {
            detenerCombinado();
            iniciarCombinado();
        }
    });
}

// Cambiar entre ejercicios
function cambiarEjercicio(ejercicio) {
    // Detener metrónomo si está activo
    if (metronomoActivo) {
        detenerMetronomo();
        document.getElementById('btnToggleMetronomo').textContent = 'Iniciar';
    }

    // Detener combinado si está activo
    if (combinadoActivo) {
        detenerCombinado();
        document.getElementById('btnToggleCombinado').textContent = 'Iniciar';
    }

    // Actualizar botones del menú
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    
    // Ocultar todos los ejercicios
    document.querySelectorAll('.ejercicio').forEach(ej => ej.classList.remove('active'));

    if (ejercicio === 'notasAzar') {
        document.getElementById('btnNotasAzar').classList.add('active');
        document.getElementById('ejercicioNotasAzar').classList.add('active');
    } else if (ejercicio === 'metronomo') {
        document.getElementById('btnMetronomo').classList.add('active');
        document.getElementById('ejercicioMetronomo').classList.add('active');
    } else if (ejercicio === 'combinado') {
        document.getElementById('btnCombinado').classList.add('active');
        document.getElementById('ejercicioCombinado').classList.add('active');
    }
}

// EJERCICIO 1: NOTA AL AZAR
function generarNotaAzar() {
    const incluirAlteraciones = document.getElementById('toggleAlteraciones').checked;
    const incluirQuintaCuerda = document.getElementById('toggleQuintaCuerda').checked;
    const notasDisponibles = incluirAlteraciones ? notasCompletas : notasNaturales;
    
    const notaSeleccionada = notasDisponibles[Math.floor(Math.random() * notasDisponibles.length)];
    
    // Si es un objeto con sostenido y bemol, elegir uno al azar
    let notaAleatoria;
    if (typeof notaSeleccionada === 'object') {
        notaAleatoria = Math.random() < 0.5 ? notaSeleccionada.sostenido : notaSeleccionada.bemol;
    } else {
        notaAleatoria = notaSeleccionada;
    }
    
    const cuerdasDisponibles = incluirQuintaCuerda ? [...cuerdasBase, quintaCuerda] : cuerdasBase;
    const cuerda = cuerdasDisponibles[Math.floor(Math.random() * cuerdasDisponibles.length)];

    const notaDisplay = document.getElementById('notaDisplay');
    notaDisplay.innerHTML = `
        <span class="nota">${notaAleatoria}</span>
        <span class="cuerda">${cuerda.nombre}</span>
    `;
}

// EJERCICIO 2: METRÓNOMO
function inicializarAudio() {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    } catch (e) {
        console.error('Web Audio API no soportada', e);
    }
}

function toggleMetronomo() {
    if (metronomoActivo) {
        detenerMetronomo();
        document.getElementById('btnToggleMetronomo').textContent = 'Iniciar';
    } else {
        iniciarMetronomo();
        document.getElementById('btnToggleMetronomo').textContent = 'Detener';
    }
}

function iniciarMetronomo() {
    if (!audioContext) {
        alert('El audio no está disponible en tu navegador');
        return;
    }

    // Reanudar el contexto de audio si está suspendido
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const bpm = parseInt(document.getElementById('tempoSlider').value);
    const intervalo = 60000 / bpm; // Convertir BPM a milisegundos

    metronomoActivo = true;
    
    // Reproducir el primer beat inmediatamente
    reproducirClick();
    
    // Configurar intervalo para los siguientes beats
    intervaloMetronomo = setInterval(() => {
        reproducirClick();
    }, intervalo);
}

function detenerMetronomo() {
    metronomoActivo = false;
    if (intervaloMetronomo) {
        clearInterval(intervaloMetronomo);
        intervaloMetronomo = null;
    }
}

function reproducirClick() {
    if (!audioContext) return;

    const beatIndicator = document.getElementById('beatIndicator');
    
    // Animación visual
    beatIndicator.classList.add('beat');
    setTimeout(() => {
        beatIndicator.classList.remove('beat');
    }, 100);

    // Generar sonido de click
    const oscilador = audioContext.createOscillator();
    const ganancia = audioContext.createGain();

    oscilador.connect(ganancia);
    ganancia.connect(audioContext.destination);

    // Configuración del sonido
    oscilador.frequency.value = 1000; // Frecuencia en Hz
    oscilador.type = 'sine';

    // Envelope para el click
    const ahora = audioContext.currentTime;
    ganancia.gain.value = 0.3;
    ganancia.gain.exponentialRampToValueAtTime(0.01, ahora + 0.05);

    oscilador.start(ahora);
    oscilador.stop(ahora + 0.05);
}

// EJERCICIO 3: COMBINADO
function toggleCombinado() {
    if (combinadoActivo) {
        detenerCombinado();
        document.getElementById('btnToggleCombinado').textContent = 'Iniciar';
    } else {
        iniciarCombinado();
        document.getElementById('btnToggleCombinado').textContent = 'Detener';
    }
}

function iniciarCombinado() {
    if (!audioContext) {
        alert('El audio no está disponible en tu navegador');
        return;
    }

    // Reanudar el contexto de audio si está suspendido
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const bpm = parseInt(document.getElementById('tempoSliderCombinado').value);
    const intervalo = 60000 / bpm; // Convertir BPM a milisegundos

    combinadoActivo = true;
    
    // Generar la primera nota y reproducir el primer beat inmediatamente
    generarNotaCombinado();
    reproducirClickCombinado();
    
    // Configurar intervalo para los siguientes beats
    intervaloCombinado = setInterval(() => {
        generarNotaCombinado();
        reproducirClickCombinado();
    }, intervalo);
}

function detenerCombinado() {
    combinadoActivo = false;
    if (intervaloCombinado) {
        clearInterval(intervaloCombinado);
        intervaloCombinado = null;
    }
}

function generarNotaCombinado() {
    const incluirAlteraciones = document.getElementById('toggleAlteracionesCombinado').checked;
    const incluirQuintaCuerda = document.getElementById('toggleQuintaCuerdaCombinado').checked;
    const notasDisponibles = incluirAlteraciones ? notasCompletas : notasNaturales;
    
    const notaSeleccionada = notasDisponibles[Math.floor(Math.random() * notasDisponibles.length)];
    
    // Si es un objeto con sostenido y bemol, elegir uno al azar
    let notaAleatoria;
    if (typeof notaSeleccionada === 'object') {
        notaAleatoria = Math.random() < 0.5 ? notaSeleccionada.sostenido : notaSeleccionada.bemol;
    } else {
        notaAleatoria = notaSeleccionada;
    }
    
    const cuerdasDisponibles = incluirQuintaCuerda ? [...cuerdasBase, quintaCuerda] : cuerdasBase;
    const cuerda = cuerdasDisponibles[Math.floor(Math.random() * cuerdasDisponibles.length)];

    const notaDisplay = document.getElementById('notaDisplayCombinado');
    notaDisplay.innerHTML = `
        <span class="nota">${notaAleatoria}</span>
        <span class="cuerda">${cuerda.nombre}</span>
    `;
}

function reproducirClickCombinado() {
    if (!audioContext) return;

    const beatIndicator = document.getElementById('beatIndicatorCombinado');
    
    // Animación visual
    beatIndicator.classList.add('beat');
    setTimeout(() => {
        beatIndicator.classList.remove('beat');
    }, 100);

    // Generar sonido de click
    const oscilador = audioContext.createOscillator();
    const ganancia = audioContext.createGain();

    oscilador.connect(ganancia);
    ganancia.connect(audioContext.destination);

    // Configuración del sonido
    oscilador.frequency.value = 1000; // Frecuencia en Hz
    oscilador.type = 'sine';

    // Envelope para el click
    const ahora = audioContext.currentTime;
    ganancia.gain.value = 0.3;
    ganancia.gain.exponentialRampToValueAtTime(0.01, ahora + 0.05);

    oscilador.start(ahora);
    oscilador.stop(ahora + 0.05);
}
