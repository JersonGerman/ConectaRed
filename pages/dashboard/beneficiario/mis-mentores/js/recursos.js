document.addEventListener("DOMContentLoaded", () => {
    const vistaResultados = document.getElementById("vista-resultados");
    const vistaDetalle    = document.getElementById("vista-detalle");
    const vistaVacia      = document.getElementById("vista-vacia");
    const mainSearchInput    = document.getElementById("main-search-input");
    const btnBackToResults   = document.getElementById("btn-back-to-results");
    const toggleMegasInput   = document.getElementById("toggle-megas-input");
    const containerTarjetas  = document.getElementById("contenedor-tarjetas");
    const checkboxesCategoria = document.querySelectorAll("input[name='categoria']");
    const selectNivel          = document.getElementById("filter-nivel");
    const radiosMateria        = document.querySelectorAll("input[name='materia']");
    const tabsFormato          = document.querySelectorAll("#formato-tab-container .btn-tab");
    const btnLimpiarFiltros    = document.getElementById("btn-limpiar-filtros");
    const btnResetEmpty        = document.getElementById("btn-reset-empty");

    let formatoSeleccionado = "Todos";

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
            vistaResultados.classList.remove("active");
            vistaDetalle.classList.add("active");
            window.scrollTo(0, 0);
        }
    });

    btnBackToResults.addEventListener("click", () => {
        vistaDetalle.classList.remove("active");
        vistaResultados.classList.add("active");
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

    btnLimpiarFiltros.addEventListener("click", resetFilters);
    btnResetEmpty.addEventListener("click", resetFilters);
});