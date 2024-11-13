// myFavourites.js

document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = "https://mercadoplus.somee.com/api";
    const favouritesContainer = document.getElementById('favourites-container');
    const confirmationModal = document.getElementById('confirmationModal');
    const closeButton = document.querySelector('.close-button');
    const confirmationMessage = document.getElementById('confirmationMessage');

    // Función para obtener el token JWT desde localStorage
    function getToken() {
        return localStorage.getItem('token');
    }

    // Función para obtener los artículos favoritos
    async function fetchFavourites() {
        const token = getToken();
        if (!token) {
            favouritesContainer.innerHTML = '<p class="error">No se encontró el token de autenticación. Por favor, inicia sesión.</p>';
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/wished-articles`, {
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

    // Función para obtener los detalles de una publicación por ID
    async function fetchPublicationDetails(publicationId) {
        const token = getToken();
        if (!token) {
            console.error("Token de autenticación no encontrado.");
            return null;
        }

        try {
            const response = await fetch(`${apiUrl}/publications/${publicationId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                return await response.json();
            } else {
                const errorData = await response.json();
                console.error(`Error al obtener detalles de la publicación ${publicationId}:`, errorData.message || response.statusText);
                return null;
            }
        } catch (error) {
            console.error(`Error de conexión al obtener detalles de la publicación ${publicationId}:`, error);
            return null;
        }
    }

    // Función para mostrar los favoritos en la página
    async function displayFavourites(favourites) {
        if (!Array.isArray(favourites) || favourites.length === 0) {
            favouritesContainer.innerHTML = '<p>No tienes artículos favoritos.</p>';
            return;
        }

        favouritesContainer.innerHTML = '';

        for (const favourite of favourites) {
            const publication = await fetchPublicationDetails(favourite.idPublication);

            if (!publication) {
                console.warn(`No se pudo obtener detalles para la publicación ID: ${favourite.idPublication}`);
                continue;
            }

            const title = publication.title || 'Título no disponible';
            const price = typeof publication.price === 'number' ? publication.price.toFixed(2) : 'Precio no disponible';
            const imageData = publication.photos && publication.photos.length > 0 ? publication.photos[0].imageData : null;
            const imageSrc = imageData ? `data:image/jpeg;base64,${imageData}` : 'resources/default-image.jpg';

            const card = document.createElement('div');
            card.classList.add('favourite-card');

            card.innerHTML = `
                <img src="${imageSrc}" alt="${title}">
                <div class="card-content">
                    <h3>${title}</h3>
                    <p>$${price}</p>
                </div>
                <div class="card-actions">
                    <button class="action-button remove">
                        <span class="material-symbols-outlined">delete</span>
                        <span>Eliminar</span>
                    </button>
                    <button class="action-button cart">
                        <span class="material-symbols-outlined">shopping_cart</span>
                        <span>Al carrito</span>
                    </button>
                    <button class="action-button buy-now">
                        <span class="material-symbols-outlined">shopping_bag</span>
                        <span>Comprar</span>
                    </button>
                </div>
            `;

            // Añadir eventos a los botones
            card.querySelector('.remove').addEventListener('click', () => {
                removeFavourite(favourite.id);
            });
            card.querySelector('.cart').addEventListener('click', () => {
                addToCart(publication.id);
            });
            card.querySelector('.buy-now').addEventListener('click', () => {
                buyNow(publication);
            });

            favouritesContainer.appendChild(card);
        }
    }

    // Función para navegar a detalles del producto
    function navigateToProductDetails(product) {
        localStorage.setItem('productId', product.id);
        localStorage.setItem('productName', product.title);
        localStorage.setItem('productPrice', product.price);
        const imageSrc = product.photos && product.photos.length > 0 
            ? `data:image/jpeg;base64,${product.photos[0].imageData}`
            : 'resources/default-image.jpg';
        localStorage.setItem('productImage', imageSrc);
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
            const response = await fetch(`${apiUrl}/wished-articles/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showConfirmation('Artículo eliminado de favoritos.');
                fetchFavourites();
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
    async function addToCart(publicationId) {
        const token = getToken();
        if (!token) {
            alert('No se encontró el token de autenticación. Por favor, inicia sesión.');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/ShoppingCart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    publicationId: publicationId,
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
        localStorage.setItem('productId', product.id);
        localStorage.setItem('productName', product.title);
        localStorage.setItem('productPrice', product.price);
        const imageSrc = product.photos && product.photos.length > 0 
            ? `data:image/jpeg;base64,${product.photos[0].imageData}`
            : 'resources/default-image.jpg';
        localStorage.setItem('productImage', imageSrc);
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
