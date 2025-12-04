//--------------------------------------------------------------------------------------------------
// ACCESIBILIDAD
class AdministradorAccesibilidad {
    constructor() {
        console.log("Inicializando sistema de accesibilidad...");//

        this.usuario = JSON.parse(localStorage.getItem("usuario"));
        console.log("Usuario detectado:", this.usuario);//

        this.storageKey = this.usuario
            ? `configAccesibilidad_${this.usuario.id}`
            : "configAccesibilidad_default";

        console.log("🗝 Usando storageKey:", this.storageKey);//

        this.config = {
            tema: 'dark',
            tamanoTexto: 'normal',
            espaciado: 'normal'
        };

        // Esperar a que toda la página esté lista
        window.addEventListener("load", () => {
            console.log("Window LOAD — ahora sí inicializamos accesibilidad");
            this.iniciar();
        });
    }

    iniciar() {
        this.cargarConfiguracion();
        this.aplicarConfiguracion();
        this.configurarEventos();
    }

    cargarConfiguracion() {
        const guardado = localStorage.getItem(this.storageKey);

        console.log("Revisando configuraciones guardadas:", guardado);

        if (guardado) {
            this.config = { ...this.config, ...JSON.parse(guardado) };
            console.log("Configuración cargada:", this.config);
        } else {
            console.log("No hay configuración previa para este usuario");
        }
    }

    guardarConfiguracion() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.config));
        console.log("💾 Configuración guardada:", this.config);
    }

    aplicarConfiguracion() {
        console.log("Aplicando configuración:", this.config);

        const { tema, tamanoTexto, espaciado } = this.config;

        document.body.className = document.body.className
            .replace(/\b(light-theme|dark-theme)\b/g, '')
            .replace(/\btext-(small|normal|large|xlarge)\b/g, '')
            .replace(/\bspacing-(normal|large)\b/g, '');

        document.body.classList.add(
            `${tema}-theme`,
            `text-${tamanoTexto}`,
            `spacing-${espaciado}`
        );

        this.actualizarBotonesActivos();
    }

    configurarEventos() {
        console.log("⚙ Configurando listeners...");

        this.configurarAperturaPanel();
        this.configurarTemas();
        this.configurarTamanoTexto();
        this.configurarEspaciado();
    }

    configurarAperturaPanel() {
        const boton = document.getElementById('accessibilityToggle');
        const panel = document.getElementById('accessibilityPanel');
        const cerrar = document.querySelector('.close-panel');

        console.log("🔍 Botón accesibilidad:", boton);
        console.log("🔍 Panel accesibilidad:", panel);

        if (boton) {
            boton.addEventListener('click', () => {
                console.log("👆 Clic en botón accesibilidad");
                if (panel) panel.classList.toggle('show');
            });
        }

        if (cerrar && panel) {
            cerrar.addEventListener('click', () => {
                console.log("❌ Cerrar accesibilidad");
                panel.classList.remove('show');
            });
        }
    }

    configurarTemas() {
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tema = e.target.closest('.toggle-btn').dataset.theme;
                Swal.fire({
                    title: 'Tema cambiado',
                    text: 'Se ha cambiado el tema correctamente',
                    icon: 'success',
                    confirmButtonText: 'Continuar',
                    showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
                });
                console.log("Tema cambiado a:", tema);//
                this.config.tema = tema;
                this.aplicarConfiguracion();
                this.guardarConfiguracion();
            });
        });
    }

    configurarTamanoTexto() {
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tamano = e.target.closest('.size-btn').dataset.size;
                Swal.fire({
                    title: 'Tamaño de texto cambiado',
                    text: 'Se ha cambiado el tamaño del texto correctamente',
                    icon: 'success',
                    confirmButtonText: 'Continuar',
                    showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
                });
                console.log("Tamaño de texto cambiado a:", tamano);//
                this.config.tamanoTexto = tamano;
                this.aplicarConfiguracion();
                this.guardarConfiguracion();
            });
        });
    }

    configurarEspaciado() {
        document.querySelectorAll('.spacing-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const esp = e.target.closest('.spacing-btn').dataset.spacing;
                Swal.fire({
                    title: 'Espaciado cambiado',
                    text: 'Se ha cambiado el espaciado correctamente',
                    icon: 'success',
                    confirmButtonText: 'Continuar',
                    showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
                });
                console.log("Espaciado cambiado a:", esp);//
                this.config.espaciado = esp;
                this.aplicarConfiguracion();
                this.guardarConfiguracion();
            });
        });
    }

    actualizarBotonesActivos() {
        const { tema, tamanoTexto, espaciado } = this.config;

        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === tema);
        });

        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === tamanoTexto);
        });

        document.querySelectorAll('.spacing-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.spacing === espaciado);
        });
    }
}

//Inicializar
new AdministradorAccesibilidad();
//--------------------------------------------------------------------------------------------------

//REGISTRO
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registration-form");
    if (form){
        form.addEventListener("submit", async function(e) {
            e.preventDefault();

            const nombreCompleto = document.getElementById("fullname").value;
            const nombreUsuario = document.getElementById("username").value;
            const pais = document.getElementById("country").value;
            // const rol = document.getElementById("rol").value;
            const palabra = document.getElementById("palabra").value;
            const correo = document.getElementById("correo").value;
            const contrasena = document.getElementById("password").value;
            const confContra = document.getElementById("confirm-password").value;

            if (contrasena !== confContra) {
                Swal.fire({
                        title: '¡Las contraseñas no coinciden!',
                        text: 'Por favor, intentelo de nuevo',
                        icon: 'warning',
                        confirmButtonText: 'Continuar',
                        showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
                });
                return;
            }

            const data = {
                nombreCompleto,
                nombreUsuario,
                pais,
                palabra,
                correo,
                contrasena,
            };

            const respuesta = await fetch("http://localhost:3000/api/usuarios/registrar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const resultado = await respuesta.json();
            console.log(resultado);//

            if (respuesta.ok) {
                Swal.fire({
                    title: '¡Registro Exitoso!',
                    text: 'Tu cuenta ha sido creada correctamente',
                    icon: 'success',
                    confirmButtonText: 'Continuar',
                    showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
                });
                form.reset();
            } else {
                Swal.fire({
                        title: resultado.mensaje,
                        text: 'Por favor, intentelo de nuevo',
                        icon: 'error',
                        confirmButtonText: 'Continuar',
                        showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
                    });
                form.reset();
            }//else
        });
    }
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario) {
        actualizarContadorCarritoDesdeBackend(usuario.id);
    }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////

/*CAPTCHA*/
let captchaId = null;

async function cargarCaptcha() {
    try {
        const res = await fetch("http://localhost:3000/api/captcha/generar");
        if (!res.ok) {
            console.warn('Captcha endpoint returned', res.status);
            return;
        }
        const data = await res.json();
        captchaId = data.id;
        localStorage.setItem("captchaId", data.id);
        const captchaEl = document.getElementById("captchaImage");
        if (captchaEl) {
            captchaEl.innerHTML = data.image;
        }
    } catch (err) {
        console.error('Error fetching captcha:', err);
    }
}

function refreshCaptcha() {
    cargarCaptcha();
}

window.addEventListener("DOMContentLoaded", cargarCaptcha);
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/*PARA LOGIN*/
async function loginUsuario() {
    const nombreUsuario = document.getElementById("login-username").value;
    const contrasena = document.getElementById("login-password").value;
    const captchaIngresado = document.getElementById("captcha-input").value;

    // Validar que todos los campos estén llenos
    if (!nombreUsuario || !contrasena || !captchaIngresado) {
        Swal.fire({
            title: 'Campos incompletos',
            text: 'Por favor completa todos los campos',
            icon: 'warning',
            confirmButtonText: 'Entendido',
            showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
        });
        return;
    }

    // Primero validar captcha en backend
    const validar = await fetch("http://localhost:3000/api/captcha/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: localStorage.getItem("captchaId"),
            respuesta: captchaIngresado
        })
    });

    const validacion = await validar.json();

    if (!validar.ok) {
        Swal.fire({
            title: 'Error de CAPTCHA',
            text: 'El código de verificación es incorrecto o ha expirado',
            icon: 'error',
            confirmButtonText: 'Reintentar',
            showClass: {
                popup: 'animate__animated animate__zoomIn'
            },
            hideClass: {
                popup: 'animate__animated animate__zoomOut'
            }
        });

        refreshCaptcha();  
        return;
    }

    // Si el captcha ya pasó, ahora sí enviar login
    const data = { nombreUsuario, contrasena };

    const respuesta = await fetch("http://localhost:3000/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        Swal.fire({
            title: 'Error de inicio de sesión',
            text: resultado.mensaje || 'Credenciales incorrectas',
            icon: 'error',
            confirmButtonText: 'Reintentar',
            showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
        });
        return;
    }

    Swal.fire({
        title: '¡Bienvenido!',
        text: `Hola ${resultado.nombreCompleto || resultado.nombreUsuario}`,
        icon: 'success',
        confirmButtonText: 'Continuar',
        timer: 3000,
        showClass: {
            popup: 'animate__animated animate__zoomIn'
        },
        hideClass: {
            popup: 'animate__animated animate__zoomOut'
        }
    }).then(() => {
        localStorage.setItem("usuario", JSON.stringify({
            id: resultado.id,
            username: resultado.nombreUsuario,
            nombreCompleto: resultado.nombreCompleto,
            rol: resultado.rol
        }));
        
        // Guardar token
        localStorage.setItem("token", resultado.token);
        localStorage.setItem("rol", resultado.rol);

        // Redirección según rol
        if (resultado.rol === "admin") {
            window.location.href = "administrador.html";
        } else {
            window.location.href = "tienda.html";
        }
    });
}

//Para que se vea en todas las páginas la cuenta
document.addEventListener("DOMContentLoaded", () => {
    const accountToggle = document.getElementById("accountToggle");
    const accountPanel = document.getElementById("accountPanel");
    const closeAccount = document.querySelector(".close-account");
    const logoutBtn = document.getElementById("logoutBtn");

    const usuario = JSON.parse(localStorage.getItem("usuario"));

    // Cargar datos del usuario en el panel
    if (usuario) {
        const accountName = document.getElementById("accountName");
        const panelUsername = document.getElementById("panel-username");
        const panelNombre = document.getElementById("panel-nombre");
        const panelRol = document.getElementById("panel-rol");

        if (accountName) accountName.textContent = usuario.username;
        if (panelUsername) panelUsername.textContent = usuario.username;
        if (panelNombre) panelNombre.textContent = usuario.nombreCompleto;
        if (panelRol) panelRol.textContent = usuario.rol;
    }

    // Abrir panel
    if (accountToggle && accountPanel) {
        accountToggle.addEventListener("click", () => {
            accountPanel.classList.toggle("active");
        });
    }

    // Cerrar panel
    if (closeAccount && accountPanel) {
        closeAccount.addEventListener("click", () => {
            accountPanel.classList.remove("active");
        });
    }
});

//LOGOUT
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        const token = localStorage.getItem("token");

        // Mostrar SweetAlert de confirmación
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: 'Estás a punto de cerrar tu sesión',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            showClass: {
                popup: 'animate__animated animate__zoomIn'
            },
            hideClass: {
                popup: 'animate__animated animate__zoomOut'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Notificar al servidor (de la versión 2)
                    if (token) {
                        await fetch("http://localhost:3000/api/usuarios/logout", {
                            method: "POST",
                            headers: {
                                "Authorization": "Bearer " + token
                            }
                        });
                        console.log("[FRONT] Logout notificado al servidor");
                    }
                } catch (error) {
                    console.warn("[FRONT] No se pudo notificar logout al servidor", error);
                    // Continuamos igual con el logout local
                }

                // Limpiar localStorage (combinación de ambas versiones)
                localStorage.removeItem("usuario");
                localStorage.removeItem("token");
                localStorage.removeItem("rol");
                localStorage.removeItem("captchaId"); // Limpiar también el captcha

                // Mostrar mensaje de éxito (de la versión 1)
                Swal.fire({
                    title: 'Sesión cerrada correctamente',
                    text: 'Gracias por visitarnos',
                    icon: 'success',
                    confirmButtonText: 'Continuar',
                    timer: 2000,
                    showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
                }).then(() => {
                    // Redirigir después del mensaje
                    window.location.href = "paginaprincipal.html";
                });
            }
        });
    });
}
//////////////////////////////////////////////////////////////////////////////////////7


//Funcionalidad para Preguntas Frecuentes (que se desplieguen)
document.addEventListener('DOMContentLoaded', function() {
    // Acordeón de preguntas
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            // Cerrar otras respuestas
            document.querySelectorAll('.faq-answer').forEach(otherAnswer => {
                if (otherAnswer !== answer) {
                    otherAnswer.classList.remove('active');
                    otherAnswer.previousElementSibling.querySelector('i').style.transform = 'rotate(0deg)';
                }
            });
            
            // Alternar respuesta actual
            answer.classList.toggle('active');
            icon.style.transform = answer.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
        });
    });

    // Variable global para el controlador del modal
    let modalController;

    //Filtrado por categorías
    const categoryButtons = document.querySelectorAll('.category-btn');
    const faqCategories = document.querySelectorAll('.faq-category');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Actualizar botones activos
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar/ocultar categorías
            faqCategories.forEach(cat => {
                if (category === 'all' || cat.getAttribute('data-category') === category) {
                    cat.style.display = 'block';
                } else {
                    cat.style.display = 'none';
                }
            });
        });
    });

    //Búsqueda en preguntas frecuentes
    window.buscarFAQ = function() {
        const searchTerm = document.getElementById('faq-search').value.toLowerCase();
        const faqItems = document.querySelectorAll('.faq-item');
        let foundResults = false;
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
                foundResults = true;
                
                // Resaltar término buscado
                if (searchTerm) {
                    const questionElement = item.querySelector('.faq-question h3');
                    const answerElement = item.querySelector('.faq-answer');
                    
                    const highlightedQuestion = questionElement.textContent.replace(
                        new RegExp(searchTerm, 'gi'),
                        match => `<span class="highlight">${match}</span>`
                    );
                    
                    const highlightedAnswer = answerElement.innerHTML.replace(
                        new RegExp(searchTerm, 'gi'),
                        match => `<span class="highlight">${match}</span>`
                    );
                    
                    questionElement.innerHTML = highlightedQuestion;
                    answerElement.innerHTML = highlightedAnswer;
                }
            } else {
                item.style.display = 'none';
            }
        });
        
        //Mostrar mensaje si no hay resultados
        const noResults = document.getElementById('no-results') || document.createElement('div');
        if (!foundResults && searchTerm) {
            noResults.id = 'no-results';
            noResults.innerHTML = `<p style="text-align: center; color: #ff5252; margin: 40px 0;">No se encontraron resultados para "${searchTerm}"</p>`;
            document.querySelector('.faq-content .container').appendChild(noResults);
        } else if (noResults.parentNode) {
            noResults.parentNode.removeChild(noResults);
        }
    };

    //Permitir búsqueda con enter
    const searchInput = document.getElementById('producto-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                buscarProductos();
            }
        });
    }
});

// API para obtener productos
const productosAPI = {
    async getProductos() {
        try {
            const response = await fetch("http://localhost:3000/api/productos", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();
            console.log("Productos cargados:", data);

            if (response.ok) {
                return data;
            } else {
                console.error("Error al obtener productos:", data.mensaje);
                return [];
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            return [];
        }
    },

    async getProductosOferta() {
        try {
            const response = await fetch("http://localhost:3000/api/productos", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();

            if (Array.isArray(data)) {
                return data.filter(p => Number(p.oferta) > 0);
            }

            return [];

        } catch (error) {
            console.error("Error de conexión:", error);
            return [];
        }
    },

    async getProductosByGenero(genero) {
        try {
            const response = await fetch(`http://localhost:3000/api/productos/genero/${genero}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                return data.data;
            } else {
                return [];
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            return [];
        }
    }
};

// Función para mostrar productos en oferta con diseño especial
function mostrarProductosOferta(productos, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    if (productos.length === 0) {
        contenedor.innerHTML = '<p class="no-productos">No hay productos en oferta en este momento</p>';
        return;
    }

    contenedor.innerHTML = productos.map(producto => {
        const oferta = Number(producto.oferta);
        const precioOriginal = Number(producto.precio);
        const precioConDescuento = (precioOriginal * (1 - oferta / 100)).toFixed(2);
        
        return `
        <div class="producto-card producto-oferta">
            <span class="producto-badge oferta-badge">🔥 OFERTA</span>
            ${producto.ventas > 10 ? '<span class="producto-badge popular-badge">Popular</span>' : ''}
            
            <img src="http://localhost:3000/uploads/${producto.imagen}" 
                 alt="${producto.titulo}" 
                 class="producto-img"
                 onerror="this.src='http://localhost:3000/uploads/${producto.imagen}'">
            
            <div class="producto-info">
                <h3>${producto.titulo}</h3>
                <p class="producto-artista">${producto.artista}</p>
                <p class="producto-descripcion">${producto.descripcion ? producto.descripcion.substring(0, 60) + '...' : 'Descripción no disponible'}</p>
                
                <div class="producto-precio-oferta">
                    <span class="precio-original">$${precioOriginal.toFixed(2)}</span>
                    <span class="precio-oferta">$${precioConDescuento}</span>
                    <span class="descuento">-${oferta}%</span>
                </div>
                
                <span class="producto-stock ${producto.disponibilidad > 0 ? 'en-stock' : 'agotado'}">
                    ${producto.disponibilidad > 0 ? `En stock (${producto.disponibilidad})` : 'Agotado'}
                </span>
                
                <button class="btn-ver"
                    data-id="${producto.id}"
                    data-nombre="${producto.titulo}"
                    data-descripcion="${producto.descripcion || 'Descripción no disponible'}"
                    data-precio="$${precioConDescuento}"
                    data-precio-original="$${precioOriginal.toFixed(2)}"
                    data-disponibilidad="${producto.disponibilidad}"
                    data-disponibilidad-texto="${producto.disponibilidad > 0 ? 'En stock' : 'Agotado'}"
                    data-categoria="${producto.genero}"
                    data-imagen="${producto.imagen}"
                    data-artista="${producto.artista}"
                    data-oferta="true"
                    data-porcentaje-oferta="${oferta}">
                    Ver Detalles
                </button>
            </div>
        </div>
    `}).join('');

    // Configurar botones específicamente para los productos en oferta
    configurarBotonesVerOferta(contenedorId);
}

function configurarBotonesVerOferta(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    contenedor.querySelectorAll('.btn-ver').forEach(btn => {
        btn.addEventListener('click', function() {
            console.log("Botón Ver Detalles clickeado en oferta:", this.dataset.nombre);
            abrirModalProducto(
                this.dataset.nombre,
                this.dataset.descripcion,
                this.dataset.precio,
                this.dataset.disponibilidad, // Número de existencias
                this.dataset.disponibilidadTexto, // Texto "En stock" o "Agotado"
                this.dataset.categoria,
                this.dataset.imagen,
                this.dataset.artista,
                this.dataset.oferta,
                this.dataset.precioOriginal,
                this.dataset.porcentajeOferta,
                this.dataset.id
            );
        });
    });
}

// En la parte donde manejas el botón de agregar al carrito, agrega esta validación y el POST al backend:
document.querySelector(".btn-agregar-carrito").addEventListener("click", async function() {
    // Verificar si el botón está deshabilitado (producto agotado)
    if (this.disabled) {
        console.log("Producto agotado, no se puede agregar al carrito");//
        return;
    }
    
    const productoId = this.dataset.productoId || this.dataset.id;
    const usuario = JSON.parse(localStorage.getItem('usuario')) || null;
    if (!usuario) {
        Swal.fire({
            title: 'Debes iniciar secion para añadir producto',
            text: 'Por favor, intentelo de nuevo',
            icon: 'warning',
            confirmButtonText: 'Reintentar',
            showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
        });
        
        return;
    }
    const cantidad = modalController ? modalController.getCantidad() : 1;
    
    const producto = {
        nombre: document.getElementById("modalNombre").textContent,
        precio: document.getElementById("modalPrecio").textContent,
        cantidad: cantidad,
        imagen: document.getElementById("modalImagen").src,
        productoId
    };
    
    console.log("Producto añadido al carrito (UI):", producto);

    // Llamar a la API para guardar en la tabla carrito: { usuario_id, producto_id, cantidad }
    const apiOrigin = (location.protocol === 'file:') ? 'http://localhost:3000' : `${location.protocol}//${location.host}`;
    const primary = `${apiOrigin}/api/carrito/add`;
    const fallback = 'http://localhost:3000/api/carrito/add';

    const imagenUrlCompleta = document.getElementById("modalImagen").src;

    // Función que extrae solo el nombre del archivo:
    function getFileNameFromUrl(url) {
        if (!url) return '';
        // Reemplaza barras invertidas por normales (por si acaso) y luego divide por el separador '/'
        const parts = url.replace(/\\/g, '/').split('/');
        // Devuelve el último elemento, que es el nombre del archivo
        return parts.pop();
    }

    const nombreImagenLimpio = getFileNameFromUrl(imagenUrlCompleta);
    
    const payload = {
        usuario_id: usuario.id,
        producto_id: Number(productoId),
        cantidad: Number(cantidad),
        nombre_imagen: nombreImagenLimpio
    };

    try {
        const token = localStorage.getItem("token");
        
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        let resp = await fetch(primary, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });
        if (!resp.ok) {
            console.warn(`POST carrito add respondió ${resp.status} en primary, intentando fallback`);
            resp = await fetch(fallback, { method: 'POST', headers: headers, body: JSON.stringify(payload) });
        }
        if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`HTTP ${resp.status} - ${text}`);
        }
        const data = await resp.json();
        if (data && data.success) {
            console.info('Carrito actualizado en backend:', data);
            actualizarContadorCarritoDesdeBackend(usuario.id);
        } else {
            console.warn('Respuesta inesperada al añadir al carrito:', data);
        }
    } catch (err) {
        console.error('Error al almacenar en carrito:', err);
    }
    
    // Mostrar mensaje de confirmación
    const originalText = this.innerHTML;
    this.innerHTML = '<i class="fas fa-check"></i> Añadido al Carrito';
    this.style.background = '#4CAF50';
    
    setTimeout(() => {
        this.innerHTML = originalText;
        this.style.background = '#ff5252';
    }, 2000);
    // Aquí puedes agregar la lógica para añadir al carrito
    Swal.fire({
        title: 'Producto añadido al carrito',
        text: 'Tu cuenta ha sido creada correctamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
    });
    console.log("Producto añadido al carrito:", producto);
});

async function actualizarContadorCarritoDesdeBackend(usuarioId) {
    try {
        const token = localStorage.getItem("token");
        
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const resp = await fetch(`http://localhost:3000/api/carrito/${usuarioId}`, { headers });
        if (!resp.ok) {
            console.error("Error en respuesta del carrito:", resp.status);
            return;
        }
        const data = await resp.json();

        const cartCount = document.getElementById("cartCount");
        if (cartCount && data.data && Array.isArray(data.data)) {
            cartCount.textContent = data.data.length;
        }
    } catch (error) {
        console.error("Error actualizando contador del carrito:", error);
    }
}

function mostrarMensajeSinProductos() {
    const mensaje = '<p class="no-productos">⚠️ No hay productos disponibles en este momento</p>';
    
    const contenedorVendidos = document.getElementById('productos-mas-vendidos');
    const contenedorOfertas = document.getElementById('ofertas-especiales');
    
    if (contenedorVendidos) contenedorVendidos.innerHTML = mensaje;
    if (contenedorOfertas) contenedorOfertas.innerHTML = mensaje;
}

// Mostrar productos en un contenedor específico - VERSIÓN CORREGIDA
function mostrarProductos(productos, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    if (productos.length === 0) {
        contenedor.innerHTML = '<p class="no-productos">No hay productos disponibles</p>';
        return;
    }

    contenedor.innerHTML = productos.map(producto => {
        // Calcular precio con descuento
        const oferta = Number(producto.oferta);
        const tieneOferta = oferta > 0;
        const precioOriginal = Number(producto.precio);
        const precioConDescuento = tieneOferta ? (precioOriginal * (1 - oferta / 100)).toFixed(2) : precioOriginal;
        
        return `
        <div class="producto-card ${tieneOferta ? 'producto-oferta' : ''}">
            ${tieneOferta ? '<span class="producto-badge oferta-badge">🔥 OFERTA</span>' : ''}
            ${producto.ventas > 10 ? '<span class="producto-badge popular-badge">Popular</span>' : ''}
            
            <img src="http://localhost:3000/uploads/${producto.imagen}" 
                 alt="${producto.titulo}" 
                 class="producto-img"
                 onerror="this.src='http://localhost:3000/uploads/${producto.imagen}'">
            
            <div class="producto-info">
                <h3>${producto.titulo}</h3>
                <p class="producto-artista">${producto.artista}</p>
                <p class="producto-descripcion">${producto.descripcion ? producto.descripcion.substring(0, 60) + '...' : 'Descripción no disponible'}</p>
                
                ${tieneOferta ? `
                    <div class="producto-precio-oferta">
                        <span class="precio-original">$${precioOriginal.toFixed(2)}</span>
                        <span class="precio-oferta">$${precioConDescuento}</span>
                        <span class="descuento">-${oferta}%</span>
                    </div>
                ` : `
                    <div class="producto-precio">
                        $${precioOriginal.toFixed(2)}
                    </div>
                `}
                
                <span class="producto-stock ${producto.disponibilidad > 0 ? 'en-stock' : 'agotado'}">
                    ${producto.disponibilidad > 0 ? `En stock (${producto.disponibilidad})` : 'Agotado'}
                </span>
                
                <button class="btn-ver"
                    data-id="${producto.id}"
                    data-nombre="${producto.titulo}"
                    data-descripcion="${producto.descripcion || 'Descripción no disponible'}"
                    data-precio="${tieneOferta ? '$' + precioConDescuento : '$' + precioOriginal.toFixed(2)}"
                    data-precio-original="${tieneOferta ? '$' + precioOriginal.toFixed(2) : ''}"
                    data-disponibilidad="${producto.disponibilidad}"
                    data-disponibilidad-texto="${producto.disponibilidad > 0 ? 'En stock' : 'Agotado'}"
                    data-categoria="${producto.genero}"
                    data-imagen="${producto.imagen}"
                    data-artista="${producto.artista}"
                    data-oferta="${tieneOferta}"
                    data-porcentaje-oferta="${oferta}">
                    Ver Detalles
                </button>
            </div>
        </div>
    `}).join('');

    configurarBotonesVer();
}

// Configurar filtros por categoría
function configurarFiltros() {
    const categorias = document.querySelectorAll('.categoria-card');
    
    categorias.forEach(categoria => {
        categoria.addEventListener('click', async function() {
            const genero = this.querySelector('h3').textContent.toLowerCase();
            
            console.log(`Filtrando por categoría: ${genero}`);
            
            // Remover activo de todas las categorías
            categorias.forEach(c => c.classList.remove('active'));
            // Agregar activo a la categoría clickeada
            this.classList.add('active');
            
            let productosFiltrados = [];
            
            if (genero === 'rock' || genero === 'clasico' || genero === 'corrido') {
                productosFiltrados = await productosAPI.getProductosByGenero(genero);
            } else {
                productosFiltrados = await productosAPI.getProductos();
            }
            
            console.log(`Productos filtrados para ${genero}:`, productosFiltrados.length);
            
            if (productosFiltrados.length > 0) {
                const productosNormales = productosFiltrados.filter(p => Number(p.oferta) === 0);
                const productosOferta = productosFiltrados.filter(p => Number(p.oferta) > 0);

                console.log(`Productos normales: ${productosNormales.length}, Ofertas: ${productosOferta.length}`);

                mostrarProductos(productosNormales, 'productos-mas-vendidos');
                mostrarProductosOferta(productosOferta, 'ofertas-especiales');
            } else {
                mostrarMensajeSinProductos();
            }
        });
    });
}

// Función para abrir el modal con datos del producto 
function abrirModalProducto(nombre, descripcion, precio, disponibilidad, disponibilidadTexto, categoria, imagen, artista, oferta, precioOriginal, porcentajeOferta, productoId) {
    console.log("Datos del producto para modal:", { 
        nombre, 
        oferta, 
        precioOriginal, 
        precio, 
        porcentajeOferta,
        imagen,
        disponibilidad,
        disponibilidadTexto
    });
    
    // Usar directamente el número de existencias
    const existencias = parseInt(disponibilidad) || 0;
    
    // Actualizar contenido del modal
    document.getElementById('modalNombre').textContent = nombre;
    document.getElementById('modalDescripcion').textContent = descripcion;
    document.getElementById('modalImagen').src = `http://localhost:3000/uploads/${imagen}`;
    document.getElementById('modalDisponibilidad').textContent = disponibilidadTexto;
    document.getElementById('modalCategoria').textContent = categoria;
    
    const precioElement = document.getElementById('modalPrecio');
    
    // Limpiar contenido previo
    precioElement.innerHTML = '';
    
    // Mostrar precio con oferta si corresponde
    const esOferta = oferta === 'true';
    if (esOferta && precioOriginal) {
        console.log("Mostrando producto en oferta en modal");
        precioElement.innerHTML = `
            <span class="precio-oferta-modal">${precio}</span>
            <span class="precio-original-modal">${precioOriginal}</span>
            <span class="descuento-modal">-${porcentajeOferta}%</span>
        `;
    } else {
        console.log("Mostrando producto normal en modal");
        precioElement.textContent = precio;
    }
    
    // Agregar badge de oferta en el modal si corresponde - VERSIÓN SEGURA
    const modalHeader = document.querySelector('.modal-header');
    
    // Limpiar badge existente primero
    const existingBadge = document.querySelector('.oferta-badge-modal');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Solo agregar badge si hay oferta Y el modalHeader existe
    if (esOferta && modalHeader) {
        const badge = document.createElement('span');
        badge.className = 'oferta-badge-modal';
        badge.textContent = '🔥 OFERTA ESPECIAL';
        modalHeader.appendChild(badge);
        console.log("Badge de oferta agregado al modal");
    }
    
    // Actualizar existencias en el controlador del modal
    if (modalController) {
        modalController.setExistencias(existencias);
    }
    
    // Mostrar modal
    const modal = document.getElementById('modalProducto');
    const agregarBtn = document.querySelector('.btn-agregar-carrito');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log("Modal abierto correctamente. Existencias:", existencias);
    } else {
        console.error("No se encontró el modal");
    }
    // Guardar id y nombre_imagen (archivo) para el botón de agregar al carrito
    if (agregarBtn) {
        agregarBtn.dataset.productoId = productoId || '';
        // 'imagen' es el filename (dataset.imagen), no la URL; si se pasa URL, extract filename
        agregarBtn.dataset.nombreImagen = imagen || '';
    }
}

// Configurar botones "Ver" para el modal 
function configurarBotonesVer() {
    console.log("Configurando botones Ver Detalles...");
    
    document.querySelectorAll('.btn-ver').forEach(btn => {
        // Remover event listeners anteriores para evitar duplicados
        btn.replaceWith(btn.cloneNode(true));
    });

    // Volver a seleccionar después del clone
    document.querySelectorAll('.btn-ver').forEach(btn => {
        btn.addEventListener('click', function() {
            console.log("Botón Ver Detalles clickeado:", this.dataset.nombre);

            abrirModalProducto(
                this.dataset.nombre,
                this.dataset.descripcion,
                this.dataset.precio,
                this.dataset.disponibilidad,        // Número de existencias
                this.dataset.disponibilidadTexto,   // Texto "En stock" o "Agotado"
                this.dataset.categoria,
                this.dataset.imagen,
                this.dataset.artista,
                this.dataset.oferta,
                this.dataset.precioOriginal,
                this.dataset.porcentajeOferta,
                this.dataset.id
            );

            // ⬇️ Aquí va el if, FUERA de los parámetros.
            if (Number(this.dataset.disponibilidad) === 0) {
                Swal.fire({
                    title: 'Producto agotado, no se puede agregar al carrito',
                    text: 'Suscríbete y sé de los primeros en obtenerlo cuando vuelva',
                    icon: 'warning',
                    confirmButtonText: 'Continuar',
                    showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
                });
            }
        });
    });
}


// Función de depuración para verificar productos en oferta
async function debugProductosOferta() {
    try {
        const productosOferta = await productosAPI.getProductosOferta();
        console.log("DEBUG - Productos en oferta:", productosOferta);
        
        if (productosOferta && productosOferta.length > 0) {
            console.log("Se encontraron productos en oferta:");
            productosOferta.forEach((producto, index) => {
                console.log(`   ${index + 1}. ${producto.titulo} - Oferta: ${producto.oferta}% - Precio: $${producto.precio}`);
            });
        } else {
            console.log("No se encontraron productos en oferta");
        }
    } catch (error) {
        console.error("Error en debug:", error);
    }
}

// Función principal para cargar productos
async function cargarProductos() {
    try {
        // Depuración
        await debugProductosOferta();
        
        const todosProductos = await productosAPI.getProductos();
        
        console.log("Todos los productos:", todosProductos);
        
        if (todosProductos && todosProductos.length > 0) {
            // Separar productos normales y productos en oferta
            const productosNormales = todosProductos.filter(p => Number(p.oferta) === 0);
            const productosConOferta = todosProductos.filter(p => Number(p.oferta) > 0);

            console.log("Productos normales:", productosNormales.length);
            console.log("Productos en oferta:", productosConOferta.length);

            // MOSTRAR TODOS LOS PRODUCTOS en "más vendidos" (sin límite de 4)
            mostrarProductos(productosNormales, 'productos-mas-vendidos');
            
            // Mostrar productos en oferta en la sección "ofertas especiales"
            mostrarProductosOferta(productosConOferta, 'ofertas-especiales');

            // Configurar botones después de cargar todos los productos
            configurarBotonesVer();
        } else {
            console.log("No se pudieron cargar los productos desde la API");
            mostrarMensajeSinProductos();
        }
    } catch (error) {
        console.error("Error al cargar productos:", error);
        mostrarMensajeSinProductos();
    }
}

// Inicializar funcionalidad del modal
function inicializarModal() {
    const modal = document.getElementById('modalProducto');
    const closeBtn = document.querySelector('.close');
    let cantidad = 1;
    let existenciasDisponibles = 0;

    // Botones de cantidad
    document.getElementById('decreaseQty')?.addEventListener('click', () => {
        if (cantidad > 1) {
            cantidad--;
            document.getElementById('cantidadValue').textContent = cantidad;
            actualizarEstadoBotones();
        }
    });

    document.getElementById('increaseQty')?.addEventListener('click', () => {
        if (cantidad < existenciasDisponibles) {
            cantidad++;
            document.getElementById('cantidadValue').textContent = cantidad;
            actualizarEstadoBotones();
        } else {
            mostrarMensajeStockMaximo();
        }
    });

    // Función para actualizar el estado de los botones
    function actualizarEstadoBotones() {
        const decreaseBtn = document.getElementById('decreaseQty');
        const increaseBtn = document.getElementById('increaseQty');
        const agregarCarritoBtn = document.querySelector('.btn-agregar-carrito');
        
        // Deshabilitar botón de disminuir si la cantidad es 1
        if (decreaseBtn) {
            decreaseBtn.disabled = cantidad <= 1 || existenciasDisponibles === 0;
            decreaseBtn.style.opacity = (cantidad <= 1 || existenciasDisponibles === 0) ? '0.5' : '1';
            decreaseBtn.style.cursor = (cantidad <= 1 || existenciasDisponibles === 0) ? 'not-allowed' : 'pointer';
        }
        
        // Deshabilitar botón de aumentar si alcanzó el máximo o no hay stock
        if (increaseBtn) {
            increaseBtn.disabled = cantidad >= existenciasDisponibles || existenciasDisponibles === 0;
            increaseBtn.style.opacity = (cantidad >= existenciasDisponibles || existenciasDisponibles === 0) ? '0.5' : '1';
            increaseBtn.style.cursor = (cantidad >= existenciasDisponibles || existenciasDisponibles === 0) ? 'not-allowed' : 'pointer';
        }
        
        // Deshabilitar botón de agregar al carrito si no hay stock
        if (agregarCarritoBtn) {
            
            agregarCarritoBtn.disabled = existenciasDisponibles === 0;
            agregarCarritoBtn.style.opacity = existenciasDisponibles === 0 ? '0.5' : '1';
            agregarCarritoBtn.style.cursor = existenciasDisponibles === 0 ? 'not-allowed' : 'pointer';
            
            if (existenciasDisponibles === 0) {
                agregarCarritoBtn.innerHTML = '<i class="fas fa-times"></i> Producto Agotado';
            } else {
                agregarCarritoBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Agregar al Carrito';
            }
        }
        
        // Mostrar mensaje de stock si es bajo
        mostrarMensajeStockBajo();
    }

    // Función para mostrar mensaje de stock máximo
    function mostrarMensajeStockMaximo() {
        // Remover mensaje anterior si existe
        const mensajeAnterior = document.querySelector('.stock-maximo-mensaje');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
        
        if (cantidad >= existenciasDisponibles && existenciasDisponibles > 0) {
            const mensaje = document.createElement('div');
            mensaje.className = 'stock-maximo-mensaje';
            mensaje.innerHTML = `<p style="color: #ff5252; font-size: 0.9rem; margin-top: 10px; text-align: center;">
                <i class="fas fa-exclamation-triangle"></i> 
                No puedes agregar más de ${existenciasDisponibles} unidades
            </p>`;
            
            const cantidadControls = document.querySelector('.cantidad-controls');
            if (cantidadControls) {
                cantidadControls.parentNode.insertBefore(mensaje, cantidadControls.nextSibling);
                
                // Remover mensaje después de 3 segundos
                setTimeout(() => {
                    mensaje.remove();
                }, 3000);
            }
        }
    }

    // Función para mostrar mensaje de stock bajo
    function mostrarMensajeStockBajo() {
        // Remover mensaje anterior si existe
        const mensajeAnterior = document.querySelector('.stock-bajo-mensaje');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
        
        if (existenciasDisponibles > 0 && existenciasDisponibles <= 5 && cantidad > 0) {
            const mensaje = document.createElement('div');
            mensaje.className = 'stock-bajo-mensaje';
            mensaje.innerHTML = `<p style="color: #ffa500; font-size: 0.9rem; margin-top: 5px; text-align: center;">
                <i class="fas fa-info-circle"></i> 
                ¡Quedan solo ${existenciasDisponibles} unidades en stock!
            </p>`;
            
            const cantidadSelector = document.querySelector('.cantidad-selector');
            if (cantidadSelector) {
                cantidadSelector.appendChild(mensaje);
            }
        }
    }

    // Cerrar modal
    closeBtn?.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        cantidad = 1;
        document.getElementById('cantidadValue').textContent = cantidad;
        existenciasDisponibles = 0;
        actualizarEstadoBotones();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            cantidad = 1;
            document.getElementById('cantidadValue').textContent = cantidad;
            existenciasDisponibles = 0;
            actualizarEstadoBotones();
        }
    });

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            cantidad = 1;
            document.getElementById('cantidadValue').textContent = cantidad;
            existenciasDisponibles = 0;
            actualizarEstadoBotones();
        }
    });

    // Devolver función para actualizar existencias desde fuera
    return {
        setExistencias: (existencias) => {
            existenciasDisponibles = parseInt(existencias) || 0;
            cantidad = 1; // Resetear cantidad a 1 cuando cambia el producto
            document.getElementById('cantidadValue').textContent = cantidad;
            actualizarEstadoBotones();
        },
        getCantidad: () => cantidad
    };
}

// Cargar productos cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
    configurarFiltros();
    modalController = inicializarModal(); // Guardar el controlador del modal
});

// Función para copiar cupón
function copiarCupon() {
    const cupon = "ROCK25";
    navigator.clipboard.writeText(cupon).then(() => {
        Swal.fire({
            title: 'Cupón copiado',
            text: 'Se ha copiado el cupon correctamente',
            icon: 'success',
            confirmButtonText: 'Continuar',
            showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
        });
    }).catch(err => {
        Swal.fire({
            title: 'ERROR',
            text: 'No se ha copiado el cupon correctamente',
            icon: 'error',
            confirmButtonText: 'Continuar',
            showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
        });
        console.error('Error al copiar: ', err);//
    });
}

async function aplicarCupon() {
    const codigo = document.getElementById("cuponInput").value.trim();

    if (!codigo) return Swal.fire({
            title: 'Debes introducir un cupon',
            text: 'Por favor, intentelo de nuevo',
            icon: 'warning',
            confirmButtonText: 'Reintentar',
            showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
        });

    const res = await fetch("http://localhost:3000/api/cupones/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo })
    });

    const data = await res.json();

    if (!res.ok) return Swal.fire({
            title: 'Error',
            text: data.message,
            icon: 'error',
            confirmButtonText: 'Continuar',
            confirmButtonColor: '#d33',
            showClass: {
                popup: 'animate__animated animate__zoomIn'
            },
            hideClass: {
                popup: 'animate__animated animate__zoomOut'
            }
    });


    // Guardarlo temporalmente para el pago
    localStorage.setItem("cupon", JSON.stringify({
        codigo: data.cupon.codigo,
        descuento: data.cupon.descuento
    }));

    Swal.fire({
            title: 'Cupon aplicado',
            text: " " + data.cupon.descuento + "%",
            icon: 'success',
            confirmButtonText: 'Reintentar',
            showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
        });
}

// Función principal de búsqueda de productos
window.buscarProductos = function() {
    const searchTerm = document.getElementById('producto-search').value.toLowerCase().trim();
    const productosCards = document.querySelectorAll('.producto-card');
    let foundResults = false;
    let resultadosCount = 0;

    console.log(`🔍 Buscando productos: "${searchTerm}"`);

    // Si el término de búsqueda está vacío, mostrar todos los productos
    if (!searchTerm) {
        mostrarTodosProductos();
        return;
    }

    productosCards.forEach(card => {
        const nombre = card.querySelector('h3').textContent.toLowerCase();
        const artista = card.querySelector('.producto-artista')?.textContent.toLowerCase() || '';
        const descripcion = card.querySelector('.producto-descripcion')?.textContent.toLowerCase() || '';
        const categoria = card.querySelector('.btn-ver')?.dataset.categoria?.toLowerCase() || '';

        const coincide =
            nombre.includes(searchTerm) ||
            artista.includes(searchTerm) ||
            descripcion.includes(searchTerm) ||
            categoria.includes(searchTerm);

        if (coincide) {
            card.style.display = 'block';
            foundResults = true;
            resultadosCount++;

            resaltarTermino(card, searchTerm);
        } else {
            card.style.display = 'none';
        }
    });

    // Mostrar/ocultar mensaje de resultados
    mostrarMensajeResultados(foundResults, resultadosCount, searchTerm);

    const style = document.createElement('style');
    style.textContent = `
        .btn-ver {
            background-color: #222;
            color: white;
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid #444;
            cursor: pointer;
            transition: transform 0.2s ease, background 0.2s ease;
            font-size: 0.8rem;
        }

        .btn-ver:hover {
            background-color: #333;
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
};



// Función para resaltar el término buscado
function resaltarTermino(card, searchTerm) {
    if (!searchTerm) return;
    
    const elementos = [
        { selector: 'h3', prop: 'textContent' },
        { selector: '.producto-artista', prop: 'textContent' },
        { selector: '.producto-descripcion', prop: 'textContent' }
    ];
    
    elementos.forEach(({ selector, prop }) => {
        const elemento = card.querySelector(selector);
        if (elemento) {
            const texto = elemento[prop];
            const highlighted = texto.replace(
                new RegExp(searchTerm, 'gi'),
                match => `<span class="highlight-producto" style="background-color: #ffeb3b; color: #000; padding: 2px 4px; border-radius: 3px;">${match}</span>`
            );
            elemento.innerHTML = highlighted;
        }
    });
}

// Función para mostrar mensaje de resultados
function mostrarMensajeResultados(foundResults, count, searchTerm) {
    // Remover mensajes anteriores
    const mensajeAnterior = document.getElementById('no-results-productos');
    const contadorAnterior = document.getElementById('contador-resultados');
    
    if (mensajeAnterior) mensajeAnterior.remove();
    if (contadorAnterior) contadorAnterior.remove();
    
    // Obtener contenedor de productos
    const contenedorProductos = document.querySelector('.productos-grid') || 
                               document.getElementById('productos-mas-vendidos') ||
                               document.querySelector('.container');
    
    if (!contenedorProductos) return;
    
    if (!foundResults && searchTerm) {
        // Mostrar mensaje de no resultados
        const noResults = document.createElement('div');
        noResults.id = 'no-results-productos';
        noResults.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #666; background: #f8f9fa; border-radius: 10px; margin: 15px 0;">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <h3 style="margin-bottom: 10px; font-size: 1.2rem;">No se encontraron resultados</h3>
                <p style="margin-bottom: 15px;">No hay productos que coincidan con "<strong>${searchTerm}</strong>"</p>
                <button onclick="mostrarTodosProductos()" 
                        style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s ease;">
                    <i class="fas fa-undo"></i> Mostrar todos los productos
                </button>
            </div>
        `;
        contenedorProductos.parentNode.insertBefore(noResults, contenedorProductos);
    } else if (foundResults && searchTerm) {
        // Mostrar contador de resultados
        const contador = document.createElement('div');
        contador.id = 'contador-resultados';
        contador.innerHTML = `
            <div style="background: #e7f3ff; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #007bff; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: #333;">
                    <i class="fas fa-check-circle" style="color: #007bff; font-size: 1rem;"></i> 
                    <span>Se encontraron <strong style="color: #007bff;">${count}</strong> producto(s) para "<strong>${searchTerm}</strong>"</span>
                </div>
                <button onclick="mostrarTodosProductos()" 
                        style="padding: 6px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; transition: all 0.3s ease; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-times" style="font-size: 0.7rem;"></i> Limpiar búsqueda
                </button>
            </div>
        `;
        contenedorProductos.parentNode.insertBefore(contador, contenedorProductos);
        
        // Agregar estilos hover dinámicamente
        setTimeout(() => {
            const cleanButton = document.querySelector('#contador-resultados button');
            if (cleanButton) {
                cleanButton.addEventListener('mouseenter', function() {
                    this.style.background = '#5a6268';
                    this.style.transform = 'translateY(-1px)';
                    this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                });
                
                cleanButton.addEventListener('mouseleave', function() {
                    this.style.background = '#6c757d';
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = 'none';
                });
                
                cleanButton.addEventListener('mousedown', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 1px 2px rgba(0,0,0,0.2)';
                });
                
                cleanButton.addEventListener('mouseup', function() {
                    this.style.transform = 'translateY(-1px)';
                    this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                });
            }
        }, 100);
    }
}

// Función para mostrar todos los productos (resetear búsqueda) - MEJORADA
window.mostrarTodosProductos = function() {
    const productosCards = document.querySelectorAll('.producto-card');
    
    // Mostrar todos los productos
    productosCards.forEach(card => {
        card.style.display = 'block';
    });
    
    // Remover resaltado
    removerResaltado();
    
    // Limpiar campo de búsqueda
    const searchInput = document.getElementById('producto-search');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Remover mensajes
    const noResults = document.getElementById('no-results-productos');
    const contador = document.getElementById('contador-resultados');
    
    if (noResults) noResults.remove();
    if (contador) contador.remove();
    
    console.log("Búsqueda limpiada - Mostrando todos los productos");
};

// Remover resaltado de términos - MEJORADA
function removerResaltado() {
    const highlightedElements = document.querySelectorAll('.highlight-producto');
    highlightedElements.forEach(element => {
        const parent = element.parentNode;
        // Restaurar el texto original
        if (parent) {
            parent.textContent = parent.textContent;
        }
    });
}

// Búsqueda en tiempo real (opcional)
function configurarBusquedaEnTiempoReal() {
    const searchInput = document.getElementById('producto-search');
    if (searchInput) {
        let timeoutId;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (this.value.trim() !== '') {
                    buscarProductos();
                } else {
                    mostrarTodosProductos();
                }
            }, 300); // 300ms de delay
        });
        
        // También permitir búsqueda con Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                buscarProductos();
            }
        });
    }
}

// Función para mostrar todos los productos (resetear búsqueda)
window.mostrarTodosProductos = function() {
    const productosCards = document.querySelectorAll('.producto-card');
    productosCards.forEach(card => {
        card.style.display = 'block';
    });
    
    // Remover mensaje de no resultados
    const noResults = document.getElementById('no-results-productos');
    if (noResults) {
        noResults.remove();
    }
    
    // Limpiar campo de búsqueda
    document.getElementById('producto-search').value = '';
    
    // Remover resaltado
    removerResaltado();
    
    // Ocultar contador
    const contador = document.getElementById('contador-resultados');
    if (contador) {
        contador.remove();
    }
};


// Remover resaltado de términos
function removerResaltado() {
    const highlightedElements = document.querySelectorAll('.highlight-producto');
    highlightedElements.forEach(element => {
        const parent = element.parentNode;
        parent.innerHTML = parent.textContent;
    });
}

// Código para el menú desplegable Sort By
        document.addEventListener('DOMContentLoaded', function() {
            const sortByDropdown = document.getElementById('sortByDropdown');
            const sortByBtn = document.getElementById('sortByBtn');
            const selectedSortOption = document.getElementById('selectedSortOption');
            const sortOptions = document.querySelectorAll('.sort-option');
            
            // Alternar la visibilidad del menú desplegable
            sortByBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                sortByDropdown.classList.toggle('active');
            });
            
            // Seleccionar una opción del menú
            sortOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // Remover la clase active de todas las opciones
                    sortOptions.forEach(opt => opt.classList.remove('active'));
                    
                    // Agregar la clase active a la opción seleccionada
                    this.classList.add('active');
                    
                    // Actualizar el texto del botón
                    selectedSortOption.textContent = this.textContent;
                    
                    // Cerrar el menú desplegable
                    sortByDropdown.classList.remove('active');
                    
                    // Obtener el rango seleccionado
                    const selectedRange = this.getAttribute('data-range');
                    
                    // Filtrar productos según el rango de precio seleccionado
                    filterProductsByPrice(selectedRange);
                    
                    // Mostrar mensaje de filtro aplicado
                    showFilterMessage(this.textContent);
                });
            });
            
            // Cerrar el menú desplegable al hacer clic fuera de él
            document.addEventListener('click', function() {
                sortByDropdown.classList.remove('active');
            });
            
            // Función para filtrar productos por rango de precio
function filterProductsByPrice(priceRange) {
    const productos = document.querySelectorAll('.producto-card');
    let visibleCount = 0;
    
    productos.forEach(producto => {
        let precio = 0;
        
        // Buscar precio en productos normales
        const precioElement = producto.querySelector('.producto-precio');
        if (precioElement) {
            const precioTexto = precioElement.textContent;
            precio = parseFloat(precioTexto.replace(/[^0-9.]/g, ''));
        }
        
        // Si no se encontró precio normal, buscar en productos con oferta
        if (precio === 0 || isNaN(precio)) {
            const precioOfertaElement = producto.querySelector('.precio-oferta');
            if (precioOfertaElement) {
                const precioOfertaTexto = precioOfertaElement.textContent;
                precio = parseFloat(precioOfertaTexto.replace(/[^0-9.]/g, ''));
            }
        }
        
        // Si aún no se encontró precio, buscar en cualquier elemento que contenga precio
        if (precio === 0 || isNaN(precio)) {
            const precioCualquierElemento = producto.querySelector('[class*="precio"]');
            if (precioCualquierElemento) {
                const precioTexto = precioCualquierElemento.textContent;
                precio = parseFloat(precioTexto.replace(/[^0-9.]/g, ''));
            }
        }
        
        console.log(`Producto: ${producto.querySelector('h3')?.textContent}, Precio encontrado: ${precio}`);
        
        // Mostrar u ocultar según el rango seleccionado
        let mostrarProducto = false;
        
        switch(priceRange) {
            case 'all':
                mostrarProducto = true;
                break;
            case '300-400':
                mostrarProducto = (precio >= 300 && precio <= 400);
                break;
            case '400-500':
                mostrarProducto = (precio >= 400 && precio <= 500);
                break;
            case '500-700':
                mostrarProducto = (precio >= 500 && precio <= 700);
                break;
            default:
                mostrarProducto = true;
        }
        
        if (mostrarProducto) {
            producto.style.display = 'block';
            visibleCount++;
        } else {
            producto.style.display = 'none';
        }
    });
    
    console.log(`Productos visibles después del filtro: ${visibleCount}`);
    
    // Si no hay productos visibles, mostrar mensaje
    if (visibleCount === 0 && priceRange !== 'all') {
        const productosGrid = document.getElementById('productos-mas-vendidos');
        productosGrid.innerHTML = `
            <div class="no-products-message">
                <i class="fas fa-search"></i>
                <h3>No se encontraron productos en este rango de precio</h3>
                <p>Intenta con otro rango o <a href="#" class="reset-filter">mostrar todos los productos</a></p>
            </div>
        `;
        
        // Agregar evento al enlace de reset
        const resetLink = document.querySelector('.reset-filter');
        if (resetLink) {
            resetLink.addEventListener('click', function(e) {
                e.preventDefault();
                // Encontrar y hacer clic en la opción "Todos los productos"
                const allOption = document.querySelector('.sort-option[data-range="all"]');
                if (allOption) {
                    allOption.click();
                }
            });
        }
    }
}
            
            // Función para mostrar mensaje de filtro aplicado
            function showFilterMessage(filterText) {
                // Puedes implementar aquí un toast o notificación si lo deseas
                console.log(`Filtro aplicado: ${filterText}`);
            }
        });

// Agrega estas funciones al final de tu archivo JavaScript

// Función para mostrar el formulario de recuperación de contraseña
function showForgotPassword() {
    // Ocultar otros formularios
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'none';
    
    // Mostrar formulario de pregunta de seguridad
    const securityQuestionForm = document.getElementById('securityQuestionForm') || createSecurityQuestionForm();
    securityQuestionForm.style.display = 'block';
}

// Función para crear el formulario de pregunta de seguridad si no existe
function createSecurityQuestionForm() {
    const authContainer = document.querySelector('.auth-container');
    
    const securityQuestionForm = document.createElement('div');
    securityQuestionForm.className = 'auth-form';
    securityQuestionForm.id = 'securityQuestionForm';
    securityQuestionForm.style.display = 'none';
    
    securityQuestionForm.innerHTML = `
        <div class="form-header">
            <h2>Verificación de Seguridad</h2>
            <p>Responde tu pregunta de seguridad para recuperar tu contraseña</p>
        </div>

        <form id="securityQuestionFormElement">
            <div class="form-group">
                <label for="security-username">Nombre de Usuario</label>
                <input type="text" id="security-username" name="username" placeholder="Ingresa tu nombre de usuario" required>
                <span class="error-message" id="securityUsernameError"></span>
            </div>

            <div class="form-group">
                <label for="security-question">Pregunta de Seguridad</label>
                <div class="security-question-display">
                    <p><strong>¿Cuál es el nombre de tu primera mascota?</strong></p>
                </div>
            </div>

            <div class="form-group">
                <label for="security-answer">Respuesta</label>
                <input type="text" id="security-answer" name="security_answer" placeholder="Ingresa tu respuesta" required>
                <span class="error-message" id="securityAnswerError"></span>
            </div>

            <div class="form-group">
                <label for="new-password">Nueva Contraseña</label>
                <div class="password-input">
                    <input type="password" id="new-password" name="new_password" placeholder="Ingresa tu nueva contraseña" required>
                    <button type="button" class="toggle-password" onclick="togglePassword('new-password')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <span class="error-message" id="newPasswordError"></span>
            </div>

            <div class="form-group">
                <label for="confirm-new-password">Confirmar Nueva Contraseña</label>
                <div class="password-input">
                    <input type="password" id="confirm-new-password" name="confirm_new_password" placeholder="Confirma tu nueva contraseña" required>
                    <button type="button" class="toggle-password" onclick="togglePassword('confirm-new-password')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <span class="error-message" id="confirmNewPasswordError"></span>
            </div>

            <button type="submit" class="btn-submit" id="securitySubmitBtn">
                <i class="fas fa-key"></i>
                Restablecer Contraseña
            </button>

            <div class="auth-switch">
                <p><a href="#" onclick="showLogin()">Volver al inicio de sesión</a></p>
            </div>
        </form>
    `;
    
    authContainer.appendChild(securityQuestionForm);
    
    // Configurar el evento del formulario
    document.getElementById('securityQuestionFormElement').addEventListener('submit', function(e) {
        e.preventDefault();
        verifySecurityQuestion();
    });
    
    return securityQuestionForm;
}

// Función para verificar la pregunta de seguridad y restablecer la contraseña
async function verifySecurityQuestion() {
    const username = document.getElementById('security-username').value;
    const securityAnswer = document.getElementById('security-answer').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;

    // Validaciones básicas
    if (!username || !securityAnswer || !newPassword || !confirmNewPassword) {
        Swal.fire({
            title: 'Campos incompletos',
            text: 'Por favor completa todos los campos',
            icon: 'warning',
            confirmButtonText: 'Entendido',
            showClass: {
                popup: 'animate__animated animate__zoomIn'
            },
            hideClass: {
                popup: 'animate__animated animate__zoomOut'
            }
        });
        return;
    }

    if (newPassword !== confirmNewPassword) {
        Swal.fire({
            title: 'Contraseñas no coinciden',
            text: 'Las contraseñas deben ser iguales',
            icon: 'error',
            confirmButtonText: 'Entendido',
            showClass: {
                popup: 'animate__animated animate__zoomIn'
            },
            hideClass: {
                popup: 'animate__animated animate__zoomOut'
            }
        });
        return;
    }

    // Mostrar loading
    const submitBtn = document.getElementById('securitySubmitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    submitBtn.disabled = true;

    try {
        // Llamar a la API para verificar la pregunta de seguridad
        const response = await fetch("http://localhost:3000/api/usuarios/recuperar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombreUsuario: username,
                respuestaSeguridad: securityAnswer,
                nuevaContrasena: newPassword
            })
        });

        const resultado = await response.json();

        if (response.ok) {
            Swal.fire({
                title: '¡Contraseña restablecida!',
                text: 'Tu contraseña ha sido cambiada exitosamente',
                icon: 'success',
                confirmButtonText: 'Iniciar Sesión',
                showClass: {
                    popup: 'animate__animated animate__zoomIn'
                },
                hideClass: {
                    popup: 'animate__animated animate__zoomOut'
                }
            }).then(() => {
                // Limpiar formulario y volver al login
                document.getElementById('securityQuestionFormElement').reset();
                showLogin();
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: resultado.mensaje || 'Respuesta incorrecta o usuario no encontrado',
                icon: 'error',
                confirmButtonText: 'Intentar de nuevo',
                showClass: {
                    popup: 'animate__animated animate__zoomIn'
                },
                hideClass: {
                    popup: 'animate__animated animate__zoomOut'
                }
            });
        }
    } catch (error) {
        console.error('Error al recuperar contraseña:', error);
        Swal.fire({
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor',
            icon: 'error',
            confirmButtonText: 'Entendido',
            showClass: {
                popup: 'animate__animated animate__zoomIn'
            },
            hideClass: {
                popup: 'animate__animated animate__zoomOut'
            }
        });
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Función para mostrar el formulario de login
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'none';
    
    const securityQuestionForm = document.getElementById('securityQuestionForm');
    if (securityQuestionForm) {
        securityQuestionForm.style.display = 'none';
    }
}

// Función para mostrar el formulario de registro
function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('forgotPasswordForm').style.display = 'none';
    
    const securityQuestionForm = document.getElementById('securityQuestionForm');
    if (securityQuestionForm) {
        securityQuestionForm.style.display = 'none';
    }
    
    // Scroll a la sección de registro si estamos en usuario.html
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Función para alternar visibilidad de contraseña - CORREGIDA
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentNode.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Función para ver categorías - SEPARADA CORRECTAMENTE
async function verCategoria(genero) {
    const contenedor = document.getElementById('productos-categoria');
    contenedor.innerHTML = '<p class="loading-products">Cargando productos...</p>';

    try {
        const respuesta = await fetch(`http://localhost:3000/api/productos/genero/${genero}`);
        const data = await respuesta.json();

        if (!data.success || data.count === 0) {
            contenedor.innerHTML = `<p class="no-productos">No hay productos para la categoría ${genero}</p>`;
            return;
        }

        // Mostrar productos
        contenedor.innerHTML = data.data.map(producto => `
            <div class="producto-card">
                <img src="http://localhost:3000/uploads/${producto.imagen}" alt="${producto.titulo}">
                <h3>${producto.titulo}</h3>
                <p>Artista: ${producto.artista}</p>
                <p>Precio: $${producto.precio}</p>
                <p>${producto.descripcion}</p>

                <!-- Botón siempre habilitado -->
                <button class="btn add-cart-btn" data-id="${producto.id}">
                    Añadir al carrito
                </button>
            </div>
        `).join('');

        // EVENTO DE CLIC PARA CADA BOTÓN
        document.querySelectorAll('.add-cart-btn').forEach(boton => {
            boton.addEventListener('click', () => {

                const usuarioLog = JSON.parse(localStorage.getItem('usuario'));

                if (!usuarioLog) {
                    Swal.fire({
                        title: 'Debes iniciar sesion',
                        text: 'Inicia sesión para añadir productos al carrito',
                        icon: 'warning',
                        confirmButtonText: 'Entendido',
                        showClass: { popup: 'animate__animated animate__zoomIn' },
                        hideClass: { popup: 'animate__animated animate__zoomOut' }
                    });
                    return;
                }

                // Si hay usuario logueado → aquí agregas al carrito
                console.log("Producto añadido:", boton.dataset.id);
            });
        });

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<p class="error">Error al cargar los productos.</p>';
    }
}
