// ==========================================
// CONTROLADOR DE INTERACCIONES - US20
// ==========================================

// Elementos estructurales de los Modales
const modalConfirmation = document.getElementById('modalConfirmation');
const modalErrorState = document.getElementById('modalErrorState');
const toastMessage = document.getElementById('toastMessage');

// Elementos internos del Modal de Confirmación para inyección dinámica
const previewImg = document.getElementById('previewImg');
const previewType = document.getElementById('previewType');
const previewTitle = document.getElementById('previewTitle');
const shareComment = document.getElementById('shareComment');

// Botones de acción principales de los Modales
const btnPublish = document.getElementById('btnPublish');
const btnCancel = document.getElementById('btnCancel');
const btnCopyLink = document.getElementById('btnCopyLink');
const btnRetry = document.getElementById('btnRetry');

// Objeto para recordar qué logro/insignia clickeó el usuario
let currentActiveLogro = {};

// 1. ESCUCHAR LOS CLICKS EN TODOS LOS BOTONES "COMPARTIR EN LINKEDIN"
document.querySelectorAll('.btn-linkedin-share').forEach(button => {
  button.addEventListener('click', (e) => {
    // Evitar cualquier comportamiento por defecto de enlaces o recargas
    e.preventDefault();
    
    const trigger = e.currentTarget;
    
    // Almacenar los metadatos declarados en las propiedades data-* del botón
    currentActiveLogro = {
      title: trigger.getAttribute('data-achievement'),
      type: trigger.getAttribute('data-type').toUpperCase(),
      img: trigger.getAttribute('data-img')
    };

    // Inyectar visualmente los datos del logro en la tarjeta de previsualización interna
    previewTitle.textContent = currentActiveLogro.title;
    previewType.textContent = currentActiveLogro.type;
    previewImg.src = `images/${currentActiveLogro.img}`;
    
    // Adaptar el texto del cuadro de comentario sugerido según el logro seleccionado
    shareComment.value = `¡Estoy muy emocionado de compartir que he alcanzado el nivel de "${currentActiveLogro.title}" en ConectaRed! Gracias por el apoyo...`;

    // Desplegar el modal interactivo de confirmación
    openModalLayout(modalConfirmation);
  });
});

// 2. ESCENARIO 1: Éxito en la confirmación de la red social
btnPublish.addEventListener('click', (e) => {
  e.preventDefault();
  closeModalLayout(modalConfirmation);
  
  // Simulador probabilístico controlado: 85% de éxito directo / 15% simula falla de API (Escenario 3)
  const isNetworkDown = Math.random() < 0.15;

  if (isNetworkDown) {
    // Escenario 3: Desplegar el estado alternativo de error por red caída
    setTimeout(() => {
      openModalLayout(modalErrorState);
    }, 400);
  } else {
    // Escenario 1 exitoso: Muestra notificación con logo e información requerida
    showFeedbackToast("¡Éxito! Post publicado en tu feed con el logo de ConectaRed y el logro obtenido.");
  }
});

// 3. ESCENARIO 2: Cancelación por denegación de permisos o acción voluntaria
btnCancel.addEventListener('click', (e) => {
  e.preventDefault();
  closeModalLayout(modalConfirmation);
  // Cumple estrictamente con el mensaje de salida definido en los criterios de aceptación
  showFeedbackToast("Acción cancelada por el usuario");
});

// 4. ESCENARIO 3: Enlace alternativo manual ante error o caída de red
btnCopyLink.addEventListener('click', (e) => {
  e.preventDefault();
  closeModalLayout(modalErrorState);
  showFeedbackToast("Enlace directo copiado al portapapeles correctamente.");
});

// Flujo complementario: Reintentar envío desde pantalla de error
btnRetry.addEventListener('click', (e) => {
  e.preventDefault();
  closeModalLayout(modalErrorState);
  showFeedbackToast("Reconectando de manera segura con LinkedIn...");
  setTimeout(() => {
    showFeedbackToast("¡Logro publicado exitosamente!");
  }, 1200);
});

// Funciones globales auxiliares para modificar clases CSS de opacidad y visibilidad
function openModalLayout(targetModal) {
  if (targetModal) targetModal.classList.add('active');
}

function closeModalLayout(targetModal) {
  if (targetModal) targetModal.classList.remove('active');
}

// Control de alertas flotantes temporales (Toast notifications)
function showFeedbackToast(messageText) {
  toastMessage.textContent = messageText;
  toastMessage.classList.add('show');
  setTimeout(() => {
    toastMessage.classList.remove('show');
  }, 4000);
}

// Cerrar cualquier modal abierto si el usuario hace clic fuera de la tarjeta blanca
window.addEventListener('click', (e) => {
  if (e.target === modalConfirmation) closeModalLayout(modalConfirmation);
  if (e.target === modalErrorState) closeModalLayout(modalErrorState);
});
