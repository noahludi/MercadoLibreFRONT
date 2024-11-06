document.addEventListener("DOMContentLoaded", async function() {
    const token = localStorage.getItem("token");

    if (token) {
        try {
            // Obtener información del usuario
            const userResponse = await fetch("https://mercadoplus.somee.com/api/account/getUserInfo", {
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
                usernameDisplay.style.textAlign = "center"; // Centrar el texto
                usernameDisplay.style.fontWeight = "bold";  // Texto en negrita

                // Si el usuario tiene una foto de perfil, obtener el ID y cargar la imagen
                const profilePhotoId = userData.profilePhotoId;
                if (profilePhotoId) {
                    const photoResponse = await fetch(`https://mercadoplus.somee.com/api/photos/${profilePhotoId}`, {
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
    }

    // Evento para alternar el dropdown
    document.getElementById('accountIcon').addEventListener('click', function(event) {
        event.preventDefault();
        const dropdown = document.querySelector('.dropdown');
        dropdown.classList.toggle('show');
    });

    // Cerrar el dropdown si se hace clic fuera de él
    window.onclick = function(event) {
        if (!event.target.closest('.dropdown') && !event.target.matches('.material-symbols-outlined')) {
            const dropdowns = document.getElementsByClassName('dropdown');
            for (let i = 0; i < dropdowns.length; i++) {
                const openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    };

    // Carrusel de productos destacados
    let currentIndex = 0;
    const productList = document.querySelector('.product-list');
    const products = document.querySelectorAll('.product');
    const productWidth = products[0].clientWidth;

    document.querySelector('.carousel-next').addEventListener('click', () => {
        currentIndex++;
        productList.style.transition = 'transform 0.5s ease-in-out';
        productList.style.transform = `translateX(${-currentIndex * productWidth}px)`;

        if (currentIndex >= products.length) {
            setTimeout(() => {
                productList.style.transition = 'none';
                currentIndex = 0;
                productList.style.transform = `translateX(0)`;
            }, 500);
        }
    });

    document.querySelector('.carousel-prev').addEventListener('click', () => {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = products.length - 1;
            productList.style.transition = 'none';
            productList.style.transform = `translateX(${-currentIndex * productWidth}px)`;
        }

        setTimeout(() => {
            productList.style.transition = 'transform 0.5s ease-in-out';
            productList.style.transform = `translateX(${-currentIndex * productWidth}px)`;
        }, 0);
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

// Función para mostrar detalles del producto y redirigir
function showProductDetails(name, memory, ram, screen, camera, battery, image, price) {
    // Guardar los datos del producto en localStorage
    localStorage.setItem('productName', name);
    localStorage.setItem('productMemory', memory);
    localStorage.setItem('productRam', ram);
    localStorage.setItem('productScreen', screen);
    localStorage.setItem('productCamera', camera);
    localStorage.setItem('productBattery', battery);
    localStorage.setItem('productImage', image);
    localStorage.setItem('productPrice', price);

    // Redirigir a la página de detalles
    window.location.href = 'product-details.html';
}
