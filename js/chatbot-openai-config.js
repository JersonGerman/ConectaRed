(function (window) {
    window.SUPABASE_URL = "https://sviblsfhersxggcqptfh.supabase.co";
    window.SUPABASE_ANON_KEY = "sb_publishable_GmUHZfbasiOBPudKKi1r9Q_f01Wycu2";
    const CHATBOT_OPENAI_LOCALSTORAGE_KEY = "chatbot_openai_api_key";

    function getOpenAIKeyFromLocalStorage() {
        try {
            return window.localStorage.getItem(CHATBOT_OPENAI_LOCALSTORAGE_KEY) || "";
        } catch (error) {
            console.warn("No se pudo leer la clave de OpenAI desde localStorage:", error);
            return "";
        }
    }

    function setOpenAIKeyInLocalStorage(apiKey) {
        try {
            if (!apiKey) {
                window.localStorage.removeItem(CHATBOT_OPENAI_LOCALSTORAGE_KEY);
            } else {
                window.localStorage.setItem(CHATBOT_OPENAI_LOCALSTORAGE_KEY, apiKey);
            }
            return true;
        } catch (error) {
            console.warn("No se pudo guardar la clave de OpenAI en localStorage:", error);
            return false;
        }
    }

    const ChatbotOpenAIConfig = {
        localStorageKey: CHATBOT_OPENAI_LOCALSTORAGE_KEY,
        getOpenAIKeyFromLocalStorage,
        setOpenAIKeyInLocalStorage,
        getOpenAIKey() {
            return getOpenAIKeyFromLocalStorage();
        }
    };

    window.ChatbotOpenAIConfig = ChatbotOpenAIConfig;
    console.log("chatbot-openai-config.js cargado", !!window.ChatbotOpenAIConfig);
})(window);
