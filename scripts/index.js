document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    const apiUrl = "https://mercadoplus.somee.com/api";
    const featuredProductsContainer = document.querySelector(".product-list");
    const electronicsContainer = document.querySelector(".electronics-list");
    const fashionContainer = document.querySelector(".fashion-list");
    const instrumentsContainer = document.querySelector(".instruments-list"); // Nuevo contenedor para instrumentos

    // Verificar si el usuario está autenticado
    if (!token) {
        console.log("No se encontró información de un token.");
    }

    // Obtener información del usuario
    try {
        const userResponse = await fetch(`${apiUrl}/account/getUserInfo`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (userResponse.ok) {
            const userData = await userResponse.json();

            // Configurar el texto de bienvenida
            const usernameDisplay = document.getElementById("usernameDisplay");
            usernameDisplay.textContent = "Hola, " + userData.firstName + "!";
            usernameDisplay.style.textAlign = "center";
            usernameDisplay.style.fontWeight = "bold";

            // Si el usuario tiene una foto de perfil, obtener el ID y cargar la imagen
            const profilePhotoId = userData.profilePhotoId;
            if (profilePhotoId) {
                const photoResponse = await fetch(`${apiUrl}/photos/${profilePhotoId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                });

                if (photoResponse.ok) {
                    const photoData = await photoResponse.json();
                    const imageBase64 = photoData.imageData;

                    // Crear elemento de imagen y mostrar en el dropdown
                    const profileImage = document.createElement("img");
                    profileImage.src = `data:image/jpeg;base64,${imageBase64}`;
                    profileImage.alt = "Foto de perfil";
                    profileImage.style.width = "80px";
                    profileImage.style.height = "80px";
                    profileImage.style.borderRadius = "50%";
                    profileImage.style.display = "block";
                    profileImage.style.margin = "0 auto 10px";

                    // Insertar la imagen en el dropdown
                    const dropdownContent = document.querySelector(".dropdown-content");
                    dropdownContent.insertBefore(profileImage, dropdownContent.firstChild);

                    console.log("Foto de perfil mostrada correctamente.");
                } else {
                    console.error("Error al cargar la imagen de perfil");
                }
            }

            // Cambiar el enlace de login a "Cerrar Sesión"
            const loginLink = document.querySelector(".dropdown-content a[href='login.html']");
            if (loginLink) {
                loginLink.textContent = "Cerrar Sesión";
                loginLink.href = "#";
                loginLink.addEventListener("click", () => {
                    localStorage.removeItem("token");
                    window.location.reload();
                });
            }
        } else {
            console.error("Error al cargar datos del usuario");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }

    // Evento para alternar el dropdown
    document.getElementById("accountIcon").addEventListener("click", function (event) {
        event.preventDefault();
        document.querySelector(".dropdown").classList.toggle("show");
    });

    window.onclick = function (event) {
        if (!event.target.closest(".dropdown") && !event.target.matches(".material-symbols-outlined")) {
            document.querySelector(".dropdown").classList.remove("show");
        }
    };

    // Crear un elemento de producto
    function createProductElement(product) {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product");

        productDiv.innerHTML = `
            <img src="data:image/jpeg;base64,${product.photos[0]?.imageData || ''}" alt="${product.title}" />
            <p>${product.title}</p>
            <span>$${product.price}</span>
            <a href="#"><img src="resources/addToCart.png" alt="Comprar"></a>
        `;

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

                    if (categoryNameLower === "tecnología" || categoryNameLower === "tecnologia") {
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
