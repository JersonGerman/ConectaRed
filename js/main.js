/* ==========================================================================
   CONECTARED - ARQUITECTURA MODULAR Y CONTROL DINÁMICO DE NAV/SIDEBAR
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const activeRole =
    typeof CURRENT_USER_ROLE !== "undefined"
      ? CURRENT_USER_ROLE
      : "STUDENT";

  loadComponent("header-container", "/components/header.html", () => {
    highlightCurrentPage(".nav-link");
  });

  loadComponent("footer-container", "/components/footer.html");

  loadComponent(
    "header-landing-container",
    "../../components/header-landing.html"
  );
});


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


//scroll para mostrar menú 
let lastScrollTop = 0;
let header = null;

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (!header) {
        header = document.querySelector('.landing-header');
        if (!header) return;
    }
    // Si el usuario baja más de 70px (el tamaño del header)
    if (scrollTop > 70) {
        if (scrollTop > lastScrollTop) {
            // Está scrolleando hacia ABAJO -> Escondemos el menú
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else {
            // Está scrolleando hacia ARRIBA -> Mostramos el menú
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
    } else {
        // Si está arriba del todo, el menú siempre debe estar visible e inmóvil
        header.classList.remove('scroll-down', 'scroll-up');
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Evita errores en rebotes de scroll en Mac
});