// product-details.js

document.addEventListener('DOMContentLoaded', async function () {
    console.log("Inicializando script de detalles de producto...");

    const token = localStorage.getItem("token");
    const apiUrl = "https://mercadoplus.somee.com/api";

    // Obtener el ID del producto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');

    if (!productId) {
        console.error("No se proporcionó un ID de producto en la URL.");
        alert("Producto no encontrado.");
        return;
    }

    try {
        // Obtener los detalles del producto desde la API
        const productResponse = await fetch(`${apiUrl}/publications/${productId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (productResponse.ok) {
            const productData = await productResponse.json();

            // Mostrar los detalles del producto
            document.getElementById('productTitle').textContent = productData.title || 'Producto sin título';
            document.getElementById('productPrice').textContent = productData.price ? `$${productData.price}` : 'Precio no disponible';
            document.getElementById('productDescription').textContent = productData.description || 'Sin descripción';

            // Guardar detalles del producto en localStorage
            localStorage.setItem('productId', productId);
            localStorage.setItem('productName', productData.title || 'Producto sin título');
            localStorage.setItem('productPrice', productData.price || 'Precio no disponible');

            // Configurar y guardar la imagen del producto
            const productImageElement = document.querySelector('.product-image img');
            if (productData.photos && productData.photos.length > 0 && productData.photos[0].imageData) {
                const productImage = `data:image/jpeg;base64,${productData.photos[0].imageData}`;
                productImageElement.src = productImage;
                localStorage.setItem('productImage', productImage);
            } else {
                productImageElement.src = 'resources/default-image.jpg';
                localStorage.setItem('productImage', 'resources/default-image.jpg');
            }

            // Mostrar características del producto si existen
            const productFeatures = productData.features; // Asegúrate de que la API devuelve un array de características
            const productFeaturesElement = document.getElementById('productFeatures');
            if (productFeatures && Array.isArray(productFeatures)) {
                productFeatures.forEach(feature => {
                    const li = document.createElement('li');
                    li.textContent = feature;
                    productFeaturesElement.appendChild(li);
                });
            } else {
                productFeaturesElement.innerHTML = '<li>No hay características disponibles.</li>';
            }

            // Manejar el botón "Comprar ahora"
            const buyNowButton = document.querySelector('.buy-now-button');
            buyNowButton.addEventListener('click', function () {
                window.location.href = "checkout.html";
            });

            // Obtener y mostrar información del vendedor
            if (productData.sellerId) {
                fetchSellerInfo(productData.sellerId);
            } else {
                console.warn("No se encontró la información del vendedor en los datos del producto.");
                document.getElementById('sellerName').textContent = 'Vendedor desconocido';
                document.getElementById('sellerRating').textContent = 'Calificación: No disponible';
                document.getElementById('sellerDescription').textContent = 'No se encontró descripción del vendedor.';
            }

            // Obtener y mostrar reseñas
            fetchReviews(productId);

            // Obtener y mostrar preguntas
            fetchQuestions(productId);

        } else {
            console.error("Error al obtener los detalles del producto de la API.");
            document.getElementById('productTitle').textContent = 'Producto no disponible';
            document.getElementById('productPrice').textContent = 'Precio no disponible';
            document.getElementById('productDescription').textContent = 'Descripción no disponible.';
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }

    // Función para obtener y mostrar información del vendedor
    async function fetchSellerInfo(sellerId) {
        try {
            const response = await fetch(`${apiUrl}/sellers/${sellerId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const sellerData = await response.json();

                // Actualizar la sección del vendedor en el HTML
                document.getElementById('sellerName').textContent = sellerData.name || 'Nombre del Vendedor';
                document.getElementById('sellerRating').textContent = sellerData.rating ? `Calificación: ${'★'.repeat(Math.round(sellerData.rating))}${'☆'.repeat(5 - Math.round(sellerData.rating))}` : 'Calificación: No disponible';
                document.getElementById('sellerDescription').textContent = sellerData.description || 'Descripción del vendedor no disponible.';

                // Configurar y guardar la imagen del vendedor si existe
                const sellerAvatarElement = document.getElementById('sellerAvatar');
                if (sellerData.avatar && sellerData.avatar.imageData) {
                    const sellerAvatar = `data:image/jpeg;base64,${sellerData.avatar.imageData}`;
                    sellerAvatarElement.src = sellerAvatar;
                } else {
                    sellerAvatarElement.src = 'resources/default-avatar.png';
                }

            } else {
                console.error("Error al obtener la información del vendedor:", response.statusText);
                document.getElementById('sellerName').textContent = 'Vendedor desconocido';
                document.getElementById('sellerRating').textContent = 'Calificación: No disponible';
                document.getElementById('sellerDescription').textContent = 'Descripción del vendedor no disponible.';
            }
        } catch (error) {
            console.error("Error de conexión al obtener información del vendedor:", error);
            document.getElementById('sellerName').textContent = 'Vendedor desconocido';
            document.getElementById('sellerRating').textContent = 'Calificación: No disponible';
            document.getElementById('sellerDescription').textContent = 'Descripción del vendedor no disponible.';
        }
    }

    // Función para obtener y mostrar reseñas
    async function fetchReviews(productId) {
        try {
            const response = await fetch(`${apiUrl}/publications/${productId}/reviews`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const reviewsContainer = document.getElementById('reviews-container');

            if (response.ok) {
                const reviews = await response.json();

                if (reviews.length === 0) {
                    reviewsContainer.innerHTML = '<p>No hay reseñas para este producto.</p>';
                    return;
                }

                reviewsContainer.innerHTML = ''; // Limpiar contenido previo

                reviews.forEach(review => {
                    const reviewDiv = document.createElement('div');
                    reviewDiv.classList.add('review');

                    reviewDiv.innerHTML = `
                        <div class="review-header">
                            <img src="${review.reviewerAvatar ? `data:image/jpeg;base64,${review.reviewerAvatar}` : 'resources/default-avatar.png'}" alt="Avatar de ${review.reviewerName}">
                            <div>
                                <span class="reviewer-name">${review.reviewerName || 'Usuario Anónimo'}</span>
                                <span class="reviewer-rating">${'★'.repeat(Math.round(review.rating))}${'☆'.repeat(5 - Math.round(review.rating))}</span>
                            </div>
                        </div>
                        <div class="review-body">
                            <p>${review.comment || 'Sin comentario.'}</p>
                        </div>
                    `;

                    reviewsContainer.appendChild(reviewDiv);
                });

            } else {
                console.error("Error al obtener reseñas:", response.statusText);
                reviewsContainer.innerHTML = '<p class="error">No se pudieron cargar las reseñas.</p>';
            }
        } catch (error) {
            console.error("Error de conexión al obtener reseñas:", error);
            document.getElementById('reviews-container').innerHTML = '<p class="error">Error al cargar las reseñas.</p>';
        }
    }

    // Función para obtener y mostrar preguntas
    async function fetchQuestions(productId) {
        try {
            const response = await fetch(`${apiUrl}/publications/${productId}/questions`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const questionsContainer = document.getElementById('questions-container');

            if (response.ok) {
                const questions = await response.json();

                if (questions.length === 0) {
                    questionsContainer.innerHTML = '<p>No hay preguntas para este producto.</p>';
                    return;
                }

                questionsContainer.innerHTML = ''; // Limpiar contenido previo

                questions.forEach(question => {
                    const questionDiv = document.createElement('div');
                    questionDiv.classList.add('question');

                    questionDiv.innerHTML = `
                        <div class="question-header">
                            <span class="questioner-name">${question.questionerName || 'Usuario Anónimo'}</span>
                        </div>
                        <div class="question-body">
                            <p>${question.questionText || 'Sin pregunta.'}</p>
                        </div>
                    `;

                    // Si hay respuestas, mostrarlas
                    if (question.answers && question.answers.length > 0) {
                        question.answers.forEach(answer => {
                            const answerDiv = document.createElement('div');
                            answerDiv.classList.add('answer');
                            answerDiv.innerHTML = `
                                <p><strong>Respuesta:</strong> ${answer.answerText || 'Sin respuesta.'}</p>
                            `;
                            questionDiv.appendChild(answerDiv);
                        });
                    }

                    questionsContainer.appendChild(questionDiv);
                });

            } else {
                console.error("Error al obtener preguntas:", response.statusText);
                questionsContainer.innerHTML = '<p class="error">No se pudieron cargar las preguntas.</p>';
            }
        } catch (error) {
            console.error("Error de conexión al obtener preguntas:", error);
            document.getElementById('questions-container').innerHTML = '<p class="error">Error al cargar las preguntas.</p>';
        }
    }

    // Función para manejar el envío de una nueva pregunta
    async function handleAskQuestion(event) {
        event.preventDefault(); // Evitar que el formulario se envíe de forma predeterminada

        const questionText = document.getElementById('questionText').value.trim();
        const questionError = document.getElementById('questionError');

        // Validar que la pregunta no esté vacía
        if (!questionText) {
            questionError.textContent = "La pregunta no puede estar vacía.";
            return;
        }

        // Limpiar mensaje de error
        questionError.textContent = "";

        try {
            const response = await fetch(`${apiUrl}/publications/${productId}/questions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    questionText: questionText
                })
            });

            if (response.ok) {
                // Mostrar mensaje de confirmación
                showConfirmation('Tu pregunta ha sido enviada exitosamente.');

                // Limpiar el formulario
                document.getElementById('askQuestionForm').reset();

                // Recargar las preguntas para incluir la nueva
                fetchQuestions(productId);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "No se pudo enviar la pregunta.");
            }
        } catch (error) {
            console.error("Error al enviar la pregunta:", error);
            questionError.textContent = "Error al enviar la pregunta. Por favor, intenta nuevamente.";
        }
    }

    // Función para mostrar un mensaje de confirmación en un modal
    function showConfirmation(message) {
        const confirmationModal = document.getElementById('confirmationModal');
        const confirmationMessage = document.getElementById('confirmationMessage');
        confirmationMessage.textContent = message;
        confirmationModal.style.display = 'block';
    }

    // Función para cerrar el modal de confirmación
    function closeConfirmationModal() {
        const confirmationModal = document.getElementById('confirmationModal');
        confirmationModal.style.display = 'none';
    }

    // Manejar el clic en el botón de cerrar del modal
    const closeButton = document.querySelector('.close-button');
    closeButton.addEventListener('click', closeConfirmationModal);

    // Manejar clic fuera del contenido del modal para cerrarlo
    window.addEventListener('click', function(event) {
        const confirmationModal = document.getElementById('confirmationModal');
        if (event.target === confirmationModal) {
            closeConfirmationModal();
        }
    });

    // Añadir evento al formulario para manejar el envío de preguntas
    const askQuestionForm = document.getElementById('askQuestionForm');
    askQuestionForm.addEventListener('submit', handleAskQuestion);
});
