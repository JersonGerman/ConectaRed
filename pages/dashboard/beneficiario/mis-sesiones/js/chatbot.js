document.getElementById("chatbot-button").addEventListener("click", function () {
    const chatbotContainer = document.getElementById("chatbot-container");
    chatbotContainer.style.display = "flex";
    this.style.display = "none";
});
document.getElementById("close-chatbot").addEventListener("click", function () {
    const chatbotContainer = document.getElementById("chatbot-container");
    chatbotContainer.style.display = "none";
    document.getElementById("chatbot-button").style.display = "flex"; 
});

// Manejor del formulario del chatbot
document.getElementById("chatbot-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const input = this.querySelector("input");
    const message = input.value.trim();
    if (message) {
        const chatbotBody = document.getElementById("chatbot-body");
        const userMessage = document.createElement("p");
        userMessage.className = "user-message";
        userMessage.textContent = message;
        chatbotBody.appendChild(userMessage);
        input.value = "";
        chatbotBody.scrollTop = chatbotBody.scrollHeight; // Desplazamiento hacia abajo
    }
});