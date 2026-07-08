document.addEventListener("DOMContentLoaded", () => {
    const vistaResultados = document.getElementById("vista-resultados");
    const vistaDetalle = document.getElementById("vista-detalle");
    const vistaVacia = document.getElementById("vista-vacia");
    const mainSearchInput = document.getElementById("main-search-input");
    const btnBackToResults = document.getElementById("btn-back-to-results");
    const toggleMegasInput = document.getElementById("toggle-megas-input");
    const containerTarjetas = document.getElementById("contenedor-tarjetas");
    const checkboxesCategoria = document.querySelectorAll("input[name='categoria']");
    const selectNivel = document.getElementById("filter-nivel");
    const radiosMateria = document.querySelectorAll("input[name='materia']");
    const tabsFormato = document.querySelectorAll("#formato-tab-container .btn-tab");
    const btnLimpiarFiltros = document.getElementById("btn-limpiar-filtros");
    const btnResetEmpty = document.getElementById("btn-reset-empty");

    let supabaseClient = null;
    let remoteMaterials = [];

    let formatoSeleccionado = "Todos";

    let publishedMaterials = [
        {
            id: 1,
            title: "Matemáticas para niños",
            name: "Matemáticas para niños",
            description: "Un libro de matemáticas para niños de primaria.",
            category: "Libros",
            type: "PDF"
        }
    ];

    fetchAllTarjetasMateriales();

    // CORE DE FILTRADO INTERACTIVO
    function ejecutarFiltradoGlobal() {
        const categoriasActivas = Array.from(checkboxesCategoria).filter(cb => cb.checked).map(cb => cb.value);
        const nivelSeleccionado = selectNivel.value;
        let materiaSeleccionada = "Todas";
        radiosMateria.forEach(radio => { if (radio.checked) materiaSeleccionada = radio.value; });
        const textoBusqueda = mainSearchInput.value.trim().toLowerCase();

        if (textoBusqueda === "cálculo cuántico para niños" || textoBusqueda === "cálculo cuántico") {
            vistaResultados.classList.remove("active");
            vistaDetalle.classList.remove("active");
            vistaVacia.classList.add("active");
            return;
        }

        const tarjetas = document.querySelectorAll(".libro-card");
        let visibles = 0;

        tarjetas.forEach(tarjeta => {
            const catCard = tarjeta.getAttribute("data-categoria");
            const matCard = tarjeta.getAttribute("data-materia");
            const formatoCard = tarjeta.getAttribute("data-formato");
            const tituloCard = tarjeta.querySelector("h3").textContent.toLowerCase();

            const cumpleCategoria = categoriasActivas.includes(catCard);
            const cumpleMateria = (materiaSeleccionada === "Todas") || (matCard === materiaSeleccionada);
            const cumpleFormato = (formatoSeleccionado === "Todos") || (formatoCard === formatoSeleccionado);
            const cumpleBusqueda = (textoBusqueda === "") || (tituloCard.includes(textoBusqueda));

            if (cumpleCategoria && cumpleMateria && cumpleFormato && cumpleBusqueda) {
                tarjeta.style.display = "flex";
                visibles++;
            } else {
                tarjeta.style.display = "none";
            }
        });

        if (visibles === 0) {
            vistaResultados.classList.remove("active");
            vistaVacia.classList.add("active");
        } else {
            if (!vistaDetalle.classList.contains("active")) {
                vistaVacia.classList.remove("active");
                vistaResultados.classList.add("active");
            }
        }
    }

    checkboxesCategoria.forEach(cb => cb.addEventListener("change", ejecutarFiltradoGlobal));
    selectNivel.addEventListener("change", ejecutarFiltradoGlobal);
    radiosMateria.forEach(radio => radio.addEventListener("change", ejecutarFiltradoGlobal));
    mainSearchInput.addEventListener("input", ejecutarFiltradoGlobal);

    tabsFormato.forEach(tab => {
        tab.addEventListener("click", () => {
            tabsFormato.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            formatoSeleccionado = tab.getAttribute("data-formato");
            ejecutarFiltradoGlobal();
        });
    });

    containerTarjetas.addEventListener("click", (e) => {
        const botonDetalle = e.target.closest(".recursos-btn-detalle");
        if (botonDetalle) {
            // Aqui recuperamos el id del material y buscamos en el array de materiales remotos
            const materialId = parseInt(botonDetalle.getAttribute("data-id"), 10);
            const materialSeleccionado = remoteMaterials.find(m => m.id === materialId);
            if (materialSeleccionado) {
                console.log("Material seleccionado:", materialSeleccionado);
                renderMaterialDetail(materialSeleccionado);
            }

            vistaResultados.classList.remove("active");
            vistaDetalle.classList.add("active");
            window.scrollTo(0, 0);
        }
    });

    vistaDetalle.addEventListener("click", (e) => {
        if (e.target.id === "btn-back-to-results") {
            vistaDetalle.classList.remove("active");
            vistaResultados.classList.add("active");
        }else if (e.target.classList.contains("btn-action-download")) {
            const materialId = parseInt(e.target.getAttribute("data-id"), 10);
            const materialSeleccionado = remoteMaterials.find(m => m.id === materialId);
            console.log("Material seleccionado para descarga:", materialSeleccionado);
            if (materialSeleccionado) {
                descargarPDF(materialSeleccionado.path, `${materialSeleccionado.name}.pdf`);
            }
        }
    });

    toggleMegasInput.addEventListener("change", () => {
        document.querySelectorAll(".libro-card-top").forEach(p => {
            if (toggleMegasInput.checked) p.classList.add("hide-cover-active");
            else p.classList.remove("hide-cover-active");
        });
    });

    containerTarjetas.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-fav")) {
            e.target.classList.toggle("active");
            e.target.textContent = e.target.classList.contains("active") ? "💙" : "🖤";
        }
    });

    function resetFilters() {
        mainSearchInput.value = "";
        checkboxesCategoria.forEach(cb => cb.checked = true);
        radiosMateria.forEach(r => r.checked = r.value === "Todas");
        formatoSeleccionado = "Todos";
        tabsFormato.forEach(t => t.classList.toggle("active", t.getAttribute("data-formato") === "Todos"));
        vistaVacia.classList.remove("active");
        vistaResultados.classList.add("active");
        ejecutarFiltradoGlobal();
    }

    function getSupabaseClient() {
        if (supabaseClient) return supabaseClient;

        if (!window.supabase) {
            throw new Error("La librería de Supabase no está disponible.");
        }

        const supabaseUrl = window.SUPABASE_URL || "https://sviblsfhersxggcqptfh.supabase.co";
        const supabaseAnonKey = window.SUPABASE_ANON_KEY || "sb_publishable_GmUHZfbasiOBPudKKi1r9Q_f01Wycu2";
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        return supabaseClient;
    }

    function mapSupabaseMaterial(record) {
        return {
            id: record.id,
            title: record.name || "Material sin título",
            name: record.name || "Material sin título",
            description: record.description || "Sin descripción",
            category: record.category || "Sin categoría",
            type: record.type || "Sin tipo",
            path: record.path || "#",
            image_preview: record.image_preview || null,
            cuentas: record.cuentas || { nombre_completo: "Autor desconocido" },
        };
    }

    async function fetchAllTarjetasMateriales() {
        // obtener de la api de supabase todos los materiales educativos y renderizarlos en el contenedor de tarjetas
        try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase
                .from("recursos")
                .select("id, name, description, category, type, path, image_preview, created_at, cuentas(nombre_completo)")
                .order("id", { ascending: false });

            if (error) {
                throw error;
            }
            remoteMaterials = (data || []).map(mapSupabaseMaterial);
            renderMaterialsList(remoteMaterials, containerTarjetas);
        } catch (error) {
            console.error("No se pudieron obtener los materiales desde Supabase:", error);
        }

    }

    const materialIcons = {
        "Libros": "📚",
        "Guías": "📝",
        "Ejercicios": "✏️",
        "Videos": "🎥",
        "Matematicas": "🧮",
        "Ciencias": "🔬",
        "Lenguaje": "📖",
        "Historia": "🏺",
        "Tecnología": "💻"
    };
    const getIconForCategory = (category) => {
        // Si la categoría existe en el objeto, la devuelve; si no, usa el "fallback" por defecto ("📖")
        return materialIcons[category] || "📖";
    };
    function renderMaterialsList(materials, container) {
        container.innerHTML = "";
        if (materials.length === 0) {
            vistaResultados.classList.remove("active");
            vistaVacia.classList.add("active");
            return;
        }
        materials.forEach(material => {
            container.innerHTML += `
            <div class="libro-card" data-materia="${material.category}" data-categoria="${material.type}" data-nivel="Secundaria"
                  data-formato="${material.type}">
                  <div class="libro-card-top">
                    <button class="btn-fav" type="button">🖤</button>
                    <div class="libro-cover-placeholder">${getIconForCategory(material.category)}</div>
                  </div>
                  <div class="libro-card-info">
                    <div class="libro-tags"><span class="tag-mat">${material.category}</span><span class="tag-formato">${material.type}
                        (PDF)</span></div>
                    <h3>${material.name}</h3>
                    <p class="autor">Por ${material.cuentas?.nombre_completo || "Autor desconocido"}</p>
                    <button class="recursos-btn-detalle" data-id="${material.id}" type="button">Ver Detalle</button>
                  </div>
                </div>`;
        });
    }
    // Función para descargar PDF
    function descargarPDF(urlPdf, nombreArchivo) {

        if (!urlPdf || urlPdf === "#") {
            alert("No hay archivo disponible para descargar.");
            return;
        }

        // Crear un elemento <a> temporal para descargar
        const enlaceDescarga = document.createElement("a");
        enlaceDescarga.href = urlPdf;
        enlaceDescarga.download = nombreArchivo || "documento.pdf";
        document.body.appendChild(enlaceDescarga);
        enlaceDescarga.click();
        document.body.removeChild(enlaceDescarga);
    }

    // Vista Detalle Material
    function renderMaterialDetail(material) {

        const breakcrumbTitle = material.name.length > 30 ? material.name.substring(0, 30) + "..." : material.name;

        const typeDocument = material.type || "Desconocido";
        const categoryDocument = material.category || "Desconocido";
        const authorDocument = material.cuentas?.nombre_completo || "Autor desconocido";
        const descriptionDocument = material.description || "Sin descripción disponible.";
        const pathDocumentBucket = material.path || "#";

        let htmlButtons = typeDocument === "digital" ? `
        <button type="button" class="btn-action-download" data-id="${material.id}">📥 Descargar PDF (Digital)</button>`:`
        <button type="button" class="btn-action-loan" onclick="alert('Préstamo físico solicitado.')">Solicitar Préstamo Físico</button>
        `;
        vistaDetalle.innerHTML = `
        <button type="button" class="recursos-btn-volver" id="btn-back-to-results">
           ← Recursos / <strong id="detalle-dinamico-breadcrumb">${breakcrumbTitle}</strong>
        </button>

        <div class="detalle-grid-layout">
            <div class="detalle-col-izquierda">
                <div class="detalle-main-card">
                    <div class="detalle-cover-big" id="detalle-icon-placeholder">🧮</div>
                    <div class="detalle-main-info">
                    <div class="libro-tags">
                        <span class="tag-mat" id="detalle-tag-materia">${categoryDocument}</span>
                        <span class="tag-formato" id="detalle-tag-formato">${typeDocument}</span>
                    </div>
                    <h2 id="detalle-titulo">${material.name}</h2>
                    <p class="autor-big">Por <strong id="detalle-autor">${authorDocument}</strong></p>

                    <div class="detalle-mini-data">
                        <div><small>PUBLICADO</small><br><strong>2024</strong></div>
                        <div><small>NIVEL</small><br><strong>Superior / Pre</strong></div>
                        <div><small>IDIOMA</small><br><strong>Español</strong></div>
                    </div>
                    </div>
                </div>

                <div class="detalle-sinopsis">
                    <h3>Sinopsis</h3>
                    <p id="detalle-descripcion">${descriptionDocument}</p>
                </div>
            </div>
            <div class="detalle-col-derecha">
              <div class="card-disponibilidad">
                <div class="disp-status"><span class="dot-green"></span> En Stock (Lima)</div>
                ${htmlButtons}
                <div class="puntos-recojo">
                 <!-- <h4>Puntos de recojo cercanos</h4>
                  <p>📍 <strong>Biblioteca Central UNMSM</strong><br><small>Cercado de Lima • 2.5 km</small></p>
                  <p>📍 <strong>Centro Comunitario Surco</strong><br><small>Av. Ayacucho • 8.1 km</small></p> -->
                </div>
              </div>

              <div class="card-tip-ahorro">
                💡 <strong>Tip de ahorro</strong>
                <p>¿Sabías que puedes descargar la versión PDF comprimida para ahorrar hasta un 40% de datos?</p>
              </div>
            </div>
            
        </div>      
              `;
    }


    btnLimpiarFiltros.addEventListener("click", resetFilters);
    btnResetEmpty.addEventListener("click", resetFilters);
});