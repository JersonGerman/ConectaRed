/*
 * chatbot-openai.js
 * Reusable helper to query Supabase and OpenAI from a chatbot.
 * Configura nuevas tablas en tableDefinitions y modifica las reglas del system prompt en systemPromptRules.
 */
(function (window) {
    const ChatbotOpenAI = {
        config: {
            openaiApiKey: "",
            openaiApiUrl: "https://api.openai.com/v1/chat/completions",
            model: "gpt-4o-mini",
            temperature: 0.25,
            maxTokens: 700,
            systemPromptRules: [
                "Eres un asistente útil y directo.",
                "Responde usando únicamente información verificada disponible en la base de datos.",
                "No inventes recursos ni enlaces si no existen en los datos.",
                "Si no hay resultados relevantes, di claramente que no hay recursos disponibles.",
                "Mantén la respuesta clara, corta y en el idioma del usuario."
            ],
            tableDefinitions: {
                recursos: {
                    tableName: "recursos",
                    displayName: "Recursos disponibles",
                    searchableFields: ["name", "description", "category", "type"],
                    // 1. Agregamos las palabras temáticas clave como disparadores
                    triggers: [
                        // Singulares
                        "recurso", "material", "curso", "pdf", "documento", "biblioteca","categoria","lectura",
                        "aprendizaje", "educativo", "taller", "clase", "capacitación", "capacitacion",
                        "disponible", "guía", "guia", "libro", "ejercicio", "actividad", "video",
                        "inteligencia artificial", "ia", "artificial", "prompt", "machine learning",

                        // Plurales explícitos (Para asegurar raíces que cambian y juego semántico)
                        "recursos", "materiales", "categorias", "lecturas", "cursos", "pdfs", "documentos", "talleres",
                        "clases", "capacitaciones", "guías", "guias", "libros", "ejercicios",
                        "actividades", "videos", "ias"
                    ],
                    defaultLimit: 8,
                    formatRecord: (record, index) => {
                        return [
                            `Recurso ${index + 1}:`,
                            `Título: ${record.name || record.title || "N/A"}`,
                            `Descripción: ${record.description || record.descripcion || "N/A"}`,
                            `Categoría: ${record.category || record.categoria || "N/A"}`,
                            `Tipo: ${record.type || "N/A"}`,
                            `Enlace: ${record.path || record.url || record.link || "No disponible"}`
                        ].join("\n");
                    }
                },
                // Tabla Cuentas (Mentores)
                cuentas: {
                    tableName: "cuentas",
                    displayName: "Mentores y Usuarios del sistema",
                    searchableFields: ["nombre_completo", "rol","verificado","area","descripcion"], // Columnas donde buscará el filtro
                    triggers: [
                        "mentor", "mentores", "profesor", "profesores", "voluntario", "voluntarios", 
                        "cuenta", "cuentas", "usuario", "usuarios", "quien subio", "quién subió", 
                        "creador", "nombre", "apellido", "rol", "roles"
                    ],
                    defaultLimit: 5,
                    formatRecord: (record, index) => {
                        return [
                            `Mentor/Usuario ${index + 1}:`,
                            `Nombre Completo: ${record.nombre || "N/A"} ${record.apellido || ""}`,
                            `Rol en la plataforma: ${record.rol || "N/A"}`,
                            `Identificador: ${record.id || "N/A"}`
                        ].join("\n");
                    }
                }
            }
        },

        setOpenAIKey(apiKey) {
            this.config.openaiApiKey = apiKey;
        },

        setSystemPromptRules(rules) {
            if (Array.isArray(rules)) {
                this.config.systemPromptRules = rules;
            }
        },

        addTableDefinition(tableKey, tableDefinition) {
            if (!tableKey || typeof tableDefinition !== "object") return;
            this.config.tableDefinitions[tableKey] = tableDefinition;
        },

        async askOpenAI(userMessage) {
            return askOpenAI(userMessage);
        }
    };

    function getSupabaseClient() {
        if (!window.supabase) {
            throw new Error("La librería de Supabase no está disponible.");
        }

        const supabaseUrl = window.SUPABASE_URL || "";
        const supabaseAnonKey = window.SUPABASE_ANON_KEY || "";

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error("La configuración de Supabase no está definida.");
        }

        return window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    }

    function normalizeText(text) {
        return String(text || "").trim().toLowerCase();
    }

    function isTableTriggered(message, tableConfig) {
        if (!message || !tableConfig || !Array.isArray(tableConfig.triggers)) return false;
        const normalized = normalizeText(message);
        return tableConfig.triggers.some((keyword) => normalized.includes(keyword));
    }

    function chooseQueryTable(message) {
        const tableKeys = Object.keys(ChatbotOpenAI.config.tableDefinitions);
        for (const tableKey of tableKeys) {
            const tableDefinition = ChatbotOpenAI.config.tableDefinitions[tableKey];
            if (isTableTriggered(message, tableDefinition)) {
                return tableKey;
            }
        }
        return "recursos";
    }

    function buildSearchFilter(queryText, fields) {
        // 1. Limpiamos signos de interrogación y comillas
        let normalized = queryText.replace(/[¿?"]/g, "").trim().toLowerCase();
        if (!normalized) return "";

        // 2. Lista de "stop words" (palabras conectoras comunes que no aportan valor a la búsqueda)
        const stopWords = ["que", "tienes", "de", "sobre", "un", "una", "el", "la", "los", "las", "para", "buscar", "busca", "encuentra", "algun", "algunos"];

        // 3. Separamos la frase en palabras individuales y filtramos las conectoras
        const palabrasClave = normalized.split(/\s+/)
            .filter(palabra => !stopWords.includes(palabra) && palabra.length > 2);

        if (palabrasClave.length === 0) return "";

        // 4. Creamos un filtro OR de Supabase para CADA palabra clave en CADA campo mapeado
        // Esto buscará registros que contengan "inteligencia", "artificial" OR "ejercicios"
        const filtros = [];
        fields.forEach((field) => {
            palabrasClave.forEach((palabra) => {
                filtros.push(`${field}.ilike.%${encodeURIComponent(palabra)}%`);
            });
        });

        return filtros.join(",");
    }

    async function searchTable(tableKey, message) {
        const tableDefinition = ChatbotOpenAI.config.tableDefinitions[tableKey];
        const supabase = getSupabaseClient();
        const searchText = normalizeText(message);

        if (!tableDefinition) {
            throw new Error(`No existe la definición de la tabla: ${tableKey}`);
        }

        const query = supabase
            .from(tableDefinition.tableName)
            .select("*")
            .limit(tableDefinition.defaultLimit);

        if (searchText) {
            const filter = buildSearchFilter(searchText, tableDefinition.searchableFields);
            if (filter) {
                query.or(filter);
            }
        }

        const { data, error } = await query;
        console.log(`Supabase query for table "${tableKey}" with message "${message}":`, { data, error });
        if (error) {
            throw new Error(`Error al consultar Supabase: ${error.message}`);
        }
        return data || [];
    }

    function formatTableResults(tableKey, results) {
        const tableDefinition = ChatbotOpenAI.config.tableDefinitions[tableKey];
        if (!Array.isArray(results) || results.length === 0) {
            return "No se encontraron recursos con los criterios actuales.";
        }
        return results
            .map((record, index) => tableDefinition.formatRecord(record, index))
            .join("\n\n");
    }

    function buildSystemMessage(tableKey, results) {
        const rules = ChatbotOpenAI.config.systemPromptRules.join("\n- ");
        const tableDefinition = ChatbotOpenAI.config.tableDefinitions[tableKey];
        const formattedResults = formatTableResults(tableKey, results);

        return {
            role: "system",
            content: `Reglas:
- ${rules}

Contexto de la tabla ${tableDefinition.displayName} (${tableDefinition.tableName}):
${formattedResults}

Usa únicamente esta información para responder consultas relacionadas con recursos disponibles. Si la pregunta no está relacionada con los recursos, responde de forma general y menciona que esta interfaz está diseñada para consultar recursos de la base de datos.`
        };
    }

    async function callOpenAI(messages) {
        const storageKey = window.ChatbotOpenAIConfig?.getOpenAIKey?.() || "";
        const apiKey = ChatbotOpenAI.config.openaiApiKey || storageKey || "";
        if (!apiKey) {
            throw new Error("La clave de OpenAI no está configurada. Guarda el token en localStorage con la clave 'chatbot_openai_api_key'.");
        }

        const response = await fetch(ChatbotOpenAI.config.openaiApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: ChatbotOpenAI.config.model,
                messages,
                temperature: ChatbotOpenAI.config.temperature,
                max_tokens: ChatbotOpenAI.config.maxTokens
            })
        });

        const result = await response.json();
        if (!response.ok) {
            const errorMessage = result?.error?.message || response.statusText;
            throw new Error(`OpenAI API error: ${errorMessage}`);
        }

        return result.choices?.[0]?.message?.content || "";
    }

    async function askOpenAI(userMessage) {
        const tableKey = chooseQueryTable(userMessage);
        const results = await searchTable(tableKey, userMessage);
        const systemMessage = buildSystemMessage(tableKey, results);

        const userMessages = [
            {
                role: "user",
                content: `Usuario pregunta: ${userMessage}

Responde con información basada en los datos proporcionados. Si no hay coincidencias, indica que no hay recursos disponibles.`
            }
        ];

        const messages = [systemMessage, ...userMessages];
        return callOpenAI(messages);
    }

    window.ChatbotOpenAI = ChatbotOpenAI;
    console.log("chatbot-openai.js cargado", !!window.ChatbotOpenAI, typeof window.ChatbotOpenAI);
})(window);
