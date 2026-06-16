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
      { text: "Publicar", icon: "📝", url: "#" },
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
