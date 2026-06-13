document.addEventListener("DOMContentLoaded", () => {
  // Función genérica para cargar componentes HTML
  const loadComponent = (elementId, filePath) => {
    const container = document.getElementById(elementId);
    if (container) {
      fetch(filePath)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error al cargar el componente: ${filePath}`);
          }
          return response.text();
        })
        .then((htmlContent) => {
          container.innerHTML = htmlContent;

          // Opcional: Activar clase "active" en el enlace actual
          if (elementId === "header-container") {
            highlightCurrentPage();
          }
        })
        .catch((error) => console.error(error));
    }
  };

  // Función para iluminar el enlace de la página activa
  const highlightCurrentPage = () => {
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  };

  // Ejecutar la carga de los componentes bases instalados en el DOM
  loadComponent("header-container", "components/header.html");
  loadComponent("footer-container", "components/footer.html");
  loadComponent("header-landing-container", "components/header-landing.html");
});
