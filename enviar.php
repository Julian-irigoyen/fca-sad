<?php
function mostrarResultado($mensaje, $exito = true) {
    $color = $exito ? "#2ecc71" : "#e74c3c";
    echo <<<HTML
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Resultado del envío</title>
        <meta http-equiv="refresh" content="15;url=/proyecto2.0/home.php#avisos">
        <link rel="stylesheet" href="enviar.css">
    </head>
    <body>
        <div class="resultado-container">
            <h2 style="color: $color;">$mensaje</h2>
            <p>Serás redirigido automáticamente a la página principal en unos segundos...</p>
            <a class="boton-regresar" href="/proyecto2.0/home.php#avisos">Volver a la página principal</a>
        </div>
    </body>
    </html>
    HTML;
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = htmlspecialchars($_POST['nombre']);
    $correos_input = $_POST['correos'];
    $mensaje = htmlspecialchars($_POST['mensaje']);

    $lista_correos = array_map('trim', explode(',', $correos_input));
    $lista_correos_validos = array_filter($lista_correos, function($correo) {
        return filter_var($correo, FILTER_VALIDATE_EMAIL);
    });

    if (count($lista_correos_validos) > 0) {
        $tu_correo = "saduach01@gmail.com";
        $asunto = "Aviso Institucional - SAD - FCA";

        $mensaje_para_docente = "Estimado/a docente,\n\nHa recibido un nuevo aviso del Sistema de Administración a Docentes (SAD):\n\n--------------------------------------\n$mensaje\n--------------------------------------\n\nAtentamente,\n$nombre\nFacultad de Contaduría y Administración\n";

        $headers = "From: $tu_correo\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

        $fallos = [];

        foreach ($lista_correos_validos as $destino) {
            if (!mail($destino, $asunto, $mensaje_para_docente, $headers)) {
                $fallos[] = $destino;
            }
        }

        // Copia de respaldo para el administrador
        $asunto_admin = "Confirmación de envío de aviso";
        $contenido_admin = "Has enviado el siguiente aviso:\n\nRemitente: $nombre\nDestinatarios: " . implode(', ', $lista_correos_validos) . "\n\nMensaje:\n$mensaje";
        mail($tu_correo, $asunto_admin, $contenido_admin, $headers);

        if (empty($fallos)) {
            mostrarResultado("Aviso enviado correctamente a todos los destinatarios.");
        } else {
            $lista_fallos = implode(', ', $fallos);
            mostrarResultado("Aviso enviado, pero hubo errores con: $lista_fallos", false);
        }
    } else {
        mostrarResultado("No se proporcionaron correos válidos.", false);
    }
}
?>
