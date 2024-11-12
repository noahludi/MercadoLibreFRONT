document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    const apiUrl = "https://mercadoplus.somee.com/api";
    const featuredProductsContainer = document.querySelector(".product-list");
    const electronicsContainer = document.querySelector(".electronics-list");
    const fashionContainer = document.querySelector(".fashion-list");
    const instrumentsContainer = document.querySelector(".instruments-list");

    // Crear un elemento de producto
    function createProductElement(product) {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product");
        productDiv.setAttribute("data-product-id", product.id); // Asignar ID de publicación

        productDiv.innerHTML = `
            <img src="data:image/jpeg;base64,${product.photos[0]?.imageData || ''}" alt="${product.title}" />
            <p>${product.title}</p>
            <span>$${product.price}</span>
            <a href="#"><img src="resources/addToCart.png" alt="Comprar"></a>
        `;

        // Añadir evento de clic para redirigir a product-details.html con el ID del producto
        productDiv.addEventListener("click", function () {
            const productId = this.getAttribute("data-product-id");
            window.location.href = `product-details.html?productId=${productId}`;
        });

        return productDiv;
    }

    // Cargar productos de una categoría específica
    async function loadProductsByCategory(categoryName, container) {
        try {
            const response = await fetch(`${apiUrl}/publications/by-category?categoryName=${encodeURIComponent(categoryName)}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const products = await response.json();

                // Limpiar el contenedor antes de agregar nuevos productos
                container.innerHTML = '';

                products.forEach(product => {
                    const productElement = createProductElement(product);
                    container.appendChild(productElement);
                });

                // Agregar primer producto de cada categoría a destacados
                if (products.length > 0) {
                    const featuredProduct = createProductElement(products[0]);
                    featuredProductsContainer.appendChild(featuredProduct);
                }
            } else {
                console.error("Error al cargar productos de categoría:", response.statusText);
            }
        } catch (error) {
            console.error("Error de conexión al cargar productos de categoría:", error);
        }
    }

    // Obtener categorías y cargar productos por categoría
    async function loadCategories() {
        try {
            const response = await fetch(`${apiUrl}/categories`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const categories = await response.json();

                // Cargar productos para las categorías de Electrónica, Moda e Instrumentos
                categories.forEach(category => {
                    const categoryNameLower = category.name.toLowerCase();

                    if (["tecnología", "tecnologia", "electrónica", "electronica"].includes(categoryNameLower)) {
                        loadProductsByCategory(category.name, electronicsContainer);
                    }
                    if (categoryNameLower === "moda") {
                        loadProductsByCategory(category.name, fashionContainer);
                    }
                    if (categoryNameLower === "instrumentos") {
                        loadProductsByCategory(category.name, instrumentsContainer);
                    }
                });
            } else {
                console.error("Error al cargar categorías:", response.statusText);
            }
        } catch (error) {
            console.error("Error de conexión al cargar categorías:", error);
        }
    }

    // Llamada a las funciones para cargar categorías y productos destacados
    await loadCategories();

    // Carrusel de productos destacados
    let currentIndex = 0;
    const productList = document.querySelector('.product-list');
    const products = productList.children;
    const productWidth = products[0]?.clientWidth || 0;

    document.querySelector('.carousel-next').addEventListener('click', () => {
        currentIndex++;
        if (currentIndex >= products.length) {
            currentIndex = 0;
        }
        productList.style.transition = 'transform 0.5s ease-in-out';
        productList.style.transform = `translateX(${-currentIndex * productWidth}px)`;
    });

    document.querySelector('.carousel-prev').addEventListener('click', () => {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = products.length - 1;
        }
        productList.style.transition = 'transform 0.5s ease-in-out';
        productList.style.transform = `translateX(${-currentIndex * productWidth}px)`;
    });

    // Carrusel de publicidad
    let currentAdIndex = 0;
    const adList = document.querySelector('.ad-images');
    const ads = document.querySelectorAll('.ad-images img');
    const totalAds = ads.length;

    setInterval(() => {
        currentAdIndex++;
        if (currentAdIndex >= totalAds) {
            currentAdIndex = 0;
        }
        adList.style.transition = 'transform 0.5s ease-in-out';
        adList.style.transform = `translateX(${-currentAdIndex * ads[0].clientWidth}px)`;
    }, 5000);

    document.querySelector('.carousel-next-ad').addEventListener('click', () => {
        currentAdIndex++;
        if (currentAdIndex >= totalAds) {
            currentAdIndex = 0;
        }
        adList.style.transition = 'transform 0.5s ease-in-out';
        adList.style.transform = `translateX(${-currentAdIndex * ads[0].clientWidth}px)`;
    });

    document.querySelector('.carousel-prev-ad').addEventListener('click', () => {
        currentAdIndex--;
        if (currentAdIndex < 0) {
            currentAdIndex = totalAds - 1;
        }
        adList.style.transition = 'transform 0.5s ease-in-out';
        adList.style.transform = `translateX(${-currentAdIndex * ads[0].clientWidth}px)`;
    });
});
