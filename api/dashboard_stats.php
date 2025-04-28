<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/db.php';

$conn = get_db_connection();

// Recibir filtros por POST (ejemplo, puedes expandir esto)
$filters = json_decode(file_get_contents('php://input'), true);

$where = [];
$params = [];

// Ejemplo de filtro por rol (puedes expandir para otros filtros)
if (!empty($filters['rol'])) {
    $where[] = "usuarios.rol = '" . $conn->real_escape_string($filters['rol']) . "'";
}

$where_sql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

// Total de usuarios
$total_usuarios_sql = "SELECT COUNT(*) as total FROM usuarios $where_sql";
$total_usuarios_result = $conn->query($total_usuarios_sql);
$total_usuarios = $total_usuarios_result->fetch_assoc()['total'];

// Usuarios por sexo (relación usuarios-docentes)
$usuarios_por_sexo_sql = "SELECT d.sexo, COUNT(*) as total FROM usuarios u JOIN docentes d ON u.id_emple = d.id_emple $where_sql GROUP BY d.sexo";
$usuarios_por_sexo_result = $conn->query($usuarios_por_sexo_sql);
$usuarios_por_sexo = [];
while ($row = $usuarios_por_sexo_result->fetch_assoc()) {
    $usuarios_por_sexo[$row['sexo']] = $row['total'];
}

// Puedes agregar más estadísticas aquí...

$response = [
    'total_usuarios' => $total_usuarios,
    'usuarios_por_sexo' => $usuarios_por_sexo,
    // ... más estadísticas
];

$conn->close();
echo json_encode($response); 