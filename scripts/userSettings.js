document.addEventListener("DOMContentLoaded", async function () {
    await fetchUserInfo();
    document.getElementById("confirmButton").addEventListener("click", confirmChanges); // Asegura que el evento se asigne después de cargar el DOM
});

let updatedFields = {}; // Objeto para almacenar campos editados
let newProfilePhotoId = null; // Variable para almacenar el ID de la nueva foto si se actualiza

// Función para obtener la información del usuario
async function fetchUserInfo() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Token no encontrado, redirigiendo a login.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("https://mercadoplus.somee.com/api/account/getUserInfo", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Datos del usuario obtenidos:", data);
            populateProfileFields(data);
        } else {
            console.error("Error al obtener datos del usuario:", response.status);
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

// Función para llenar los campos de perfil
function populateProfileFields(data) {
    document.getElementById("username").value = data.username || "";
    document.getElementById("firstName").value = data.firstName || "";
    document.getElementById("lastName").value = data.lastName || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("currentPassword").value = "";

    if (data.profilePhotoId) {
        downloadProfilePhoto(data.profilePhotoId);
    } else {
        document.getElementById("profilePhoto").src = "";
    }
}

// Función para descargar y mostrar la foto de perfil
async function downloadProfilePhoto(photoId) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`https://mercadoplus.somee.com/api/photos/${photoId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const photoData = await response.json();
            const base64Image = `data:image/jpeg;base64,${photoData.imageData}`;
            document.getElementById("profilePhoto").src = base64Image;
            console.log("Foto de perfil mostrada correctamente.");
        } else {
            console.error("Error al obtener la foto de perfil:", response.status);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

// Función para activar el cuadro de selección de archivos
function triggerFileInput() {
    document.getElementById("fileInput").click();
}

// Función para cargar y convertir la foto de perfil a base64
document.getElementById("fileInput").addEventListener("change", async function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function (e) {
            const base64Image = e.target.result.split(',')[1];
            console.log("Imagen en base64 para subir:", base64Image);
            newProfilePhotoId = await uploadPhotoToAPI(base64Image);

            if (newProfilePhotoId) {
                // Mostrar la imagen cargada en el perfil antes de confirmar
                const imgURL = `data:image/jpeg;base64,${base64Image}`;
                document.getElementById("profilePhoto").src = imgURL;
            }
        };
        reader.readAsDataURL(file);
    }
});

// Función para subir la foto de perfil a la API y obtener el nuevo ID
async function uploadPhotoToAPI(base64Image) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("https://mercadoplus.somee.com/api/photos", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ imageData: base64Image })
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Foto de perfil subida exitosamente. ID de la foto:", result.id);
            return result.id;
        } else {
            console.error("Error al subir la foto de perfil:", response.status);
            return null;
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        return null;
    }
}

// Función para habilitar la edición de un campo específico
function enableEdit(id) {
    const field = document.getElementById(id);
    field.disabled = false;
    field.style.backgroundColor = '#fff';
    field.focus();

    // Almacena el valor editado en el objeto `updatedFields`
    field.addEventListener('input', () => {
        updatedFields[id] = field.value;
    });
}

// Función para confirmar y enviar los cambios
async function confirmChanges() {
    const token = localStorage.getItem("token");

    const username = document.getElementById("username").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("currentPassword").value || updatedFields.password;

    // Si hay un nuevo ID de foto, úsalo; de lo contrario, manten el actual
    const profilePhotoId = newProfilePhotoId || null;

    const requestBody = {
        username,
        firstName,
        lastName,
        email,
        password,
        profilePhotoId
    };

    console.log("Datos a actualizar enviados:", requestBody);

    try {
        const response = await fetch("https://mercadoplus.somee.com/api/account/update", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            console.log("Perfil actualizado exitosamente.");
            alert("Perfil actualizado exitosamente.");
            await fetchUserInfo(); // Refresca los datos del usuario después de actualizar
        } else {
            console.error("Error al actualizar el perfil:", response.status);
            alert("Error al actualizar el perfil.");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("Error de conexión con el servidor.");
    }
}

// Asociar eventos de clic a los botones y elementos interactivos
document.getElementById("confirmButton").addEventListener("click", confirmChanges);
