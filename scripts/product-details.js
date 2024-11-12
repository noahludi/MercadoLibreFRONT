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

            // Cargar características adicionales si existen
            const featuresList = document.getElementById('productFeatures');
            featuresList.innerHTML = `
                <li>Categoría: ${productData.category?.name || 'N/A'}</li>
            `;

            // Si tienes una imagen, mostrarla
            const productImage = document.querySelector('.product-image img');
            if (productData.photos && productData.photos.length > 0) {
                productImage.src = `data:image/jpeg;base64,${productData.photos[0].imageData}`;
            } else {
                productImage.src = 'resources/default-image.jpg';
            }

            // Manejar el botón "Comprar ahora"
            const buyNowButton = document.querySelector('.buy-now-button');
            buyNowButton.addEventListener('click', function () {
                if (productData.price) {
                    console.log(`Redirigiendo al checkout con el precio: ${productData.price}`);
                    window.location.href = `checkout.html?amount=${productData.price}&productId=${productId}`;
                } else {
                    console.log("No hay precio disponible para redirigir al checkout.");
                }
            });

        } else {
            console.error("Error al obtener los detalles del producto de la API.");
            document.getElementById('productTitle').textContent = 'Producto no disponible';
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
});
