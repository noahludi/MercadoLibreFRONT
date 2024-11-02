document.addEventListener("DOMContentLoaded", async function() {
    // Verificación de token
    const token = localStorage.getItem("token");

    if (token) {
        try {
            const response = await fetch("http://mercadoplus.somee.com/api/account/getUserInfo", {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (response.ok) {
                const userData = await response.json();
                document.getElementById("usernameDisplay").textContent = "Bienvenido, " + userData.firstName + "!";
            } else {
                console.error("Error al cargar datos del usuario");
                // Redirige al login si hay un problema de autorización
                //window.location.href = "login.html";
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            //window.location.href = "login.html";
        }
    } else {
        //window.location.href = "login.html";
    }

    // Carrusel de productos
    let currentIndex = 0;
    const productList = document.querySelector('.product-list');
    const products = document.querySelectorAll('.product');
    const totalProducts = products.length;
    const productWidth = products[0].clientWidth;

    // Avanza en el carrusel de productos
    document.querySelector('.carousel-next').addEventListener('click', () => {
        currentIndex++;
        productList.style.transition = 'transform 0.5s ease-in-out';
        productList.style.transform = `translateX(${-currentIndex * productWidth}px)`;

        if (currentIndex >= totalProducts) {
            setTimeout(() => {
                productList.style.transition = 'none';
                currentIndex = 0;
                productList.style.transform = `translateX(0)`;
            }, 500);
        }
    });

    // Retrocede en el carrusel de productos
    document.querySelector('.carousel-prev').addEventListener('click', () => {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = totalProducts - 1;
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

    // Avanza automáticamente en el carrusel de publicidad cada 5 segundos
    setInterval(() => {
        currentAdIndex++;
        if (currentAdIndex >= totalAds) {
            currentAdIndex = 0;
        }
        adList.style.transition = 'transform 0.5s ease-in-out';
        adList.style.transform = `translateX(${-currentAdIndex * ads[0].clientWidth}px)`;
    }, 5000);

    // Control manual de publicidad
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
