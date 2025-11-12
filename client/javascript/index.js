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

    //Permitir búsqueda con Enter
    document.getElementById('faq-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarFAQ();
        }
    });
});

// Funcionalidad para el modal de productos
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del modal
    const modal = document.getElementById("modalProducto");
    const closeModal = document.querySelector(".close");
    const cantidadValue = document.getElementById("cantidadValue");
    const decreaseBtn = document.getElementById("decreaseQty");
    const increaseBtn = document.getElementById("increaseQty");
    const addToCartBtn = document.querySelector(".btn-agregar-carrito");

    // Variables para controlar la cantidad
    let cantidad = 1;

    // Abrir modal con datos del producto
    document.querySelectorAll(".btn-ver").forEach(btn => {
        btn.addEventListener("click", () => {
            // Resetear cantidad a 1 cada vez que se abre un producto
            cantidad = 1;
            cantidadValue.textContent = cantidad;
            
            // Cargar datos del producto
            document.getElementById("modalImagen").src = btn.dataset.imagen;
            document.getElementById("modalNombre").textContent = btn.dataset.nombre;
            document.getElementById("modalDescripcion").textContent = btn.dataset.descripcion;
            document.getElementById("modalPrecio").textContent = btn.dataset.precio;
            document.getElementById("modalDisponibilidad").textContent = btn.dataset.disponibilidad;
            document.getElementById("modalCategoria").textContent = btn.dataset.categoria;
            
            // Mostrar modal
            modal.style.display = "block";
            document.body.style.overflow = "hidden"; // Prevenir scroll
        });
    });

    // Controladores de cantidad
    decreaseBtn.addEventListener("click", () => {
        if (cantidad > 1) {
            cantidad--;
            cantidadValue.textContent = cantidad;
        }
    });

    increaseBtn.addEventListener("click", () => {
        cantidad++;
        cantidadValue.textContent = cantidad;
    });

    // Añadir al carrito
    addToCartBtn.addEventListener("click", function() {
        const producto = {
            nombre: document.getElementById("modalNombre").textContent,
            precio: document.getElementById("modalPrecio").textContent,
            cantidad: cantidad,
            imagen: document.getElementById("modalImagen").src
        };
        
        // Aquí puedes agregar la lógica para añadir al carrito
        console.log("Producto añadido al carrito:", producto);
        
        // Mostrar mensaje de confirmación
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i> Añadido al Carrito';
        this.style.background = '#4CAF50';
        
        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.background = '#ff5252';
        }, 2000);
        
        // Cerrar modal después de añadir (opcional)
        // setTimeout(() => modal.style.display = "none", 2000);
    });

    // Cerrar modal
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
        document.body.style.overflow = "auto"; // Restaurar scroll
    });
    
    window.addEventListener("click", e => { 
        if (e.target === modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto"; // Restaurar scroll
        }
    });

    // Cerrar modal con tecla ESC
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && modal.style.display === "block") {
            modal.style.display = "none";
            document.body.style.overflow = "auto"; // Restaurar scroll
        }
    });
});

// Función para copiar cupón (ya existente)
function copiarCupon() {
    const cupon = "ROCK25";
    navigator.clipboard.writeText(cupon).then(() => {
        alert("Cupón copiado: " + cupon);
    }).catch(err => {
        console.error('Error al copiar: ', err);
    });
}

//Estilo para resaltar búsqueda
const style = document.createElement('style');
style.textContent = `
    .highlight {
        background-color: #ff5252;
        color: white;
        padding: 2px 4px;
        border-radius: 3px;
    }
`;
document.head.appendChild(style);

