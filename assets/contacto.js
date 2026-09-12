var formulario = document.getElementById('formulario-contacto');
var nombre = document.getElementById('nombre');
var correo = document.getElementById('correo');
var texto = document.getElementById('mensaje');

function validarNombre() { return errorCampo('nombre', revisarNombre(nombre.value.trim())); }
function validarCorreo() { return errorCampo('correo', revisarCorreo(correo.value.trim().toLowerCase(), false)); }
function validarMensaje() {
    var error = '';
    if (texto.value.trim() === '') error = 'Escribe un mensaje.';
    else if (texto.value.trim().length > 500) error = 'El mensaje admite hasta 500 caracteres.';
    return errorCampo('mensaje', error);
}
nombre.addEventListener('input', validarNombre);
correo.addEventListener('input', validarCorreo);
texto.addEventListener('input', validarMensaje);

// Contacto
formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    var aviso = document.getElementById('mensaje-contacto');
    aviso.textContent = '';
    var nombreOk = validarNombre();
    var correoOk = validarCorreo();
    var mensajeOk = validarMensaje();
    if (!nombreOk || !correoOk || !mensajeOk) return;
    try {
        var mensajes = JSON.parse(localStorage.getItem('decohogar-mensajes') || '[]');
        if (!Array.isArray(mensajes)) throw new Error('Datos invalidos');
        mensajes.push({ nombre: nombre.value.trim(), correo: correo.value.trim().toLowerCase(), mensaje: texto.value.trim() });
        localStorage.setItem('decohogar-mensajes', JSON.stringify(mensajes));
        formulario.reset();
        aviso.textContent = 'Mensaje guardado en este navegador. No se envio por correo.';
    } catch (error) {
        aviso.textContent = 'No se pudo guardar el mensaje. Revisa el almacenamiento del navegador.';
    }
});
