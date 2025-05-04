<?php
session_start();

// Database connection
$db_host = 'localhost';
$db_user = 'laticsfc_admindocentes';
$db_pass = 'Laticsfcauach2025*';
$db_name = 'laticsfc_bdfca';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

// Set character set
$conn->set_charset("utf8");

// Get the ID to check
$id_empleado = $_GET['id_empleado'] ?? '';

if (empty($id_empleado)) {
    echo json_encode(['success' => false, 'message' => 'ID de empleado no proporcionado']);
    exit;
}

// Check for duplicates in docentes table
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM docentes WHERE id_empleado = ?");
$stmt->bind_param("s", $id_empleado);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

// Check for duplicates in usuarios table
$stmt2 = $conn->prepare("SELECT COUNT(*) as count FROM usuarios WHERE id_usuario = ?");
$stmt2->bind_param("s", $id_empleado);
$stmt2->execute();
$result2 = $stmt2->get_result();
$row2 = $result2->fetch_assoc();

$isDuplicate = ($row['count'] > 0 || $row2['count'] > 0);

echo json_encode([
    'success' => true,
    'isDuplicate' => $isDuplicate,
    'message' => $isDuplicate ? 'El ID de empleado ya existe en el sistema' : 'ID de empleado disponible'
]);

$stmt->close();
$stmt2->close();
$conn->close();
?> 