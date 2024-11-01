document.addEventListener("DOMContentLoaded", function() {
    const productName = localStorage.getItem('productName');
    const productPrice = localStorage.getItem('productPrice');
    const productImage = localStorage.getItem('productImage'); // Nuevo: imagen del producto

    document.getElementById('product-name').innerText = productName;
    document.getElementById('product-price').innerText = `Precio: ${productPrice}`;
    document.getElementById('product-image').src = productImage;

    // Mostrar el precio en la sección derecha
    document.getElementById('right-product-price').innerText = productPrice;

    // Generar código QR si se selecciona el método QR
    const methods = document.querySelectorAll('.method');
    methods.forEach(method => {
        method.addEventListener('click', function() {
            methods.forEach(mth => mth.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Manejar el temporizador de 30 minutos
    let time = 1800; // 30 minutos en segundos
    const timerElement = document.getElementById('timer');
    
    function updateTimer() {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        timerElement.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        time--;
        if (time >= 0) {
            setTimeout(updateTimer, 1000);
        } else {
            alert("El tiempo ha expirado. Por favor, intenta nuevamente.");
        }
    }

    updateTimer(); // Iniciar el temporizador

    // Generar QR y manejar el envío del formulario
    document.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        const selectedMethod = document.querySelector('.method.selected');
        if (selectedMethod) {
            const method = selectedMethod.dataset.method;
            if (method === 'qr') {
                const qrContainer = document.getElementById('qr-container');
                qrContainer.innerHTML = ''; // Limpiar contenido anterior
                new QRCode(qrContainer, {
                    text: productName,
                    width: 128,
                    height: 128
                });
                alert('Código QR generado con éxito.');
            } else if (method === 'credit-card') {
                window.location.href = `confirmacion.html?method=${method}&name=${encodeURIComponent(productName)}&price=${encodeURIComponent(productPrice)}&image=${encodeURIComponent(productImage)}`;
            }
        } else {
            alert('Por favor, selecciona un método de pago.');
        }
    });
});
