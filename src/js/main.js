// Variables globales
const contenedorLanzamientos = document.getElementById('contenedor-lanzamientos');
const barraBusqueda = document.getElementById('busqueda');
const filtroAnio = document.getElementById('filtro-anio');
const filtroEstado = document.getElementById('filtro-estado');
const botonOrdenarFecha = document.getElementById('ordenar-fecha');
const botonMostrarMas = document.getElementById('boton-mostrar-mas');

let lanzamientos = [];
let lanzamientosFiltrados = [];
let ordenAscendente = true;

const lanzamientosPorPagina = 10;
let paginaActual = 1;

// Función para mostrar lanzamientos paginados
function mostrarLanzamientosPaginados() {
    // Calcular desde dónde hasta dónde mostrar
    const inicio = 0;
    const fin = paginaActual * lanzamientosPorPagina;
    const listaAMostrar = lanzamientosFiltrados.slice(inicio, fin);

    contenedorLanzamientos.innerHTML = '';

    if (listaAMostrar.length === 0) {
        contenedorLanzamientos.innerHTML = '<p class="no-resultados">🔍 No hay resultados</p>';
        botonMostrarMas.style.display = 'none';
        return;
    }


    // Listado de todas las tarjetas
    
    listaAMostrar.forEach(lanzamiento => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-lanzamiento';
    tarjeta.innerHTML = `
        <img class="imagenes-lanzamiento" 
             src="${lanzamiento.links.patch.small || 'https://placehold.co/300x100?text=No-Image'}" 
             alt="${lanzamiento.name}" 
             loading="lazy">
        <div class="contenido-tarjeta">
            <h3>Nombre del lanzamiento: ${lanzamiento.name}</h3>
            <p class="fecha-lanzamiento">Fecha de lanzamiento📅: ${new Date(lanzamiento.date_utc).toLocaleDateString()}</p>
            <p class="estado-lanzamiento ${lanzamiento.success ? 'exito' : 'fallo'}">
                Estado del lanzamiento: ${lanzamiento.success ? '✅ Éxito' : '❌ Fallo'}
            </p>
            <button class="boton-detalle" onclick="mostrarDetalle('${lanzamiento.id}')">
                Ver detalles <i class="fas fa-rocket"></i>
            </button>
        </div>
    `;
    contenedorLanzamientos.appendChild(tarjeta);
});
   
}

// Función principal: carga lanzamientos y los muestra
async function cargarLanzamientos() {
    try {
        const respuesta = await fetch('https://api.spacexdata.com/v4/launches');
        lanzamientos = await respuesta.json();
        lanzamientosFiltrados = [...lanzamientos];
        cargarFiltroAnios();
        paginaActual = 1;
        mostrarLanzamientosPaginados();
    } catch (error) {
        console.error('Error al cargar lanzamientos:', error);
        contenedorLanzamientos.innerHTML = `
            <div class="error">
                <p>🚨 No se pudieron cargar los lanzamientos. Intentelo nuevamente.</p>
            </div>
        `;
    }
}

// Filtros y búsqueda actualizan la lista filtrada y reinician paginación
function filtrarLanzamientos() {
    const textoBusqueda = barraBusqueda.value.toLowerCase();
    const anioSeleccionado = filtroAnio.value;
    const estadoSeleccionado = filtroEstado.value;

    lanzamientosFiltrados = lanzamientos.filter(lanzamiento => {
        const coincideNombre = lanzamiento.name.toLowerCase().includes(textoBusqueda);
        const coincideAnio = anioSeleccionado ? new Date(lanzamiento.date_utc).getFullYear() == anioSeleccionado : true;
        const coincideEstado = estadoSeleccionado ? 
            (estadoSeleccionado === 'success' ? lanzamiento.success : !lanzamiento.success) : true;

        return coincideNombre && coincideAnio && coincideEstado;
    });

    paginaActual = 1;
    mostrarLanzamientosPaginados();
}

// Ordenar lanamientos y reiniciar paginación
function ordenarPorFecha() {
    lanzamientosFiltrados.sort((a, b) => {
        const fechaA = new Date(a.date_utc);
        const fechaB = new Date(b.date_utc);
        return ordenAscendente ? fechaA - fechaB : fechaB - fechaA;
    });

    ordenAscendente = !ordenAscendente;
    botonOrdenarFecha.innerHTML = `Ordenar por fecha <i class="fas fa-arrow-${ordenAscendente ? 'down' : 'up'}"></i>`;

    paginaActual = 1;
    mostrarLanzamientosPaginados();
}

// Cargar años para filtro 
function cargarFiltroAnios() {
    const anios = [...new Set(lanzamientos.map(l => new Date(l.date_utc).getFullYear()))];
    anios.sort((a, b) => b - a);
    filtroAnio.innerHTML = `<option value="" style="color: black;">Todos los años</option>`;
    anios.forEach(anio => {
        const opcion = document.createElement('option');
        opcion.value = anio;
        opcion.textContent = anio;
        opcion.style.color = 'black'; 
        filtroAnio.appendChild(opcion);
    });
}

// Evento para el botón "Mostrar más"
botonMostrarMas.addEventListener('click', () => {
    paginaActual++;
    mostrarLanzamientosPaginados();
});

// Eventos de filtro y orden
barraBusqueda.addEventListener('input', filtrarLanzamientos);
filtroAnio.addEventListener('change', filtrarLanzamientos);
filtroEstado.addEventListener('change', filtrarLanzamientos);
botonOrdenarFecha.addEventListener('click', ordenarPorFecha);


// Al abrirs el popup, hace un sonido.
const sonidoPopup = new Audio('images/open_001.ogg');
// Le bajo el sonido para no quedarme sordo.
sonidoPopup.volume = 0.1;

// popup
function mostrarDetalle(idLanzamiento) {
    const lanzamiento = lanzamientos.find(l => l.id === idLanzamiento);
    if (!lanzamiento) return;

    const modal = document.getElementById("modalInfo");
    const contenido = document.getElementById("modalContenido");

    contenido.innerHTML = `
        <button class="cerrar-modal" onclick="cerrarModal()">✖</button>
        <h2>${lanzamiento.name}</h2>
        <p><strong>Fecha:</strong> ${new Date(lanzamiento.date_utc).toLocaleString()}</p>
        <p><strong>Cohete:</strong> ${lanzamiento.rocket}</p>
        <p style="margin-bottom: 40px;"><strong>Detalles:</strong> ${lanzamiento.details || 'No hay detalles disponibles.'}</p>
        ${lanzamiento.links.webcast ? `<a href="${lanzamiento.links.webcast}" target="_blank" class="boton-neon">Ver video <i class="fab fa-youtube"></i></a>` : ''}
    `;
    
    sonidoPopup.play(); 
     
    modal.classList.add("mostrar");
}

function cerrarModal() {
    const modal = document.getElementById("modalInfo");
    modal.classList.remove("mostrar");
}


// Inicializar
document.addEventListener('DOMContentLoaded', cargarLanzamientos);