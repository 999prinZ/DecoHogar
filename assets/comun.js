// Datos
function leerUsuarios() {
    var datos = localStorage.getItem('decohogar-usuarios');
    if (datos === null) return [];
    var usuarios = JSON.parse(datos);
    if (!Array.isArray(usuarios)) throw new Error('Datos invalidos');
    for (var i = 0; i < usuarios.length; i++) {
        if (!usuarios[i] || typeof usuarios[i].correo !== 'string' ||
            typeof usuarios[i].nombre !== 'string' || typeof usuarios[i].clave !== 'string' ||
            typeof usuarios[i].sal !== 'string') throw new Error('Datos invalidos');
    }
    return usuarios;
}

function buscarUsuario(usuarios, correo) {
    for (var i = 0; i < usuarios.length; i++) {
        if (usuarios[i].correo === correo) return i;
    }
    return -1;
}

// Validaciones
function errorCampo(id, mensaje) {
    document.getElementById('error-' + id).textContent = mensaje;
    document.getElementById(id).setAttribute('aria-invalid', mensaje !== '' ? 'true' : 'false');
    document.getElementById(id).setAttribute('aria-describedby', 'error-' + id);
    return mensaje === '';
}

function revisarNombre(nombre) {
    if (nombre === '') return 'Ingresa tu nombre completo.';
    if (nombre.length > 100) return 'El nombre admite hasta 100 caracteres.';
    var letras = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\u00e1\u00e9\u00ed\u00f3\u00fa\u00c1\u00c9\u00cd\u00d3\u00da\u00f1\u00d1\u00fc\u00dc ';
    for (var i = 0; i < nombre.length; i++) {
        if (letras.indexOf(nombre[i]) === -1) return 'El nombre solo puede contener letras y espacios.';
    }
    return '';
}

function revisarCorreo(correo, soloDuoc) {
    if (correo === '') return 'Ingresa tu correo.';
    var partes = correo.split('@');
    if (partes.length !== 2 || partes[0] === '' || partes[1] === '') return 'Ingresa un correo valido.';
    var permitidos = 'abcdefghijklmnopqrstuvwxyz0123456789.!#$%&\'*+-/=?^_`{|}~';
    for (var i = 0; i < partes[0].length; i++) {
        if (permitidos.indexOf(partes[0][i]) === -1) return 'Ingresa un correo valido.';
    }
    if (partes[0][0] === '.' || partes[0][partes[0].length - 1] === '.' ||
        partes[0].indexOf('..') !== -1) return 'Ingresa un correo valido.';
    if (soloDuoc && partes[1] !== 'duoc.cl') return 'El correo debe terminar en @duoc.cl.';
    var dominio = partes[1].split('.');
    if (dominio.length < 2) return 'Ingresa un correo valido.';
    for (var j = 0; j < dominio.length; j++) {
        if (dominio[j] === '' || dominio[j][0] === '-' || dominio[j][dominio[j].length - 1] === '-') return 'Ingresa un correo valido.';
        for (var k = 0; k < dominio[j].length; k++) {
            if ('abcdefghijklmnopqrstuvwxyz0123456789-'.indexOf(dominio[j][k]) === -1) return 'Ingresa un correo valido.';
        }
    }
    return '';
}

function revisarClave(clave) {
    if (clave === '') return 'Ingresa una contrasena.';
    if (clave.length < 10) return 'La contrasena debe tener al menos 10 caracteres.';
    var mayuscula = false;
    var numero = false;
    var simbolo = false;
    for (var i = 0; i < clave.length; i++) {
        if ('ABCDEFGHIJKLMNOPQRSTUVWXYZ\u00c1\u00c9\u00cd\u00d3\u00da\u00d1\u00dc'.indexOf(clave[i]) !== -1) mayuscula = true;
        if (clave[i] >= '0' && clave[i] <= '9') numero = true;
        if ('$%&/*'.indexOf(clave[i]) !== -1) simbolo = true;
    }
    if (!mayuscula || !numero || !simbolo) return 'Incluye una mayuscula, un numero y un simbolo: $ % & / *.';
    return '';
}

// Contrasenas
function crearSal() {
    var numeros = new Uint8Array(16);
    crypto.getRandomValues(numeros);
    return Array.from(numeros).join('-');
}

async function prepararClave(clave, sal) {
    var codificador = new TextEncoder();
    var llave = await crypto.subtle.importKey('raw', codificador.encode(clave), 'PBKDF2', false, ['deriveBits']);
    var resultado = await crypto.subtle.deriveBits({
        name: 'PBKDF2', salt: codificador.encode(sal), iterations: 210000, hash: 'SHA-256'
    }, llave, 256);
    return Array.from(new Uint8Array(resultado)).join('-');
}

// Sesion
var saludo = document.getElementById('saludo');
var cerrar = document.getElementById('cerrar-sesion');
if (saludo && cerrar) {
    try {
        var sesion = JSON.parse(sessionStorage.getItem('decohogar-sesion'));
        if (sesion && typeof sesion.nombre === 'string') {
            saludo.textContent = 'Hola, ' + sesion.nombre;
            cerrar.hidden = false;
            document.getElementById('enlace-login').hidden = true;
            document.getElementById('enlace-registro').hidden = true;
        }
    } catch (error) {
        saludo.textContent = '';
    }
    cerrar.addEventListener('click', function () {
        try {
            sessionStorage.removeItem('decohogar-sesion');
            window.location.href = 'login.html';
        } catch (error) {
            saludo.textContent = 'No se pudo cerrar la sesion. Revisa el almacenamiento del navegador.';
        }
    });
}
