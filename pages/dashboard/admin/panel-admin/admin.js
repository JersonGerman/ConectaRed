import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../../../js/configuration.js';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let usuarioSeleccionadoId = null;

(function () {
    'use strict';

    /* ── 1. Enrutador de "Páginas" Internas ─────────────────── */
    function navegarA(idPagina) {
        document.querySelectorAll('.admin-page').forEach(page => {
            page.classList.remove('active');
        });
        const targetPage = document.getElementById(idPagina);
        if (targetPage) targetPage.classList.add('active');

        // Sincroniza el resaltado del link activo en el sidebar
        document.querySelectorAll('.sidebar-link[data-target]').forEach(link => {
            link.classList.toggle('active', link.dataset.target === idPagina);
        });
    }

    // Navegación desde el sidebar
    document.querySelectorAll('.sidebar-link[data-target]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const destino = this.dataset.target;
            if (destino === 'page-usuarios') cargarListaUsuarios();
            navegarA(destino);
        });
    });

    // Cerrar sesión
    document.getElementById('btn-logout').addEventListener('click', async function (e) {
        e.preventDefault();
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error al cerrar sesión:', error.message);
        }
        window.location.href = '/pages/auth/login/';
    });

    // Botón del Menú hacia la lista de Usuarios
    document.getElementById('btn-nav-usuarios').addEventListener('click', function() {
        cargarListaUsuarios();
        navegarA('page-usuarios');
    });

    // Delegación de eventos para todos los botones de "Volver" (Usa data-target)
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', function() {
            const destino = this.dataset.target;
            navegarA(destino);
        });
    });


    /* ── 2. Cargar Perfiles desde la Base de Datos ─────────── */
    async function cargarListaUsuarios() {
        const contenedor = document.getElementById('contenedor-tarjetas-usuarios');
        contenedor.innerHTML = '<p class="loading">Cargando cuentas registradas...</p>';

        try {
            const { data: usuarios, error } = await supabase
                .from('cuentas')
                .select('*')
                .eq('rol', 'MENTOR')
                .order('nombre_completo', { ascending: true });

            if (error) throw error;
            contenedor.innerHTML = '';

            if (usuarios.length === 0) {
                contenedor.innerHTML = '<p>No hay mentores registrados en el sistema.</p>';
                return;
            }

            usuarios.forEach(user => {
                const tieneArchivo = !!user.documento_url;
                const tarjeta = document.createElement('div');
                tarjeta.className = `usuario-tarjeta ${user.verificado ? 'verificado' : 'pendiente'}`;
                tarjeta.innerHTML = `
                    <h3>${user.nombre_completo}</h3>
                    <p><strong>Rol:</strong> 👨‍🏫 Mentor</p>
                    <div class="tarjeta-badges">
                        <span class="badge">${user.verificado ? '✓ Verificado' : '⏳ Pendiente'}</span>
                        <span class="badge ${tieneArchivo ? 'badge-archivo-si' : 'badge-archivo-no'}">
                            ${tieneArchivo ? '📎 Con archivo' : '🚫 Sin archivo'}
                        </span>
                    </div>
                `;

                // Al hacer clic en la tarjeta de un usuario, abrimos su vista detallada
                tarjeta.addEventListener('click', () => verDetallePostulante(user));
                contenedor.appendChild(tarjeta);
            });

        } catch (error) {
            console.error('Error al consultar Supabase:', error.message);
            contenedor.innerHTML = `<p style="color:red;">Error al cargar datos: ${error.message}</p>`;
        }
    }


    /* ── 3. Mostrar Detalle y Archivo del Usuario ───────────── */
    function verDetallePostulante(user) {
        usuarioSeleccionadoId = user.id;

        document.getElementById('det-nombre').textContent = user.nombre_completo;
        document.getElementById('det-rol').textContent = user.rol;
        document.getElementById('det-estado').textContent = user.verificado ? 'Aprobado y Verificado' : 'Pendiente de Revisión';

        const frame = document.getElementById('det-archivo-frame');
        const txtError = document.getElementById('det-archivo-error');

        // Si existe una URL de documento adjunto en la base de datos, la renderiza
        if (user.documento_url) {
            frame.src = user.documento_url;
            frame.style.display = 'block';
            txtError.style.display = 'none';
        } else {
            frame.src = '';
            frame.style.display = 'none';
            txtError.style.display = 'block';
        }

        navegarA('page-detalle');
    }


    /* ── 4. Acciones de Administración (Aprobar / Rechazar) ─── */
    document.getElementById('btn-aprobar').addEventListener('click', async function() {
        if (!usuarioSeleccionadoId) return;

        try {
            const { error } = await supabase
                .from('cuentas')
                .update({ verificado: true })
                .eq('id', usuarioSeleccionadoId);

            if (error) throw error;

            alert('El perfil ha sido verificado con éxito. Ahora lucirá su tag verificado.');
            cargarListaUsuarios(); // Refrescar los estados en la lista
            navegarA('page-usuarios'); // Volver atrás

        } catch (error) {
            alert('Error al actualizar verificación: ' + error.message);
        }
    });

    document.getElementById('btn-rechazar').addEventListener('click', async function() {
        if (!usuarioSeleccionadoId) return;

        const confirmar = confirm('¿Estás seguro de que deseas quitar la verificación o rechazar este perfil?');
        if (!confirmar) return;

        try {
            const { error } = await supabase
                .from('cuentas')
                .update({ verificado: false })
                .eq('id', usuarioSeleccionadoId);

            if (error) throw error;

            alert('Perfil marcado como no verificado / rechazado.');
            cargarListaUsuarios();
            navegarA('page-usuarios');

        } catch (error) {
            alert('Error al rechazar: ' + error.message);
        }
    });

})();