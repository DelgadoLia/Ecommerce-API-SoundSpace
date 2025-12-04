document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const forms = {
        'add': document.getElementById('add-product-form'),
        'modify': document.getElementById('modify-product-section')
    };

    // ============ FUNCIÓN PARA OBTENER HEADERS CON TOKEN ============
    function getAuthHeaders(includeContentType = true) {
        const token = localStorage.getItem('token');
        const headers = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        
        return headers;
    }

    // ============ VERIFICAR SI EL USUARIO ES ADMIN ============
    function checkAdminAccess() {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const token = localStorage.getItem('token');
        
        if (!usuario || !token || usuario.rol !== 'admin') {
            Swal.fire({
                title: 'Acceso denegado',
                text: 'Debes ser administrador para acceder a esta página',
                icon: 'error',
                confirmButtonText: 'Ir al inicio',
                showClass: {
                    popup: 'animate__animated animate__zoomIn'
                },
                hideClass: {
                    popup: 'animate__animated animate__zoomOut'
                }
            }).then(() => {
                window.location.href = 'index.html';
            });
            return false;
        }
        return true;
    }

    // Verificar acceso al cargar la página
    if (!checkAdminAccess()) {
        return;
    }

    // Manejo de pestañas (Alta / Modificar)
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            Object.values(forms).forEach(form => form.classList.remove('active'));
            Object.values(forms).forEach(form => form.classList.add('hidden'));

            const targetTab = e.target.dataset.tab;
            e.target.classList.add('active');
            
            const activeForm = forms[targetTab];
            if (activeForm) {
                activeForm.classList.add('active');
                activeForm.classList.remove('hidden');
            }
        });
    });

    document.querySelector('.tab-btn[data-tab="add"]').click();
    
    let cachedProducts = [];
    const apiOrigin = (location.protocol === 'file:') ? 'http://localhost:3000' : `${location.protocol}//${location.host}`;
    const API_URL = `${apiOrigin}/api/admin/inventario`;
    const FALLBACK_API_URL = 'http://localhost:3000/api/admin/inventario';
    const TOTALSALES_API_URL = `${apiOrigin}/api/admin/totalventas`;
    const FALLBACK_TOTALSALES_API_URL = 'http://localhost:3000/api/admin/totalventas';

    console.info('API origin:', apiOrigin, 'API_URL:', API_URL, 'FALLBACK_API_URL:', FALLBACK_API_URL);

    // ============ CARGAR PRODUCTOS (CON TOKEN) ============
    async function loadProducts() {
        const tbody = document.getElementById('inventory-body');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr class="loading-row"><td colspan="9">Cargando productos...</td></tr>';
        
        try {
            const headers = getAuthHeaders();
            
            let resp = await fetch(API_URL, { headers });
            
            if (!resp.ok) {
                console.warn(`API respondió con ${resp.status} desde ${API_URL}, intentando fallback ${FALLBACK_API_URL}`);
                resp = await fetch(FALLBACK_API_URL, { headers });
            }
            
            if (!resp.ok) {
                if (resp.status === 401 || resp.status === 403) {
                    Swal.fire({
                        title: 'Sesión expirada',
                        text: 'Por favor, inicia sesión nuevamente',
                        icon: 'warning',
                        confirmButtonText: 'Continuar',
                        showClass: {
                            popup: 'animate__animated animate__zoomIn'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__zoomOut'
                        }
                    }).then(() => {
                        localStorage.clear();
                        window.location.href = 'index.html';
                    });
                    return;
                }
                throw new Error(`HTTP ${resp.status}`);
            }
            
            const data = await resp.json();
            cachedProducts = Array.isArray(data) ? data : (data.data || []);
            
            renderProductos(cachedProducts);
            updateMetrics(cachedProducts);
            fetchTotalSales();
        } catch (err) {
            console.error('Error cargando productos:', err);
            tbody.innerHTML = '<tr><td colspan="9">Error cargando productos. Ver consola para detalles.</td></tr>';
        }
    }

    // ============ OBTENER VENTAS TOTALES (CON TOKEN) ============
    async function fetchTotalSales() {
        const totalSalesEl = document.getElementById("total-sales");
        if (!totalSalesEl) return;
        
        try {
            const headers = getAuthHeaders();
            
            let resp = await fetch(TOTALSALES_API_URL, { headers });
            if (!resp.ok) resp = await fetch(FALLBACK_TOTALSALES_API_URL, { headers });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            
            const data = await resp.json();
            if (data && data.success && data.total !== undefined) {
                totalSalesEl.textContent = `$${Number(data.total).toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
            } else {
                totalSalesEl.textContent = '$0.00';
            }
        } catch (err) {
            console.error('Error obteniendo ventas totales:', err);
            totalSalesEl.textContent = '$0.00';
        }
    }

    function renderProductos(productos) {
        const tbody = document.getElementById('inventory-body');
        if (!tbody) return;
        
        if (!productos || productos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9">No se encontraron productos.</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        productos.forEach(producto => {
            const tr = document.createElement('tr');
            tr.dataset.id = producto.id || producto.ID || '';

            const priceValue = Number(producto.precio || producto.Precio || 0);
            const priceText = isNaN(priceValue) ? producto.precio : `$${priceValue.toFixed(2)}`;
            const ventas = producto.ventas ?? producto.Ventas ?? 0;
            const stock = producto.disponibilidad ?? producto.Disponibilidad ?? 0;
            const oferta = producto.oferta ?? producto.Oferta ?? 0;
            const stockClass = getStockClass(Number(stock));

            tr.innerHTML = `
                <td>${producto.id ?? producto.ID ?? ''}</td>
                <td>${producto.titulo ?? producto.Titulo ?? ''}</td>
                <td>${producto.artista ?? producto.Artista ?? ''}</td>
                <td>${producto.genero ?? producto.Genero ?? ''}</td>
                <td>${priceText}</td>
                <td data-sales="${ventas}" class="sales-value">${ventas}</td>
                <td data-stock="${stock}" class="${stockClass}">${stock}</td>
                <td>${renderImageCell(producto.imagen || producto.Imagen || '')}</td>
                <td>${oferta > 0 ? oferta + '%' : '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderImageCell(imgName) {
        if (!imgName) return '';
        const src = `${apiOrigin}/uploads/${imgName}`;
        const fallbackSrc = `http://localhost:3000/uploads/${imgName}`;
        return `<img src="${src}" alt="${imgName}" style="max-width:48px; height:auto;" onerror="this.onerror=null; this.src='${fallbackSrc}'"> ${imgName}`;
    }

    function getStockClass(stock) {
        if (isNaN(stock)) return '';
        if (stock <= 5) return 'stock-critical';
        if (stock <= 50) return 'stock-low';
        return 'stock-high';
    }

    function updateMetrics(productos) {
        const totalInventoryEl = document.getElementById('total-inventory');
        const totalSalesEl = document.getElementById('total-sales');
        
        if (totalInventoryEl) {
            const totalStock = productos.reduce((acc, p) => acc + Number(p.disponibilidad ?? p.Disponibilidad ?? 0), 0);
            totalInventoryEl.textContent = totalStock;
        }
        
        if (totalSalesEl) {
            const salesAmount = productos.reduce((acc, p) => {
                const precio = Number(p.precio ?? p.Precio ?? 0) || 0;
                const ventas = Number(p.ventas || 0) || 0;
                return acc + (precio * ventas);
            }, 0);
            totalSalesEl.textContent = `$${salesAmount.toFixed(2)}`;
        }
    }

    // ============ BÚSQUEDA ============
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = document.getElementById('search-product').value.trim().toLowerCase();
            const searchResults = document.getElementById('search-results');
            const noResultsMessage = document.querySelector('.no-results-message');

            if (!query) {
                searchResults.classList.add('hidden');
                noResultsMessage.classList.remove('hidden');
                return;
            }

            let results = cachedProducts.filter(p => {
                const idStr = String(p.id ?? p.ID ?? '');
                return idStr === query;
            });
            
            if (results.length === 0) {
                results = cachedProducts.filter(p => {
                    const title = (p.titulo ?? p.Titulo ?? '').toString().toLowerCase();
                    return title.includes(query);
                });
            }

            if (results.length > 0) {
                const resultItem = searchResults.querySelector('.result-item');
                if (resultItem) {
                    const p = results[0];
                    resultItem.dataset.id = p.id ?? p.ID ?? '';
                    console.info('search matched:', p.id ?? p.ID, p.titulo ?? p.Titulo);
                    resultItem.querySelector('.product-title-display').textContent = `Modificar: ${p.titulo || p.Titulo || ''}`;
                    resultItem.querySelector('.product-metadata').innerHTML = `ID: ${p.id || p.ID || ''} | Ventas Acumuladas: <span class="sales-value-display">${p.ventas ?? 0}</span>`;
                    resultItem.querySelector('#m-title').value = p.titulo || '';
                    resultItem.querySelector('#m-artist').value = p.artista || '';
                    resultItem.querySelector('#m-description').value = p.descripcion || '';
                    resultItem.querySelector('#m-price').value = p.precio || '';
                    resultItem.querySelector('#m-stock').value = p.disponibilidad || '';
                    resultItem.querySelector('#m-image').value = p.imagen || '';
                    
                    const genreEl = resultItem.querySelector('#m-genre');
                    if (genreEl) genreEl.value = p.genero || '';
                    
                    const offerEl = resultItem.querySelector('#m-offer');
                    if (offerEl) offerEl.value = p.oferta || '';
                }
                searchResults.classList.remove('hidden');
                noResultsMessage.classList.add('hidden');
            } else {
                searchResults.classList.add('hidden');
                noResultsMessage.classList.remove('hidden');
            }
        });
    }

    loadProducts();

    // ============ AÑADIR PRODUCTO (CON TOKEN) ============
    const addBtn = document.querySelector('.btn-add-product');
    if (addBtn) {
        addBtn.addEventListener('click', async (e) => {
            console.info('btn-add-product clicked');
            e.preventDefault();

            const form = document.getElementById('add-product-form');
            if (!form) {
                console.error('Formulario de alta no encontrado (id: add-product-form)');
                return;
            }

            const formData = new FormData();
            const imageFileEl = form.querySelector('#p-image-file');
            const imageFile = imageFileEl ? imageFileEl.files[0] : null;

            const titulo = form.querySelector('#p-title') ? form.querySelector('#p-title').value.trim() : '';
            const artista = form.querySelector('#p-artist') ? form.querySelector('#p-artist').value.trim() : '';
            const descripcion = form.querySelector('#p-description') ? form.querySelector('#p-description').value.trim() : '';
            const precio = form.querySelector('#p-price') ? form.querySelector('#p-price').value.trim() : '';
            const disponibilidad = form.querySelector('#p-stock') ? form.querySelector('#p-stock').value.trim() : '';
            const genero = form.querySelector('#p-genre') ? form.querySelector('#p-genre').value.trim() : '';
            const ventas = 0;
            const imagen = form.querySelector('#p-image') ? form.querySelector('#p-image').value.trim() : '';
            const oferta = form.querySelector('#p-offer') ? form.querySelector('#p-offer').value.trim() : '';

            const hasImage = imageFile || imagen;

            if (!titulo || !artista || !descripcion || !precio || !disponibilidad || !genero || !hasImage) {
                Swal.fire({
                    title: 'Datos incompletos',
                    text: 'Por favor, completa todos los campos antes de añadir el producto',
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

            formData.append('title', titulo);
            formData.append('titulo', titulo);
            formData.append('artista', artista);
            formData.append('descripcion', descripcion);
            formData.append('precio', precio);
            formData.append('disponibilidad', disponibilidad);
            formData.append('genero', genero);
            formData.append('oferta', oferta);
            formData.append('ventas', 0);

            formData.append('imageFile', imageFile);
            if (imagen) formData.append('imagen', imagen);

            const fallbackAdminUrl = `http://localhost:3000/api/admin/inventario`;
            addProductFormDataFetch(`${apiOrigin}/api/admin/inventario`, fallbackAdminUrl, formData);
        });
    }

    const addForm = document.getElementById('add-product-form');
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const addBtnEl = document.querySelector('.btn-add-product');
            if (addBtnEl) addBtnEl.click();
        });
    }

    // ============ ACTUALIZAR PRODUCTO (CON TOKEN) ============
    const updateBtn = document.querySelector('.btn-update-product');
    if (updateBtn) {
        updateBtn.addEventListener('click', async () => {
            const resultItem = document.querySelector('#search-results .result-item');
            const id = resultItem?.dataset.id;
            
            if (!id) {
                Swal.fire({
                    title: 'No se encontró el ID del producto para modificar',
                    text: 'Realiza una búsqueda primero',
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
            
            const form = resultItem.querySelector('.update-form');
            if (!form) {
                Swal.fire({
                    title: 'Formulario de modificación no encontrado',
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

            const tituloVal = (form.querySelector('#m-title')?.value ?? '').trim();
            const artistaVal = (form.querySelector('#m-artist')?.value ?? '').trim();
            const descripcionVal = (form.querySelector('#m-description')?.value ?? '').trim();
            const precioVal = (form.querySelector('#m-price')?.value ?? '').trim();
            const disponibilidadVal = (form.querySelector('#m-stock')?.value ?? '').trim();
            const generoVal = (form.querySelector('#m-genre')?.value ?? '').trim();
            const imagenVal = (form.querySelector('#m-image')?.value ?? '').trim();
            const ofertaVal = (form.querySelector('#m-offer')?.value ?? '').trim();
            const ventasEl = form.querySelector('#m-sales') || form.querySelector('.sales-value-display');
            const ventas = ventasEl ? Number(ventasEl.value ?? ventasEl.textContent ?? 0) : 0;

            if (!tituloVal && !artistaVal && !descripcionVal && !precioVal && !disponibilidadVal && !generoVal && !imagenVal && !ofertaVal) {
                Swal.fire({
                    title: 'Modificación vacía',
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

            const payload = {
                titulo: tituloVal === '' ? undefined : tituloVal,
                artista: artistaVal === '' ? undefined : artistaVal,
                descripcion: descripcionVal === '' ? undefined : descripcionVal,
                precio: precioVal === '' ? undefined : Number(precioVal),
                disponibilidad: disponibilidadVal === '' ? undefined : Number(disponibilidadVal),
                genero: generoVal === '' ? undefined : generoVal,
                ventas: Number(ventas) || undefined,
                imagen: imagenVal === '' ? undefined : imagenVal,
                oferta: ofertaVal === '' ? undefined : Number(ofertaVal)
            };

            const primary = `${apiOrigin}/api/admin/inventario/${id}`;
            const fallback = `http://localhost:3000/api/admin/inventario/${id}`;
            
            try {
                const imageFileEl = form.querySelector('#m-image-file');
                const imageFile = imageFileEl ? imageFileEl.files[0] : null;
                const token = localStorage.getItem('token');
                let resp;

                if (imageFile) {
                    console.info('Actualizando producto con imagen (FormData)', id, payload);
                    const formData = new FormData();
                    Object.keys(payload).forEach(k => {
                        const v = payload[k];
                        if (typeof v !== 'undefined') formData.append(k, v);
                    });
                    formData.append('imageFile', imageFile);
                    
                    resp = await fetch(primary, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                    });
                    
                    if (!resp.ok) {
                        console.warn(`PUT (FormData) respondió ${resp.status} en primary, intentando fallback`);
                        resp = await fetch(fallback, {
                            method: 'PUT',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: formData
                        });
                    }
                } else {
                    console.info('Actualizando producto (JSON)', id, payload);
                    const headers = getAuthHeaders();
                    resp = await fetch(primary, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify(payload)
                    });
                    
                    if (!resp.ok) {
                        console.warn(`PUT respondió ${resp.status} en primary, intentando fallback`);
                        resp = await fetch(fallback, {
                            method: 'PUT',
                            headers,
                            body: JSON.stringify(payload)
                        });
                    }
                }

                if (!resp.ok) {
                    const text = await resp.text();
                    throw new Error(`HTTP ${resp.status} - ${text}`);
                }
                
                const data = await resp.json();
                if (data && data.success) {
                    Swal.fire({
                        title: 'Producto modificado',
                        text: 'Se realizo la accion exitosamente',
                        icon: 'success',
                        confirmButtonText: 'Continuar',
                        showClass: {
                            popup: 'animate__animated animate__zoomIn'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__zoomOut'
                        }
                    });
                    loadProducts();
                    document.getElementById('search-results').classList.add('hidden');
                } else {
                    Swal.fire({
                        title: 'No se pudo modificar el producto',
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
                }
            } catch (err) {
                console.error('Error modificando producto:', err);
                Swal.fire({
                    title: 'No se pudo modificar el producto',
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
            }
        });
    }

    // ============ ELIMINAR PRODUCTO (CON TOKEN) ============
    const deleteBtn = document.querySelector('.btn-delete-product');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            const confirmResult = await Swal.fire({
                title: '¿Estás seguro?',
                text: '¿Deseas dar de baja este producto?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                showClass: {
                    popup: 'animate__animated animate__zoomIn'
                },
                hideClass: {
                    popup: 'animate__animated animate__zoomOut'
                }
            });
            
            if (!confirmResult.isConfirmed) return;
            
            const resultItem = document.querySelector('#search-results .result-item');
            const id = resultItem?.dataset.id;
            
            if (!id) {
                Swal.fire({
                    title: 'No se encontró el ID del producto para eliminar',
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
                return;
            }

            const primary = `${apiOrigin}/api/admin/inventario/${id}`;
            const fallback = `http://localhost:3000/api/admin/inventario/${id}`;
            const headers = getAuthHeaders();
            
            try {
                let resp = await fetch(primary, { method: 'DELETE', headers });
                if (!resp.ok) {
                    console.warn(`DELETE respondió ${resp.status} en primary, intentando fallback`);
                    resp = await fetch(fallback, { method: 'DELETE', headers });
                }
                if (!resp.ok) {
                    const text = await resp.text();
                    throw new Error(`HTTP ${resp.status} - ${text}`);
                }
                
                const data = await resp.json();
                if (data && data.success) {
                    Swal.fire({
                        title: 'Producto eliminado',
                        text: 'Se realizo la accion correctamente',
                        icon: 'success',
                        confirmButtonText: 'Continuar',
                        showClass: {
                            popup: 'animate__animated animate__zoomIn'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__zoomOut'
                        }
                    });
                    document.getElementById('search-results').classList.add('hidden');
                    loadProducts();
                } else {
                    Swal.fire({
                        title: 'No se pudo eliminar el producto',
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
                }
            } catch (err) {
                console.error('Error eliminando producto:', err);
                Swal.fire({
                    title: 'No se pudo eliminar el producto',
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
            }
        });
    }

    // ============ FUNCIÓN AUXILIAR PARA AÑADIR CON FORMDATA (CON TOKEN) ============
    async function addProductFormDataFetch(primary, fallback, formData) {
        try {
            console.info('Intentando añadir producto (FormData) en:', primary);
            const token = localStorage.getItem('token');
            
            let resp = await fetch(primary, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!resp.ok) {
                console.warn(`Respuesta ${resp.status} desde ${primary}, intentando fallback ${fallback}`);
                resp = await fetch(fallback, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            }

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`HTTP ${resp.status} - ${text}`);
            }

            let data;
            try {
                data = await resp.json();
            } catch (parseErr) {
                const rawText = await resp.text();
                throw new Error(`La respuesta no es JSON válido: ${parseErr.message}. Contenido: ${rawText}`);
            }

            if (data && data.success) {
                Swal.fire({
                    title: 'Producto añadido',
                    text: 'Se realizo la accion exitosamente',
                    icon: 'success',
                    confirmButtonText: 'Continuar',
                    showClass: {
                        popup: 'animate__animated animate__zoomIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__zoomOut'
                    }
                });
                loadProducts();
                document.getElementById('add-product-form').reset();
            } else {
                alert('Error al añadir el producto: ' + (data.message || 'Respuesta inesperada.'));
            }
        } catch (err) {
            console.error('Error al añadir producto:', err);
            alert('Error al añadir el producto. Ver consola para detalles.');
        }
    }
});