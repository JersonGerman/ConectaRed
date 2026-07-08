document.addEventListener("DOMContentLoaded", () => {
    const gridFavoritos = document.querySelector(".favoritos-grid");
    const botonesFiltro = document.querySelectorAll(".favoritos-filtros .filtro-btn");
    const inputBuscar = document.getElementById("buscarFavorito");

    let supabaseClient = null;
    let favoritosData = []; // guarda { favoritoId, recurso }
    let filtroActivo = "Todos";

    function getSupabaseClient() {
        if (supabaseClient) return supabaseClient;
        if (!window.supabase) throw new Error("La librería de Supabase no está disponible.");
        const supabaseUrl = window.SUPABASE_URL;
        const supabaseAnonKey = window.SUPABASE_ANON_KEY;
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        return supabaseClient;
    }

    async function obtenerUsuarioActual(supabase) {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
            console.error("No hay sesión activa:", error);
            return null;
        }
        return data.user;
    }

    async function cargarFavoritos() {
        try {
            const supabase = getSupabaseClient();
            const user = await obtenerUsuarioActual(supabase);

            if (!user) {
                gridFavoritos.innerHTML = `<p class="favoritos-empty">Debes iniciar sesión para ver tus recursos guardados.</p>`;
                return;
            }

            const { data, error } = await supabase
                .from("favoritos")
                .select("id, id_recurso, recursos(id, name, description, category, type, path, image_preview, cuentas(nombre_completo))")
                .eq("id_cuenta", user.id)
                .order("id", { ascending: false });

            if (error) throw error;

            favoritosData = (data || [])
                .filter(f => f.recursos) // por si el recurso fue borrado
                .map(f => ({ favoritoId: f.id, recurso: f.recursos }));

            renderFavoritos(favoritosData);
        } catch (error) {
            console.error("Error cargando favoritos:", error);
            gridFavoritos.innerHTML = `<p class="favoritos-empty">Ocurrió un error al cargar tus favoritos.</p>`;
        }
    }

    function coincideFiltro(recurso) {
        if (filtroActivo === "Todos") return true;
        const categoria = (recurso.category || "").toLowerCase();
        const tipo = (recurso.type || "").toLowerCase();
        const filtro = filtroActivo.toLowerCase();
        return categoria.includes(filtro) || tipo.includes(filtro);
    }

    function coincideBusqueda(recurso) {
        const texto = (inputBuscar.value || "").trim().toLowerCase();
        if (texto === "") return true;
        return (recurso.name || "").toLowerCase().includes(texto);
    }

    function renderFavoritos(lista) {
        const visibles = lista.filter(f => coincideFiltro(f.recurso) && coincideBusqueda(f.recurso));

        if (visibles.length === 0) {
            gridFavoritos.innerHTML = `<p class="favoritos-empty">No tienes recursos guardados que coincidan.</p>`;
            return;
        }

        gridFavoritos.innerHTML = "";
        visibles.forEach(({ favoritoId, recurso }) => {
            const imagen = recurso.image_preview || "../../../../images/dashboard/placeholder-recurso.png";
            const autor = recurso.cuentas?.nombre_completo || "Autor desconocido";

            gridFavoritos.innerHTML += `
            <article class="favorito-card" data-favorito-id="${favoritoId}">
                <div class="favorito-img">
                    <img src="${imagen}" alt="${recurso.name}">
                    <button class="btn-fav active" data-favorito-id="${favoritoId}">❤️</button>
                    <span class="tipo-recurso">${recurso.type || "Recurso"}</span>
                </div>
                <div class="favorito-body">
                    <h3>${recurso.name || "Sin título"}</h3>
                    <p class="autor">${autor}</p>
                    <div class="card-footer">
                        <small>Guardado</small>
                        <button class="recursos-btn-detalle" data-path="${recurso.path || "#"}">Abrir</button>
                    </div>
                </div>
            </article>`;
        });
    }

    async function quitarFavorito(favoritoId, cardEl) {
        try {
            const supabase = getSupabaseClient();
            const { error } = await supabase.from("favoritos").delete().eq("id", favoritoId);
            if (error) throw error;

            favoritosData = favoritosData.filter(f => f.favoritoId !== favoritoId);
            cardEl.remove();

            if (favoritosData.filter(f => coincideFiltro(f.recurso) && coincideBusqueda(f.recurso)).length === 0) {
                renderFavoritos(favoritosData);
            }
        } catch (error) {
            console.error("Error quitando favorito:", error);
            alert("No se pudo quitar el favorito. Intenta de nuevo.");
        }
    }

    gridFavoritos.addEventListener("click", (e) => {
        const btnFav = e.target.closest(".btn-fav");
        if (btnFav) {
            const favoritoId = parseInt(btnFav.getAttribute("data-favorito-id"), 10);
            const card = btnFav.closest(".favorito-card");
            quitarFavorito(favoritoId, card);
            return;
        }

        const btnAbrir = e.target.closest(".recursos-btn-detalle");
        if (btnAbrir) {
            const path = btnAbrir.getAttribute("data-path");
            if (path && path !== "#") window.open(path, "_blank");
        }
    });

    botonesFiltro.forEach(btn => {
        btn.addEventListener("click", () => {
            botonesFiltro.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filtroActivo = btn.textContent.trim();
            renderFavoritos(favoritosData);
        });
    });

    inputBuscar.addEventListener("input", () => renderFavoritos(favoritosData));

    cargarFavoritos();
});