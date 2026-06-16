const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (
        email === "admin@conectared.com" &&
        password === "123456"
    ) {
        localStorage.setItem("loggedUser", email);

        window.location.href =
            "../../pages/dashboard/dashboard.html";
    } else {
        errorMessage.textContent =
            "Correo o contraseña incorrectos";
    }
});