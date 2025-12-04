/* carrito.js
   - Carga y muestra los items del carrito para el usuario actual
   - Actualiza cantidad (PUT) y elimina items (DELETE)
   - Maneja rutas protegidas con autenticación JWT
   - Sistema de cupones de descuento
*/

(function() {
    const apiOrigin = (location.protocol === 'file:') ? 'http://localhost:3000' : `${location.protocol}//${location.host}`;
    const primaryBase = `${apiOrigin}/api/carrito`;
    const fallbackBase = 'http://localhost:3000/api/carrito';
    const cuponesBase = `${apiOrigin}/api/cupones`;
    const fallbackCuponesBase = 'http://localhost:3000/api/cupones';
    const tarifasBase = `${apiOrigin}/api/tarifas`;
    const fallbackTarifasBase = 'http://localhost:3000/api/tarifas';

    // Variable global para almacenar el descuento del cupón
    let cuponActual = {
        codigo: null,
        descuento: 0,
        id: null,
        aplicado: false
    };

    // Variables globales para tarifas del usuario
    let tarifasUsuario = {
        impuesto: 16, // Por defecto México
        envio: 15.00,
        pais: 'México'
    };

    document.addEventListener('DOMContentLoaded', () => {
        initCartPage();
    });

    async function initCartPage() {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const token = localStorage.getItem('token');
        
        if (!usuario || !usuario.id || !token) {
            showLoginMessage();
            return;
        }

        const usuarioId = usuario.id;
        
        // Cargar tarifas del usuario primero
        await loadUserTarifas();
        console.log('✅ Tarifas cargadas, ahora cargando carrito...');
        
        // Luego cargar items del carrito
        await loadCartItems(usuarioId);
        console.log('✅ Carrito cargado, actualizando resumen...');
        
        // Forzar actualización del resumen con las tarifas cargadas
        const subtotalEls = document.querySelectorAll('.subtotal-col');
        let sum = 0;
        subtotalEls.forEach(el => {
            sum += Number(el.dataset.subtotal) || 0;
        });
        updateSummary(sum);

        const btnFinalizar = document.getElementById('btn-finalizar-pago');
        if (btnFinalizar) {
            btnFinalizar.addEventListener('click', () => {
                // Verificar que haya items antes de proceder
                const items = document.querySelectorAll('.cart-item');
                if (items.length === 0) {
                    showAlert('error', 'Tu carrito está vacío', 'Agrega productos antes de finalizar la compra');
                    return;
                }
                
                // Guardar información del cupón para la página de compra
                if (cuponActual.aplicado && cuponActual.codigo) {
                    localStorage.setItem('cuponAplicado', JSON.stringify(cuponActual));
                }
                
                // Guardar tarifas para la página de compra
                localStorage.setItem('tarifasUsuario', JSON.stringify(tarifasUsuario));
                
                window.location.href = 'compra.html';
            });
        }
    }

    function showLoginMessage() {
        const container = document.querySelector('.cart-items-container');
        if (!container) return;
        
        const header = container.querySelector('.cart-header-row');
        container.innerHTML = '';
        if (header) container.appendChild(header);
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'empty-cart-message';
        msgDiv.innerHTML = `
            <i class="fas fa-user-lock" style="font-size: 48px; color: #ff5252; margin-bottom: 15px;"></i>
            <h3>Debes iniciar sesión</h3>
            <p>Para ver tu carrito de compras, primero debes iniciar sesión en tu cuenta.</p>
            <button onclick="window.location.href='index.html'" class="btn-submit" style="margin-top: 15px;">
                Ir a Iniciar Sesión
            </button>
        `;
        container.appendChild(msgDiv);
        
        // Ocultar resumen de compra
        const summary = document.querySelector('.cart-summary-card');
        if (summary) summary.style.display = 'none';
    }

    function showMessage(text, icon = 'info') {
        const container = document.querySelector('.cart-items-container');
        if (!container) return;
        
        const header = container.querySelector('.cart-header-row');
        container.innerHTML = '';
        if (header) container.appendChild(header);
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'empty-cart-message';
        
        let iconClass = 'fa-shopping-cart';
        let iconColor = '#6c757d';
        
        if (icon === 'error') {
            iconClass = 'fa-exclamation-triangle';
            iconColor = '#ff5252';
        }
        
        msgDiv.innerHTML = `
            <i class="fas ${iconClass}" style="font-size: 48px; color: ${iconColor}; margin-bottom: 15px;"></i>
            <h3>${text}</h3>
            <button onclick="window.location.href='tienda.html'" class="btn-submit" style="margin-top: 15px;">
                Explorar Productos
            </button>
        `;
        container.appendChild(msgDiv);
        
        // Resetear resumen cuando no hay productos
        updateSummary(0);
    }

    // Función para cargar las tarifas del usuario según su país
    async function loadUserTarifas() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('⚠️ No hay token disponible');
            return;
        }

        const url = `${tarifasBase}/usuario`;
        
        try {
            console.log('📊 Cargando tarifas del usuario desde:', url);
            console.log('🔑 Token:', token.substring(0, 20) + '...');
            
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            let resp = await fetch(url, { headers });
            console.log('📡 Respuesta inicial:', resp.status, resp.statusText);
            
            if (!resp.ok && url !== `${fallbackTarifasBase}/usuario`) {
                console.log('⚠️ Intentando fallback...');
                resp = await fetch(`${fallbackTarifasBase}/usuario`, { headers });
                console.log('📡 Respuesta fallback:', resp.status, resp.statusText);
            }
            
            if (!resp.ok) {
                const errorText = await resp.text();
                console.warn(`⚠️ Error HTTP ${resp.status}: ${errorText}`);
                console.warn('⚠️ No se pudieron cargar tarifas, usando valores por defecto');
                return; // Mantener valores por defecto
            }
            
            const data = await resp.json();
            console.log('📦 Datos recibidos:', data);
            
            if (data.success && data.data) {
                const impuestoValue = Number(data.data.impuesto) || 16;
                // Si el valor es > 1, asumir que es porcentaje (ej: 16), si no es decimal (ej: 0.16)
                const impuestoPorcentaje = impuestoValue > 1 ? impuestoValue : impuestoValue * 100;
                
                tarifasUsuario = {
                    impuesto: impuestoPorcentaje,
                    envio: Number(data.data.envio) || 15.00,
                    pais: data.data.pais || 'México'
                };
                
                console.log('✅ Tarifas cargadas correctamente:', tarifasUsuario);
                
                // Actualizar etiqueta del impuesto en el resumen
                const taxLabel = document.querySelector('.summary-row:nth-child(3) span:first-child');
                if (taxLabel) {
                    taxLabel.textContent = `Impuestos (${tarifasUsuario.impuesto}%):`;
                }
            } else {
                console.warn('⚠️ Respuesta sin datos válidos:', data);
            }
            
        } catch (err) {
            console.error('❌ Error cargando tarifas:', err);
            console.error('Stack:', err.stack);
            // Mantener valores por defecto
        }
    }

    async function loadCartItems(usuarioId) {
        const url = `${primaryBase}/${usuarioId}`;
        const token = localStorage.getItem('token');
        
        if (!token) {
            showLoginMessage();
            return;
        }

        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            let resp = await fetch(url, { headers });
            
            // Si falla con la URL primaria, intentar con fallback
            if (!resp.ok && url !== `${fallbackBase}/${usuarioId}`) {
                resp = await fetch(`${fallbackBase}/${usuarioId}`, { headers });
            }
            
            // Manejar errores de autenticación
            if (resp.status === 401 || resp.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                showAlert('warning', 'Sesión Expirada', 'Por favor, inicia sesión nuevamente');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                return;
            }
            
            if (!resp.ok) {
                const errorText = await resp.text();
                console.error(`Error ${resp.status}: ${errorText}`);
                throw new Error(`HTTP ${resp.status} - ${errorText}`);
            }
            
            const data = await resp.json();
            
            if (!data.success) {
                showMessage('No se pudo cargar el carrito', 'error');
                return;
            }
            
            renderCartItems(data.data);
            
        } catch (err) {
            console.error('Error loading cart items:', err);
            showMessage('Error al cargar el carrito. Verifica tu conexión.', 'error');
        }
    }

    function renderCartItems(items) {
        const container = document.querySelector('.cart-items-container');
        if (!container) return;
        
        const header = container.querySelector('.cart-header-row');
        container.querySelectorAll('.cart-item').forEach(el => el.remove());

        if (!items || items.length === 0) {
            showMessage('El carrito está vacío');
            return;
        }

        let subtotal = 0;

        console.log('🖼️ Renderizando items del carrito:', items);

        items.forEach(item => {
            console.log('Item completo:', item);
            
            const precio = Number(item.precio) || 0;
            const oferta = Number(item.oferta) || 0;
            const precioUnitario = oferta > 0 ? precio * (1 - oferta / 100) : precio;
            const cantidad = Number(item.cantidad) || 1;
            const itemSubtotal = precioUnitario * cantidad;
            subtotal += itemSubtotal;

            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'cart-item';
            cartItemEl.dataset.carritoId = item.carrito_id;
            
            // Intentar con diferentes nombres de campo para la imagen
            const nombreImagen = item.nombre_imagen || item.imagen || item.image || item.foto || '';
            cartItemEl.dataset.nombreImagen = nombreImagen;
            cartItemEl.dataset.precio = precioUnitario.toFixed(2);
        
            console.log('📸 Campo imagen en item:', {
                nombre_imagen: item.nombre_imagen,
                imagen: item.imagen,
                image: item.image,
                foto: item.foto
            });
            
            // Construir la URL de la imagen - usar directamente localhost:3000
            const imagenUrl = nombreImagen 
                ? `http://localhost:3000/uploads/${nombreImagen}` 
                : 'http://localhost:3000/uploads/placeholder.png';
            
            console.log('🔗 URL final de imagen:', imagenUrl);
            
            cartItemEl.innerHTML = `
                <div class="cart-col product-col">
                    <img src="${imagenUrl}" 
                         alt="${item.titulo || 'Producto'}" 
                         class="cart-item-img" 
                         onerror="this.onerror=null; this.src='http://localhost:3000/uploads/placeholder.png'; console.error('Error cargando imagen:', '${imagenUrl}')">
                    <div class="item-info">
                        <h4>${item.titulo || 'Producto'}</h4>
                        <p>${item.artista || 'Artista desconocido'}</p>
                    </div>
                </div>
                <span class="cart-col price-col" data-price="${precioUnitario.toFixed(2)}">${precioUnitario.toFixed(2)}</span>
                <div class="cart-col quantity-col">
                    <div class="quantity-control">
                        <button class="quantity-btn decrement" data-carrito-id="${item.carrito_id}">-</button>
                        <input type="number" value="${cantidad}" min="1" class="item-quantity" data-carrito-id="${item.carrito_id}">
                        <button class="quantity-btn increment" data-carrito-id="${item.carrito_id}">+</button>
                    </div>
                </div>
                <span class="cart-col subtotal-col" data-subtotal="${itemSubtotal.toFixed(2)}">${itemSubtotal.toFixed(2)}</span>
                <div class="cart-col actions-col">
                    <button class="btn-remove" data-carrito-id="${item.carrito_id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;

            if (header && header.nextSibling) {
                container.insertBefore(cartItemEl, header.nextSibling);
            } else {
                container.appendChild(cartItemEl);
            }
        });

        attachCartListeners();
        updateSummary(subtotal);
        
        // Mostrar el resumen de compra
        const summary = document.querySelector('.cart-summary-card');
        if (summary) summary.style.display = 'block';
    }

    function attachCartListeners() {
        document.querySelectorAll('.quantity-btn.decrement').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.dataset.carritoId;
                const input = document.querySelector(`.item-quantity[data-carrito-id="${id}"]`);
                let qty = Number(input.value) || 1;
                if (qty <= 1) return;
                qty -= 1;
                input.value = qty;
                await updateItemQuantity(id, qty);
            });
        });

        document.querySelectorAll('.quantity-btn.increment').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.dataset.carritoId;
                const input = document.querySelector(`.item-quantity[data-carrito-id="${id}"]`);
                let qty = Number(input.value) || 1;
                qty += 1;
                input.value = qty;
                await updateItemQuantity(id, qty);
            });
        });

        document.querySelectorAll('.item-quantity').forEach(input => {
            input.addEventListener('change', async function() {
                let qty = Number(this.value);
                if (!qty || qty < 1) {
                    qty = 1;
                    this.value = 1;
                }
                const id = this.dataset.carritoId;
                await updateItemQuantity(id, qty);
            });
        });

        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.dataset.carritoId;
                const result = await showConfirm('¿Eliminar producto?', '¿Estás seguro de que deseas eliminar este producto del carrito?');
                if (result) {
                    await removeItem(id);
                }
            });
        });
    }

    async function updateItemQuantity(carritoId, cantidad) {
        const url = `${primaryBase}/${carritoId}`;
        const token = localStorage.getItem('token');
        
        if (!token) {
            showAlert('warning', 'Sesión Expirada', 'Por favor, inicia sesión nuevamente');
            return;
        }

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
            
            const cartRow = document.querySelector(`.cart-item[data-carrito-id="${carritoId}"]`);
            const nombre_imagen = cartRow ? cartRow.dataset.nombreImagen : undefined;
            
            let body = { cantidad };
            if (nombre_imagen) {
                body.nombre_imagen = nombre_imagen;
            }
            
            let resp = await fetch(url, {
                method: 'PUT',
                headers,
                body: JSON.stringify(body)
            });
            
            if (!resp.ok && url !== `${fallbackBase}/${carritoId}`) {
                resp = await fetch(`${fallbackBase}/${carritoId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(body)
                });
            }
            
            if (resp.status === 401 || resp.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                showAlert('warning', 'Sesión Expirada', 'Por favor, inicia sesión nuevamente');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                return;
            }
            
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }
            
            // Actualizar el subtotal del item
            if (cartRow) {
                const priceEl = cartRow.querySelector('.price-col');
                const price = Number(priceEl.dataset.price) || 0;
                const newSubtotal = price * cantidad;
                const subtotalEl = cartRow.querySelector('.subtotal-col');
                subtotalEl.textContent = `$${newSubtotal.toFixed(2)}`;
                subtotalEl.dataset.subtotal = newSubtotal.toFixed(2);
            }
            
            recalcTotals();
            
        } catch (err) {
            console.error('Error updating item quantity:', err);
            showAlert('error', 'Error', 'No se pudo actualizar la cantidad');
        }
    }

    async function removeItem(carritoId) {
        const url = `${primaryBase}/${carritoId}`;
        const token = localStorage.getItem('token');
        
        if (!token) {
            showAlert('warning', 'Sesión Expirada', 'Por favor, inicia sesión nuevamente');
            return;
        }

        try {
            const headers = {
                'Authorization': `Bearer ${token}`
            };
            
            let resp = await fetch(url, {
                method: 'DELETE',
                headers
            });
            
            if (!resp.ok && url !== `${fallbackBase}/${carritoId}`) {
                resp = await fetch(`${fallbackBase}/${carritoId}`, {
                    method: 'DELETE',
                    headers
                });
            }
            
            if (resp.status === 401 || resp.status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                showAlert('warning', 'Sesión Expirada', 'Por favor, inicia sesión nuevamente');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                return;
            }
            
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }
            
            // Eliminar la fila del carrito con animación
            const itemRow = document.querySelector(`.cart-item[data-carrito-id="${carritoId}"]`);
            if (itemRow) {
                itemRow.classList.add('removing');
                setTimeout(() => {
                    itemRow.remove();
                    
                    // Verificar si quedan items
                    const remainingItems = document.querySelectorAll('.cart-item');
                    if (remainingItems.length === 0) {
                        showMessage('El carrito está vacío');
                        // Limpiar cupón si se eliminan todos los productos
                        resetCupon();
                    } else {
                        recalcTotals();
                    }
                }, 300);
            }
            
            showAlert('success', 'Producto eliminado', 'El producto se ha eliminado del carrito');
            
        } catch (err) {
            console.error('Error removing cart item:', err);
            showAlert('error', 'Error', 'No se pudo eliminar el producto');
        }
    }

    function recalcTotals() {
        const subtotalEls = document.querySelectorAll('.subtotal-col');
        let sum = 0;
        subtotalEls.forEach(el => {
            sum += Number(el.dataset.subtotal) || 0;
        });
        updateSummary(sum);
    }

    function updateSummary(subtotal) {
        const elSubtotal = document.getElementById('summary-subtotal');
        const elDiscount = document.getElementById('summary-discount');
        const elTax = document.getElementById('summary-tax');
        const elShipping = document.getElementById('summary-shipping');
        const elTotal = document.getElementById('summary-total-amount');

        if (!elSubtotal) return;

        // Actualizar subtotal
        elSubtotal.textContent = `$${subtotal.toFixed(2)}`;

        // Calcular descuento del cupón (siempre es porcentaje según tu backend)
        let couponDiscount = 0;
        if (cuponActual.aplicado && cuponActual.descuento > 0) {
            // El descuento viene como porcentaje (ej: 10 para 10%)
            couponDiscount = subtotal * (cuponActual.descuento / 100);
        }
        
        // Subtotal después del descuento
        const subtotalConDescuento = Math.max(0, subtotal - couponDiscount);
        
        // IVA usando la tarifa del país del usuario
        const tax = subtotalConDescuento * (tarifasUsuario.impuesto / 100);
        
        // Envío usando la tarifa del país del usuario (gratis si el carrito está vacío)
        const shipping = subtotal > 0 ? tarifasUsuario.envio : 0.00;
        
        // Total final
        const total = subtotalConDescuento + tax + shipping;

        // Actualizar elementos en la UI
        if (elDiscount) {
            const discountRow = elDiscount.closest('.summary-row');
            if (couponDiscount > 0) {
                elDiscount.textContent = `-${couponDiscount.toFixed(2)}`;
                if (discountRow) {
                    discountRow.style.display = 'flex';
                    discountRow.classList.add('discount-active');
                }
            } else {
                elDiscount.textContent = '-$0.00';
                if (discountRow) {
                    discountRow.style.display = 'none';
                    discountRow.classList.remove('discount-active');
                }
            }
        }
        
        if (elTax) {
            elTax.textContent = `${tax.toFixed(2)}`;
        }
        
        if (elShipping) {
            elShipping.textContent = subtotal > 0 ? `${shipping.toFixed(2)}` : 'Gratis';
        }
        
        if (elTotal) {
            elTotal.textContent = `${total.toFixed(2)}`;
        }

        // Guardar en localStorage para usar en compra.html
        localStorage.setItem('cartSummary', JSON.stringify({
            subtotal: subtotal.toFixed(2),
            discount: couponDiscount.toFixed(2),
            tax: tax.toFixed(2),
            shipping: shipping.toFixed(2),
            total: total.toFixed(2),
            cupon: cuponActual.aplicado ? cuponActual.codigo : null,
            descuentoPorcentaje: cuponActual.aplicado ? cuponActual.descuento : 0,
            impuesto: tarifasUsuario.impuesto,
            pais: tarifasUsuario.pais
        }));
    }

    // Función global para aplicar cupón
    window.aplicarCupon = async function() {
        const cuponInput = document.getElementById('cuponInput');
        if (!cuponInput) return;
        
        const codigo = cuponInput.value.trim().toUpperCase();
        if (!codigo) {
            showAlert('warning', 'Cupón requerido', 'Por favor, ingresa un código de cupón');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showAlert('warning', 'Sesión requerida', 'Debes iniciar sesión para aplicar cupones');
            return;
        }

        // Verificar que haya productos en el carrito
        const items = document.querySelectorAll('.cart-item');
        if (items.length === 0) {
            showAlert('warning', 'Carrito vacío', 'Agrega productos antes de aplicar un cupón');
            return;
        }

        // Verificar si ya hay un cupón aplicado
        if (cuponActual.aplicado) {
            showAlert('info', 'Cupón ya aplicado', 'Ya tienes un cupón aplicado. Remuévelo para usar otro.');
            return;
        }

        try {
            // Deshabilitar el botón mientras se valida
            const btnAplicar = document.querySelector('.coupon-input-group button:not(.btn-remover-cupon)');
            if (btnAplicar) {
                btnAplicar.disabled = true;
                btnAplicar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando...';
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Intentar con la URL principal
            let resp = await fetch(`${cuponesBase}/validar`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ codigo })
            });

            // Si falla, intentar con fallback
            if (!resp.ok && cuponesBase !== fallbackCuponesBase) {
                resp = await fetch(`${fallbackCuponesBase}/validar`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ codigo })
                });
            }

            const data = await resp.json();

            // Restaurar botón
            if (btnAplicar) {
                btnAplicar.disabled = false;
                btnAplicar.textContent = 'Aplicar';
            }

            if (!resp.ok || data.message?.includes('❌')) {
                showAlert('error', 'Cupón inválido', data.message || 'El cupón ingresado no es válido o ha expirado');
                return;
            }

            // Cupón válido - guardar información
            cuponActual = {
                codigo: data.cupon.codigo,
                descuento: Number(data.cupon.descuento),
                id: data.cupon.id,
                aplicado: true
            };

            // Guardar también en localStorage para compra.html
            localStorage.setItem('cuponAplicado', JSON.stringify(cuponActual));

            // Actualizar la UI
            recalcTotals();
            
            // DESHABILITAR completamente el input y botón de aplicar
            cuponInput.value = codigo;
            cuponInput.disabled = true;
            cuponInput.classList.add('cupon-aplicado-input');
            
            if (btnAplicar) {
                btnAplicar.disabled = true;
                btnAplicar.innerHTML = '<i class="fas fa-check-circle"></i> Aplicado';
                btnAplicar.classList.add('cupon-aplicado');
            }

            // Agregar botón para remover cupón
            const cuponGroup = cuponInput.parentElement;
            let btnRemover = cuponGroup.querySelector('.btn-remover-cupon');
            if (!btnRemover) {
                btnRemover = document.createElement('button');
                btnRemover.type = 'button';
                btnRemover.className = 'btn-remover-cupon';
                btnRemover.innerHTML = '<i class="fas fa-times"></i>';
                btnRemover.title = 'Remover cupón';
                btnRemover.onclick = removerCupon;
                cuponGroup.appendChild(btnRemover);
            }

            // Agregar indicador visual de ahorro
            const couponSection = document.querySelector('.coupon-section');
            if (couponSection) {
                let savingsMsg = couponSection.querySelector('.savings-message');
                if (!savingsMsg) {
                    savingsMsg = document.createElement('div');
                    savingsMsg.className = 'savings-message';
                    couponSection.appendChild(savingsMsg);
                }
                savingsMsg.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>¡Cupón "${codigo}" aplicado! Descuento del ${cuponActual.descuento}%</span>
                `;
            }

            showAlert('success', '¡Cupón aplicado!', `Obtuviste ${cuponActual.descuento}% de descuento en tu compra`);

        } catch (err) {
            console.error('Error applying coupon:', err);
            showAlert('error', 'Error', 'No se pudo validar el cupón. Verifica tu conexión.');
            
            const btnAplicar = document.querySelector('.coupon-input-group button:not(.btn-remover-cupon)');
            if (btnAplicar) {
                btnAplicar.disabled = false;
                btnAplicar.textContent = 'Aplicar';
            }
        }
    };

    // Función para remover el cupón aplicado
    function removerCupon() {
        const confirmRemove = confirm('¿Estás seguro de que deseas remover el cupón aplicado?');
        if (!confirmRemove) return;

        resetCupon();
        recalcTotals();
        showAlert('info', 'Cupón removido', 'El cupón ha sido removido del carrito');
    }

    // Función auxiliar para resetear el cupón
    function resetCupon() {
        cuponActual = { codigo: null, descuento: 0, id: null, aplicado: false };
        
        const cuponInput = document.getElementById('cuponInput');
        if (cuponInput) {
            cuponInput.value = '';
            cuponInput.disabled = false;
            cuponInput.classList.remove('cupon-aplicado-input');
        }

        const btnAplicar = document.querySelector('.coupon-input-group button:not(.btn-remover-cupon)');
        if (btnAplicar) {
            btnAplicar.disabled = false;
            btnAplicar.textContent = 'Aplicar';
            btnAplicar.classList.remove('cupon-aplicado');
        }

        const btnRemover = document.querySelector('.btn-remover-cupon');
        if (btnRemover) {
            btnRemover.remove();
        }

        const savingsMsg = document.querySelector('.savings-message');
        if (savingsMsg) {
            savingsMsg.remove();
        }

        // Limpiar localStorage
        localStorage.removeItem('cuponAplicado');
    }

    // Funciones auxiliares para alertas
    function showAlert(icon, title, text) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: icon,
                title: title,
                text: text,
                confirmButtonColor: '#ff5252',
                timer: icon === 'success' ? 3000 : undefined,
                timerProgressBar: icon === 'success'
            });
        } else {
            alert(`${title}: ${text}`);
        }
    }

    function showConfirm(title, text) {
        if (typeof Swal !== 'undefined') {
            return Swal.fire({
                title: title,
                text: text,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ff5252',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => result.isConfirmed);
        } else {
            return Promise.resolve(confirm(`${title}\n${text}`));
        }
    }

})();