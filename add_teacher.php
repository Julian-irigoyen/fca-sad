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

// Get form data
$id_empleado = $_POST['id_empleado'];
$nombre = $_POST['nombre'];
$apellido_paterno = $_POST['apellido_paterno'];
$apellido_materno = $_POST['apellido_materno'];
$sexo = $_POST['sexo'];
$fecha_nacimiento = $_POST['fecha_nacimiento'];
$correo = $_POST['correo'];
$telefono = $_POST['telefono'];
$rfc = $_POST['rfc'];
$curp = $_POST['curp'];
$tipo_contratacion = $_POST['tipo_contratacion'];
$tipo_plaza = $_POST['tipo_plaza'];
$fecha_ingreso = $_POST['fecha_ingreso'];
$id_facultad = $_POST['id_facultad'];

// Prepare and execute the insert query
$stmt = $conn->prepare("INSERT INTO docentes (id_empleado, nombre, apellido_paterno, apellido_materno, sexo, fecha_nacimiento, correo, telefono, rfc, curp, tipo_contratacion, tipo_plaza, fecha_ingreso, id_facultad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param("sssssssssssssi", 
    $id_empleado,
    $nombre,
    $apellido_paterno,
    $apellido_materno,
    $sexo,
    $fecha_nacimiento,
    $correo,
    $telefono,
    $rfc,
    $curp,
    $tipo_contratacion,
    $tipo_plaza,
    $fecha_ingreso,
    $id_facultad
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Docente agregado exitosamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al agregar docente: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?> 