document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    const apiUrl = "https://mercadoplus.somee.com/api"; // URL base de la API

    // Verificar si el usuario está autenticado
    if (!token) {
        alert("Debe iniciar sesión para publicar un producto.");
        window.location.href = "login.html"; // Redirigir a la página de inicio de sesión si no hay token
        return;
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

    // Función para cargar opciones dinámicas en los selectores desde la API
    async function loadOptions(endpoint, selectId) {
        try {
            const response = await fetch(`${apiUrl}/${endpoint}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const options = await response.json();
                const select = document.getElementById(selectId);
                options.forEach(option => {
                    const opt = document.createElement("option");
                    opt.value = option.id;
                    opt.textContent = option.name || option.description;
                    select.appendChild(opt);
                });
            } else {
                console.error(`Error al cargar opciones para ${selectId}`);
            }
        } catch (error) {
            console.error(`Error de conexión al cargar ${selectId}`, error);
        }
    }

    // Llamadas para cargar las opciones en los selectores
    await loadOptions("categories", "idCategoria"); // Cargar categorías
    await loadOptions("product-states", "idProductState");
    await loadOptions("publication-states", "idPublicationState");
    await loadOptions("colors", "idColor");

    // Almacenar las imágenes en Base64 para el envío
    let base64Photos = [];
    const photoContainer = document.getElementById("photoPreviewContainer");

    document.getElementById("fileInput").addEventListener("change", function (event) {
        base64Photos = []; // Reiniciar la lista de fotos en Base64
        photoContainer.innerHTML = ""; // Limpiar la vista previa

        Array.from(event.target.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.className = "photo-preview-item";
                photoContainer.appendChild(img);

                // Guardar la imagen en formato Base64 (sin la cabecera)
                base64Photos.push({ imageData: e.target.result.split(',')[1] });
            };
            reader.readAsDataURL(file);
        });
    });

    // Manejar el envío del formulario
    document.getElementById("sellProductForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        // Asegurarse de que las fotos en base64 están presentes en el formulario
        const formData = {
            title: document.getElementById("title") ? document.getElementById("title").value : "",
            description: document.getElementById("description") ? document.getElementById("description").value : "",
            price: document.getElementById("price") ? parseFloat(document.getElementById("price").value) : 0,
            idCategoria: document.getElementById("idCategoria") ? parseInt(document.getElementById("idCategoria").value) : 0,
            idProductState: document.getElementById("idProductState") ? parseInt(document.getElementById("idProductState").value) : 0,
            idPublicationState: document.getElementById("idPublicationState") ? parseInt(document.getElementById("idPublicationState").value) : 0,
            idColor: document.getElementById("idColor") ? parseInt(document.getElementById("idColor").value) : 0,
            stock: document.getElementById("stock") ? parseInt(document.getElementById("stock").value) : 0,
            photos: base64Photos // Incluir las fotos en Base64 en el objeto de datos
        };

        // Confirmar que el campo photos contiene los datos necesarios
        console.log("Datos del formulario a enviar:", formData);

        try {
            const response = await fetch(`${apiUrl}/publications`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("Producto publicado con éxito.");
                window.location.href = "index.html"; // Redirigir tras publicar
            } else {
                console.error("Error al publicar producto:", await response.text());
            }
        } catch (error) {
            console.error("Error de conexión al publicar producto:", error);
        }
    });

    // Lógica del dropdown de cuenta
    document.getElementById("accountIcon").addEventListener("click", function (event) {
        event.preventDefault();
        document.querySelector(".dropdown").classList.toggle("show");
    });

    // Cerrar dropdown al hacer clic fuera
    window.onclick = function (event) {
        if (!event.target.closest(".dropdown") && !event.target.matches(".material-symbols-outlined")) {
            document.querySelector(".dropdown").classList.remove("show");
        }
    };
});
