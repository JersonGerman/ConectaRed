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