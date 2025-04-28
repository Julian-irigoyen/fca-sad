<?php
require_once __DIR__ . '/../includes/db.php';

try {
    $conn = get_db_connection();
    echo '<h2 style="color:green">¡Conexión exitosa a la base de datos!</h2>';
    $conn->close();
} catch (Exception $e) {
    echo '<h2 style="color:red">Error de conexión: ' . htmlspecialchars($e->getMessage()) . '</h2>';
} 