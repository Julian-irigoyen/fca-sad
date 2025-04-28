document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("login-form")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Evita el envío del formulario

      // Credenciales de prueba
      const usuarioValido = "admin";
      const contrasenaValida = "1234";

      // Obtiene los valores del formulario
      const usuarioIngresado = document.getElementById("username").value;
      const contrasenaIngresada = document.getElementById("password").value;

      // Verifica las credenciales
      if (
        usuarioIngresado === usuarioValido &&
        contrasenaIngresada === contrasenaValida
      ) {
        alert("Inicio de sesión exitoso");
        window.location.href = "index.php"; // Redirige a home.php
      } else {
        alert("Usuario o contraseña incorrectos");
      }
    });
});
