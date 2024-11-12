document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    const apiUrl = "https://mercadoplus.somee.com/api";

    if (!token) {
        alert("Por favor, inicia sesión para ver tu carrito.");
        window.location.href = "login.html";
        return;
    }

    // Función para obtener y mostrar los productos del carrito
    async function loadCartItems() {
        try {
            const response = await fetch(`${apiUrl}/ShoppingCart`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const cartData = await response.json();
                console.log("Cart data:", cartData); // Para inspeccionar los datos
                displayCartItems(cartData.items); // Pasamos cartData.items
            } else {
                console.error("Error al obtener los artículos del carrito:", response.statusText);
            }
        } catch (error) {
            console.error("Error de conexión al obtener los artículos del carrito:", error);
        }
    }

    // Función para mostrar los productos en la página
    async function displayCartItems(cartItems) {
        const cartItemsContainer = document.querySelector(".cart-items");
        const cartSummaryContainer = document.querySelector(".cart-summary .summary-details");
        let subtotal = 0;

        // Limpiar el contenedor de artículos
        cartItemsContainer.innerHTML = '<h2>Carrito de Compras</h2>';

        // Usar un array para almacenar las promesas
        const itemPromises = cartItems.map(async item => {
            const productDiv = document.createElement("div");
            productDiv.classList.add("cart-item");

            // Obtener la imagen de la publicación
            const imageSrc = await getPublicationImage(item.publicationId);

            productDiv.innerHTML = `
                <img src="${imageSrc}" alt="${item.title}">
                <div class="item-details">
                    <p>${item.title}</p>
                    <p>Precio: $${item.price}</p>
                    <label>Cantidad:</label>
                    <input type="number" value="${item.quantity}" min="1" data-publication-id="${item.publicationId}">
                    <button class="remove-item" data-publication-id="${item.publicationId}">Eliminar</button>
                </div>
            `;

            cartItemsContainer.appendChild(productDiv);

            subtotal += item.price * item.quantity;
        });

        // Esperar a que todas las promesas se resuelvan
        await Promise.all(itemPromises);

        // Calcular impuestos y total
        const impuestos = subtotal * 0.21; // Suponiendo un 21% de impuestos
        const total = subtotal + impuestos;

        // Mostrar resumen del pedido
        cartSummaryContainer.innerHTML = `
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
            <p>Impuestos: $${impuestos.toFixed(2)}</p>
            <p>Total: $${total.toFixed(2)}</p>
            <button class="pay-now-button">Pagar ahora</button>
        `;

        // Añadir eventos para actualizar cantidades y eliminar productos
        addEventListenersToCartItems();
    }

    // Función para obtener la imagen de la publicación
    async function getPublicationImage(publicationId) {
        try {
            const response = await fetch(`${apiUrl}/publications/${publicationId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const publicationData = await response.json();
                const imageData = publicationData.photos[0]?.imageData || '';
                return `data:image/jpeg;base64,${imageData}`;
            } else {
                console.error(`Error al obtener la publicación ${publicationId}:`, response.statusText);
                return "resources/default-image.jpg"; // Ruta a una imagen por defecto
            }
        } catch (error) {
            console.error(`Error de conexión al obtener la publicación ${publicationId}:`, error);
            return "resources/default-image.jpg"; // Ruta a una imagen por defecto
        }
    }

    // Función para añadir eventos a los elementos del carrito
    function addEventListenersToCartItems() {
        // Actualizar cantidades
        const quantityInputs = document.querySelectorAll(".cart-item input[type='number']");
        quantityInputs.forEach(input => {
            input.addEventListener("change", function () {
                const publicationId = this.getAttribute("data-publication-id");
                const newQuantity = parseInt(this.value);
                updateCartItem(publicationId, newQuantity);
            });
        });

        // Eliminar productos
        const removeButtons = document.querySelectorAll(".remove-item");
        removeButtons.forEach(button => {
            button.addEventListener("click", function () {
                const publicationId = this.getAttribute("data-publication-id");
                removeCartItem(publicationId);
            });
        });

        // Evento para el botón "Pagar ahora"
        const payNowButton = document.querySelector(".pay-now-button");
        if (payNowButton) {
            payNowButton.addEventListener("click", function () {
                // Aquí puedes redirigir al usuario al proceso de pago
                alert("Procesando pago...");
            });
        }
    }

    // Función para actualizar la cantidad de un producto en el carrito
    async function updateCartItem(publicationId, quantity) {
        try {
            const response = await fetch(`${apiUrl}/ShoppingCart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    publicationId: parseInt(publicationId),
                    quantity: quantity
                })
            });

            if (response.ok) {
                // Recargar los artículos del carrito
                loadCartItems();
            } else {
                console.error("Error al actualizar la cantidad:", response.statusText);
            }
        } catch (error) {
            console.error("Error de conexión al actualizar la cantidad:", error);
        }
    }

    // Función para eliminar un producto del carrito
    async function removeCartItem(publicationId) {
        try {
            const response = await fetch(`${apiUrl}/ShoppingCart?publicationId=${publicationId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Recargar los artículos del carrito
                loadCartItems();
            } else {
                console.error("Error al eliminar el producto del carrito:", response.statusText);
            }
        } catch (error) {
            console.error("Error de conexión al eliminar el producto del carrito:", error);
        }
    }

    // Llamar a la función para cargar los productos del carrito
    await loadCartItems();
});
