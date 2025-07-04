let puntos = 0;
let misionActual = null;
let esVerdadera = false;
let yaRespondio = false; 

// Trae una misión aleatoria desde la API de SpaceX
async function obtenerMisionRandom() {
    const res = await fetch("https://api.spacexdata.com/v4/launches");
    const data = await res.json();
    const random = data[Math.floor(Math.random() * data.length)];
    return random;
}

// Reproduce el sonido correcto según si el usuario acertó o erró
function reproducirSonido(acierto) {
    const sonido = document.getElementById(acierto ? "sonido-acierto" : "sonido-error");
    sonido.currentTime = 0;
    sonido.play();
}

// Verifica si la respuesta del usuario es correcta o incorrecta
function responder(eleccion) {
    if (yaRespondio) return; 

    yaRespondio = true; 

    const resultado = document.getElementById("resultado");
    if (eleccion === esVerdadera) {
        puntos++;
        reproducirSonido(true);
        resultado.textContent = "✅ ¡Correcto!";
        resultado.style.color = "lime";
    } else {
        reproducirSonido(false);
        resultado.textContent = "❌ ¡Incorrecto!";
        resultado.style.color = "red";
    }

    // Actualiza los puntos en pantalla
    document.getElementById("puntos").textContent = `Puntos: ${puntos}`;
}

// Carga una nueva misión y genera una frase (verdadera o falsa)
async function cargarNueva() {
    const pregunta = document.getElementById("pregunta");
    const resultado = document.getElementById("resultado");
    resultado.textContent = "";
    yaRespondio = false; 

    misionActual = await obtenerMisionRandom();
    const fueExitosa = misionActual.success;

    // Si la misión no tiene estado definido, se busca otra
    if (fueExitosa === null) {
        cargarNueva();
        return;
    }

    // Decide aleatoriamente si la frase será verdadera o falsa
    esVerdadera = Math.random() < 0.5;

    // Genera la frase en base al resultado verdadero o falso
    const frase = esVerdadera
        ? `La misión "${misionActual.name}" fue un ${fueExitosa ? "éxito" : "fallo"}`
        : `La misión "${misionActual.name}" fue un ${!fueExitosa ? "éxito" : "fallo"}`;

    // Muestra la frase en pantalla
    pregunta.textContent = frase;
}

// Inicia el juego cuando la página carga
window.onload = cargarNueva;