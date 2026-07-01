/**
 * ConectaRed — Aula Virtual Interactive Actions
 */
document.addEventListener("DOMContentLoaded", () => {
    const btnUnirme = document.getElementById("btn-unirme");
    const btnTimer  = document.getElementById("btn-timer");
    const lblStatus = document.getElementById("lbl-status");

    // Simulador interactivo de entrada a la sesión en vivo
    btnUnirme.addEventListener("click", () => {
        lblStatus.textContent = "Conectando a la sala de videoconferencia...";
        lblStatus.style.color = "#0284c7";
        
        setTimeout(() => {
            alert("¡Redirección simulada con éxito! Abriendo sala integrada de Google Meet / Zoom.");
            lblStatus.textContent = "En clase (Sesión Activa)";
            lblStatus.style.color = "#22c55e";
        }, 1200);
    });
});