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
            $stmt = $conn->query("SELECT p.*, doc.nombre, doc.apellido_paterno, doc.apellido_materno 
                                 FROM publicaciones_docentes p 
                                 JOIN docentes doc ON p.id_empleado = doc.id_empleado 
                                 ORDER BY doc.apellido_paterno, doc.apellido_materno, doc.nombre");
            $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $publicaciones]);
        } catch (PDOException $e) {
            handleError("Error al obtener publicaciones: " . $e->getMessage());
        }
        break;

    case 'create':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id_empleado'])) {
                handleError("El ID del empleado es requerido");
            }

            if (empty($data['tipo'])) {
                handleError("El tipo de publicación es requerido");
            }

            if (empty($data['titulo'])) {
                handleError("El título es requerido");
            }

            // Check if docente exists
            $stmt = $conn->prepare("SELECT COUNT(*) FROM docentes WHERE id_empleado = ?");
            $stmt->execute([$data['id_empleado']]);
            if ($stmt->fetchColumn() == 0) {
                handleError("El docente no existe");
            }

            $sql = "INSERT INTO publicaciones_docentes (id_empleado, tipo, titulo, fecha_publicacion, revista_o_editorial, archivo_pdf) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['id_empleado'],
                $data['tipo'],
                $data['titulo'],
                $data['fecha_publicacion'] ?? null,
                $data['revista_o_editorial'] ?? null,
                $data['archivo_pdf'] ?? null
            ]);

            echo json_encode(['success' => true, 'message' => 'Publicación creada exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al crear publicación: " . $e->getMessage());
        }
        break;

    case 'update':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id_publicacion'] ?? null;
            
            if (!$id) {
                handleError("ID de publicación no proporcionado");
            }

            if (empty($data['tipo'])) {
                handleError("El tipo de publicación es requerido");
            }

            if (empty($data['titulo'])) {
                handleError("El título es requerido");
            }

            $sql = "UPDATE publicaciones_docentes SET 
                    tipo = ?, titulo = ?, fecha_publicacion = ?, revista_o_editorial = ?, archivo_pdf = ? 
                    WHERE id_publicacion = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['tipo'],
                $data['titulo'],
                $data['fecha_publicacion'] ?? null,
                $data['revista_o_editorial'] ?? null,
                $data['archivo_pdf'] ?? null,
                $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Publicación actualizada exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al actualizar publicación: " . $e->getMessage());
        }
        break;

    case 'delete':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de publicación no proporcionado");
            }

            $stmt = $conn->prepare("DELETE FROM publicaciones_docentes WHERE id_publicacion = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'message' => 'Publicación eliminada exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al eliminar publicación: " . $e->getMessage());
        }
        break;

    case 'get':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de publicación no proporcionado");
            }

            $stmt = $conn->prepare("SELECT p.*, doc.nombre, doc.apellido_paterno, doc.apellido_materno 
                                  FROM publicaciones_docentes p 
                                  JOIN docentes doc ON p.id_empleado = doc.id_empleado 
                                  WHERE p.id_publicacion = ?");
            $stmt->execute([$id]);
            $publicacion = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$publicacion) {
                handleError("Publicación no encontrada");
            }

            echo json_encode(['success' => true, 'data' => $publicacion]);
        } catch (PDOException $e) {
            handleError("Error al obtener publicación: " . $e->getMessage());
        }
        break;

    default:
        handleError("Acción no válida");
}
?> 