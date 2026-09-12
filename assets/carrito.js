var productos = [
    {
        "id": "silla",
        "nombre": "Silla de Comedor",
        "precio": 123990,
        "imagen": "https://i.pinimg.com/1200x/84/6d/dd/846dddb5bde4a97adecf1abd9817a2d6.jpg"
    },
    {
        "id": "mesa",
        "nombre": "Mesa de Comedor",
        "precio": 3500000,
        "imagen": "https://i.pinimg.com/736x/ae/fb/98/aefb98f9c5c0c07220bade938e20cc0b.jpg"
    },
    {
        "id": "velador",
        "nombre": "Velador flotante",
        "precio": 79990,
        "imagen": "https://i.pinimg.com/736x/82/cc/86/82cc86327ce64b910ef3d23b6985ff76.jpg"
    }
];

var carrito = [];
var listaCarrito = document.getElementById('productos-carrito');
var avisoCarrito = document.getElementById('aviso-carrito');
var vaciarCarrito = document.getElementById('vaciar-carrito');

function buscarProducto(id) {
    for (var i = 0; i < productos.length; i++) {
        if (productos[i].id === id) return productos[i];
    }
    return null;
}

function leerCarrito() {
    var datos = JSON.parse(localStorage.getItem('decohogar-carrito') || '[]');
    if (!Array.isArray(datos)) throw new Error('Carrito invalido');
    var resultado = [];
    for (var i = 0; i < datos.length; i++) {
        if (!datos[i]) throw new Error('Producto invalido');
        var producto = buscarProducto(datos[i].id);
        if (producto === null || !Number.isInteger(datos[i].cantidad) ||
            datos[i].cantidad < 1 || datos[i].cantidad > 99) {
            throw new Error('Producto invalido');
        }
        for (var j = 0; j < resultado.length; j++) {
            if (resultado[j].id === producto.id) throw new Error('Producto repetido');
        }
        resultado.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: datos[i].cantidad
        });
    }
    return resultado;
}

function precioPesos(numero) {
    return '$' + numero.toLocaleString('es-CL');
}

function guardarCarrito(nuevoCarrito) {
    try {
        localStorage.setItem('decohogar-carrito', JSON.stringify(nuevoCarrito));
        carrito = nuevoCarrito;
        mostrarCarrito();
        return true;
    } catch (error) {
        avisoCarrito.textContent = 'No se pudo guardar el cambio. Revisa el almacenamiento del navegador.';
        return false;
    }
}

function actualizarCantidad(id, campo) {
    var cantidad = Number(campo.value);
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
        avisoCarrito.textContent = 'Ingresa una cantidad entera entre 1 y 99.';
        campo.focus();
        return;
    }
    try {
        var actualizado = leerCarrito();
        var encontrado = false;
        for (var i = 0; i < actualizado.length; i++) {
            if (actualizado[i].id === id) {
                actualizado[i].cantidad = cantidad;
                encontrado = true;
            }
        }
        if (guardarCarrito(actualizado)) {
            avisoCarrito.textContent = encontrado ? 'Cantidad actualizada.' : 'El producto ya no esta en el carrito.';
            var nuevoCampo = document.getElementById('cantidad-' + id);
            if (nuevoCampo) nuevoCampo.focus();
        }
    } catch (error) {
        avisoCarrito.textContent = 'No se pudo leer el carrito. No se guardaron cambios.';
    }
}

function eliminarProducto(id) {
    try {
        var actualizado = leerCarrito();
        for (var i = 0; i < actualizado.length; i++) {
            if (actualizado[i].id === id) {
                actualizado.splice(i, 1);
                break;
            }
        }
        if (guardarCarrito(actualizado)) {
            avisoCarrito.textContent = 'Producto eliminado.';
            document.querySelector('.resumen-carrito a').focus();
        }
    } catch (error) {
        avisoCarrito.textContent = 'No se pudo leer el carrito. No se guardaron cambios.';
    }
}

function crearFila(item) {
    var producto = buscarProducto(item.id);
    var fila = document.createElement('article');
    fila.className = 'producto-carrito';

    var enlaceFoto = document.createElement('a');
    enlaceFoto.href = 'detalle-' + producto.id + '.html';
    var foto = document.createElement('img');
    foto.src = producto.imagen;
    foto.alt = producto.nombre;
    enlaceFoto.appendChild(foto);
    fila.appendChild(enlaceFoto);

    var informacion = document.createElement('div');
    informacion.className = 'datos-carrito';
    var titulo = document.createElement('h3');
    var enlace = document.createElement('a');
    enlace.href = enlaceFoto.href;
    enlace.textContent = producto.nombre;
    titulo.appendChild(enlace);
    informacion.appendChild(titulo);

    var precio = document.createElement('p');
    precio.textContent = 'Precio por unidad: ' + precioPesos(producto.precio);
    informacion.appendChild(precio);

    var formulario = document.createElement('form');
    formulario.className = 'cantidad-carrito';
    formulario.noValidate = true;
    var etiqueta = document.createElement('label');
    etiqueta.htmlFor = 'cantidad-' + producto.id;
    etiqueta.textContent = 'Cantidad';
    formulario.appendChild(etiqueta);
    var campo = document.createElement('input');
    campo.type = 'number';
    campo.id = etiqueta.htmlFor;
    campo.name = 'cantidad';
    campo.min = '1';
    campo.max = '99';
    campo.step = '1';
    campo.required = true;
    campo.value = item.cantidad;
    formulario.appendChild(campo);
    var actualizar = document.createElement('button');
    actualizar.type = 'submit';
    actualizar.textContent = 'Actualizar';
    formulario.appendChild(actualizar);
    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();
        actualizarCantidad(item.id, campo);
    });
    informacion.appendChild(formulario);

    var subtotal = document.createElement('p');
    subtotal.className = 'subtotal-carrito';
    subtotal.textContent = 'Subtotal: ' + precioPesos(producto.precio * item.cantidad);
    informacion.appendChild(subtotal);
    var eliminar = document.createElement('button');
    eliminar.type = 'button';
    eliminar.className = 'eliminar-carrito';
    eliminar.textContent = 'Eliminar';
    eliminar.addEventListener('click', function () { eliminarProducto(item.id); });
    informacion.appendChild(eliminar);
    fila.appendChild(informacion);
    return fila;
}

function mostrarCarrito() {
    listaCarrito.textContent = '';
    var total = 0;
    var unidades = 0;
    for (var i = 0; i < carrito.length; i++) {
        listaCarrito.appendChild(crearFila(carrito[i]));
        total += carrito[i].precio * carrito[i].cantidad;
        unidades += carrito[i].cantidad;
    }
    document.getElementById('unidades-carrito').textContent = unidades;
    document.getElementById('total-carrito').textContent = precioPesos(total);
    document.getElementById('carrito-vacio').hidden = carrito.length !== 0;
    vaciarCarrito.disabled = carrito.length === 0;
}

function cargarCarrito() {
    try {
        carrito = leerCarrito();
        avisoCarrito.textContent = '';
        mostrarCarrito();
    } catch (error) {
        listaCarrito.textContent = '';
        document.getElementById('carrito-vacio').hidden = true;
        document.getElementById('unidades-carrito').textContent = '-';
        document.getElementById('total-carrito').textContent = '-';
        vaciarCarrito.disabled = false;
        avisoCarrito.textContent = 'No se pudo leer el carrito. Puedes vaciarlo para empezar de nuevo.';
    }
}

vaciarCarrito.addEventListener('click', function () {
    if (guardarCarrito([])) avisoCarrito.textContent = 'Carrito vaciado.';
});

window.addEventListener('storage', function (evento) {
    if (evento.key === 'decohogar-carrito' || evento.key === null) cargarCarrito();
});

window.addEventListener('pageshow', cargarCarrito);
