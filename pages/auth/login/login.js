import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../../js/configuration.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // ── Acceso admin (quemado, no pasa por Supabase) ──
    if (email === "admin@conectared.com" && password === "123456") {
        localStorage.setItem("loggedUser", email);
        window.location.href = "../../dashboard/voluntario/dashboard";
        return;
    }

    // ── Resto de usuarios: autenticación real vía Supabase ──
    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) throw authError;

        const { data: cuenta, error: cuentaError } = await supabase
            .from('cuentas')
            .select('rol')
            .eq('id', authData.user.id)
            .single();

        if (cuentaError) throw cuentaError;

        if (cuenta.rol === 'STUDENT') {
            window.location.href = "../../dashboard/beneficiario/aula-virtual/";
        } else {
            window.location.href = "../../dashboard/voluntario/dashboard";
        }

    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        errorMessage.textContent = "Correo o contraseña incorrectos";
    }
});