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

            // Manejar el botón "Comprar ahora"
            const buyNowButton = document.querySelector('.buy-now-button');
            buyNowButton.addEventListener('click', function () {
                window.location.href = "checkout.html";
            });

        } else {
            console.error("Error al obtener los detalles del producto de la API.");
            document.getElementById('productTitle').textContent = 'Producto no disponible';
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
});
