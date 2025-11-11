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