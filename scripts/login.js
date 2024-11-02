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

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (!username || !password) {
            console.error("Usuario o contraseña no proporcionados.");
            return;
        }

        if (isRegisterClicked) {
            // Proceso de Registro
            const email = document.getElementById("email").value;
            const dni = document.getElementById("dni").value;
            const firstName = document.getElementById("name").value;
            const lastName = document.getElementById("lastname").value;

            if (!email || !dni || !firstName || !lastName) {
                console.error("Campos de registro faltantes.");
                return;
            }

            const registerData = {
                username: username,
                password: password,
                email: email,
                dni: dni,
                firstName: firstName,
                lastName: lastName
            };

            try {
                const response = await fetch("http://mercadoplus.somee.com/api/account/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(registerData)
                });

                if (response.ok) {
                    alert("Registro exitoso.");
                } else {
                    const error = await response.json();
                    alert("Error en el registro: " + (error.message || "Ocurrió un error en el registro."));
                }
            } catch (error) {
                console.error("Error de conexión:", error);
                alert("Error de conexión con el servidor.");
            }

        } else {
            // Proceso de Login
            const loginData = {
                username: username,
                password: password
            };

            try {
                const response = await fetch("http://mercadoplus.somee.com/api/account/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(loginData)
                });

                if (response.ok) {
                    const result = await response.json();
                    // Almacena el token en localStorage
                    localStorage.setItem("token", result.token);
                    localStorage.setItem("expiration", result.expiration);
                    console.log("Token almacenado en localStorage:", localStorage.getItem("token"));
                    // Redirige a index.html
                    window.location.href = "index.html";
                } else {
                    const error = await response.json();
                    alert("Error en el inicio de sesión: " + (error.message || "Ocurrió un error en el inicio de sesión."));
                }
            } catch (error) {
                console.error("Error de conexión:", error);
                alert("Error de conexión con el servidor.");
            }
        }
    });
});
