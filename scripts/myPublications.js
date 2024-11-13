// myPublications.js

document.addEventListener('DOMContentLoaded', () => {
    const publicationsContainer = document.getElementById('publications');
    const editModal = document.getElementById('editModal');
    const closeButton = document.querySelector('.close-button');
    const editPublicationForm = document.getElementById('editPublicationForm');
    const editPhotoPreviewContainer = document.getElementById('editPhotoPreviewContainer');

    let currentEditId = null; // ID de la publicación que se está editando
    let existingPhotos = []; // Array para almacenar las fotos existentes

    // Objetos para almacenar los estados y colores
    const publicationStates = {};
    const productStates = {};
    const colors = {};

    // Función para obtener el token JWT desde localStorage
    function getToken() {
        return localStorage.getItem('token'); // Asegúrate de almacenar el token con la clave 'token'
    }

    // Función para obtener la información del usuario desde el token JWT
    async function getUserInfo(token) {
        try {
            const response = await fetch('https://mercadoplus.somee.com/api/account/getUserInfo', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
                } else {
                    throw new Error('Error al obtener la información del usuario: ' + response.statusText);
                }
            }

            const userInfo = await response.json();
            return userInfo.id; // Asumiendo que el campo del ID del usuario es 'id'
        } catch (error) {
            throw error;
        }
    }

    // Función para obtener todas las publicaciones
    async function fetchAllPublications() {
        const token = getToken();
        if (!token) {
            publicationsContainer.innerHTML = '<p class="error">No se encontró el token de autenticación. Por favor, inicia sesión.</p>';
            return;
        }

        try {
            const response = await fetch('https://mercadoplus.somee.com/api/publications', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
                } else {
                    throw new Error('Error al obtener las publicaciones: ' + response.statusText);
                }
            }

            const publications = await response.json();
            return publications;
        } catch (error) {
            throw error;
        }
    }

    // Función para obtener y mostrar las publicaciones del usuario
    async function fetchMyPublications() {
        const token = getToken();
        if (!token) {
            publicationsContainer.innerHTML = '<p class="error">No se encontró el token de autenticación. Por favor, inicia sesión.</p>';
            return;
        }

        try {
            const userId = await getUserInfo(token);
            if (!userId) {
                publicationsContainer.innerHTML = '<p class="error">No se pudo obtener el ID del usuario desde la información del usuario.</p>';
                return;
            }

            const allPublications = await fetchAllPublications();
            if (!allPublications) {
                publicationsContainer.innerHTML = '<p class="error">No se pudieron obtener las publicaciones.</p>';
                return;
            }

            // Filtrar publicaciones por idUsuario
            const myPublications = allPublications.filter(pub => pub.idUsuario === userId);
            displayPublications(myPublications);
        } catch (error) {
            publicationsContainer.innerHTML = `<p class="error">${error.message}</p>`;
            console.error('Error:', error);
        }
    }

    // Función para mostrar las publicaciones en una tabla
    function displayPublications(publications) {
        if (!Array.isArray(publications) || publications.length === 0) {
            publicationsContainer.innerHTML = '<p>No tienes publicaciones.</p>';
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Estado del Producto</th>
                        <th>Estado de Publicación</th>
                        <th>Color</th>
                        <th>Fotos</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        publications.forEach(pub => {
            // Crear elementos de las fotos
            let photosHTML = '';
            if (pub.photos && pub.photos.length > 0) {
                pub.photos.forEach(photo => {
                    photosHTML += `<img src="data:image/jpeg;base64,${photo.imageData}" alt="Foto de ${pub.title}" class="publication-photo"/> `;
                });
            } else {
                photosHTML = 'Sin fotos';
            }

            tableHTML += `
                <tr>
                    <td>${pub.id}</td>
                    <td>${pub.title}</td>
                    <td>${pub.description || 'Sin descripción'}</td>
                    <td>$${pub.price.toFixed(2)}</td>
                    <td>${pub.stock}</td>
                    <td>${getProductStateName(pub.idProductState)}</td>
                    <td>${getPublicationStateName(pub.idPublicationState)}</td>
                    <td>${getColorName(pub.idColor)}</td>
                    <td>${photosHTML}</td>
                    <td class="actions">
                        <button onclick="openEditModal(${pub.id})">Editar</button>
                        <button onclick="deletePublication(${pub.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        publicationsContainer.innerHTML = tableHTML;
    }

    // Funciones para obtener nombres a partir de IDs
    async function fetchPublicationStatesAndProductStatesAndColors(token) {
        await fetchPublicationStates(token);
        await fetchProductStates(token);
        await fetchColors(token);
    }

    async function fetchPublicationStates(token) {
        try {
            const response = await fetch('https://mercadoplus.somee.com/api/publication-states', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const states = await response.json();
                states.forEach(state => {
                    publicationStates[state.id] = state.name;
                });
            } else {
                console.error('Error al obtener los estados de publicación');
            }
        } catch (error) {
            console.error('Error de conexión al obtener los estados de publicación:', error);
        }
    }

    async function fetchProductStates(token) {
        try {
            const response = await fetch('https://mercadoplus.somee.com/api/product-states', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const states = await response.json();
                states.forEach(state => {
                    productStates[state.id] = state.name;
                });
            } else {
                console.error('Error al obtener los estados del producto');
            }
        } catch (error) {
            console.error('Error de conexión al obtener los estados del producto:', error);
        }
    }

    async function fetchColors(token) {
        try {
            const response = await fetch('https://mercadoplus.somee.com/api/colors', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const colorsData = await response.json();
                colorsData.forEach(color => {
                    colors[color.id] = color.name;
                });
            } else {
                console.error('Error al obtener colores');
            }
        } catch (error) {
            console.error('Error de conexión al obtener colores:', error);
        }
    }

    function getPublicationStateName(id) {
        return publicationStates[id] || `Estado desconocido (${id})`;
    }

    function getProductStateName(id) {
        return productStates[id] || `Estado desconocido (${id})`;
    }

    function getColorName(id) {
        return colors[id] || `Color desconocido (${id})`;
    }

    // Función para abrir el modal de edición
    window.openEditModal = async function(id) {
        const token = getToken();
        if (!token) {
            alert('No se encontró el token de autenticación. Por favor, inicia sesión.');
            return;
        }

        try {
            const response = await fetch(`https://mercadoplus.somee.com/api/publications/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
                } else {
                    throw new Error('Error al obtener la publicación: ' + response.statusText);
                }
            }

            const publication = await response.json();
            currentEditId = publication.id;
            existingPhotos = publication.photos || [];

            // Poblamos los selectores de color
            const editColorSelect = document.getElementById('editColor');
            editColorSelect.innerHTML = ''; // Limpiar opciones previas
            for (const [id, name] of Object.entries(colors)) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = name;
                editColorSelect.appendChild(option);
            }
            editColorSelect.value = publication.idColor;

            // Poblamos los selectores de estado de publicación
            const editPublicationStateSelect = document.getElementById('editPublicationState');
            editPublicationStateSelect.innerHTML = ''; // Limpiar opciones previas
            for (const [id, name] of Object.entries(publicationStates)) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = name;
                editPublicationStateSelect.appendChild(option);
            }
            editPublicationStateSelect.value = publication.idPublicationState;

            // Poblamos los selectores de estado del producto
            const editProductStateSelect = document.getElementById('editProductState');
            editProductStateSelect.innerHTML = ''; // Limpiar opciones previas
            for (const [id, name] of Object.entries(productStates)) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = name;
                editProductStateSelect.appendChild(option);
            }
            editProductStateSelect.value = publication.idProductState;

            // Rellenar el formulario con los datos de la publicación
            document.getElementById('editTitle').value = publication.title;
            document.getElementById('editDescription').value = publication.description;
            document.getElementById('editPrice').value = publication.price;
            document.getElementById('editStock').value = publication.stock;

            // Rellenar las fotos existentes en el modal
            editPhotoPreviewContainer.innerHTML = '';
            existingPhotos.forEach((photo, index) => {
                const img = document.createElement('img');
                img.src = `data:image/jpeg;base64,${photo.imageData}`;
                img.alt = `Foto de ${publication.title}`;
                img.className = 'publication-photo';
                img.dataset.photoId = photo.id; // Suponiendo que cada foto tiene un ID
                editPhotoPreviewContainer.appendChild(img);
            });

            // Abrir el modal
            editModal.style.display = 'block';
        } catch (error) {
            alert(error.message);
            console.error('Error:', error);
        }
    }

    // Función para cerrar el modal
    function closeEditModal() {
        editModal.style.display = 'none';
        currentEditId = null;
        editPublicationForm.reset();
        editPhotoPreviewContainer.innerHTML = '';
    }

    // Manejar el clic en el botón de cerrar
    closeButton.addEventListener('click', closeEditModal);

    // Manejar clic fuera del contenido del modal para cerrarlo
    window.addEventListener('click', function(event) {
        if (event.target === editModal) {
            closeEditModal();
        }
    });

    // Manejar el envío del formulario de edición
    editPublicationForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        if (!currentEditId) {
            alert('No se ha seleccionado ninguna publicación para editar.');
            return;
        }

        const token = getToken();
        if (!token) {
            alert('No se encontró el token de autenticación. Por favor, inicia sesión.');
            return;
        }

        // Obtener los valores del formulario
        const updatedData = {
            title: document.getElementById('editTitle').value,
            description: document.getElementById('editDescription').value,
            price: parseFloat(document.getElementById('editPrice').value),
            stock: parseInt(document.getElementById('editStock').value),
            idColor: parseInt(document.getElementById('editColor').value),
            idPublicationState: parseInt(document.getElementById('editPublicationState').value),
            idProductState: parseInt(document.getElementById('editProductState').value)
            // El campo 'status' ha sido eliminado para evitar duplicidad
        };

        // Opcional: Loguear los datos que se van a enviar para depuración
        console.log('Datos enviados para actualizar la publicación:', updatedData);

        try {
            const response = await fetch(`https://mercadoplus.somee.com/api/publications/${currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                // Intentar obtener el mensaje de error del cuerpo de la respuesta
                let errorMessage = `Error al actualizar la publicación: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMessage = `Error al actualizar la publicación: ${errorData.message}`;
                    }
                } catch (e) {
                    // No se pudo parsear el error como JSON
                }
                throw new Error(errorMessage);
            }

            alert('Publicación actualizada exitosamente.');

            // Ahora manejar la subida de imágenes
            await handleImageUpload();

            closeEditModal();
            fetchMyPublications(); // Refrescar la lista de publicaciones
        } catch (error) {
            alert(error.message);
            console.error('Error:', error);
        }
    });

    // Función para manejar la subida de imágenes
    async function handleImageUpload() {
        const token = getToken();
        if (!token) {
            alert('No se encontró el token de autenticación. Por favor, inicia sesión.');
            return;
        }

        const photoFiles = document.getElementById('editPhotos').files;
        if (photoFiles.length === 0) {
            return; // No hay nuevas fotos para subir
        }

        const uploadPromises = [];

        for (let file of photoFiles) {
            const base64 = await convertFileToBase64(file);
            const imageData = base64.split(',')[1]; // Obtener solo la parte Base64

            const photoData = {
                imageData: imageData
            };

            // Crear la solicitud POST para subir la foto
            const uploadPromise = fetch(`https://mercadoplus.somee.com/api/publications/${currentEditId}/photos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(photoData)
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`Error al subir la foto: ${response.status} ${response.statusText}`);
                }
                return response.json();
            }).then(data => {
                console.log('Foto subida exitosamente:', data);
            }).catch(error => {
                console.error('Error al subir la foto:', error);
                alert(`Error al subir la foto: ${error.message}`);
            });

            uploadPromises.push(uploadPromise);
        }

        // Esperar a que todas las fotos se hayan subido
        await Promise.all(uploadPromises);
    }

    // Función para convertir un archivo a Base64
    function convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Función para eliminar una publicación
    window.deletePublication = async function(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) return;

        const token = getToken();
        if (!token) {
            alert('No se encontró el token de autenticación. Por favor, inicia sesión.');
            return;
        }

        try {
            const response = await fetch(`https://mercadoplus.somee.com/api/publications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // Intentar obtener el mensaje de error del cuerpo de la respuesta
                let errorMessage = `Error al eliminar la publicación: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMessage = `Error al eliminar la publicación: ${errorData.message}`;
                    }
                } catch (e) {
                    // No se pudo parsear el error como JSON
                }
                throw new Error(errorMessage);
            }

            alert('Publicación eliminada exitosamente.');
            fetchMyPublications(); // Refrescar la lista de publicaciones
        } catch (error) {
            alert(error.message);
            console.error('Error:', error);
        }
    }

    // Función para inicializar la obtención de estados y colores, luego las publicaciones
    async function initialize() {
        const token = getToken();
        if (!token) {
            publicationsContainer.innerHTML = '<p class="error">No se encontró el token de autenticación. Por favor, inicia sesión.</p>';
            return;
        }

        try {
            await fetchPublicationStatesAndProductStatesAndColors(token);
            await fetchMyPublications();
        } catch (error) {
            publicationsContainer.innerHTML = `<p class="error">${error.message}</p>`;
            console.error('Error:', error);
        }
    }

    // Inicializar la obtención de publicaciones
    initialize();
});
