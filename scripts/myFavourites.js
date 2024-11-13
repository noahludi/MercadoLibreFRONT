// myFavourites.js

document.addEventListener('DOMContentLoaded', () => {
    const favouritesContainer = document.getElementById('favourites-container');
    const confirmationModal = document.getElementById('confirmationModal');
    const closeButton = document.querySelector('.close-button');
    const confirmationMessage = document.getElementById('confirmationMessage');

    // Función para obtener el token JWT desde localStorage
    function getToken() {
        return localStorage.getItem('token'); // Asegúrate de almacenar el token con la clave 'token'
    }

    // Función para obtener los artículos favoritos
    async function fetchFavourites() {
        const token = getToken();
        if (!token) {
            favouritesContainer.innerHTML = '<p class="error">No se encontró el token de autenticación. Por favor, inicia sesión.</p>';
            return;
        }

        try {
            const response = await fetch('https://mercadoplus.somee.com/api/wished-articles', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const favourites = await response.json();
                displayFavourites(favourites);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al obtener los favoritos.');
            }
        } catch (error) {
            favouritesContainer.innerHTML = `<p class="error">${error.message}</p>`;
            console.error('Error:', error);
        }
    }

    // Función para mostrar los favoritos en la página
    function displayFavourites(favourites) {
        if (!Array.isArray(favourites) || favourites.length === 0) {
            favouritesContainer.innerHTML = '<p>No tienes artículos favoritos.</p>';
            return;
        }

        favouritesContainer.innerHTML = ''; // Limpiar contenido previo

        favourites.forEach(favourite => {
            const card = document.createElement('div');
            card.classList.add('favourite-card');

            // Obtener la imagen del producto
            const imageSrc = favourite.photos && favourite.photos.length > 0 
                ? `data:image/jpeg;base64,${favourite.photos[0].imageData}` 
                : 'resources/default-image.jpg';

            card.innerHTML = `
                <img src="${imageSrc}" alt="${favourite.title}">
                <div class="card-content">
                    <h3>${favourite.title}</h3>
                    <p>$${favourite.price.toFixed(2)}</p>
                </div>
                <div class="card-actions">
                    <button class="remove-favourite" data-id="${favourite.id}">Quitar</button>
                    <button class="add-to-cart" data-id="${favourite.id}">Agregar al Carrito</button>
                    <button class="buy-now" data-id="${favourite.id}">Comprar Ahora</button>
                </div>
            `;

            // Añadir evento al hacer clic en la imagen o título para ir a detalles del producto
            card.querySelector('.card-content h3').addEventListener('click', () => {
                navigateToProductDetails(favourite);
            });

            card.querySelector('img').addEventListener('click', () => {
                navigateToProductDetails(favourite);
            });

            // Añadir eventos a los botones
            card.querySelector('.remove-favourite').addEventListener('click', () => {
                removeFavourite(favourite.id);
            });

            card.querySelector('.add-to-cart').addEventListener('click', () => {
                addToCart(favourite);
            });

            card.querySelector('.buy-now').addEventListener('click', () => {
                buyNow(favourite);
            });

            favouritesContainer.appendChild(card);
        });
    }

    // Función para navegar a detalles del producto
    function navigateToProductDetails(product) {
        // Guardar los detalles del producto en localStorage
        localStorage.setItem('productId', product.id);
        localStorage.setItem('productName', product.title);
        localStorage.setItem('productPrice', product.price);
        const imageSrc = product.photos && product.photos.length > 0 
            ? `data:image/jpeg;base64,${product.photos[0].imageData}`
            : 'resources/default-image.jpg';
        localStorage.setItem('productImage', imageSrc);

        // Redirigir a la página de detalles del producto con query parameter
        window.location.href = `product-details.html?productId=${product.id}`;
    }

    // Función para quitar un artículo de favoritos
    async function removeFavourite(id) {
        const token = getToken();
        if (!token) {
            alert('No se encontró el token de autenticación. Por favor, inicia sesión.');
            return;
        }

        if (!confirm('¿Estás seguro de que deseas quitar este artículo de tus favoritos?')) return;

        try {
            const response = await fetch(`https://mercadoplus.somee.com/api/wished-articles/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showConfirmation('Artículo eliminado de favoritos.');
                fetchFavourites(); // Refrescar la lista de favoritos
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el favorito.');
            }
        } catch (error) {
            alert(error.message);
            console.error('Error:', error);
        }
    }

    // Función para agregar un artículo al carrito
    async function addToCart(product) {
        const token = getToken();
        if (!token) {
            alert('No se encontró el token de autenticación. Por favor, inicia sesión.');
            return;
        }

        try {
            const response = await fetch('https://mercadoplus.somee.com/api/ShoppingCart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    publicationId: product.id,
                    quantity: 1
                })
            });

            if (response.ok) {
                showConfirmation('Artículo agregado al carrito.');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al agregar al carrito.');
            }
        } catch (error) {
            alert(error.message);
            console.error('Error:', error);
        }
    }

    // Función para comprar ahora
    function buyNow(product) {
        // Guardar los detalles del producto en localStorage
        localStorage.setItem('productId', product.id);
        localStorage.setItem('productName', product.title);
        localStorage.setItem('productPrice', product.price);
        const imageSrc = product.photos && product.photos.length > 0 
            ? `data:image/jpeg;base64,${product.photos[0].imageData}`
            : 'resources/default-image.jpg';
        localStorage.setItem('productImage', imageSrc);

        // Redirigir a la página de checkout
        window.location.href = 'checkout.html';
    }

    // Función para mostrar un mensaje de confirmación en un modal
    function showConfirmation(message) {
        confirmationMessage.textContent = message;
        confirmationModal.style.display = 'block';
    }

    // Función para cerrar el modal de confirmación
    function closeConfirmationModal() {
        confirmationModal.style.display = 'none';
    }

    // Manejar el clic en el botón de cerrar del modal
    closeButton.addEventListener('click', closeConfirmationModal);

    // Manejar clic fuera del contenido del modal para cerrarlo
    window.addEventListener('click', function(event) {
        if (event.target === confirmationModal) {
            closeConfirmationModal();
        }
    });

    // Llamar a la función para cargar los favoritos
    fetchFavourites();
});
