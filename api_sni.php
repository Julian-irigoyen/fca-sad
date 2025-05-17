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
            $stmt = $conn->query("SELECT s.*, doc.nombre, doc.apellido_paterno, doc.apellido_materno 
                                 FROM certificados_snii s 
                                 JOIN docentes doc ON s.id_empleado = doc.id_empleado 
                                 ORDER BY doc.apellido_paterno, doc.apellido_materno, doc.nombre");
            $sni = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $sni]);
        } catch (PDOException $e) {
            handleError("Error al obtener certificados SNI: " . $e->getMessage());
        }
        break;

    case 'create':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id_empleado'])) {
                handleError("El ID del empleado es requerido");
            }

            if (empty($data['nivel'])) {
                handleError("El nivel es requerido");
            }

            // Check if docente exists
            $stmt = $conn->prepare("SELECT COUNT(*) FROM docentes WHERE id_empleado = ?");
            $stmt->execute([$data['id_empleado']]);
            if ($stmt->fetchColumn() == 0) {
                handleError("El docente no existe");
            }

            $sql = "INSERT INTO certificados_snii (id_empleado, nivel, fecha_certificacion, archivo_certificado) 
                    VALUES (?, ?, ?, ?)";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['id_empleado'],
                $data['nivel'],
                $data['fecha_certificacion'] ?? null,
                $data['archivo_certificado'] ?? null
            ]);

            echo json_encode(['success' => true, 'message' => 'Certificado SNI creado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al crear certificado SNI: " . $e->getMessage());
        }
        break;

    case 'update':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id_snii'] ?? null;
            
            if (!$id) {
                handleError("ID de certificado SNI no proporcionado");
            }

            if (empty($data['nivel'])) {
                handleError("El nivel es requerido");
            }

            $sql = "UPDATE certificados_snii SET 
                    nivel = ?, fecha_certificacion = ?, archivo_certificado = ? 
                    WHERE id_snii = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['nivel'],
                $data['fecha_certificacion'] ?? null,
                $data['archivo_certificado'] ?? null,
                $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Certificado SNI actualizado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al actualizar certificado SNI: " . $e->getMessage());
        }
        break;

    case 'delete':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de certificado SNI no proporcionado");
            }

            $stmt = $conn->prepare("DELETE FROM certificados_snii WHERE id_snii = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'message' => 'Certificado SNI eliminado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al eliminar certificado SNI: " . $e->getMessage());
        }
        break;

    case 'get':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de certificado SNI no proporcionado");
            }

            $stmt = $conn->prepare("SELECT s.*, doc.nombre, doc.apellido_paterno, doc.apellido_materno 
                                  FROM certificados_snii s 
                                  JOIN docentes doc ON s.id_empleado = doc.id_empleado 
                                  WHERE s.id_snii = ?");
            $stmt->execute([$id]);
            $sni = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$sni) {
                handleError("Certificado SNI no encontrado");
            }

            echo json_encode(['success' => true, 'data' => $sni]);
        } catch (PDOException $e) {
            handleError("Error al obtener certificado SNI: " . $e->getMessage());
        }
        break;

    default:
        handleError("Acción no válida");
}
?> 