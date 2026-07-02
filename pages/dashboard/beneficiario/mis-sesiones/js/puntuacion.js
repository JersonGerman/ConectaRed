/* ==========================================================================
   CONECTARED - US10: Calificar la calidad de la asesoría
   ========================================================================== */

const SESSION_SCENARIOS = {
  success: {
    mentorName: "Carlos Mendoza",
    subject: "Historia & Literatura",
    date: "📅 14 de junio, 2026 · 🕒 4:00 PM - 5:00 PM",
    attended: true,
    avatar: "../../images/perfil2.png",
    currentScore: 4.9,
    currentReviews: 89,
  },
  error: {
    mentorName: "Ana Rodríguez",
    subject: "Biología & Química",
    date: "📅 16 de junio, 2026 · 🕒 6:00 PM - 7:00 PM",
    attended: false,
    avatar: "../../images/perfil3.png",
    currentScore: 4.8,
    currentReviews: 64,
  },
  alternative: {
    mentorName: "María González",
    subject: "Matemáticas & Física",
    date: "📅 10 de junio, 2026 · 🕒 5:00 PM - 6:00 PM",
    attended: true,
    avatar: "../../images/perfil1.png",
    currentScore: 5.0,
    currentReviews: 112,
  },
};

let currentScenario = "success";
let selectedRating = 0;

document.addEventListener("DOMContentLoaded", () => {
  updateSubmitState();

  document.querySelectorAll(".rating-stars .star").forEach((star) => {
    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.value);
      renderStars(selectedRating);
      updateSubmitState();
    });
    star.addEventListener("mouseenter", () => {
      previewStars(Number(star.dataset.value));
    });
    star.addEventListener("mouseleave", () => {
      renderStars(selectedRating);
    });
  });

  document.getElementById("btn-submit-rating").addEventListener("click", submitRating);
  document.getElementById("btn-cancel-rating").addEventListener("click", closeRatingWindow);
  document.getElementById("btn-reopen-rating").addEventListener("click", reopenRatingFromReminder);


});

/**
 * Pinta de amarillo las estrellas hasta el valor indicado (selección confirmada)
 */
function renderStars(value) {
  document.querySelectorAll(".rating-stars .star").forEach((star) => {
    const starValue = Number(star.dataset.value);
    star.classList.toggle("selected", starValue <= value);
  });

  const helper = document.getElementById("rating-helper");
  helper.textContent =
    value === 0 ? "Selecciona de 1 a 5 estrellas" : `Calificación seleccionada: ${value} de 5`;
}

/**
 * Previsualiza la cantidad de estrellas al pasar el mouse, sin confirmar la selección
 */
function previewStars(value) {
  document.querySelectorAll(".rating-stars .star").forEach((star) => {
    const starValue = Number(star.dataset.value);
    star.classList.toggle("hovered", starValue <= value);
  });
}

function updateSubmitState() {
  const submitBtn = document.getElementById("btn-submit-rating");
  submitBtn.disabled = selectedRating === 0;
}

/**
 * Escenario 1 (Éxito): publica la calificación y refleja el cambio en el perfil del mentor
 */
function submitRating() {
  if (selectedRating === 0) return;

  document.querySelector(".session-info-card").style.display = "none";  // ocultar card mentor
  setTimeout(() => {
    document.getElementById("modal-puntuacion").style.display = "none";
    document.getElementById("sesiones").innerHTML = "No tienes sesiones programadas";

  }, 3000);


  const data = SESSION_SCENARIOS[currentScenario];
  const comment = document.getElementById("rating-comment").value.trim();

  // Simula el recálculo del puntaje público del mentor tras la nueva reseña
  const newReviewCount = data.currentReviews + 1;
  const newScore = (
    (data.currentScore * data.currentReviews + selectedRating) / newReviewCount
  ).toFixed(1);

  document.getElementById("rating-form").classList.add("hidden");
  document.getElementById("reminder-banner").classList.add("hidden");

  document.getElementById("preview-mentor-name").textContent = data.mentorName;
  document.getElementById("preview-stars").textContent = "★".repeat(Math.round(newScore)).padEnd(5, "☆");
  document.getElementById("preview-score").textContent = newScore;
  document.getElementById("preview-count").textContent = `(${newReviewCount} reseñas)`;

  document.getElementById("success-banner").classList.remove("hidden");

  console.log(
    `Reseña publicada: ${selectedRating}★ para ${data.mentorName}. Comentario: "${comment}"`,
  );
}

/**
 * Cierra la ventana de calificación sin completarla (dispara el escenario alternativo)
 */
function closeRatingWindow() {
  document.getElementById("rating-form").classList.add("hidden");
  document.getElementById("reminder-banner").classList.remove("hidden");
}

/**
 * Reabre el formulario de calificación desde el recordatorio persistente
 */
function reopenRatingFromReminder() {
  document.getElementById("reminder-banner").classList.add("hidden");
  document.getElementById("rating-form").classList.remove("hidden");
}


// Interactividad de sesion pendiente
const modalPuntuacion = document.getElementById("modal-puntuacion");
const sesionesContainer = document.getElementById("sesiones");

// Pequeño script incrustado para simular la interactividad al unirse
document.addEventListener("DOMContentLoaded", () => {

  // Listar lista de sesiones activas
  renderSesions();

  let countdown = 5; // 30 minutos
  const timerInterval = setInterval(() => {
    const btnTimer = document.getElementById("btn-timer");
    countdown--;
    btnTimer.textContent = `Disponible en ${countdown} segundos`;
    if (countdown <= 0) {
      clearInterval(timerInterval);
      const btnUnirme = document.getElementById("btn-unirme");
      btnTimer.textContent = "Sesión disponible";
      btnTimer.disabled = true;
      btnUnirme.removeAttribute("disabled")
      btnUnirme.classList.add("active")
    }
  }, 1000); // Actualiza cada minuto

  const btnUnirme = document.getElementById("btn-unirme");
  const btnTimer = document.getElementById("btn-timer");


  btnUnirme.addEventListener("click", () => {
    btnUnirme.disabled = true;
    btnUnirme.textContent = "Conectando...";
    const status = document.getElementById("lbl-status");
    status.textContent = "Conectando a la sesión de Carlos Mendoza...";
    status.style.color = "#0284c7";
    setTimeout(() => {
      alert("¡Redirección simulada con éxito a la videollamada!");
      status.textContent = "En clase (Sesión Activa)";
      status.style.color = "#22c55e";

      btnUnirme.textContent = "Unirse a la sesión activa";

    }, 1000);

    let countdown = 5; // 30 minutos
    const timerInterval = setInterval(() => {
      btnTimer.textContent = `Sesión finaliza en ${countdown} segundos`;
      if (countdown <= 0) {
        clearInterval(timerInterval);
        // activar puntuacion
        modalPuntuacion.style.display = "flex"
      }
      countdown--;
    }, 1000)

    setTimeout(() => {
      modalPuntuacion.style.display = "none"
    }, 3000);

  });

});

const sesionesActivas = [
  {
    title: "Álgebra Básica - Ecuaciones Lineales",
    mentor_speciality: "Profesor de Ciencias",
    mentor_raiting: 5.0,
    mentor_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    mentor_name: "Carlos Mendoza",
    duration: "45 min",
    date: "Hoy, 15:00 hrs",
    state: "La sesión comenzará pronto",
    button_timer: "Disponible en 30 min"

  }
]

function templateHtmlSesions(sesion) {

  const { title, mentor_raiting, mentor_image, mentor_name, mentor_speciality, duration, state, date, button_timer } = sesion;

  let raitingHtml = "";
  for (let index = 0; index < mentor_raiting; index++) {
    raitingHtml += "⭐";
  }

  return `
    <div class="aula-container-card">
          <div class="aula-banner-header">
            <span class="aula-badge-live"><span class="dot-live"></span> Sesión Próxima</span>
            <h2>${title}</h2>
          </div>

          <div class="aula-card-body">
            <div class="aula-mentor-profile-box">
              <div class="mentor-avatar-container">
                <img src="${mentor_image}"
                  alt="${mentor_name}" class="mentor-photo">
                <span class="mentor-verified-check">✓</span>
              </div>
              <h3>${mentor_name}</h3>
              <p class="mentor-specialty">${mentor_speciality}</p>
              <div class="mentor-rating">${raitingHtml} <span>${mentor_raiting}/span></div>
            </div>

            <div class="aula-details-actions-box">
              <div class="aula-meta-info-grid">
                <div class="meta-item">
                  <span class="meta-icon">🕒</span>
                  <div>
                    <label>DURACIÓN</label>
                    <strong>${duration}</strong>
                  </div>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">📅</span>
                  <div>
                    <label>FECHA</label>
                    <strong>${date}</strong>
                  </div>
                </div>
              </div>

              <div class="aula-status-bar">
                <span class="status-icon-info">ℹ️</span>
                <p>Estado: <span class="status-highlight" id="lbl-status">${state}</span></p>
              </div>

              <div class="aula-buttons-row">
                <button type="button" class="btn-aula-join" disabled id="btn-unirme">Unirme a la sesión</button>
                <button type="button" class="btn-aula-countdown" disabled id="btn-timer">${button_timer}</button>
              </div>

              <p class="aula-disclaimer">
                Esperando al anfitrión. Al hacer clic, serás redirigido automáticamente a la sala de Zoom o Google Meet
                integrada.
              </p>
            </div>
          </div>
        </div>
  
  `;
}

function renderSesions() {
  // Ejecutar solicitud a la api de sesiones

  if (sesionesActivas.length > 0) {
    sesionesActivas.forEach(sesion => {
      sesionesContainer.innerHTML += templateHtmlSesions(sesion);
    })
  } else {
    sesionesContainer.textContent = "No tienes sesiones programadas";
  }

}