const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

const validateUser = (email, password) => {
    const usersData = JSON.parse(localStorage.getItem('usersData')) || [];
    return usersData.some(user => user["registro-correo"] === email && user["registro-password"] === password);
}

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (
        (email === "admin@conectared.com" &&
        password === "123456") || validateUser(email, password)
    ) {

        localStorage.setItem("loggedUser", email);

        const usersData = JSON.parse(localStorage.getItem('usersData')) || [];
        if (usersData.some(user => user["registro-correo"] === email && user["registro-rol"] === "beneficiario")) {
            window.location.href = "../../dashboard/beneficiario/aula-virtual/";
        }else{
            window.location.href =
            "../../pages/dashboard/dashboard.html";
        }
        
    } else {
        errorMessage.textContent =
            "Correo o contraseña incorrectos";
    }
});