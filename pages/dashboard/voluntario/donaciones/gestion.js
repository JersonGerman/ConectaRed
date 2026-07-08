// ============================================================
// CONTROLADOR LOGIC - USER STORY US14: GESTIÓN DE STOCK
// ============================================================

let materialesData = [
  {
    id: "don-quijote",
    title: "Don Quijote de la Mancha",
    author: "Miguel de Cervantes Saavedra",
    status: "disponible",
    location: "",
    img: "don_quijote.png"
  },
  {
    id: "clean-code",
    title: "Clean Code",
    author: "Robert C. Martin",
    status: "disponible",
    location: "",
    img: "clean_code.png"
  },
  {
    id: "calculus",
    title: "Calculus Vol. 1",
    author: "James Stewart",
    status: "pendiente",
    location: "Esperando en: Lima Cercado",
    img: "calculus.png"
  },
  {
    id: "design-things",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    status: "disponible",
    location: "",
    img: "design_things.png"
  }
];

let currentTab = "disponibles";

const container = document.getElementById('materials-container');
const tabDisponibles = document.getElementById('tab-disponibles');
const tabHistorial = document.getElementById('tab-historial');
const toastMessage = document.getElementById('toastMessage');

document.addEventListener("DOMContentLoaded", () => {
  renderMaterialCards();
  setupTabListeners();
});

function setupTabListeners() {
  tabDisponibles.addEventListener('click', () => {
    currentTab = "disponibles";
    tabDisponibles.classList.add('active');
    tabHistorial.classList.remove('active');
    renderMaterialCards();
  });

  tabHistorial.addEventListener('click', () => {
    currentTab = "historial";
    tabHistorial.classList.add('active');
    tabDisponibles.classList.remove('active');
    renderMaterialCards();
  });
}

function renderMaterialCards() {
  container.innerHTML = "";

  const filtered = materialesData.filter(item => {
    if (currentTab === "disponibles") {
      return item.status === "disponible" || item.status === "pendiente";
    } else {
      return item.status === "entregado";
    }
  });

  if (filtered.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; color: #94a3b8; padding: 40px 0; text-align:center; width:100%;">No hay elementos para mostrar en esta sección.</p>`;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = `libro-card ${item.status === 'entregado' ? 'locked' : ''}`;
    
    card.innerHTML = `
      <span class="status-pill-badge ${item.status}">${item.status}</span>
      <div class="container-insignia">
        <img src="images/${item.img}" alt="${item.title}" class="badge-img" onerror="this.src='https://placehold.co/260x180?text=${encodeURIComponent(item.title)}'">
      </div>
      <div class="libro-card-info">
        <h3>${item.title}</h3>
        <p class="autor">${item.author}</p>
        ${item.location ? `<p class="location-status-text"> Esperando en: Lima Cercado</p>` : ''}
        ${renderCardActionButton(item)}
      </div>
    `;
    container.appendChild(card);
  });

  bindCardActionEvents();
}

function renderCardActionButton(item) {
  if (item.status === "disponible") {
    return `<button class="btn-action-stock action-deliver" data-id="${item.id}">Marcar como Entregado</button>`;
  } else if (item.status === "pendiente") {
    return `<button class="btn-action-cancel action-cancel" data-id="${item.id}">Cancelar Entrega</button>`;
  } else {
    return `<button class="btn-locked" disabled>Entregado Correctamente</button>`;
  }
}

function bindCardActionEvents() {
  // ESCENARIO 1 & 2: Marcar como Entregado / Control de Estados
  document.querySelectorAll('.action-deliver').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      const item = materialesData.find(m => m.id === id);
      
      if (item) {
        if (item.status === "entregado") {
          showToastFeedback("Este libro ya figura como entregado.");
        } else {
          item.status = "entregado";
          showToastFeedback(`El libro "${item.title}" ha sido marcado como Entregado y movido al Historial.`);
          renderMaterialCards();
        }
      }
    });
  });

  // ESCENARIO 3: Cancelar Entrega -> Vuelve a Disponible
  document.querySelectorAll('.action-cancel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      const item = materialesData.find(m => m.id === id);
      
      if (item) {
        item.status = "disponible";
        item.location = ""; 
        showToastFeedback(`Entrega cancelada. "${item.title}" vuelve a figurar como Disponible.`);
        renderMaterialCards();
      }
    });
  });
}

function showToastFeedback(text) {
  toastMessage.textContent = text;
  toastMessage.classList.add('show');
  setTimeout(() => {
    toastMessage.classList.remove('show');
  }, 4000);
}