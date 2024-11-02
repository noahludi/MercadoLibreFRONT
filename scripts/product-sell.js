document.addEventListener('DOMContentLoaded', async function () {
    console.log("Inicializando script de detalles de producto...");

    const token = localStorage.getItem("token");

    // Función para obtener la información del usuario
    async function getUserInfo() {
        if (token) {
            try {
                console.log("Solicitando información del usuario...");

                const userResponse = await fetch("http://mercadoplus.somee.com/api/account/getUserInfo", {
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
                    usernameDisplay.style.textAlign = "center"; // Centrar el texto
                    usernameDisplay.style.fontWeight = "bold";  // Texto en negrita

                    // Cargar la foto de perfil si existe
                    const profilePhotoId = userData.profilePhotoId;
                    if (profilePhotoId) {
                        console.log("Obteniendo foto de perfil con ID:", profilePhotoId);
                        const photoResponse = await fetch(`http://mercadoplus.somee.com/api/photos/${profilePhotoId}`, {
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

    // Cargar detalles del producto desde localStorage
    console.log("Cargando detalles del producto desde localStorage...");
    const name = localStorage.getItem('productName');
    const memory = localStorage.getItem('productMemory');
    const ram = localStorage.getItem('productRam');
    const screen = localStorage.getItem('productScreen');
    const camera = localStorage.getItem('productCamera');
    const battery = localStorage.getItem('productBattery');
    const image = localStorage.getItem('productImage');
    const price = localStorage.getItem('productPrice');

    // Mostrar los detalles del producto en la página
    document.querySelector('.product-info h1').textContent = name || 'Producto no disponible';
    document.querySelector('.product-info h2').textContent = price || 'Precio no disponible';
    document.querySelector('.product-features').innerHTML = `
        <li>${memory || 'N/A'}</li>
        <li>${ram || 'N/A'}</li>
        <li>${screen || 'N/A'}</li>
        <li>${camera || 'N/A'}</li>
        <li>${battery || 'N/A'}</li>
    `;
    document.querySelector('.product-image img').src = image || 'resources/default-image.jpg';

    // Redirección al checkout
    const buyNowButton = document.querySelector('.buy-now-button');
    buyNowButton.addEventListener('click', function () {
        if (price) {
            console.log(`Redirigiendo al checkout con el precio: ${price}`);
            window.location.href = `checkout.html?amount=${price}`;
        } else {
            console.log("No hay precio disponible para redirigir al checkout.");
        }
    });
});
