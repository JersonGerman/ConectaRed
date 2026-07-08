console.log("chatbot.js inicializado, ChatbotOpenAI presente:", !!window.ChatbotOpenAI);
const chatbotButton = document.getElementById("chatbot-button");
const chatbotContainer = document.getElementById("chatbot-container");
const chatbotCloseButton = document.getElementById("close-chatbot");
const chatbotForm = document.getElementById("chatbot-form");
const chatbotBody = document.getElementById("chatbot-body");
const chatbotInput = chatbotForm.querySelector("input");

chatbotButton.addEventListener("click", function () {
  chatbotContainer.style.display = "flex";
  this.style.display = "none";
});

chatbotCloseButton.addEventListener("click", function () {
  chatbotContainer.style.display = "none";
  chatbotButton.style.display = "flex";
});

function appendMessage(text, className) {
  const messageElement = document.createElement("p");
  messageElement.className = className;
  messageElement.textContent = text;
  chatbotBody.appendChild(messageElement);
  chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

function setChatbotLoading(isLoading) {
  if (isLoading) {
    appendMessage("Escribiendo respuesta...", "bot-message loading");
  }
}

async function handleUserMessage(message) {
  appendMessage(message, "user-message");
  setChatbotLoading(true);

  try {
    if (!window.ChatbotOpenAI || typeof window.ChatbotOpenAI.askOpenAI !== "function") {
      throw new Error("ChatbotOpenAI no está disponible. Revisa que chatbot-openai.js se haya cargado correctamente.");
    }

    const response = await window.ChatbotOpenAI.askOpenAI(message);
    // Eliminar cualquier mensaje de carga previo
    const loadingMessage = chatbotBody.querySelector(".loading");
    if (loadingMessage) {
      chatbotBody.removeChild(loadingMessage);
    }

    appendMessage(response || "No se obtuvo respuesta de OpenAI.", "bot-message");
  } catch (error) {
    const loadingMessage = chatbotBody.querySelector(".loading");
    if (loadingMessage) {
      chatbotBody.removeChild(loadingMessage);
    }
    appendMessage(`Error: ${error.message}`, "bot-message error");
    console.error(error);
  }
}

chatbotForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const message = chatbotInput.value.trim();
  if (!message) {
    return;
  }
  chatbotInput.value = "";
  handleUserMessage(message);
});