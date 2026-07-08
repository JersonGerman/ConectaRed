// ============================================================
// CONTROLADOR LOGIC - USER STORY US20: COMPARTIR EN LINKEDIN
// ============================================================

const modalConfirmation = document.getElementById('modalConfirmation');
const modalErrorState = document.getElementById('modalErrorState');
const toastMessage = document.getElementById('toastMessage');

const previewImg = document.getElementById('previewImg');
const previewType = document.getElementById('previewType');
const previewTitle = document.getElementById('previewTitle');
const shareComment = document.getElementById('shareComment');

const btnPublish = document.getElementById('btnPublish');
const btnCancel = document.getElementById('btnCancel');
const btnCopyLink = document.getElementById('btnCopyLink');
const btnRetry = document.getElementById('btnRetry');

let currentActiveLogro = {};

// 1. ESCUCHAR LOS CLICKS EN TODOS LOS BOTONES "COMPARTIR EN LINKEDIN"
document.querySelectorAll('.btn-linkedin-share').forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault(); 
    
    const trigger = e.currentTarget;
    
    currentActiveLogro = {
      title: trigger.getAttribute('data-achievement'),
      type: trigger.getAttribute('data-type') ? trigger.getAttribute('data-type').toUpperCase() : 'LOGRO OBTENIDO',
      img: trigger.getAttribute('data-img')
    };

    if (previewTitle) previewTitle.textContent = currentActiveLogro.title;
    if (previewType) previewType.textContent = currentActiveLogro.type;
    if (previewImg) previewImg.src = `images/${currentActiveLogro.img}`;
    
    if (shareComment) {
      shareComment.value = `¡Estoy muy emocionado de compartir que he alcanzado el nivel de "${currentActiveLogro.title}" en ConectaRed! Gracias por el apoyo...`;
    }

    openModalLayout(modalConfirmation);
  });
});

// 2. ESCENARIO 1: Éxito al confirmar la publicación (con simulación probabilística de error)
if (btnPublish) {
  btnPublish.addEventListener('click', (e) => {
    e.preventDefault();
    closeModalLayout(modalConfirmation);
    
    // 85% probabilidad de éxito / 15% simula caída de red para probar la Interacción 02
    const isNetworkDown = Math.random() < 0.15;

    if (isNetworkDown) {
      setTimeout(() => {
        openModalLayout(modalErrorState);
      }, 400);
    } else {
      showFeedbackToast("¡Éxito! Post publicado en tu feed con el logo de ConectaRed y el logro obtenido.");
    }
  });
}

// 3. ESCENARIO 2: Cancelación o cierre voluntario por el usuario
if (btnCancel) {
  btnCancel.addEventListener('click', (e) => {
    e.preventDefault();
    closeModalLayout(modalConfirmation);
    showFeedbackToast("Acción cancelada por el usuario");
  });
}

// 4. ESCENARIO 3: Copiar enlace directo en estado de error alternativo
if (btnCopyLink) {
  btnCopyLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeModalLayout(modalErrorState);
    showFeedbackToast("Enlace directo copiado al portapapeles correctamente.");
  });
}

// Reintentar conexión desde el modal de error
if (btnRetry) {
  btnRetry.addEventListener('click', (e) => {
    e.preventDefault();
    closeModalLayout(modalErrorState);
    showFeedbackToast("Reconectando de manera segura con LinkedIn...");
    setTimeout(() => {
      showFeedbackToast("¡Logro publicado exitosamente!");
    }, 1200);
  });
}

function openModalLayout(targetModal) {
  if (targetModal) targetModal.classList.add('active');
}

function closeModalLayout(targetModal) {
  if (targetModal) targetModal.classList.remove('active');
}

function showFeedbackToast(messageText) {
  if (toastMessage) {
    toastMessage.textContent = messageText;
    toastMessage.classList.add('show');
    setTimeout(() => {
      toastMessage.classList.remove('show');
    }, 4500);
  }
}

window.addEventListener('click', (e) => {
  if (e.target === modalConfirmation) closeModalLayout(modalConfirmation);
  if (e.target === modalErrorState) closeModalLayout(modalErrorState);
});
