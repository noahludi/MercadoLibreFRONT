document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    const apiUrl = "https://mercadoplus.somee.com/api";

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

                    // Mostrar la imagen en el dropdown
                    const profileImage = document.getElementById("profilePicture");
                    profileImage.src = `data:image/jpeg;base64,${imageBase64}`;
                    profileImage.style.display = "block";

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
});
