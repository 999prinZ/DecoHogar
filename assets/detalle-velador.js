var formularioVelador = document.getElementById('formulario-velador');
var cantidadVelador = document.getElementById('cantidad-velador');
var mensajeCarrito = document.getElementById('mensaje-carrito');
formularioVelador.addEventListener('submit', function (evento) {
    evento.preventDefault();
    var cantidad = Number(cantidadVelador.value);

    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
        mensajeCarrito.textContent = 'Ingresa una cantidad entera entre 1 y 99.';
        cantidadVelador.focus();
        return;
    }

    try {
        var carrito = JSON.parse(localStorage.getItem('decohogar-carrito') || '[]');
        if (!Array.isArray(carrito)) throw new Error('Carrito invalido');
        var posicion = -1;

        for (var i = 0; i < carrito.length; i++) {
            if (!carrito[i] || typeof carrito[i].id !== 'string' ||
                !Number.isInteger(carrito[i].cantidad) || carrito[i].cantidad < 1) {
                throw new Error('Carrito invalido');
            }
            if (carrito[i].id === 'velador') posicion = i;
        }

        if (posicion === -1) {
            carrito.push({
                id: 'velador',
                nombre: 'Velador flotante',
                precio: 79990,
                cantidad: cantidad
            });
        } else {
            if (carrito[posicion].cantidad + cantidad > 99) {
                mensajeCarrito.textContent = 'El carrito admite hasta 99 unidades de este producto.';
                return;
            }
            carrito[posicion].cantidad += cantidad;
            carrito[posicion].precio = 79990;
        }

        localStorage.setItem('decohogar-carrito', JSON.stringify(carrito));
        mensajeCarrito.textContent = 'Velador flotante agregado al carrito.';
    } catch (error) {
        mensajeCarrito.textContent = 'No se pudo guardar el carrito. Revisa el almacenamiento del navegador.';
    }
});
