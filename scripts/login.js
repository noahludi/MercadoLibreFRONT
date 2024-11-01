document.addEventListener('DOMContentLoaded', function() {
    const registerLink = document.getElementById('registerLink');
    const additionalFields = document.getElementById('additionalFields');
    const submitButton = document.getElementById('submitButton');
    const loginForm = document.querySelector("form");
    let isRegisterClicked = false;

    // Muestra u oculta los campos adicionales para registro
    registerLink.addEventListener('click', function(event) {
        event.preventDefault();

        if (!isRegisterClicked) {
            additionalFields.style.height = additionalFields.scrollHeight + 'px';
            additionalFields.style.opacity = 1;
            submitButton.textContent = 'Registrarse'; 
            registerLink.textContent = 'Iniciar Sesión'; 
            isRegisterClicked = true;
        } else {
            additionalFields.style.height = '0px';
            additionalFields.style.opacity = 0;
            submitButton.textContent = 'Iniciar Sesión'; 
            registerLink.textContent = 'Registrate'; 
            isRegisterClicked = false;
        }
    });

    // Maneja el envío del formulario para login o registro
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const usernameElement = document.getElementById("username");
        const passwordElement = document.getElementById("password");

        if (!usernameElement || !passwordElement) {
            console.error("Elementos de login no encontrados.");
            return;
        }

        const username = usernameElement.value;
        const password = passwordElement.value;

        if (isRegisterClicked) {
            const emailElement = document.getElementById("email");
            const dniElement = document.getElementById("dni");
            const nameElement = document.getElementById("name");
            const lastnameElement = document.getElementById("lastname");

            if (!emailElement || !dniElement || !nameElement || !lastnameElement) {
                console.error("Elementos de registro no encontrados.");
                return;
            }

            const email = emailElement.value;
            const dni = dniElement.value;
            const firstName = nameElement.value;
            const lastName = lastnameElement.value;

            const registerData = {
                username: username,
                password: password,
                email: email,
                dni: dni,
                firstName: firstName,
                lastName: lastName
            };

            try {
                const response = await fetch("http://localhost:5142/api/account/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    mode: "no-cors", // Ajuste temporal para evitar problemas de CORS
                    body: JSON.stringify(registerData)
                });

                if (response.ok) {
                    alert("Registro exitoso.");
                } else {
                    alert("Error en el registro.");
                }
            } catch (error) {
                console.error("Error de conexión:", error);
                alert("Error de conexión con el servidor.");
            }

        } else {
            const loginData = {
                username: username,
                password: password
            };

            try {
                const response = await fetch("http://localhost:5142/api/account/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    mode: "no-cors", // Ajuste temporal para evitar problemas de CORS
                    body: JSON.stringify(loginData)
                });

                if (response.ok) {
                    alert("Inicio de sesión exitoso.");
                } else {
                    alert("Error en el inicio de sesión.");
                }
            } catch (error) {
                console.error("Error de conexión:", error);
                alert("Error de conexión con el servidor.");
            }
        }
    });
});
