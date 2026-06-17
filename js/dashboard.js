/* ==========================================================================
   CONECTARED - MOTOR DE RENDERIZADO DINÁMICO MULTI-ROL (PRODUCCIÓN)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Al haber reordenado los scripts, CURRENT_USER_ROLE siempre estará definido
  const role =
    typeof CURRENT_USER_ROLE !== "undefined" ? CURRENT_USER_ROLE : "STUDENT";

  if (role === "VOLUNTEER") {
    renderVolunteerDashboard();
  } else {
    renderStudentDashboard();
  }

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

// Render del Layout Principal del Dashboard según el rol asignado (STUDENT o VOLUNTEER)
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
                        <a href="../../" class="sidebar-link logout">
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
   FLUJO A: VISTA DEL ESTUDIANTE (Estructura Dinámica y Segura)
   ========================================================================== */

function renderStudentDashboard() {
  const mainContent = document.querySelector(".main-content");
  if (!mainContent) return;

  // 1. Inyección del armazón semántico requerido por los componentes discentes
  mainContent.innerHTML = `
        <div class="dashboard-row-top">
            <section class="session-card" id="widget-session"></section>
            <section class="progress-card">
                <h2>My Progress</h2>
                <div class="metrics-container" id="widget-progress"></div>
            </section>
        </div>
        <div class="dashboard-row-bottom">
            <section class="recommendations-area">
                <div class="section-header">
                    <h2>Recommended for You</h2>
                    <a href="#" class="view-all-link">View All</a>
                </div>
                <div class="cards-grid" id="widget-recommendations"></div>
            </section>
            <section class="activity-card">
                <h2>Recent Activity</h2>
                <ul class="activity-list" id="widget-activity"></ul>
            </section>
        </div>
    `;

  // 2. Población de los contenedores una vez creados en el paso anterior
  renderUpcomingSession();
  renderProgressMetrics();
  renderRecommendations();
  renderRecentActivity();
}

function renderUpcomingSession() {
  const container = document.getElementById("widget-session");
  if (!container) return;

  container.innerHTML = `
        <div class="session-badge">${UPCOMING_SESSION.status}</div>
        <div class="session-body">
            <div class="mentor-avatar-wrapper">
                <img src="${UPCOMING_SESSION.avatar}" alt="${UPCOMING_SESSION.mentorName}" onerror="this.parentNode.classList.add('no-image');">
            </div>
            <div class="mentor-info">
                <h3 class="mentor-name">${UPCOMING_SESSION.mentorName}</h3>
                <p class="mentor-specialty">${UPCOMING_SESSION.specialty}</p>
                <div class="session-time-meta">
                    <span>📅 ${UPCOMING_SESSION.date}</span>
                    <span>🕒 ${UPCOMING_SESSION.time}</span>
                </div>
            </div>
            <button class="btn-join">Join Now</button>
        </div>
    `;
}

function renderProgressMetrics() {
  const container = document.getElementById("widget-progress");
  if (!container) return;

  container.innerHTML = PROGRESS_METRICS.map((metric) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
      circumference - (metric.percentage / 100) * circumference;

    return `
            <div class="metric-item">
                <div class="metric-chart-wrapper">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="${radius}" class="svg-circle-bg" />
                        <circle cx="40" cy="40" r="${radius}" class="svg-circle-progress"
                                stroke="${metric.color}"
                                stroke-dasharray="${circumference}"
                                stroke-dashoffset="${strokeDashoffset}"
                                transform="rotate(-90 40 40)" />
                    </svg>
                    <span class="metric-percentage">${metric.percentage}%</span>
                </div>
                <span class="metric-label">${metric.label}</span>
            </div>
        `;
  }).join("");
}

function renderRecommendations() {
  const container = document.getElementById("widget-recommendations");
  if (!container) return;

  container.innerHTML = RECOMMENDED_COURSES.map(
    (course) => `
        <article class="custom-card">
            <div class="card-image-wrapper">
                <img src="${course.image}" alt="${course.title}" onerror="this.style.display='none';">
            </div>
            <div class="card-body">
                <span class="card-tag ${course.tagClass}">${course.category}</span>
                <h3 class="card-title">${course.title}</h3>
                <div class="card-footer-meta">
                    <span>🕒 ${course.duration}</span>
                </div>
            </div>
        </article>
    `,
  ).join("");
}

function renderRecentActivity() {
  const container = document.getElementById("widget-activity");
  if (!container) return;

  container.innerHTML = RECENT_ACTIVITIES.map(
    (activity) => `
        <li class="activity-item">
            <div class="activity-icon-container icon-${activity.type}">
                ${activity.icon}
            </div>
            <div class="activity-details">
                <p class="activity-text">${activity.text}</p>
                <span class="activity-time">${activity.timeAgo}</span>
            </div>
        </li>
    `,
  ).join("");
}

/* ==========================================================================
   FLUJO B: VISTA DEL VOLUNTARIO (Estructura Dinámica Directa)
   ========================================================================== */

function renderVolunteerDashboard() {
  const mainContent = document.querySelector(".main-content");
  if (!mainContent) return;

  mainContent.innerHTML = `
        <div class="volunteer-stats-row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin-bottom: 24px;">
            ${VOLUNTEER_DATA.stats
              .map(
                (stat) => `
                <div class="stat-card" style="background-color: #ffffff; border: 1px solid #edf2f7; border-radius: 16px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02); display: flex; flex-direction: column; gap: 4px;">
                    <span class="stat-title" style="font-size: 0.85rem; font-weight: 600; color: #718096;">${stat.title}</span>
                    <span class="stat-value" style="font-size: 1.8rem; font-weight: 700; color: #2d3748; line-height: 1.2;">${stat.value}</span>
                    <span class="stat-detail" style="font-size: 0.75rem; color: #a0aec0; font-weight: 500;">${stat.detail}</span>
                </div>
            `,
              )
              .join("")}
        </div>

        <div class="dashboard-row-bottom" style="display: flex; gap: 24px;">
            <section class="activity-card" style="flex: 1; background-color: #ffffff; border: 1px solid #edf2f7; border-radius: 16px; padding: 24px;">
                <h2 style="font-family: var(--font-family-heading), 'Poppins', sans-serif; font-size: 1.1rem; font-weight: 700; color: #2d3748; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em;">Sesiones</h2>
                <ul class="volunteer-session-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px;">
                    ${VOLUNTEER_DATA.sessions
                      .map((sess) => {
                        const isConfirmed = sess.status === "Confirmada";
                        const bgBadge = isConfirmed ? "#e6fffa" : "#fffaf0";
                        const colorBadge = isConfirmed ? "#2f855a" : "#dd6b20";
                        const bgAvatar = isConfirmed ? "#ebf8ff" : "#fff5f5";
                        const colorAvatar = isConfirmed ? "#2b6cb0" : "#c53030";

                        return `
                            <li class="session-item-volunteer" style="display: flex; align-items: center; gap: 16px;">
                                <div class="student-avatar-placeholder" style="width: 40px; height: 40px; border-radius: 50%; background-color: ${bgAvatar}; color: ${colorAvatar}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0;">
                                    ${sess.student
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                </div>
                                <div class="session-info-volunteer" style="flex: 1;">
                                    <strong style="font-size: 0.9rem; color: #2d3748; display: block;">${sess.student}</strong>
                                    <p style="font-size: 0.8rem; color: #718096; margin: 0;">${sess.time} | ${sess.subject}</p>
                                </div>
                                <span class="badge-status" style="font-size: 0.75rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; background-color: ${bgBadge}; color: ${colorBadge};">${sess.status}</span>
                            </li>
                        `;
                      })
                      .join("")}
                </ul>
            </section>

            <section class="progress-card" style="flex: 2; background-color: #ffffff; border: 1px solid #edf2f7; border-radius: 16px; padding: 24px;">
                <h2 style="font-family: var(--font-family-heading), 'Poppins', sans-serif; font-size: 1.1rem; font-weight: 700; color: #2d3748; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em;">Progreso Certificado</h2>
                <div class="certified-progress-placeholder" style="width: 100%; height: 200px; border: 2px dashed #e2e8f0; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #a0aec0; font-size: 0.9rem; font-weight: 500;">
                    Área reservada para el gráfico analítico de horas acumuladas
                </div>
            </section>
        </div>
    `;
}
