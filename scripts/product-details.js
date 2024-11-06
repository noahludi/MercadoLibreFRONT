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
                // Si el endpoint requiere autenticación, agrega el token
                // "Authorization": "Bearer " + token
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
                <!-- Agrega más características si están disponibles -->
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

    // Función para obtener la información del usuario
    async function getUserInfo() {
        if (token) {
            try {
                console.log("Solicitando información del usuario...");

                const userResponse = await fetch(`${apiUrl}/account/getUserInfo`, {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();

                    // Actualizar texto de bienvenida
                    const usernameDisplay = document.getElementById("usernameDisplay");
                    usernameDisplay.textContent = "Hola, " + userData.firstName + "!";
                    usernameDisplay.style.textAlign = "center";
                    usernameDisplay.style.fontWeight = "bold";

                    // Cargar la foto de perfil si existe
                    const profilePhotoId = userData.profilePhotoId;
                    if (profilePhotoId) {
                        console.log("Obteniendo foto de perfil con ID:", profilePhotoId);
                        const photoResponse = await fetch(`${apiUrl}/photos/${profilePhotoId}`, {
                            method: "GET",
                            headers: {
                                "Authorization": "Bearer " + token
                            }
                        });

                        if (photoResponse.ok) {
                            const photoData = await photoResponse.json();
                            const imageBase64 = photoData.imageData;

                            // Asignar la imagen de perfil
                            const profileImage = document.getElementById("profilePicture");
                            profileImage.src = `data:image/jpeg;base64,${imageBase64}`;
                            profileImage.style.display = "block";
                            profileImage.style.width = "80px";
                            profileImage.style.height = "80px";
                            profileImage.style.borderRadius = "50%";
                            profileImage.style.margin = "0 auto 10px";
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
        } else {
            console.log("No se encontró un token en localStorage.");
        }
    }

    // Llamar a la función para obtener la información del usuario
    await getUserInfo();

    // Evento para alternar el dropdown
    document.getElementById("accountIcon").addEventListener("click", function (event) {
        event.preventDefault();
        const dropdown = document.querySelector(".dropdown");
        dropdown.classList.toggle("show");
    });

    // Cerrar el dropdown si se hace clic fuera de él
    window.onclick = function (event) {
        if (!event.target.closest(".dropdown") && !event.target.matches("#accountIcon, .material-symbols-outlined")) {
            const dropdown = document.querySelector(".dropdown");
            if (dropdown.classList.contains("show")) {
                dropdown.classList.remove("show");
            }
        }
    };
});
