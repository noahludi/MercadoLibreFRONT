document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    const apiUrl = "https://mercadoplus.somee.com/api"; // URL base de la API

    // Verificar si el usuario está autenticado
    if (!token) {
        alert("Debe iniciar sesión para publicar un producto.");
        window.location.href = "login.html"; // Redirigir a la página de inicio de sesión si no hay token
        return;
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
    await loadOptions("categories", "idCategory"); // Cargar categorías
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
            idCategoria: document.getElementById("idCategory") ? parseInt(document.getElementById("idCategory").value) : 0,
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

    // Nota: La lógica del navbar ha sido eliminada, ya que ahora se maneja en navbar.js
});
