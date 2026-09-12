var formulario = document.getElementById('formulario-registro');
var nombre = document.getElementById('nombre');
var correo = document.getElementById('correo');
var contrasena = document.getElementById('contrasena');
var confirmar = document.getElementById('confirmar-contrasena');
var telefono = document.getElementById('telefono');
var lista = document.getElementById('lista-direcciones');
var plantilla = lista.querySelector('.direccion').cloneNode(true);
var contador = 1;
var mensaje = document.getElementById('mensaje-registro');

// Campos
function validarNombre() {
    return errorCampo('nombre', revisarNombre(nombre.value.trim()));
}

function validarCorreo() {
    var valor = correo.value.trim().toLowerCase();
    var error = revisarCorreo(valor, true);
    if (error === '') {
        try {
            if (buscarUsuario(leerUsuarios(), valor) !== -1) error = 'Este correo ya esta registrado. Inicia sesion.';
        } catch (problema) {
            error = 'No se pueden leer las cuentas guardadas. Revisa el almacenamiento del navegador.';
        }
    }
    return errorCampo('correo', error);
}

function validarContrasena() {
    return errorCampo('contrasena', revisarClave(contrasena.value));
}

function validarConfirmacion() {
    var error = '';
    if (confirmar.value === '') error = 'Confirma tu contrasena.';
    else if (confirmar.value !== contrasena.value) error = 'Las contrasenas no coinciden.';
    return errorCampo('confirmar-contrasena', error);
}

function validarEstilos() {
    var estilos = formulario.querySelectorAll('input[name="estilos"]:checked');
    var error = document.getElementById('error-estilos');
    error.textContent = '';
    if (estilos.length === 0) {
        error.textContent = 'Selecciona al menos un estilo.';
        return false;
    }
    return true;
}

// Direcciones
function validarDireccion(tarjeta) {
    var alias = tarjeta.querySelector('.alias');
    var calle = tarjeta.querySelector('.calle');
    var comuna = tarjeta.querySelector('.comuna');
    var error = '';
    var comunas = ['Santiago', 'Providencia', 'Maipu', 'La Florida', 'Puente Alto'];
    var aliasOk = alias.value.trim().length <= 20;
    var calleOk = calle.value.trim().length >= 10;
    var comunaOk = comunas.indexOf(comuna.value) !== -1;
    if (!aliasOk) error += 'El alias admite hasta 20 caracteres. ';
    if (!calleOk) error += 'La direccion debe tener al menos 10 caracteres. ';
    if (!comunaOk) error += 'Selecciona una comuna.';
    alias.setAttribute('aria-invalid', aliasOk ? 'false' : 'true');
    calle.setAttribute('aria-invalid', calleOk ? 'false' : 'true');
    comuna.setAttribute('aria-invalid', comunaOk ? 'false' : 'true');
    tarjeta.querySelector('.error-direccion').textContent = error;
    return error === '';
}

function conectarDireccion(tarjeta) {
    var campos = tarjeta.querySelectorAll('input, select');
    var error = tarjeta.querySelector('.error-direccion');
    error.id = 'error-direccion-' + contador;
    for (var i = 0; i < campos.length; i++) {
        campos[i].setAttribute('aria-describedby', error.id);
        campos[i].addEventListener('input', function () { validarDireccion(tarjeta); });
        campos[i].addEventListener('change', function () { validarDireccion(tarjeta); });
    }
    tarjeta.querySelector('.eliminar-direccion').addEventListener('click', function () {
        var aviso = document.getElementById('error-direcciones');
        if (lista.children.length === 1) {
            aviso.textContent = 'Debes mantener al menos una direccion.';
            return;
        }
        tarjeta.remove();
        aviso.textContent = '';
    });
}

conectarDireccion(lista.querySelector('.direccion'));
document.getElementById('agregar-direccion').addEventListener('click', function () {
    contador++;
    var tarjeta = plantilla.cloneNode(true);
    tarjeta.querySelector('legend').textContent = 'Direccion ' + contador;
    var campos = tarjeta.querySelectorAll('input, select');
    var etiquetas = tarjeta.querySelectorAll('label');
    for (var i = 0; i < campos.length; i++) {
        campos[i].id = campos[i].className + '-' + contador;
        campos[i].name = campos[i].id;
        campos[i].value = '';
        etiquetas[i].htmlFor = campos[i].id;
    }
    lista.appendChild(tarjeta);
    conectarDireccion(tarjeta);
    document.getElementById('error-direcciones').textContent = '';
    campos[0].focus();
});

nombre.addEventListener('input', validarNombre);
correo.addEventListener('input', validarCorreo);
contrasena.addEventListener('input', function () {
    validarContrasena();
    if (confirmar.value !== '') validarConfirmacion();
});
confirmar.addEventListener('input', validarConfirmacion);
var casillas = formulario.querySelectorAll('input[name="estilos"]');
for (var i = 0; i < casillas.length; i++) casillas[i].addEventListener('change', validarEstilos);

// Registro
formulario.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    mensaje.textContent = '';
    var valido = true;
    if (!validarNombre()) valido = false;
    if (!validarCorreo()) valido = false;
    if (!validarContrasena()) valido = false;
    if (!validarConfirmacion()) valido = false;
    if (!validarEstilos()) valido = false;
    var tarjetas = lista.querySelectorAll('.direccion');
    if (tarjetas.length === 0) {
        document.getElementById('error-direcciones').textContent = 'Agrega al menos una direccion.';
        valido = false;
    }
    for (var i = 0; i < tarjetas.length; i++) {
        if (!validarDireccion(tarjetas[i])) valido = false;
    }
    if (!valido) {
        mensaje.textContent = 'Revisa los campos marcados.';
        var primero = formulario.querySelector('[aria-invalid="true"]');
        if (primero) primero.focus();
        return;
    }
    var estilos = [];
    for (var j = 0; j < casillas.length; j++) {
        if (casillas[j].checked) estilos.push(casillas[j].value);
    }
    var direcciones = [];
    for (var k = 0; k < tarjetas.length; k++) {
        direcciones.push({
            alias: tarjetas[k].querySelector('.alias').value.trim(),
            calle: tarjetas[k].querySelector('.calle').value.trim(),
            comuna: tarjetas[k].querySelector('.comuna').value
        });
    }
    var usuario = {
        nombre: nombre.value.trim(), correo: correo.value.trim().toLowerCase(),
        telefono: telefono.value.trim(), estilos: estilos, direcciones: direcciones,
        sal: '', clave: ''
    };
    var boton = document.getElementById('boton-registro');
    boton.disabled = true;
    mensaje.textContent = 'Guardando cuenta...';
    try {
        usuario.sal = crearSal();
        usuario.clave = await prepararClave(contrasena.value, usuario.sal);
        var usuarios = leerUsuarios();
        if (buscarUsuario(usuarios, usuario.correo) !== -1) {
            errorCampo('correo', 'Este correo ya esta registrado.');
            mensaje.textContent = 'No se creo otra cuenta con el mismo correo.';
            return;
        }
        usuarios.push(usuario);
        localStorage.setItem('decohogar-usuarios', JSON.stringify(usuarios));
        formulario.reset();
        mensaje.textContent = 'Cuenta creada. Ya puedes iniciar sesion.';
        window.location.href = 'login.html?registro=ok';
    } catch (error) {
        mensaje.textContent = 'No se pudo guardar la cuenta. Abre la pagina con Live Server y permite el almacenamiento del navegador.';
    } finally {
        boton.disabled = false;
    }
});
