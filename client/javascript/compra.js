document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Script compra.js cargado');

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
    const shippingInputs = document.querySelectorAll('#shipping-form input[required], #shipping-form select[required]');
    const finalizarCompraBtn = document.querySelector('.btn-finalizar-pago');

    console.log('📦 Elementos encontrados:', {
        paymentOptions: paymentOptions.length,
        shippingInputs: shippingInputs.length,
        finalizarCompraBtn: !!finalizarCompraBtn
    });

    let selectedMethod = "card";

    // Agrupamos los inputs requeridos por método de pago
    const paymentForms = {
        card: document.querySelectorAll('#card-form input[required]'),
        transfer: document.querySelectorAll('#transfer-form input[required]'),
        oxxo: document.querySelectorAll('#oxxo-form input[required]')
    };

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
    
    // ---------------------- VALIDACIONES ----------------------
    function validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function validateCardNumber(value) {
        const num = value.replace(/\s+/g, '');
        return /^\d{12,19}$/.test(num);
    }

    function validateCVV(value) {
        return /^\d{3,4}$/.test(value);
    }

    function validateNotEmpty(value) {
        return value.trim().length > 0;
    }

    function validateCardFields() {
        const cardNumberEl = document.getElementById('card-number');
        const cardNameEl = document.getElementById('card-name');
        const cardExpiryEl = document.getElementById('card-expiry');
        const cardCvvEl = document.getElementById('card-cvv');
        
        if (!cardNumberEl || !cardNameEl || !cardExpiryEl || !cardCvvEl) return false;
        
        const num = cardNumberEl.value.replace(/\s+/g, '');
        const numValid = /^\d{12,19}$/.test(num);
        const nameValid = cardNameEl.value.trim().length > 2;
        const expiryValid = /^\d{2}\/\d{2}$/.test(cardExpiryEl.value.trim());
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
        return Array.from(shippingInputs).every(input => input.value.trim());
    }

    function updateFinalizeButton() {
        if (!finalizarCompraBtn) return;
        
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
                    message = "La tarjeta debe tener entre 12 y 19 dígitos";
                }

                if (input.id === "card-cvv") {
                    valid = validateCVV(input.value);
                    message = "CVV debe tener 3 o 4 dígitos";
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

        updateFinalizeButton();
        return formValid;
    }

    // ---------------------- CAMBIO DE MÉTODO ----------------------
    function showPaymentForm(method) {
        selectedMethod = method;

        Object.values(formContainers).forEach(form => {
            if (form) {
                form.classList.add("hidden");
                form.classList.remove("active");
            }
        });

        if (formContainers[method]) {
            formContainers[method].classList.add("active");
            formContainers[method].classList.remove("hidden");
        }

        validateAll();
    }

    // ---------------------- CARGAR RESUMEN DEL CARRITO ----------------------
    async function loadCartSummary() {
        console.log('🛒 Iniciando carga de resumen del carrito...');
        
        const summaryContainer = document.querySelector('.order-items-summary');
        const subtotalEl = document.getElementById('order-subtotal');
        const discountEl = document.getElementById('order-discount');
        const taxEl = document.getElementById('order-tax');
        const shippingEl = document.getElementById('order-shipping');
        const totalEl = document.getElementById('order-total-amount');

        console.log('📍 Elementos DOM encontrados:', {
            summaryContainer: !!summaryContainer,
            subtotalEl: !!subtotalEl,
            discountEl: !!discountEl,
            taxEl: !!taxEl,
            shippingEl: !!shippingEl,
            totalEl: !!totalEl
        });

        if (!summaryContainer) {
            console.error('❌ No se encontró .order-items-summary');
            return;
        }

        let subtotal = 0;
        let discount = 0;
        
        // Cargar tarifas del usuario desde localStorage
        const tarifasGuardadas = JSON.parse(localStorage.getItem('tarifasUsuario'));
        let tarifas = tarifasGuardadas || {
            impuesto: 16,
            envio: 15.00,
            pais: 'México'
        };
        
        // Asegurar que el impuesto sea un porcentaje
        if (tarifas.impuesto) {
            const impuestoValue = Number(tarifas.impuesto);
            tarifas.impuesto = impuestoValue > 1 ? impuestoValue : impuestoValue * 100;
        }
        
        console.log('📊 Tarifas del usuario:', tarifas);

        const usuario = JSON.parse(localStorage.getItem('usuario')) || null;
        console.log('👤 Usuario:', usuario);

        if (!usuario || !usuario.id) {
            console.warn('⚠️ Usuario no encontrado o sin ID');
            summaryContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; background: #fff3cd; border-radius: 8px; margin: 10px 0;">
                    <p style="margin: 10px 0;">⚠️ Inicia sesión para ver tu carrito</p>
                    <a href="index.html" style="display: inline-block; padding: 8px 16px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                        Ir a inicio de sesión
                    </a>
                </div>
            `;
            
            if (subtotalEl) subtotalEl.textContent = formatCurrency(0);
            if (discountEl) discountEl.textContent = formatCurrency(0);
            if (taxEl) taxEl.textContent = formatCurrency(0);
            if (shippingEl) shippingEl.textContent = formatCurrency(0);
            if (totalEl) totalEl.textContent = formatCurrency(0);
            if (finalizarCompraBtn) finalizarCompraBtn.disabled = true;
            return;
        }

        const apiOrigin = (location.protocol === 'file:') ? 'http://localhost:3000' : `${location.protocol}//${location.host}`;
        const primary = `${apiOrigin}/api/carrito/${usuario.id}`;
        const fallback = `http://localhost:3000/api/carrito/${usuario.id}`;

        console.log('🌐 URLs API:', { primary, fallback });

        summaryContainer.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <p>⏳ Cargando carrito...</p>
            </div>
        `;

        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            console.log('📡 Haciendo fetch a:', primary);
            let resp = await fetch(primary, { headers });
            
            if (!resp.ok) {
                console.warn(`⚠️ Respuesta ${resp.status} desde primary, intentando fallback...`);
                resp = await fetch(fallback, { headers });
            }
            
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
            }
            
            const json = await resp.json();
            console.log('✅ Respuesta del carrito:', json);
            
            const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
            console.log('📦 Items del carrito:', items);

            if (items.length === 0) {
                summaryContainer.innerHTML = `
                    <div style="padding: 20px; text-align: center; background: #f8f9fa; border-radius: 8px; margin: 10px 0;">
                        <p style="margin: 10px 0;">🛒 Tu carrito está vacío</p>
                        <a href="tienda.html" style="display: inline-block; padding: 8px 16px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                            Ir a la tienda
                        </a>
                    </div>
                `;
                
                if (subtotalEl) subtotalEl.textContent = formatCurrency(0);
                if (discountEl) discountEl.textContent = formatCurrency(0);
                if (taxEl) taxEl.textContent = formatCurrency(0);
                if (shippingEl) shippingEl.textContent = formatCurrency(0);
                if (totalEl) totalEl.textContent = formatCurrency(0);
                if (finalizarCompraBtn) {
                    finalizarCompraBtn.disabled = true;
                    finalizarCompraBtn.textContent = 'Carrito vacío';
                }
                return;
            }

            // Calcular subtotal de productos
            let totalItems = 0;
            
            items.forEach(it => {
                const price = Number(it.precio) || 0;
                const qty = Number(it.cantidad) || 1;
                const oferta = Number(it.oferta) || 0;
                
                const precioUnitario = oferta > 0 ? price * (1 - oferta / 100) : price;
                const itemSubtotal = precioUnitario * qty;
                subtotal += itemSubtotal;
                totalItems += qty;
            });

            // Verificar si hay cupón aplicado desde carrito.html
            const cuponAplicado = JSON.parse(localStorage.getItem('cuponAplicado'));
            let cuponDescuento = 0;
            let cuponCodigo = null;
            
            if (cuponAplicado && cuponAplicado.aplicado && cuponAplicado.descuento > 0) {
                // Calcular descuento del cupón (porcentaje)
                cuponDescuento = subtotal * (cuponAplicado.descuento / 100);
                cuponCodigo = cuponAplicado.codigo;
                console.log('🎫 Cupón aplicado:', {
                    codigo: cuponCodigo,
                    descuento: cuponAplicado.descuento,
                    monto: cuponDescuento
                });
            }

            // Mostrar resumen de productos
            summaryContainer.innerHTML = `
                <p>${totalItems} Producto${totalItems !== 1 ? 's' : ''} en total</p>
                ${cuponCodigo ? `
                    <div style="background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.3); border-radius: 5px; padding: 8px 12px; margin: 10px 0; font-size: 13px; color: #2e7d32;">
                        <i class="fas fa-tag"></i> Cupón "${cuponCodigo}" aplicado
                    </div>
                ` : ''}
                ${tarifas.pais ? `
                    <div style="background: rgba(33, 150, 243, 0.1); border: 1px solid rgba(33, 150, 243, 0.3); border-radius: 5px; padding: 8px 12px; margin: 10px 0; font-size: 13px; color: #1976d2;">
                        <i class="fas fa-globe"></i> Envío a: ${tarifas.pais}
                    </div>
                ` : ''}
                <a href="carrito.html" class="btn-edit-cart">
                    <i class="fas fa-edit"></i> Editar Carrito
                </a>
            `;

            // Calcular totales finales con tarifas del país
            const subtotalConDescuento = Math.max(0, subtotal - cuponDescuento);
            const tax = subtotalConDescuento * (tarifas.impuesto / 100);
            const shipping = tarifas.envio;
            const total = subtotalConDescuento + tax + shipping;

            // Actualizar elementos del resumen
            if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
            
            // Actualizar etiqueta del impuesto
            const taxLabel = document.querySelector('.summary-row:nth-child(3) span:first-child');
            if (taxLabel) {
                taxLabel.textContent = `Impuestos (${tarifas.impuesto}%):`;
            }
            
            if (discountEl) {
                const discountRow = discountEl.closest('.summary-row');
                if (cuponDescuento > 0) {
                    discountEl.textContent = `-${formatCurrency(cuponDescuento)}`;
                    if (discountRow) {
                        discountRow.style.display = 'flex';
                        discountRow.style.color = '#4caf50';
                        discountRow.style.fontWeight = '600';
                    }
                } else {
                    discountEl.textContent = formatCurrency(0);
                    if (discountRow) {
                        discountRow.style.display = 'none';
                    }
                }
            }
            
            if (taxEl) taxEl.textContent = formatCurrency(tax);
            if (shippingEl) shippingEl.textContent = formatCurrency(shipping);
            if (totalEl) totalEl.textContent = formatCurrency(total);

            console.log('💰 Resumen calculado:', { 
                subtotal, 
                cuponDescuento, 
                subtotalConDescuento,
                tax, 
                shipping, 
                total,
                impuesto: tarifas.impuesto,
                pais: tarifas.pais
            });

            updateFinalizeButton();
            
        } catch (err) {
            console.error('❌ Error cargando resumen del carrito:', err);
            summaryContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; background: #f8d7da; border-radius: 8px; margin: 10px 0; color: #721c24;">
                    <p style="margin: 10px 0;">❌ Error al cargar el resumen</p>
                    <p style="font-size: 12px; margin: 5px 0;">${err.message}</p>
                    <a href="carrito.html" style="display: inline-block; padding: 8px 16px; background: #6c757d; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                        Ver carrito
                    </a>
                </div>
            `;
            
            if (subtotalEl) subtotalEl.textContent = formatCurrency(0);
            if (discountEl) discountEl.textContent = formatCurrency(0);
            if (taxEl) taxEl.textContent = formatCurrency(0);
            if (shippingEl) shippingEl.textContent = formatCurrency(0);
            if (totalEl) totalEl.textContent = formatCurrency(0);
        }
    }

    function formatCurrency(value) {
        return `$${Number(value).toFixed(2)}`;
    }

    // ---------------------- EVENT LISTENERS ----------------------
    
    // Inicializar con la forma de pago por defecto
    if (formContainers.card) {
        showPaymentForm('card');
    }

    // Escuchar cambios en métodos de pago
    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            showPaymentForm(e.target.value);
        });
    });

    // Escuchar eventos en campos
    shippingInputs.forEach(input => {
        input.addEventListener('input', updateFinalizeButton);
    });

    Object.values(paymentForms).forEach(nodeList => {
        nodeList.forEach(i => i.addEventListener('input', updateFinalizeButton));
    });

    // Validación en todos los inputs
    document.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("input", validateAll);
    });

    // ---------------------- FINALIZAR COMPRA ----------------------
    if (finalizarCompraBtn) {
        finalizarCompraBtn.addEventListener('click', async () => {
            
            if (!validateAll()) {
                Swal.fire({
                    title: 'Datos incompletos',
                    text: 'Revisa los campos marcados.',
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

            if (!isPaymentValid()) {
                Swal.fire({
                    title: 'Completa los datos de pago',
                    text: 'Por favor completa los campos del método de pago antes de finalizar.',
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

            const usuario = JSON.parse(localStorage.getItem("usuario"));

            if (!usuario || !usuario.id) {
                Swal.fire({
                    title: 'Inicia sesión',
                    text: 'Debes iniciar sesión para continuar',
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

            const confirm = await Swal.fire({
                title: "¿Confirmar compra?",
                text: "Se enviará la nota de compra a tu correo",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sí, confirmar",
                cancelButtonText: "Cancelar",
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                showClass: {
                    popup: 'animate__animated animate__zoomIn'
                },
                hideClass: {
                    popup: 'animate__animated animate__zoomOut'
                }
            });

            if (!confirm.isConfirmed) return;

            // Obtener información del cupón aplicado (si existe)
            const cuponAplicado = JSON.parse(localStorage.getItem("cuponAplicado"));
            
            // Obtener tarifas del usuario
            const tarifasUsuario = JSON.parse(localStorage.getItem("tarifasUsuario"));
            
            const pais = document.getElementById("pais") ? document.getElementById("pais").value : "México";
            
            const apiOrigin = (location.protocol === 'file:') ? 'http://localhost:3000' : `${location.protocol}//${location.host}`;
            const primary = `${apiOrigin}/api/nota/compra`;
            const fallback = `http://localhost:3000/api/nota/compra`;

            try {
                const token = localStorage.getItem('token');
                const headers = { 'Content-Type': 'application/json' };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                // Construir payload con información del cupón y tarifas
                const payload = {
                    usuario_id: usuario.id,
                    cupon_codigo: cuponAplicado?.codigo || null,
                    cupon_descuento: cuponAplicado?.descuento || 0,
                    pais: pais,
                    impuesto: tarifasUsuario?.impuesto || 16,
                    envio: tarifasUsuario?.envio || 15.00
                };

                console.info('📤 Enviando nota de compra:', payload);

                let resp = await fetch(primary, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(payload)
                });

                if (!resp.ok) {
                    console.warn(`⚠️ Respuesta ${resp.status} desde primary, intentando fallback...`);
                    resp = await fetch(fallback, {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify(payload)
                    });
                }

                if (!resp.ok) {
                    const errorText = await resp.text();
                    throw new Error(`HTTP ${resp.status}: ${errorText}`);
                }

                const json = await resp.json();
                console.info('✅ Respuesta de nota de compra:', json);

                if (json.success) {
                    await Swal.fire({
                        title: '¡Compra exitosa!',
                        html: `
                            <p>Tu nota de compra ha sido enviada a tu correo</p>
                            ${cuponAplicado?.codigo ? `<p style="color: #4caf50; margin-top: 10px;"><i class="fas fa-tag"></i> Cupón "${cuponAplicado.codigo}" aplicado con éxito</p>` : ''}
                            ${tarifasUsuario?.pais ? `<p style="color: #1976d2; margin-top: 5px;"><i class="fas fa-globe"></i> Envío a: ${tarifasUsuario.pais}</p>` : ''}
                        `,
                        icon: 'success',
                        confirmButtonText: 'Continuar',
                        confirmButtonColor: '#28a745',
                        showClass: {
                            popup: 'animate__animated animate__zoomIn'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__zoomOut'
                        }
                    });
                    
                    // Limpiar datos del cupón, tarifas y carrito del localStorage
                    localStorage.removeItem("cuponAplicado");
                    localStorage.removeItem("tarifasUsuario");
                    localStorage.removeItem("cartSummary");
                    
                    setTimeout(() => location.href = "tienda.html", 1200);
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: json.message || 'Ocurrió un error al procesar la compra',
                        icon: 'error',
                        confirmButtonText: 'Continuar',
                        showClass: {
                            popup: 'animate__animated animate__zoomIn'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__zoomOut'
                        }
                    });
                }

            } catch (err) {
                console.error('❌ Error al finalizar compra:', err);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo completar la compra. Por favor, intenta de nuevo.',
                    icon: 'error',
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
    }

    // ---------------------- INICIALIZAR ----------------------
    console.log('⚡ Inicializando validaciones y carga de carrito...');
    validateAll();
    loadCartSummary();
});