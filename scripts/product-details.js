document.addEventListener('DOMContentLoaded', function() {
    // Dropdown para el ícono de cuenta
    console.log("Escuchando el clic en el icono de la cuenta...");
    document.getElementById('accountIcon').addEventListener('click', function(event) {
        event.preventDefault(); // Evita la recarga de la página al hacer clic
        console.log("Se hizo clic en el icono de la cuenta.");
        
        // En lugar de aplicar la clase al dropdown-content, aplicamos al dropdown principal
        const dropdown = document.querySelector('.dropdown');
        dropdown.classList.toggle('show'); // Alterna la visibilidad del dropdown
        console.log("Dropdown visibility toggled.");
    });

    // Cerrar el dropdown si se hace clic fuera de él
    window.onclick = function(event) {
        if (!event.target.closest('.dropdown') && !event.target.matches('#accountIcon, .material-symbols-outlined')) {
            const dropdown = document.querySelector('.dropdown');
            if (dropdown.classList.contains('show')) {
                console.log("Cerrando el dropdown.");
                dropdown.classList.remove('show');
            }
        }
    };

    // Obtener los detalles del producto desde localStorage
    console.log("Cargando detalles del producto desde localStorage...");
    const name = localStorage.getItem('productName');
    const memory = localStorage.getItem('productMemory');
    const ram = localStorage.getItem('productRam');
    const screen = localStorage.getItem('productScreen');
    const camera = localStorage.getItem('productCamera');
    const battery = localStorage.getItem('productBattery');
    const image = localStorage.getItem('productImage');
    const price = localStorage.getItem('productPrice');

    // Verificar si los valores de los productos están cargados
    console.log(`Producto: ${name}, Precio: ${price}`);

    // Mostrar los detalles del producto en la página
    document.querySelector('.product-info h1').textContent = name ? name : 'Producto no disponible';
    document.querySelector('.product-info h2').textContent = price ? price : 'Precio no disponible';
    document.querySelector('.product-features').innerHTML = `
        <li>${memory ? memory : 'N/A'}</li>
        <li>${ram ? ram : 'N/A'}</li>
        <li>${screen ? screen : 'N/A'}</li>
        <li>${camera ? camera : 'N/A'}</li>
        <li>${battery ? battery : 'N/A'}</li>
    `;
    document.querySelector('.product-image img').src = image ? image : 'resources/default-image.jpg';

    // Redirección al checkout
    const buyNowButton = document.querySelector('.buy-now-button');
    buyNowButton.addEventListener('click', function() {
        if (price) {
            // Redirigir al checkout con el precio y el nombre del producto
            console.log(`Redirigiendo al checkout con el precio: ${price}`);
            window.location.href = `checkout.html?amount=${price}`;
        } else {
            console.log("No hay precio disponible para redirigir al checkout.");
        }
    });
});
