document.addEventListener('DOMContentLoaded', () => {

    // ---------------------- REFERENCIAS ----------------------
    const paymentOptions = document.querySelectorAll('input[name="payment-method"]');

    const formContainers = {
        'card': document.getElementById('card-form'),
        'transfer': document.getElementById('transfer-form'),
        'oxxo': document.getElementById('oxxo-form')
    };

    const cardInputs = document.querySelectorAll('#card-form input[required]');
    const transferInputs = document.querySelectorAll('#transfer-form input[required]');
    const oxxoInputs = document.querySelectorAll('#oxxo-form input[required]');

    let selectedMethod = "card";

    // ---------------------- MARCAR INPUT ----------------------
    function markInput(input, valid, message = "") {
        let errorMsg = input.parentElement.querySelector(".error-msg");

        if (!errorMsg) {
            errorMsg = document.createElement("div");
            errorMsg.classList.add("error-msg");
            input.parentElement.appendChild(errorMsg);
        }

        if (valid) {
            input.classList.remove("input-error");
            input.classList.add("input-valid");
            errorMsg.classList.remove("active");
        } else {
            input.classList.add("input-error");
            input.classList.remove("input-valid");
            errorMsg.textContent = message;
            errorMsg.classList.add("active");
        }
    }

    // Inicializar con la forma de pago por defecto (Tarjeta)
    showPaymentForm('card');

    // Escuchar cambios en los métodos de pago
    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            showPaymentForm(e.target.value);
        });
    });

    // --- Lógica de Habilitar Botón de Compra (Simulación) ---
    // Validar que tanto dirección como método de pago estén completos antes de habilitar el botón
    const shippingInputs = document.querySelectorAll('#shipping-form input[required], #shipping-form select[required]');
    const finalizarCompraBtn = document.querySelector('.btn-finalizar-pago');

    // Agrupamos los inputs requeridos por método de pago
    const paymentForms = {
        card: document.querySelectorAll('#card-form input[required]'),
        transfer: document.querySelectorAll('#transfer-form input[required]'),
        oxxo: document.querySelectorAll('#oxxo-form input[required]')
    };

    function validateCardFields() {
        const cardNumberEl = document.getElementById('card-number');
        const cardNameEl = document.getElementById('card-name');
        const cardExpiryEl = document.getElementById('card-expiry');
        const cardCvvEl = document.getElementById('card-cvv');
        if (!cardNumberEl || !cardNameEl || !cardExpiryEl || !cardCvvEl) return false;
        const num = cardNumberEl.value.replace(/\s+/g, '');
        const numValid = /^\d{12,19}$/.test(num); // básico: entre 12 y 19 dígitos
        const nameValid = cardNameEl.value.trim().length > 2;
        const expiryValid = /^\d{2}\/\d{2}$/.test(cardExpiryEl.value.trim()); // MM/AA
        const cvvValid = /^\d{3,4}$/.test(cardCvvEl.value.trim());
        return numValid && nameValid && expiryValid && cvvValid;
    }

    function isPaymentValid() {
        const method = document.querySelector('input[name="payment-method"]:checked')?.value || 'card';
        if (method === 'card') return validateCardFields();
        const inputs = paymentForms[method] || [];
        return Array.from(inputs).every(i => i.value.trim());
    }

    function isShippingValid() {
        let isComplete = true;
        shippingInputs.forEach(input => {
            if (!input.value.trim()) {
                isComplete = false;
            }
        });
        return isComplete;
    }

    function updateFinalizeButton() {
        const shippingOk = isShippingValid();
        const paymentOk = isPaymentValid();
        finalizarCompraBtn.disabled = !(shippingOk && paymentOk);
        if (!shippingOk) {
            finalizarCompraBtn.textContent = 'Rellena los campos de Envío';
        } else if (!paymentOk) {
            finalizarCompraBtn.textContent = 'Completa los datos de pago';
        } else {
            finalizarCompraBtn.textContent = 'Terminar Compra';
        }
    }

    // Escuchar eventos en los campos del formulario de envío
    shippingInputs.forEach(input => {
        input.addEventListener('input', updateFinalizeButton);
    });

    // Escuchar cambios en los formularios de pago
    Object.values(paymentForms).forEach(nodeList => nodeList.forEach(i => i.addEventListener('input', updateFinalizeButton)));
    // También actualizar cuando cambie el método de pago
    paymentOptions.forEach(option => option.addEventListener('change', () => { updateFinalizeButton(); }));

    // Revisar al cargar
    updateFinalizeButton();
    // Cargar y renderizar resumen del carrito
    async function loadCartSummary() {
        const usuario = JSON.parse(localStorage.getItem('usuario')) || null;
        const summaryContainer = document.querySelector('.order-items-summary');
        const subtotalEl = document.getElementById('order-subtotal');
        const discountEl = document.getElementById('order-discount');
        const taxEl = document.getElementById('order-tax');
        const shippingEl = document.getElementById('order-shipping');
        const totalEl = document.getElementById('order-total-amount');

        // Valores por defecto
        let subtotal = 0;
        let discount = 0;
        const shipping = 15.0;

        if (!usuario || !usuario.id) {
            // No hay usuario -> mostrar mensaje genérico
            summaryContainer.innerHTML = `<p>Inicia sesión para ver tu carrito</p><a href="carrito.html" class="btn-edit-cart"><i class="fas fa-edit"></i> Editar Carrito</a>`;
            subtotalEl.textContent = formatCurrency(0);
            discountEl.textContent = formatCurrency(0);
            taxEl.textContent = formatCurrency(0);
            shippingEl.textContent = formatCurrency(0);
            totalEl.textContent = formatCurrency(0);
            finalizarCompraBtn.disabled = true;
            return;
        }

        const apiOrigin = (location.protocol === 'file:') ? 'http://localhost:3000' : `${location.protocol}//${location.host}`;
        const primary = `${apiOrigin}/api/carrito/${usuario.id}`;
        const fallback = `http://localhost:3000/api/carrito/${usuario.id}`;

        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            let resp = await fetch(primary, { headers });
            if (!resp.ok) resp = await fetch(fallback, { headers });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const json = await resp.json();
            const items = Array.isArray(json.data) ? json.data : [];

            if (items.length === 0) {
                summaryContainer.innerHTML = `<p>Tu carrito está vacío</p><a href="carrito.html" class="btn-edit-cart"><i class="fas fa-edit"></i> Ir a carrito</a>`;
                subtotalEl.textContent = formatCurrency(0);
                discountEl.textContent = formatCurrency(0);
                taxEl.textContent = formatCurrency(0);
                shippingEl.textContent = formatCurrency(0);
                totalEl.textContent = formatCurrency(0);
                finalizarCompraBtn.disabled = true;
                updateFinalizeButton();
                return;
            }

            // Render lista breve y calcular totales
            const listHtml = [];
            let totalItems = 0;
            items.forEach(it => {
                const price = Number(it.precio) || 0;
                const qty = Number(it.cantidad) || 1;
                const oferta = Number(it.oferta) || 0; // porcentaje si aplica
                const orig = price * qty;
                const discounted = oferta > 0 ? orig * (1 - oferta / 100) : orig;
                subtotal += discounted;
                discount += (orig - discounted);
                totalItems += qty;
            });

            summaryContainer.innerHTML = `<p>${totalItems} Productos en total</p>` + listHtml.join('') + `<a href="carrito.html" class="btn-edit-cart"><i class="fas fa-edit"></i> Editar Carrito</a>`;

            const tax = subtotal * 0.16;
            const total = subtotal + tax + shipping;

            subtotalEl.textContent = formatCurrency(subtotal);
            discountEl.textContent = `-${formatCurrency(discount)}`;
            taxEl.textContent = formatCurrency(tax);
            shippingEl.textContent = formatCurrency(shipping);
            totalEl.textContent = formatCurrency(total);

            // Si no hay items, deshabilitar botón
            finalizarCompraBtn.disabled = items.length === 0 || !isShippingValid() || !isPaymentValid();

            // Asegurar que el botón muestre el estado correcto
            updateFinalizeButton();
        } catch (err) {
            console.error('Error loading cart summary:', err);
            summaryContainer.innerHTML = `<p>Error cargando resumen</p><a href="carrito.html" class="btn-edit-cart"><i class="fas fa-edit"></i> Ver carrito</a>`;
        }
    }

    function formatCurrency(value) {
        return `$${Number(value).toFixed(2)}`;
    }
    
    // Cargar resumen al inicio
    loadCartSummary();
    // Acción al clicar Finalizar Compra
    finalizarCompraBtn.addEventListener('click', async () => {
        // Asegurarse de que el botón esté habilitado
        if (finalizarCompraBtn.disabled) return;
        // Protección adicional: validar pago antes de continuar
        if (!isPaymentValid()) {
            Swal.fire('Completa los datos de pago', 'Por favor completa los campos del método de pago antes de finalizar.', 'warning');
            return;
        }
        const usuario = JSON.parse(localStorage.getItem('usuario')) || null;
        if (!usuario || !usuario.id) {
            Swal.fire('Debes iniciar sesión', 'Debes iniciar sesión para finalizar la compra', 'warning');
    // ---------------------- VALIDACIONES ----------------------
    function validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function validateCardNumber(value) {
        return /^\d{16}$/.test(value);
    }

    function validateCVV(value) {
        return /^\d{3,4}$/.test(value);
    }

    function validateNotEmpty(value) {
        return value.trim().length > 0;
    }

    function validateNumeric(value) {
        return /^\d+$/.test(value);
    }

    // ---------------------- VALIDACIÓN GLOBAL ----------------------
    function validateAll() {
        let formValid = true;

        // Validar envío
        shippingInputs.forEach(input => {
            const valid = validateNotEmpty(input.value);
            markInput(input, valid, "Este campo es obligatorio");
            if (!valid) formValid = false;
        });

        // Validar método de pago
        if (selectedMethod === "card") {
            cardInputs.forEach(input => {
                let valid = validateNotEmpty(input.value);
                let message = "Este campo es obligatorio";

                if (input.id === "card-number") {
                    valid = validateCardNumber(input.value);
                    message = "La tarjeta debe tener 16 dígitos";
                }

                if (input.id === "card-cvv") {
                    valid = validateCVV(input.value);
                    message = "CVV inválido";
                }

                if (input.id === "card-email") {
                    valid = validateEmail(input.value);
                    message = "Email inválido";
                }

                markInput(input, valid, message);
                if (!valid) formValid = false;
            });
        }

        if (selectedMethod === "transfer") {
            transferInputs.forEach(input => {
                const valid = validateNotEmpty(input.value);
                markInput(input, valid, "Este campo es obligatorio");
                if (!valid) formValid = false;
            });
        }

        if (selectedMethod === "oxxo") {
            oxxoInputs.forEach(input => {
                const valid = validateNotEmpty(input.value);
                markInput(input, valid, "Este campo es obligatorio");
                if (!valid) formValid = false;
            });
        }

        // Activar/desactivar botón
        finalizarCompraBtn.disabled = !formValid;
        finalizarCompraBtn.textContent = formValid
            ? "Terminar Compra"
            : "Completa los datos para continuar";

        return formValid;
    }

    // Disparar validación con cada input
    document.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("input", validateAll);
    });

    validateAll();


    // ---------------------- CAMBIO DE MÉTODO ----------------------
    function showPaymentForm(method) {
        selectedMethod = method;

        Object.values(formContainers).forEach(form => {
            form.classList.add("hidden");
            form.classList.remove("active");
        });

        formContainers[method].classList.add("active");
        formContainers[method].classList.remove("hidden");

        validateAll();
    }

    paymentOptions.forEach(opt => {
        opt.addEventListener("change", e => showPaymentForm(e.target.value));
    });

    showPaymentForm("card");


    // ---------------------- FINALIZAR COMPRA ----------------------
    finalizarCompraBtn.addEventListener('click', async () => {

        if (!validateAll()) {
            Swal.fire("Datos incompletos", "Revisa los campos marcados.", "warning");
            return;
        }

        const usuario = JSON.parse(localStorage.getItem("usuario"));

        if (!usuario || !usuario.id) {
            Swal.fire("Inicia sesión", "Debes iniciar sesión para continuar", "warning");
            return;
        }

        const confirm = await Swal.fire({
            title: "¿Confirmar compra?",
            text: "Se enviará la nota de compra a tu correo",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "Cancelar"
        });

        if (!confirm.isConfirmed) return;

        const cupon = JSON.parse(localStorage.getItem("cupon")) || {};

        const url = `http://localhost:3000/api/nota/compra`;
        
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            /*let resp = await fetch(primary, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
            });*/
            if (!resp.ok) {
                console.warn(`POST nota comp failed (${resp.status}) at primary, falling back to ${fallback}`);
                resp = await fetch(fallback, { method: 'POST', headers: headers, body: JSON.stringify(formData) });
            }
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`HTTP ${resp.status} - ${text}`);
            }
            //const json = await resp.json();
            if (json && json.success) {
                Swal.fire('Enviado', 'La nota de compra ha sido enviada a tu correo', 'success');
                // Redirect to main page shortly after confirmation
                setTimeout(() => { window.location.href = 'tienda.html'; }, 1300);
            } else {
                Swal.fire('Error', json.message || 'Ocurrió un error', 'error');
            }

            // AQUI LEEMOS EL PAÍS 
            const pais = document.getElementById("pais") ? document.getElementById("pais").value : "México";

            const resp = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: usuario.id,
                    cupon_codigo: cupon.codigo || null,
                    cupon_descuento: cupon.descuento || 0,
                    pais: pais 
                })
            });

            const json = await resp.json();

            if (json.success) {
                Swal.fire("Éxito", "Nota enviada a tu correo", "success");
                localStorage.removeItem("cupon");
                setTimeout(() => location.href = "tienda.html", 1200);
            }

        } catch (err) {
            console.error(err);
            Swal.fire("Error", "No se pudo completar la compra", "error");
        }

    });
});