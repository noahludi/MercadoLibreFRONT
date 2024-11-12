document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    const apiUrl = "https://mercadoplus.somee.com/api";

    // Crear el elemento header y su contenido
    const header = document.createElement('header');
    header.innerHTML = `
        <div class="logo">
            <a href="index.html">
                <img src="resources/Logo.png" alt="Logo" style="width: 120px;">
            </a>            
        </div>
        <div class="search-bar">
            <input type="text" placeholder="Buscar productos, marcas y más...">
            <button><img src="resources/search.png" class="search-icon" alt="Buscar"/></button>
        </div>
        <div class="nav-links">
            <a href="index.html"><span class="material-symbols-outlined">home</span></a>
            <a href="cart.html"><span class="material-symbols-outlined">shopping_cart</span></a>
            <a href="sellProducts.html"><span class="material-symbols-outlined">sell</span></a>
            <div class="dropdown">
                <a href="#" id="accountIcon"><span class="material-symbols-outlined">account_circle</span></a>
                <div class="dropdown-content">
                    <img id="profilePicture" src="" alt="Foto de perfil" style="width: 60px; height: 60px; border-radius: 50%; display: none; margin: 0 auto 10px;"/>
                    <p id="usernameDisplay">Bienvenido, Invitado</p>
                    <a id="configButton" href="userSettings.html">Configuración</a>
                    <a id="configButton" href="userHistory.html">Historial</a>
                    <a id="configButton" href="userQuestions.html">Preguntas</a>
                    <a id="configButton" href="userOpinions.html">Opiniones</a>
                    <a href="login.html" id="loginLink">Ingresar</a>
                </div>
            </div>
        </div>
    `;

    // Insertar el header al inicio del body
    document.body.insertBefore(header, document.body.firstChild);

    // Ahora continuamos con el código que maneja la lógica del navbar

    // Verificar si el usuario está autenticado
    if (!token) {
        console.log("No se encontró información de un token.");
    } else {
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

                        // Mostrar la imagen en el dropdown
                        const profileImage = document.getElementById("profilePicture");
                        profileImage.src = `data:image/jpeg;base64,${imageBase64}`;
                        profileImage.style.display = "block";
                    } else {
                        console.error("Error al cargar la imagen de perfil");
                    }
                }

                // Cambiar el enlace de login a "Cerrar Sesión"
                const loginLink = document.getElementById("loginLink");
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
    document.getElementById("accountIcon").addEventListener("click", function (event) {
        event.preventDefault();
        document.querySelector(".dropdown").classList.toggle("show");
    });

    window.onclick = function (event) {
        if (!event.target.closest(".dropdown") && !event.target.matches(".material-symbols-outlined")) {
            const dropdowns = document.querySelectorAll(".dropdown");
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove("show");
            });
        }
    };
});
