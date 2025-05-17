<?php
session_start();
$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Database connection placeholders
    $db_host = 'localhost';
    $db_user = 'laticsfc_admindocentes';
    $db_pass = 'Laticsfcauach2025*';
    $db_name = 'laticsfc_bdfca';

    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    if ($conn->connect_error) {
        die("Database connection failed: " . $conn->connect_error);
    }

    // Determine which form was submitted
    if (isset($_POST['action']) && $_POST['action'] === 'login') {
        // --- Login Form Handling ---
        $identifier = trim($_POST['username']);
        $password = $_POST['password'];

        // Prepare query to check for user by either id_empleado or email
        $stmt = $conn->prepare("SELECT * FROM usuarios WHERE id_empleado = ? OR email = ?");
        $stmt->bind_param("ss", $identifier, $identifier);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            if (password_verify($password, $user['password_hash'])) {
                // Update last login timestamp
                $update_stmt = $conn->prepare("UPDATE usuarios SET ultimo_login = NOW() WHERE id_usuario = ?");
                $update_stmt->bind_param("i", $user['id_usuario']);
                $update_stmt->execute();
                $update_stmt->close();

                // Redirect based on role
                switch ($user['rol']) {
                    case 'admin':
                        header("Location: adminHome.php");
                        exit;
                    case 'coordinador':
                        header("Location: coordinadorHome.php");
                        exit;
                    case 'docente':
                        header("Location: docenteHome.php");
                        exit;
                    default:
                        $error = "Rol de usuario desconocido.";
                }
            } else {
                $error = "Usuario o contraseña incorrecta.";
            }
        } else {
            $error = "Usuario o contraseña incorrecta.";
        }
        $stmt->close();
    } elseif (isset($_POST['action']) && $_POST['action'] === 'recover') {
        // --- Password Recovery/Change Handling ---
        $identifier = trim($_POST['identifier']);
        $new_password = $_POST['new_password'];
        $confirm_password = $_POST['confirm_password'];

        // Validate new password criteria: minimum 8 characters, at least one number and one symbol
        if (strlen($new_password) < 8 || !preg_match('/\d/', $new_password) || !preg_match('/[^a-zA-Z\d]/', $new_password)) {
            $error = "La contraseña debe tener al menos 8 caracteres, incluir un número y un símbolo.";
        } elseif ($new_password !== $confirm_password) {
            $error = "Las contraseñas no coinciden.";
        } else {
            // Check if user exists with given identifier (id_empleado or email)
            $stmt = $conn->prepare("SELECT * FROM usuarios WHERE id_empleado = ? OR email = ?");
            $stmt->bind_param("ss", $identifier, $identifier);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                $new_hash = password_hash($new_password, PASSWORD_DEFAULT);
                $update_stmt = $conn->prepare("UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?");
                $update_stmt->bind_param("si", $new_hash, $user['id_usuario']);
                if ($update_stmt->execute()) {
                    $success = "Contraseña actualizada exitosamente. (Este feature enviará un email con instrucciones en el futuro.)";
                } else {
                    $error = "Error al actualizar la contraseña.";
                }
                $update_stmt->close();
            } else {
                $error = "No se encontró el usuario.";
            }
            $stmt->close();
        }
    }
    $conn->close();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login</title>
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,500" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="login.css">

  <link rel="icon" href="favicon.ico" type="image/x-icon">
  
  <style>
    /* Simple styles to toggle the visibility of forms */
    .hidden { display: none; }
    .message { color: red; margin-bottom: 1em; }
    .success { color: green; margin-bottom: 1em; }       
  </style>
</head>
<body>
  <div class="login-container">
    <div class="login-card">
      <img src="logo.png" alt="Logo" class="login-logo-placeholder">
      <h1>FCA SAD</h1>
      
      <!-- Display messages -->
      <?php if ($error): ?>
        <div class="message"><?php echo $error; ?></div>
      <?php endif; ?>
      <?php if ($success): ?>
        <div class="success"><?php echo $success; ?></div>
      <?php endif; ?>

      <!-- Login Form -->
      <form method="POST" action="">
        <input type="hidden" name="action" value="login">
        <div class="form-group">
          <label for="username">Usuario (id_empleado o email)</label>
          <input type="text" id="username" name="username" required>
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" name="password" required>
        </div>
        <p class="error-message" style="display: none;">Usuario o contraseña incorrecta</p>
        <button type="submit" class="login-btn">Iniciar Sesión</button>
      </form>

      <p style="text-align:center; margin-top:1em;">
        ¿Olvidaste tu contraseña? <a href="#" id="showRecover">Recupérala aquí</a>
      </p>

      <!-- Password Recovery/Change Form -->
      <form method="POST" action="" id="recoverForm" class="hidden" style="margin-top: 1em;">
        <input type="hidden" name="action" value="recover">
        <div class="form-group">
          <label for="identifier">Identificador (id_empleado o email)</label>
          <input type="text" id="identifier" name="identifier" required>
        </div>
        <div class="form-group">
          <label for="new_password">Nueva Contraseña</label>
          <input type="password" id="new_password" name="new_password" required>
        </div>
        <div class="form-group">
          <label for="confirm_password">Confirmar Nueva Contraseña</label>
          <input type="password" id="confirm_password" name="confirm_password" required>
        </div>
        <p class="helper-text">La contraseña debe tener al menos 8 caracteres, incluir un número y un símbolo.</p>
        <button type="submit" class="login-btn">Actualizar Contraseña</button>
        <p style="text-align:center; margin-top:1em;">
          <a href="#" id="showLogin">Volver al Login</a>
        </p>
      </form>

      <div class="login-credentials">
        Usuario: FCA - Contraseña: SAD
      </div>
      <p class="login-footer">¿Olvidó su contraseña? <a href="#">Recuperar</a></p>
    </div>
  </div>

  <script>
    // Simple JavaScript to toggle between the login and recovery forms
    document.getElementById('showRecover').addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector('form[action=""]').classList.add('hidden'); // hide login form
      document.getElementById('recoverForm').classList.remove('hidden');
    });

    document.getElementById('showLogin').addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('recoverForm').classList.add('hidden');
      // Show the first form (login)
      document.querySelector('form[action=""]').classList.remove('hidden');
    });
  </script>
</body>
</html>
