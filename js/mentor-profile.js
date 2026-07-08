import { SUPABASE_URL, SUPABASE_ANON_KEY } from './configuration.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. Obtener el ID del mentor desde los parámetros de la URL (?id=...)
const urlParams = new URLSearchParams(window.location.search);
const mentorId = urlParams.get('id');

// Variable para guardar el perfil cargado de Supabase
let datosMentorActual = null;

async function inicializarPerfil() {
    if (!mentorId) {
        alert("No se especificó ningún ID de mentor.");
        window.location.href = "mentores.html";
        return;
    }

    try {
        // 2. Traer el mentor específico por su ID
        const { data: mentor, error } = await supabase
            .from("cuentas")
            .select("id, nombre_completo, area, descripcion, verificado")
            .eq("id", mentorId)
            .single(); // Trae un solo objeto directo

        if (error) throw error;
        datosMentorActual = mentor;

        // 3. Pintar los datos en la vista de lectura
        document.getElementById("perf-nombre").textContent = mentor.nombre_completo;
        document.getElementById("perf-area").textContent = `👨‍🏫 Especialista en ${mentor.area || 'General'}`;
        document.getElementById("perf-descripcion").textContent = mentor.descripcion || "Este mentor aún no ha redactado su presentación.";
        
        if (mentor.verificado) {
            document.getElementById("perf-badge").classList.remove("hidden");
        }

        // 4. Validar si el usuario visitante es el dueño de la cuenta para dejarlo editar
        chequearPropietario();

    } catch (error) {
        console.error("Error al cargar perfil:", error.message);
        document.getElementById("perf-nombre").textContent = "Perfil no encontrado";
    }
}

// Compara el usuario autenticado actual con el perfil que estamos viendo
async function chequearPropietario() {
    // Obtenemos la sesión actual de Supabase Auth
    const { data: { session } } = await supabase.auth.getSession();
    
    // Si hay una sesión iniciada Y el id del usuario logueado es igual al id del perfil que estamos viendo
    if (session && session.user.id === mentorId) {
        // Habilitamos el botón "Editar mi Perfil"
        const btnEditar = document.getElementById("btn-editar-perfil");
        btnEditar.classList.remove("hidden");

        // Eventos para intercambiar pantallas (SPA)
        btnEditar.addEventListener("click", abrirFormularioEdicion);
    }
}

function abrirFormularioEdicion() {
    // Pasar valores actuales a los inputs del formulario
    document.getElementById("edit-nombre").value = datosMentorActual.nombre_completo;
    document.getElementById("edit-area").value = datosMentorActual.area || "tecnologia";
    document.getElementById("edit-descripcion").value = datosMentorActual.descripcion || "";

    // Intercambiar clases visuales
    document.getElementById("vista-lectura").classList.add("hidden");
    document.getElementById("vista-edicion").classList.remove("hidden");
}

// Cancelar edición
document.getElementById("btn-cancelar").addEventListener("click", () => {
    document.getElementById("vista-edicion").classList.add("hidden");
    document.getElementById("vista-lectura").classList.remove("hidden");
});

// 5. Guardar los cambios actualizados en Supabase
document.getElementById("form-editar-mentor").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoNombre = document.getElementById("edit-nombre").value;
    const nuevaArea = document.getElementById("edit-area").value;
    const nuevaDesc = document.getElementById("edit-descripcion").value;

    try {
        const { error } = await supabase
            .from("cuentas")
            .update({
                nombre_completo: nuevoNombre,
                area: nuevaArea,
                descripcion: nuevaDesc
            })
            .eq("id", mentorId);

        if (error) throw error;

        alert("¡Tu perfil se ha actualizado correctamente!");
        // Recargar la página para ver los datos frescos aplicados
        window.location.reload();

    } catch (error) {
        alert("Error al actualizar perfil: " + error.message);
    }
});

// Lanzar proceso
inicializarPerfil();