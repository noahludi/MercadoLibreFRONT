document.addEventListener("DOMContentLoaded", async function () {
    const apiUrl = "https://mercadoplus.somee.com/api";
    const token = localStorage.getItem("token");
    const productId = localStorage.getItem("productId");
    const productName = localStorage.getItem("productName");
    const productPrice = localStorage.getItem("productPrice");
    const productImage = localStorage.getItem("productImage");
    const paymentMethod = localStorage.getItem("paymentMethod");

    if (!token || !productId || !productName || !productPrice) {
        alert("Información insuficiente para realizar la compra.");
        return;
    }

    // Mostrar detalles del producto
    document.getElementById('product-name').innerText = productName;
    document.getElementById('product-price').innerText = `Precio: ${productPrice}`;
    document.getElementById('product-image').src = productImage;

    // Obtener el ID del usuario
    let userId = null;

    async function getUserId() {
        try {
            const response = await fetch(`${apiUrl}/account/getUserInfo`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                userId = userData.id;
                console.log("ID del usuario obtenido:", userId);
            } else {
                console.error("Error al obtener información del usuario.");
            }
        } catch (error) {
            console.error("Error de conexión al obtener información del usuario:", error);
        }
    }

    await getUserId();

    // Función para guardar tarjeta
    async function saveCard() {
        const cardData = {
            cardNumber: document.getElementById("number").value.replace(/\s/g, ''),
            cardholderName: document.getElementById("name").value,
            expirationDate: document.getElementById("date").value,
            cvv: document.getElementById("cvc").value,
            cardTypeId: 1 // Ajusta si el tipo es requerido
        };
        console.log("Datos de la tarjeta:", cardData);
        const response = await fetch(`${apiUrl}/cards`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(cardData)
        });
        if (response.ok) {
            const card = await response.json();
            console.log("Tarjeta guardada con éxito:", card);
            return card.id;
        } else {
            const errorText = await response.text();
            console.error("Error al guardar la tarjeta:", errorText);
            alert("Error al guardar la tarjeta: " + errorText);
            return null;
        }
    }

    // Función para registrar transacción
    async function saveTransaction(cardId) {
        const transactionData = {
            idBuyer: userId,
            idCard: cardId,
            idPublication: parseInt(productId),
            amount: parseFloat(productPrice)
        };
        console.log("Datos de la transacción:", transactionData);
        const response = await fetch(`${apiUrl}/transactions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(transactionData)
        });
        if (response.ok) {
            alert("Compra realizada con éxito.");
            window.location.href = "success.html";
        } else {
            const errorText = await response.text();
            console.error("Error al completar la transacción:", errorText);
            alert("Error al completar la transacción: " + errorText);
        }
    }

    // Manejar el clic en "Buy Now"
    const buyNowButton = document.getElementById("buyNowButton");
    if (buyNowButton) {
        buyNowButton.addEventListener("click", async function (event) {
            event.preventDefault(); // Prevenir envío del formulario
            console.log("Botón 'Buy Now' clickeado.");
            console.log("Método de pago seleccionado:", paymentMethod);
            if (paymentMethod === "credit-card") {
                const cardId = await saveCard();
                if (cardId) {
                    await saveTransaction(cardId);
                }
            } else {
                console.log("Método de pago no es tarjeta de crédito.");
            }
        });
    } else {
        console.error("El botón 'Buy Now' no se encuentra en el DOM.");
    }
});
