document.addEventListener('DOMContentLoaded', async function () {
    const apiUrl = "https://mercadoplus.somee.com/api";
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Debe iniciar sesión para ver sus compras.");
        window.location.href = "login.html";
        return;
    }

    let userId = null;

    // Obtener el ID del usuario
    async function getUserId() {
        try {
            const response = await fetch(`${apiUrl}/account/getUserInfo`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                userId = userData.id;
                console.log("ID del usuario obtenido:", userId);
            } else {
                console.error("Error al obtener información del usuario.");
            }
        } catch (error) {
            console.error("Error de conexión al obtener información del usuario:", error);
        }
    }

    // Obtener las compras del usuario
    async function getUserPurchases() {
        try {
            const response = await fetch(`${apiUrl}/transactions/by-user/${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const purchases = await response.json();
                displayPurchases(purchases);
            } else {
                console.error("Error al obtener las compras del usuario.");
                alert("No se pudieron cargar sus compras.");
            }
        } catch (error) {
            console.error("Error de conexión al obtener las compras del usuario:", error);
        }
    }

    // Mostrar las compras en el DOM
    function displayPurchases(purchases) {
        const purchasesList = document.getElementById('purchasesList');
        purchasesList.innerHTML = '';

        if (purchases.length === 0) {
            purchasesList.innerHTML = '<p>No has realizado compras aún.</p>';
            return;
        }

        purchases.forEach(async (purchase) => {
            // Obtener detalles de la publicación (producto)
            const publication = await getPublicationDetails(purchase.idPublication);

            // Crear elemento de compra
            const purchaseItem = document.createElement('div');
            purchaseItem.classList.add('purchase-item');

            purchaseItem.innerHTML = `
                <div class="purchase-image">
                    <img src="${publication.photo}" alt="${publication.title}">
                </div>
                <div class="purchase-details">
                    <h3>${publication.title}</h3>
                    <p>Precio: $${purchase.amount}</p>
                    <p>Fecha: ${new Date(purchase.date).toLocaleDateString()}</p>
                </div>
                <div class="purchase-actions">
                    <button class="view-button" data-publication-id="${publication.id}">Ver Producto</button>
                </div>
            `;

            purchasesList.appendChild(purchaseItem);
        });

        // Agregar eventos a los botones "Ver Producto"
        document.querySelectorAll('.view-button').forEach(button => {
            button.addEventListener('click', function () {
                const publicationId = this.getAttribute('data-publication-id');
                window.location.href = `product-details.html?productId=${publicationId}`;
            });
        });
    }

    // Obtener detalles de la publicación
    async function getPublicationDetails(publicationId) {
        try {
            const response = await fetch(`${apiUrl}/publications/${publicationId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const publication = await response.json();

                // Obtener la imagen principal
                let photo = 'resources/default-image.jpg';
                if (publication.photos && publication.photos.length > 0 && publication.photos[0].imageData) {
                    photo = `data:image/jpeg;base64,${publication.photos[0].imageData}`;
                }

                return {
                    id: publication.id,
                    title: publication.title,
                    photo: photo
                };
            } else {
                console.error(`Error al obtener detalles de la publicación con ID ${publicationId}.`);
                return {
                    id: publicationId,
                    title: 'Título no disponible',
                    photo: 'resources/default-image.jpg'
                };
            }
        } catch (error) {
            console.error(`Error de conexión al obtener detalles de la publicación con ID ${publicationId}:`, error);
            return {
                id: publicationId,
                title: 'Título no disponible',
                photo: 'resources/default-image.jpg'
            };
        }
    }

    // Inicializar
    await getUserId();
    if (userId) {
        await getUserPurchases();
    }
});
