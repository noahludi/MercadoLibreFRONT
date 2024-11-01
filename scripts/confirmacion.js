document.addEventListener("DOMContentLoaded", function() {
    // Obtener los datos del producto desde localStorage
    const productName = localStorage.getItem('productName');
    const productPrice = localStorage.getItem('productPrice');
    const productImage = localStorage.getItem('productImage');
  
    // Verificar si los datos están disponibles
    if (productName && productPrice && productImage) {
        // Mostrar los detalles del producto en la página de confirmación
        document.getElementById('product-name').innerText = productName;
        document.getElementById('product-price').innerText = `Precio: ${productPrice}`;
        document.getElementById('product-image').src = productImage;
    }

    // Formatear el campo "Valid Thru"
    document.getElementById("date").addEventListener("input", function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remover cualquier carácter que no sea dígito
        if (value.length > 2) {
            e.target.value = value.substring(0, 2) + "/" + value.substring(2, 4); // Formato MM/YY
        } else {
            e.target.value = value;
        }
    });

    // Formatear el número de tarjeta con espacios cada 4 dígitos
    document.getElementById("number").addEventListener("input", function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remover cualquier carácter que no sea dígito
        value = value.substring(0, 19); // Limitar a 16 dígitos
        let formattedValue = value.replace(/(.{4})/g, '$1 '); // Agregar un espacio cada 4 dígitos
        e.target.value = formattedValue.trim(); // Asignar el valor formateado al campo
    });

    // Limitar el CVV a 4 dígitos
    document.getElementById("cvc").addEventListener("input", function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4); // Solo números y máximo 4 dígitos
    });
});
