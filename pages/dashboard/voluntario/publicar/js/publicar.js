/* ==========================================================================
   CONECTARED - ARQUITECTURA MODULAR Y CONTROL DINÁMICO DE NAV/SIDEBAR
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const activeRole =
    typeof CURRENT_USER_ROLE !== "undefined" ? CURRENT_USER_ROLE : "STUDENT";

  // 1. Carga de Componentes Estáticos Reutilizables (Header y Footer)
  loadComponent("header-container", "/components/header.html", () => {
    highlightCurrentPage(".nav-link");
  });

  loadComponent("footer-container", "/components/footer.html");

  // 2. Inyección Dinámica del Sidebar en Función del Rol de Usuario
  renderDynamicSidebar(activeRole);
});

/**
 * Función genérica para cargar componentes HTML estáticos
 * @param {string} elementId - Identificador del contenedor en el DOM
 * @param {string} filePath - Ruta del archivo HTML a consumir
 * @param {Function} callback - Función opcional a ejecutar tras la inyección
 */
const loadComponent = (elementId, filePath, callback = null) => {
  const container = document.getElementById(elementId);
  if (!container) return;

  fetch(filePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error al cargar el componente: ${filePath}`);
      }
      return response.text();
    })
    .then((htmlContent) => {
      container.innerHTML = htmlContent;
      if (callback) callback();
    })
    .catch((error) => console.error(error));
};

/**
 * Ilumina el enlace correspondiente a la página activa en el navegador
 * @param {string} selector - Selector CSS de los enlaces a evaluar
 */
const highlightCurrentPage = (selector) => {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll(selector);

  links.forEach((link) => {
    // Normalización para comparar rutas relativas de forma segura
    const linkPath = link.getAttribute("href")?.split("/").pop();
    if (linkPath === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
};

/**
 * Genera e inyecta la estructura semántica del Sidebar según el rol del usuario
 * @param {string} role - El rol del usuario activo ("STUDENT" o "VOLUNTEER")
 */
function renderDynamicSidebar(role) {
  const sidebarContainer = document.getElementById("sidebar-container");
  if (!sidebarContainer) return;

  let mainMenuItems = [];

  // Discriminación de accesos principales según la fisonomía del rol
  if (role === "VOLUNTEER") {
    mainMenuItems = [
      { text: "Dashboard", icon: "📊", url: "/pages/dashboard/dashboard.html" },
      { text: "Publicar", icon: "📝", url: "/pages/publicar/publicar.html" },
      { text: "Donaciones", icon: "📈", url: "#" },
      { text: "Logros", icon: "🏆", url: "#", badge: "3" },
      { text: "Certificados", icon: "📜", url: "#" },
      { text: "Mensajes", icon: "💬", url: "#", badge: "4" },
    ];
  } else {
    mainMenuItems = [
      { text: "Dashboard", icon: "📊", url: "/pages/dashboard/dashboard.html" },
      { text: "Mis mentores", icon: "👥", url: "#", badge: "3" },
      { text: "Mis sesiones", icon: "📅", url: "#", badge: "3" },
      { text: "Logros", icon: "🏆", url: "#" },
      { text: "Recursos guardados", icon: "🔖", url: "#" },
      { text: "Mensajes", icon: "💬", url: "#" },
    ];
  }

  // Inyección del armazón HTML respetando las clases globales de vuestro style.css
  sidebarContainer.innerHTML = `
        <aside class="main-sidebar">
            <div class="sidebar-section">
                <h3 class="sidebar-title">MENU PRINCIPAL</h3>
                <ul class="sidebar-menu">
                    ${mainMenuItems
                      .map(
                        (item) => `
                        <li>
                            <a href="${item.url}" class="sidebar-link">
                                <span class="sidebar-icon-placeholder">${item.icon}</span>
                                <span class="sidebar-text">${item.text}</span>
                                ${item.badge ? `<span class="sidebar-badge">${item.badge}</span>` : ""}
                            </a>
                        </li>
                    `,
                      )
                      .join("")}
                </ul>
            </div>

            <div class="sidebar-section footer-options" style="margin-top: auto;">
                <h3 class="sidebar-title">OTRAS OPCIONES</h3>
                <ul class="sidebar-menu">
                    <li>
                        <a href="#" class="sidebar-link">
                            <span class="sidebar-icon-placeholder">⚙️</span>
                            <span class="sidebar-text">Configuracion</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" class="sidebar-link logout">
                            <span class="sidebar-icon-placeholder">🚪</span>
                            <span class="sidebar-text" style="color: #e53e3e;">Cerrar Sesion</span>
                        </a>
                    </li>
                </ul>
            </div>
        </aside>
    `;

  // Ejecución inmediata de la iluminación para marcar el ítem del Sidebar que esté activo
  highlightCurrentPage(".sidebar-link");
}



/* ==========================================================================
   CONECTARED - MOTOR DE PUBLICACIÓN Y GESTIÓN MULTI-ARCHIVO
   ========================================================================== */

   
console.log("js/publicar.js: Cargado e inspeccionando el escenario...");

// Bandera de control para evitar doble inicialización
let moduleInitialized = false;
let filesToPublish = [];

// CANAL 1: Escucha del evento personalizado maestro
document.addEventListener("LayoutModulesLoaded", (event) => {
  console.log("js/publicar.js: Evento 'LayoutModulesLoaded' detectado.");
  if (!moduleInitialized) {
    initializePublishingModule();
  }
});

// CANAL 2: Fallback inmediato si el evento se extravía o se ejecuta antes
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  console.log(
    "js/publicar.js: El DOM ya estaba listo. Intentando inicialización directa...",
  );
  setTimeout(initializePublishingModule, 100); // Pequeño margen para asegurar el render
} else {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("js/publicar.js: Evento DOMContentLoaded nativo detectado.");
    setTimeout(initializePublishingModule, 100);
  });
}

function initializePublishingModule() {
  const dropZone = document.getElementById("upload-drop-zone");
  const fileInput = document.getElementById("upload-file-input");
  const form = document.getElementById("publish-form");

  // Si los elementos aún no existen en el DOM, abortamos pacíficamente para esperar al Canal 1
  if (!dropZone || !fileInput || !form) {
    console.warn(
      "js/publicar.js: Elementos no hallados aún. Aguardando al evento maestro...",
    );
    return;
  }

  // Si ya se inicializó, no duplicamos esfuerzos
  if (moduleInitialized) return;
  moduleInitialized = true;

  console.log(
    "¡ÉXITO EN EL ACOPLE! Escuchadores vinculándose a la zona de arrastre.",
  );

  // Redirección segura del clic
  dropZone.addEventListener("click", (e) => {
    if (e.target !== fileInput) {
      console.log(
        "js/publicar.js: Zona cliqueada. Invocando explorador de archivos...",
      );
      fileInput.click();
    }
  });

  // BLINDAJE ABSOLUTO: Evita que el navegador abra el PDF y reemplace vuestra web
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    window.addEventListener(eventName, (e) => e.preventDefault(), false);
    dropZone.addEventListener(eventName, (e) => e.preventDefault(), false);
  });

  // Efectos cromáticos decorativos al arrastrar
  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
      dropZone.style.borderColor = "#3182ce";
      dropZone.style.backgroundColor = "#ebf8ff";
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
      dropZone.style.borderColor = "#cbd5e0";
      dropZone.style.backgroundColor = "#f7fafc";
    });
  });

  // Captura del lote de archivos al soltarlos
  dropZone.addEventListener("drop", (e) => {
    console.log("js/publicar.js: Documentos arrojados en la zona.");
    handleIncomingFiles(e.dataTransfer.files);
  });

  // Captura del lote de archivos desde el selector nativo
  fileInput.addEventListener("change", (e) => {
    console.log(
      "js/publicar.js: Documentos seleccionados mediante el explorador.",
    );
    handleIncomingFiles(e.target.files);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    executeSimulatedPublishing();
  });
}

function handleIncomingFiles(files) {
  if (files.length === 0) return;

  const listContainer = document.getElementById("publishing-file-list");
  const placeholder = document.getElementById("no-files-placeholder");

  if (placeholder) placeholder.remove();

  Array.from(files).forEach((file) => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      console.log(
        `js/publicar.js: Procesando e integrando cola -> ${file.name}`,
      );
      const fileId =
        "file_" + Date.now() + Math.random().toString(36).substr(2, 5);
      const baseName = file.name.replace(/\.[^/.]+$/, "");

      const fileObject = {
        id: fileId,
        name: file.name,
        title: baseName,
        tags: "",
      };
      filesToPublish.push(fileObject);

      const li = document.createElement("li");
      li.id = fileId;
      li.style.cssText =
        "background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 8px; position: relative;";

      li.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 6px;">
                    <span style="font-size: 0.75rem; font-weight: 700; color: #e53e3e; background: #fff5f5; padding: 2px 6px; border-radius: 4px;">PDF READY</span>
                    <span style="font-size: 0.75rem; color: #a0aec0; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${file.name}">${file.name}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="font-size: 0.75rem; font-weight: 600; color: #718096;">Título del Recurso:</label>
                    <input type="text" value="${baseName}" class="edit-title" data-id="${fileId}" style="width: 100%; padding: 6px 10px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 0.85rem; color: #2d3748;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="font-size: 0.75rem; font-weight: 600; color: #718096;">Etiquetas (separadas por comas):</label>
                    <input type="text" placeholder="Ej: Algebra, Ingenieria, Ciclo1" class="edit-tags" data-id="${fileId}" style="width: 100%; padding: 6px 10px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 0.85rem; color: #2d3748;">
                </div>
                <button type="button" class="btn-remove-file" data-id="${fileId}" style="position: absolute; top: 12px; right: 12px; background: none; border: none; color: #a0aec0; cursor: pointer; font-size: 0.9rem;">✕</button>
            `;

      listContainer.appendChild(li);

      li.querySelector(".edit-title").addEventListener(
        "input",
        (e) => (fileObject.title = e.target.value),
      );
      li.querySelector(".edit-tags").addEventListener(
        "input",
        (e) => (fileObject.tags = e.target.value),
      );
      li.querySelector(".btn-remove-file").addEventListener("click", () =>
        removeFileFromQueue(fileId),
      );
    } else {
      console.warn(
        `Archivo descartado por no cumplir con la extensión PDF: ${file.name}`,
      );
    }
  });

  updatePublishButtonState();
}

function removeFileFromQueue(id) {
  filesToPublish = filesToPublish.filter((f) => f.id !== id);
  document.getElementById(id)?.remove();

  if (filesToPublish.length === 0) {
    const listContainer = document.getElementById("publishing-file-list");
    listContainer.innerHTML = `<li id="no-files-placeholder" style="text-align: center; color: #a0aec0; font-style: italic; padding: 30px; font-size: 0.9rem;">No habéis seleccionado ningún documento aún.</li>`;
  }
  updatePublishButtonState();
}

function updatePublishButtonState() {
  const btn = document.getElementById("btn-submit-all");
  if (!btn) return;

  if (filesToPublish.length > 0) {
    btn.disabled = false;
    btn.style.backgroundColor = "#3182ce";
    btn.style.cursor = "pointer";
  } else {
    btn.disabled = true;
    btn.style.backgroundColor = "#cbd5e0";
    btn.style.cursor = "not-allowed";
  }
}

function executeSimulatedPublishing() {
  alert(
    `¡Éxito! Se han publicado formalmente ${filesToPublish.length} recursos didácticos.`,
  );
  filesToPublish = [];
  const listContainer = document.getElementById("publishing-file-list");
  listContainer.innerHTML = `<li id="no-files-placeholder" style="text-align: center; color: #a0aec0; font-style: italic; padding: 30px; font-size: 0.9rem;">No habéis seleccionado ningún documento aún.</li>`;
  updatePublishButtonState();
}