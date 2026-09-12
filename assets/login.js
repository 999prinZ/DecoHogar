var formulario = document.getElementById('formulario-login');
var correo = document.getElementById('correo');
var contrasena = document.getElementById('contrasena');
var mensaje = document.getElementById('mensaje-login');
if (window.location.search === '?registro=ok') mensaje.textContent = 'Cuenta creada. Inicia sesion.';

function validarCorreo() {
    return errorCampo('correo', revisarCorreo(correo.value.trim().toLowerCase(), true));
}
function validarContrasena() {
    return errorCampo('contrasena', contrasena.value === '' ? 'Ingresa tu contrasena.' : '');
}
correo.addEventListener('input', validarCorreo);
contrasena.addEventListener('input', validarContrasena);

// Login
formulario.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    mensaje.textContent = '';
    var correoOk = validarCorreo();
    var claveOk = validarContrasena();
    if (!correoOk || !claveOk) return;
    var boton = formulario.querySelector('button[type="submit"]');
    boton.disabled = true;
    try {
        var usuarios = leerUsuarios();
        var posicion = buscarUsuario(usuarios, correo.value.trim().toLowerCase());
        if (posicion === -1) {
            errorCampo('correo', 'No hay una cuenta registrada con este correo.');
            return;
        }
        var usuario = usuarios[posicion];
        var clave = await prepararClave(contrasena.value, usuario.sal);
        if (clave !== usuario.clave) {
            errorCampo('contrasena', 'La contrasena es incorrecta.');
            return;
        }
        sessionStorage.setItem('decohogar-sesion', JSON.stringify({ nombre: usuario.nombre, correo: usuario.correo }));
        window.location.href = 'index.html';
    } catch (error) {
        mensaje.textContent = 'No se pudo iniciar sesion. Abre la pagina con Live Server y permite el almacenamiento del navegador.';
    } finally {
        boton.disabled = false;
    }
});
