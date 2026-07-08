import { SUPABASE_URL, SUPABASE_ANON_KEY } from './configuration.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let todosLosMentores = [];

async function cargarMentores() {
    try {
        const {data: mentores, error } = await supabase
        .from("cuentas")
        .select("id, nombre_completo, documento_url, verificado, area")
        .eq("rol", "MENTOR")

        if(error) throw error;

        todosLosMentores = mentores || [];
        mostrarMentores(todosLosMentores);
    } catch (error) {
        console.error(error);
        const grid = document.getElementById("mentores-grid");
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red;">
            No se pudieron cargar los mentores de la base de datos.
        </p>`;
    }
}

function mostrarMentores(mentores) {
    const grid = document.getElementById("mentores-grid");
    const emptyState = document.getElementById("empty-state");
    grid.innerHTML = "";

    if (mentores.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    }else {
        emptyState.classList.add("hidden");
    }

    mentores.forEach(mentor => {
        const card = document.createElement("article");
        card.classList.add("mentor-card");

        const areaTexto = mentor.area ? mentor.area : "General";
        card.innerHTML = `
            <div class="mentor-card-header">
                <img src="../../images/perfil1.png" class="mentor-card-avatar">
                <div class="mentor-card-meta">
                    <div class="mentor-card-name-row">
                        <h3 class="mentor-card-name">${mentor.nombre_completo}</h3>
                        ${mentor.verificado ? `<span class="badge-mini badge-verified-mini">✓ Verificado</span>` : ""}
                    </div>
                    <p class="mentor-card-area">
                        ${mentor.area ? mentor.area.charAt(0).toUpperCase() + mentor.area.slice(1) : "General"}
                    </p>
                </div>
            </div>
            
            <a href="mentor-profile.html?id=${mentor.id}" class="btn-ver-perfil">
                Ver perfil
            </a>
        `;
        grid.appendChild(card);
    });
}

let filtroAreaActual = 'todos';

window.filtrarMentores = function() {
    const terminoBusqueda = document.getElementById("buscador").value.toLowerCase().trim();

    const mentoresFiltrados = todosLosMentores.filter(mentor => {
        const coincideNombre = mentor.nombre_completo.toLowerCase().includes(terminoBusqueda);
        const areaMentor = (mentor.area || "").toLowerCase();
        
        // Valida que coincida tanto con el texto escrito como con el botón de la Pill seleccionada
        const coincideArea = (filtroAreaActual === 'todos' || areaMentor === filtroAreaActual);

        return coincideNombre && coincideArea;
    });

    mostrarMentores(mentoresFiltrados);
};

window.setFiltro = function(area, botonActivo) {
    filtroAreaActual = area.toLowerCase();

    // Cambiar la clase estética activa en los botones/pills
    document.querySelectorAll(".pill").forEach(pill => pill.classList.remove("active"));
    botonActivo.classList.add("active");

    // Ejecutar el filtro combinado
    window.filtrarMentores();
};

// Arrancar la carga apenas se lee el script
cargarMentores();