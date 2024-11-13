// searchResult.js

document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "https://mercadoplus.somee.com/api";
    const searchContainer = document.getElementById("results-container"); // Cambiado para coincidir con el HTML

    // Verificar que el contenedor existe en el DOM
    if (!searchContainer) {
        console.error("No se encontró el contenedor 'results-container' en el DOM.");
        return;
    }

    // Obtener el término de búsqueda de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("searchTerm");

    if (query) {
        fetchSearchResults(query);
    } else {
        searchContainer.innerHTML = "<p>No se ha proporcionado ningún término de búsqueda.</p>";
    }

    // Función para buscar productos
    async function fetchSearchResults(searchTerm) {
        try {
            const response = await fetch(`${apiUrl}/publications/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const results = await response.json();
                displaySearchResults(results);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al realizar la búsqueda.");
            }
        } catch (error) {
            searchContainer.innerHTML = `<p class="error">${error.message}</p>`;
            console.error("Error:", error);
        }
    }

    // Función para mostrar los resultados
    function displaySearchResults(results) {
        searchContainer.innerHTML = ""; // Limpiar resultados previos

        if (!Array.isArray(results) || results.length === 0) {
            searchContainer.innerHTML = "<p>No se encontraron resultados para tu búsqueda.</p>";
            return;
        }

        results.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");

            const imageSrc = product.photos && product.photos.length > 0 
                ? `data:image/jpeg;base64,${product.photos[0].imageData}`
                : "resources/default-image.jpg";

            productCard.innerHTML = `
                <img src="${imageSrc}" alt="${product.title}" class="product-image">
                <h3>${product.title}</h3>
                <p>$${product.price.toFixed(2)}</p>
            `;

            productCard.addEventListener("click", () => {
                window.location.href = `product-details.html?productId=${product.id}`;
            });

            searchContainer.appendChild(productCard);
        });
    }
});
