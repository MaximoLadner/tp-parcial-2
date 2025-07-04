const contenedor = document.getElementById('info-lanzamiento');

// Obtener un lanzamiento random
async function obtenerLanzamientoAleatorio() {
    try {
        const res = await fetch('https://api.spacexdata.com/v4/launches/');
        const lanzamientos = await res.json();

        // Elegir uno al azar
        const randomIndex = Math.floor(Math.random() * lanzamientos.length);
        const lanzamiento = lanzamientos[randomIndex];

        mostrarLanzamiento(lanzamiento);
    } catch (error) {
        contenedor.innerHTML = `<p>Error al cargar el lanzamiento 😞</p>`;
        console.error(error);
    }
}


// Mostrar el lanzamiento.
function mostrarLanzamiento(lanzamiento) {
    const fecha = new Date(lanzamiento.date_utc).toLocaleDateString();

    contenedor.innerHTML = `
        <h2>${lanzamiento.name}</h2>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p><strong>Detalles:</strong> ${lanzamiento.details || "Sin descripción disponible."}</p>
        <img class="imagenes-lanzamiento" src="${lanzamiento.links.patch.small || 'https://placehold.co/300x100?text=No-Image'}" alt="${lanzamiento.name}">
        ${lanzamiento.links.wikipedia ? `<p><a href="${lanzamiento.links.wikipedia}" target="_blank" style="color: var(--neon-cyan);">Más info en Wikipedia</a></p>` : ""}
    `;
}


// Cargar uno al iniciar
obtenerLanzamientoAleatorio();

// botón para obtener infinitos lanzamientos randoms
document.getElementById('nuevo-lanzamiento').addEventListener('click', () => {
    obtenerLanzamientoAleatorio();
});