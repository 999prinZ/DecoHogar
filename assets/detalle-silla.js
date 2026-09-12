var formularioSilla = document.getElementById('formulario-silla');
var cantidadSilla = document.getElementById('cantidad-silla');
var mensajeCarrito = document.getElementById('mensaje-carrito');

// Agregar silla
formularioSilla.addEventListener('submit', function (evento) {
    evento.preventDefault();
    var cantidad = Number(cantidadSilla.value);

    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
        mensajeCarrito.textContent = 'Ingresa una cantidad entera entre 1 y 99.';
        cantidadSilla.focus();
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
            if (carrito[i].id === 'silla') posicion = i;
        }

        if (posicion === -1) {
            carrito.push({
                id: 'silla',
                nombre: 'Silla de Comedor',
                precio: 123990,
                cantidad: cantidad
            });
        } else {
            if (carrito[posicion].cantidad + cantidad > 99) {
                mensajeCarrito.textContent = 'El carrito admite hasta 99 unidades de esta silla.';
                return;
            }
            carrito[posicion].cantidad += cantidad;
            carrito[posicion].precio = 123990;
        }

        localStorage.setItem('decohogar-carrito', JSON.stringify(carrito));
        mensajeCarrito.textContent = 'Silla agregada al carrito.';
    } catch (error) {
        mensajeCarrito.textContent = 'No se pudo guardar el carrito. Revisa el almacenamiento del navegador.';
    }
});
