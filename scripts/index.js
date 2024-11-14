// index.js

document.addEventListener("DOMContentLoaded", async function () {
    const apiUrl = "https://mercadoplus.somee.com/api";
    const featuredProductsContainer = document.querySelector(".product-list");
    const electronicsContainer = document.querySelector(".electronics-list");
    const fashionContainer = document.querySelector(".fashion-list");
    const instrumentsContainer = document.querySelector(".instruments-list");

    // Almacenar productos de cada categoría
    let electronicsProducts = [];
    let fashionProducts = [];
    let instrumentsProducts = [];

    // Función para obtener el token JWT desde localStorage
    function getToken() {
        return localStorage.getItem("token"); // Asegúrate de almacenar el token con la clave 'token'
    }

    // Crear un elemento de producto
    function createProductElement(product) {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product");
        productDiv.setAttribute("data-product-id", product.id); // Asignar ID de publicación

        productDiv.innerHTML = `
            <img src="data:image/jpeg;base64,${product.photos[0]?.imageData || ''}" alt="${product.title}" />
            <p>${product.title}</p>
            <span>$${product.price.toFixed(2)}</span>
            <button class="add-to-cart-button">
                <img src="resources/addToCart.png" alt="Agregar al carrito">
            </button>
            <button class="add-to-favourite-button">
                <img src="resources/favourite.png" alt="Agregar a favoritos">
            </button>
        `;

        // Evento para agregar al carrito
        const addToCartButton = productDiv.querySelector(".add-to-cart-button");
        addToCartButton.addEventListener("click", function (event) {
            event.stopPropagation(); // Evitar que el evento se propague al contenedor padre
            addToCart(product.id); // Llamar a la función para agregar al carrito
        });

        // Evento para agregar a favoritos
        const addToFavouriteButton = productDiv.querySelector(".add-to-favourite-button");
        addToFavouriteButton.addEventListener("click", function (event) {
            event.stopPropagation(); // Evitar que el evento se propague al contenedor padre
            addToFavourite(product.id); // Llamar a la función para agregar a favoritos
        });

        // Evento al hacer clic en la imagen para ir a detalles del producto
        productDiv.querySelector("img").addEventListener("click", function (event) {
            event.stopPropagation();
            const productId = productDiv.getAttribute("data-product-id");
            window.location.href = `product-details.html?productId=${productId}`;
        });

        return productDiv;
    }

    // Función para agregar un producto al carrito
    async function addToCart(publicationId) {
        const token = getToken(); // Obtener el token utilizando la función existente

        if (!token) {
            alert("Por favor, inicia sesión para agregar productos al carrito.");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/ShoppingCart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    publicationId: publicationId,
                    quantity: 1 // Puedes permitir que el usuario seleccione la cantidad
                })
            });

            if (response.ok) {
                alert("Producto agregado al carrito exitosamente.");
            } else {
                const errorData = await response.json();
                console.error("Error al agregar al carrito:", errorData);
                alert("No se pudo agregar el producto al carrito.");
            }
        } catch (error) {
            console.error("Error de conexión al agregar al carrito:", error);
            alert("Error de conexión. Por favor, intenta nuevamente.");
        }
    }

    // Función para agregar un producto a favoritos
    async function addToFavourite(publicationId) {
        const token = getToken(); // Obtener el token utilizando la función existente

        if (!token) {
            alert("Por favor, inicia sesión para agregar productos a favoritos.");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/wished-articles`, { // Usar la variable apiUrl
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    idPublication: publicationId // Corregir el nombre de la propiedad según Swagger
                })
            });

            if (response.ok) {
                alert('Producto agregado a favoritos exitosamente.');
            } else {
                const errorData = await response.json();
                console.error("Error al agregar a favoritos:", errorData);
                alert(errorData.message || "No se pudo agregar el producto a favoritos.");
            }
        } catch (error) {
            console.error("Error de conexión al agregar a favoritos:", error);
            alert("Error de conexión. Por favor, intenta nuevamente.");
        }
    }

    // Cargar productos de una categoría específica
    async function loadProductsByCategory(categoryName, container) {
        // Elimina la dependencia del token
        const headers = {};
        const token = getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    
        try {
            const response = await fetch(`${apiUrl}/publications/by-category?categoryName=${encodeURIComponent(categoryName)}`, {
                headers: headers
            });
    
            if (response.ok) {
                const products = await response.json();
    
                // Limpiar el contenedor antes de agregar nuevos productos
                container.innerHTML = '';
    
                products.forEach(product => {
                    const productElement = createProductElement(product);
                    container.appendChild(productElement);
                });
    
                // Almacenar los productos según la categoría
                const categoryNameLower = categoryName.toLowerCase();
                if (["tecnología", "tecnologia", "electrónica", "electronica"].includes(categoryNameLower)) {
                    electronicsProducts = products;
                }
                if (categoryNameLower === "moda") {
                    fashionProducts = products;
                }
                if (categoryNameLower === "instrumentos") {
                    instrumentsProducts = products;
                }
    
            } else {
                const errorData = await response.json();
                console.error("Error al cargar productos de categoría:", errorData.message || response.statusText);
            }
        } catch (error) {
            console.error("Error de conexión al cargar productos de categoría:", error);
        }
    }
    

    // Función para seleccionar aleatoriamente productos para el carrusel
    function selectRandomProducts() {
        const selectedProducts = [];

        // Función auxiliar para seleccionar productos aleatorios de una lista
        function getRandomProductsFromList(productList, count) {
            const shuffled = productList.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        }

        // Seleccionar al menos 2 productos de cada categoría
        if (electronicsProducts.length > 0) {
            selectedProducts.push(...getRandomProductsFromList(electronicsProducts, 2));
        }
        if (fashionProducts.length > 0) {
            selectedProducts.push(...getRandomProductsFromList(fashionProducts, 2));
        }
        if (instrumentsProducts.length > 0) {
            selectedProducts.push(...getRandomProductsFromList(instrumentsProducts, 2));
        }

        return selectedProducts;
    }

    // Función para cargar los productos seleccionados en el carrusel
    function loadCarouselProducts() {
        const products = selectRandomProducts();
        featuredProductsContainer.innerHTML = ''; // Limpiar contenido previo

        products.forEach(product => {
            const productElement = createProductElement(product);
            featuredProductsContainer.appendChild(productElement);
        });

        // Inicializar el carrusel después de cargar los productos
        initializeProductCarousel();
    }

    // Función para inicializar el carrusel de productos
    function initializeProductCarousel() {
        let currentIndex = 0;
        const productList = document.querySelector('.product-list');
        const products = productList.children;
        if (products.length === 0) {
            console.warn('No se encontraron productos para el carrusel.');
            return;
        }
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
    }

    // Obtener categorías y cargar productos por categoría
    async function loadCategories() {
        const headers = {};
        const token = getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    
        try {
            const response = await fetch(`${apiUrl}/categories`, {
                headers: headers
            });
    
            if (response.ok) {
                const categories = await response.json();
    
                // Cargar productos para las categorías
                const loadCategoryPromises = categories.map(async category => {
                    const categoryNameLower = category.name.toLowerCase();
    
                    if (["tecnología", "tecnologia", "electrónica", "electronica"].includes(categoryNameLower)) {
                        await loadProductsByCategory(category.name, electronicsContainer);
                    }
                    if (categoryNameLower === "moda") {
                        await loadProductsByCategory(category.name, fashionContainer);
                    }
                    if (categoryNameLower === "instrumentos") {
                        await loadProductsByCategory(category.name, instrumentsContainer);
                    }
                });
    
                await Promise.all(loadCategoryPromises);
    
                // Después de cargar todas las categorías, cargar el carrusel
                loadCarouselProducts();
            } else {
                const errorData = await response.json();
                console.error("Error al cargar categorías:", errorData.message || response.statusText);
            }
        } catch (error) {
            console.error("Error de conexión al cargar categorías:", error);
        }
    }    

    // Llamada a las funciones para cargar categorías y productos del carrusel
    await loadCategories();

    // Carrusel de publicidad (mantiene tu código existente)
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
