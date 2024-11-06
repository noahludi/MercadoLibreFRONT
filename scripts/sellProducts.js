document.addEventListener("DOMContentLoaded", async function() {
    const token = localStorage.getItem("token");

    // Cargar opciones dinámicas para selects desde la API
    async function loadOptions(endpoint, selectId) {
        try {
            const response = await fetch(endpoint, {
                headers
                : {
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
    loadOptions("/api/product-states", "idProductState");
    loadOptions("/api/publication-states", "idPublicationState");
    loadOptions("/api/colors", "idColor");

    // Manejar el envío del formulario
    document.getElementById("sellProductForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        const formData = {
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            price: parseFloat(document.getElementById("price").value),
            idProductState: parseInt(document.getElementById("idProductState").value),
            idPublicationState: parseInt(document.getElementById("idPublicationState").value),
            idColor: parseInt(document.getElementById("idColor").value),
            stock: parseInt(document.getElementById("stock").value)
        };

        try {
            const response = await fetch("/api/publications", {
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
                console.error("Error al publicar producto:", response.status);
            }
        } catch (error) {
            console.error("Error de conexión al publicar producto:", error);
        }
    });

    // Lógica del dropdown de cuenta
    document.getElementById("accountIcon").addEventListener("click", function(event) {
        event.preventDefault();
        document.querySelector(".dropdown").classList.toggle("show");
    });

    // Cerrar dropdown al hacer clic fuera
    window.onclick = function(event) {
        if (!event.target.closest(".dropdown") && !event.target.matches(".material-symbols-outlined")) {
            document.querySelector(".dropdown").classList.remove("show");
        }
    };
});
