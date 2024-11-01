document.addEventListener("DOMContentLoaded", function() {
    // Carrusel de productos
    let currentIndex = 0;
    const productList = document.querySelector('.product-list');
    const products = document.querySelectorAll('.product');
    const totalProducts = products.length;
    const productWidth = products[0].clientWidth;

    // Verifica si los botones de carrusel de productos están siendo detectados
    console.log(document.querySelector('.carousel-next')); 
    console.log(document.querySelector('.carousel-prev')); 

    // Avanza en el carrusel de productos
    document.querySelector('.carousel-next').addEventListener('click', () => {
        console.log("Carrusel productos: Botón Siguiente presionado");
        currentIndex++;
        productList.style.transition = 'transform 0.5s ease-in-out';
        productList.style.transform = `translateX(${-currentIndex * productWidth}px)`;

        if (currentIndex >= totalProducts) {
            setTimeout(() => {
                productList.style.transition = 'none'; 
                currentIndex = 0;
                productList.style.transform = `translateX(0)`; // Vuelve al inicio sin transición visible
            }, 500);
        }
    });

    // Retrocede en el carrusel de productos
    document.querySelector('.carousel-prev').addEventListener('click', () => {
        console.log("Carrusel productos: Botón Previo presionado");
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = totalProducts - 1; // Si retrocede más allá del inicio, vuelve al final
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

    // Avanza automáticamente en el carrusel de publicidad cada 2 segundos
    setInterval(() => {
        currentAdIndex++;
        if (currentAdIndex >= totalAds) {
            currentAdIndex = 0;
        }
        adList.style.transition = 'transform 0.5s ease-in-out';
        adList.style.transform = `translateX(${-currentAdIndex * ads[0].clientWidth}px)`;
    }, 5000); // Cambia cada 2 segundos

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

    // Dropdown para el ícono de cuenta
    document.getElementById('accountIcon').addEventListener('click', function(event) {
        event.preventDefault(); // Evita la recarga de la página al hacer clic
        const dropdown = document.querySelector('.dropdown');
        dropdown.classList.toggle('show'); // Alterna la visibilidad del dropdown
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
});

// Mover la función fuera del DOMContentLoaded para que sea accesible desde el HTML
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
