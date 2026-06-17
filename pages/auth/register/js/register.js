/**
 * ConectaRed — Registration Page Logic
 * Pure vanilla JavaScript. No frameworks, no bundlers.
 *
 * Responsibilities:
 *  1. View navigation  (selection ↔ beneficiario ↔ voluntario)
 *  2. Role switcher    (select change → navigate to the other form)
 *  3. Password toggle  (show / hide)
 *  4. File upload      (click + drag-and-drop, type validation)
 *  5. Form validation  (required fields, email format, password match)
 *  6. Success toast    (show on valid submit, dismiss on close)
 */

(function () {
  'use strict';

  /* ── 1. View navigation ─────────────────────────────────── */

  const VIEWS = ['view-selection', 'view-beneficiario', 'view-voluntario'];

  /**
   * Shows the requested view, hides all others.
   * @param {string} id  – One of the VIEWS ids.
   */
  function showView(id) {
    VIEWS.forEach(function (viewId) {
      var el = document.getElementById(viewId);
      if (!el) return;
      if (viewId === id) {
        el.classList.add('active');
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        el.classList.remove('active');
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Logo → back to selection
  document.getElementById('btn-logo').addEventListener('click', function () {
    showView('view-selection');
  });

  // "Quiero Aprender" card button
  document.getElementById('btn-go-beneficiario').addEventListener('click', function () {
    showView('view-beneficiario');
  });

  // "Quiero Ayudar" card button
  document.getElementById('btn-go-voluntario').addEventListener('click', function () {
    showView('view-voluntario');
  });

  // Back buttons
  document.getElementById('ben-back').addEventListener('click', function () {
    showView('view-selection');
  });

  document.getElementById('vol-back').addEventListener('click', function () {
    showView('view-selection');
  });


  /* ── 2. Role switcher (select change) ───────────────────── */

  /**
   * When the user picks a different role in the <select>,
   * navigate to the corresponding form view.
   */
  function attachRoleSwitcher(selectId, viewMap) {
    var select = document.getElementById(selectId);
    if (!select) return;
    select.addEventListener('change', function () {
      var target = viewMap[this.value];
      if (target) showView(target);
    });
  }

  attachRoleSwitcher('ben-rol', {
    beneficiario: 'view-beneficiario',
    voluntario:   'view-voluntario'
  });

  attachRoleSwitcher('vol-rol', {
    beneficiario: 'view-beneficiario',
    voluntario:   'view-voluntario'
  });


  /* ── 3. Password show / hide ────────────────────────────── */

  /**
   * Toggles the input type between "password" and "text".
   * Also swaps the eye-open / eye-closed SVG icons.
   */
  document.querySelectorAll('.registro-eye').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = this.dataset.target;
      var input    = document.getElementById(targetId);
      var iconShow = this.querySelector('.icon-eye-show');
      var iconHide = this.querySelector('.icon-eye-hide');

      if (!input) return;

      if (input.type === 'password') {
        input.type          = 'text';
        iconShow.style.display = 'none';
        iconHide.style.display = 'block';
        this.setAttribute('aria-label', 'Ocultar contraseña');
      } else {
        input.type          = 'password';
        iconShow.style.display = 'block';
        iconHide.style.display = 'none';
        this.setAttribute('aria-label', 'Mostrar contraseña');
      }
    });
  });


  /* ── 4. File upload (drop zone) ─────────────────────────── */

  var selectedFile = null;   // holds the chosen File object

  var dropzone     = document.getElementById('vol-dropzone');
  var fileInput    = document.getElementById('registro-documento');
  var filenameEl   = document.getElementById('vol-filename');
  var fileErrorEl  = document.getElementById('vol-file-error');

  var ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

  /**
   * Validates and stores a file, updating the UI accordingly.
   * @param {File} file
   */
  function handleFile(file) {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Solo se permiten archivos PDF, JPG o PNG.');
      selectedFile = null;
      dropzone.classList.remove('has-file');
      filenameEl.textContent = '';
      return;
    }

    selectedFile = file;
    dropzone.classList.add('has-file');
    dropzone.classList.remove('is-invalid');
    filenameEl.textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
    setFileError('');
  }

  function setFileError(msg) {
    fileErrorEl.textContent = msg;
    if (msg) {
      dropzone.classList.add('is-invalid');
    } else {
      dropzone.classList.remove('is-invalid');
    }
  }

  // Click on drop zone → trigger hidden file input
  dropzone.addEventListener('click', function (e) {
    // Don't double-trigger if the native input itself was clicked
    if (e.target !== fileInput) fileInput.click();
  });

  // Keyboard accessibility
  dropzone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', function () {
    handleFile(this.files[0]);
  });

  // Drag events
  dropzone.addEventListener('dragover', function (e) {
    e.preventDefault();
    this.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', function () {
    this.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    this.classList.remove('dragover');
    var dt = e.dataTransfer;
    if (dt && dt.files.length) handleFile(dt.files[0]);
  });


  /* ── 5. Form validation ─────────────────────────────────── */

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Shows or clears an error message and marks the input.
   * @param {HTMLElement} input
   * @param {HTMLElement} errorEl
   * @param {string}      msg    – Empty string clears the error.
   */
  function setFieldError(input, errorEl, msg) {
    errorEl.textContent = msg;
    if (msg) {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }
  }

  /**
   * Clears red borders when the user starts typing again.
   */
  function attachLiveValidation(inputId, errorId) {
    var input   = document.getElementById(inputId);
    var errorEl = document.getElementById(errorId);
    if (!input || !errorEl) return;
    input.addEventListener('input', function () {
      if (this.value.trim()) setFieldError(this, errorEl, '');
    });
  }

  // Beneficiario live validation
  ['ben-nombre', 'ben-correo', 'ben-password', 'ben-confirmar'].forEach(function (id) {
    attachLiveValidation(id, id + '-error');
  });

  // Voluntario live validation
  ['vol-nombre', 'vol-correo', 'vol-password', 'vol-confirmar'].forEach(function (id) {
    attachLiveValidation(id, id + '-error');
  });

  /**
   * Validates the Beneficiario form.
   * Returns true if all fields are valid.
   */
  function validateBeneficiario() {
    var nombre    = document.getElementById('ben-nombre');
    var correo    = document.getElementById('ben-correo');
    var password  = document.getElementById('ben-password');
    var confirmar = document.getElementById('ben-confirmar');

    var errNombre    = document.getElementById('ben-nombre-error');
    var errCorreo    = document.getElementById('ben-correo-error');
    var errPassword  = document.getElementById('ben-password-error');
    var errConfirmar = document.getElementById('ben-confirmar-error');

    var valid = true;

    // Nombre
    if (!nombre.value.trim()) {
      setFieldError(nombre, errNombre, 'El nombre es obligatorio.');
      valid = false;
    } else {
      setFieldError(nombre, errNombre, '');
    }

    // Correo
    if (!correo.value.trim()) {
      setFieldError(correo, errCorreo, 'El correo es obligatorio.');
      valid = false;
    } else if (!EMAIL_RE.test(correo.value)) {
      setFieldError(correo, errCorreo, 'Ingresa un correo válido.');
      valid = false;
    } else {
      setFieldError(correo, errCorreo, '');
    }

    // Contraseña
    if (!password.value) {
      setFieldError(password, errPassword, 'La contraseña es obligatoria.');
      valid = false;
    } else if (password.value.length < 6) {
      setFieldError(password, errPassword, 'Mínimo 6 caracteres.');
      valid = false;
    } else {
      setFieldError(password, errPassword, '');
    }

    // Confirmar
    if (!confirmar.value) {
      setFieldError(confirmar, errConfirmar, 'Confirma tu contraseña.');
      valid = false;
    } else if (confirmar.value !== password.value) {
      setFieldError(confirmar, errConfirmar, 'Las contraseñas no coinciden.');
      valid = false;
    } else {
      setFieldError(confirmar, errConfirmar, '');
    }

    return valid;
  }

  /**
   * Validates the Voluntario form (including file upload).
   * Returns true if all fields and the file are valid.
   */
  function validateVoluntario() {
    var nombre    = document.getElementById('vol-nombre');
    var correo    = document.getElementById('vol-correo');
    var password  = document.getElementById('vol-password');
    var confirmar = document.getElementById('vol-confirmar');

    var errNombre    = document.getElementById('vol-nombre-error');
    var errCorreo    = document.getElementById('vol-correo-error');
    var errPassword  = document.getElementById('vol-password-error');
    var errConfirmar = document.getElementById('vol-confirmar-error');

    var valid = true;

    // Nombre
    if (!nombre.value.trim()) {
      setFieldError(nombre, errNombre, 'El nombre es obligatorio.');
      valid = false;
    } else {
      setFieldError(nombre, errNombre, '');
    }

    // Correo
    if (!correo.value.trim()) {
      setFieldError(correo, errCorreo, 'El correo es obligatorio.');
      valid = false;
    } else if (!EMAIL_RE.test(correo.value)) {
      setFieldError(correo, errCorreo, 'Ingresa un correo válido.');
      valid = false;
    } else {
      setFieldError(correo, errCorreo, '');
    }

    // Contraseña
    if (!password.value) {
      setFieldError(password, errPassword, 'La contraseña es obligatoria.');
      valid = false;
    } else if (password.value.length < 6) {
      setFieldError(password, errPassword, 'Mínimo 6 caracteres.');
      valid = false;
    } else {
      setFieldError(password, errPassword, '');
    }

    // Confirmar
    if (!confirmar.value) {
      setFieldError(confirmar, errConfirmar, 'Confirma tu contraseña.');
      valid = false;
    } else if (confirmar.value !== password.value) {
      setFieldError(confirmar, errConfirmar, 'Las contraseñas no coinciden.');
      valid = false;
    } else {
      setFieldError(confirmar, errConfirmar, '');
    }

    // File
    if (!selectedFile) {
      setFileError('Sube un documento de validación.');
      valid = false;
    } else {
      setFileError('');
    }

    return valid;
  }


  /* ── 6. Toast ────────────────────────────────────────────── */

  var toast     = document.getElementById('registro-toast');
  var toastDesc = document.getElementById('toast-desc');
  var toastClose= document.getElementById('toast-close');
  var toastTimer= null;

  /**
   * Displays the success toast with a role-specific message.
   * Auto-dismisses after 5 seconds.
   * @param {'beneficiario'|'voluntario'} role
   */
  function showToast(role) {
    var messages = {
      beneficiario: 'Tu cuenta de beneficiario ha sido creada.',
      voluntario:   'Tu cuenta de voluntario ha sido enviada para validación.'
    };
    toastDesc.textContent = messages[role] || '';
    toast.classList.add('visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(dismissToast, 5000);
  }

  function dismissToast() {
    toast.classList.remove('visible');
    clearTimeout(toastTimer);
  }

  toastClose.addEventListener('click', dismissToast);


  /* ── Form submit handlers ───────────────────────────────── */

  document.getElementById('form-beneficiario').addEventListener('submit', function (e) {
    e.preventDefault();
    if (validateBeneficiario()) {
      showToast('beneficiario');
      const form = new FormData(this);
      const data = {};
      form.forEach((value, key) => {
        data[key] = value;
      });
      
      const usersData = JSON.parse(localStorage.getItem('usersData')) || [];
      usersData.push(data);
      localStorage.setItem('usersData', JSON.stringify(usersData));
        this.reset();
    }
  });

  document.getElementById('form-voluntario').addEventListener('submit', function (e) {
    e.preventDefault();
    if (validateVoluntario()) {
      showToast('voluntario');
      // Reset file state
      selectedFile = null;
      filenameEl.textContent = '';
      dropzone.classList.remove('has-file', 'is-invalid');

      const form = new FormData(this);
      const data = {};
      form.forEach((value, key) => {
        data[key] = value;
      });
      data['documento'] = selectedFile ? selectedFile.name : null; // Store file name for demo  


      const usersData = JSON.parse(localStorage.getItem('usersData')) || [];
      usersData.push(data);
      localStorage.setItem('usersData', JSON.stringify(usersData));

      this.reset();
    }
  });

})();