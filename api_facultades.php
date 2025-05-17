<?php
require_once 'db.php';
header('Content-Type: application/json');

function handleError($message) {
    http_response_code(400);
    echo json_encode(['error' => $message]);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        try {
            $stmt = $conn->query("SELECT * FROM facultades ORDER BY nombre");
            $facultades = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $facultades]);
        } catch (PDOException $e) {
            handleError("Error al obtener facultades: " . $e->getMessage());
        }
        break;

    case 'create':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['nombre'])) {
                handleError("El nombre de la facultad es requerido");
            }

            // Check for duplicate name
            $stmt = $conn->prepare("SELECT COUNT(*) FROM facultades WHERE nombre = ?");
            $stmt->execute([$data['nombre']]);
            if ($stmt->fetchColumn() > 0) {
                handleError("Ya existe una facultad con ese nombre");
            }

            $stmt = $conn->prepare("INSERT INTO facultades (nombre) VALUES (?)");
            $stmt->execute([$data['nombre']]);

            echo json_encode(['success' => true, 'message' => 'Facultad creada exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al crear facultad: " . $e->getMessage());
        }
        break;

    case 'update':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id_facultad'] ?? null;
            
            if (!$id) {
                handleError("ID de facultad no proporcionado");
            }

            if (empty($data['nombre'])) {
                handleError("El nombre de la facultad es requerido");
            }

            // Check for duplicate name excluding current record
            $stmt = $conn->prepare("SELECT COUNT(*) FROM facultades WHERE nombre = ? AND id_facultad != ?");
            $stmt->execute([$data['nombre'], $id]);
            if ($stmt->fetchColumn() > 0) {
                handleError("Ya existe una facultad con ese nombre");
            }

            $stmt = $conn->prepare("UPDATE facultades SET nombre = ? WHERE id_facultad = ?");
            $stmt->execute([$data['nombre'], $id]);

            echo json_encode(['success' => true, 'message' => 'Facultad actualizada exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al actualizar facultad: " . $e->getMessage());
        }
        break;

    case 'delete':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de facultad no proporcionado");
            }

            // Check if faculty is in use
            $stmt = $conn->prepare("SELECT COUNT(*) FROM docentes WHERE id_facultad = ?");
            $stmt->execute([$id]);
            if ($stmt->fetchColumn() > 0) {
                handleError("No se puede eliminar la facultad porque está asignada a docentes");
            }

            $stmt = $conn->prepare("DELETE FROM facultades WHERE id_facultad = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'message' => 'Facultad eliminada exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al eliminar facultad: " . $e->getMessage());
        }
        break;

    case 'get':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de facultad no proporcionado");
            }

            $stmt = $conn->prepare("SELECT * FROM facultades WHERE id_facultad = ?");
            $stmt->execute([$id]);
            $facultad = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$facultad) {
                handleError("Facultad no encontrada");
            }

            echo json_encode(['success' => true, 'data' => $facultad]);
        } catch (PDOException $e) {
            handleError("Error al obtener facultad: " . $e->getMessage());
        }
        break;

    default:
        handleError("Acción no válida");
}
?> 