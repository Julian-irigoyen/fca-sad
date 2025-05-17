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
                                 FROM certificados_prodep p 
                                 JOIN docentes doc ON p.id_empleado = doc.id_empleado 
                                 ORDER BY doc.apellido_paterno, doc.apellido_materno, doc.nombre");
            $prodep = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $prodep]);
        } catch (PDOException $e) {
            handleError("Error al obtener certificados PRODEP: " . $e->getMessage());
        }
        break;

    case 'create':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id_empleado'])) {
                handleError("El ID del empleado es requerido");
            }

            // Check if docente exists
            $stmt = $conn->prepare("SELECT COUNT(*) FROM docentes WHERE id_empleado = ?");
            $stmt->execute([$data['id_empleado']]);
            if ($stmt->fetchColumn() == 0) {
                handleError("El docente no existe");
            }

            $sql = "INSERT INTO certificados_prodep (id_empleado, fecha_fin, archivo_certificado) 
                    VALUES (?, ?, ?)";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['id_empleado'],
                $data['fecha_fin'] ?? null,
                $data['archivo_certificado'] ?? null
            ]);

            echo json_encode(['success' => true, 'message' => 'Certificado PRODEP creado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al crear certificado PRODEP: " . $e->getMessage());
        }
        break;

    case 'update':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id_prodep'] ?? null;
            
            if (!$id) {
                handleError("ID de certificado PRODEP no proporcionado");
            }

            $sql = "UPDATE certificados_prodep SET 
                    fecha_fin = ?, archivo_certificado = ? 
                    WHERE id_prodep = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['fecha_fin'] ?? null,
                $data['archivo_certificado'] ?? null,
                $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Certificado PRODEP actualizado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al actualizar certificado PRODEP: " . $e->getMessage());
        }
        break;

    case 'delete':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de certificado PRODEP no proporcionado");
            }

            $stmt = $conn->prepare("DELETE FROM certificados_prodep WHERE id_prodep = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'message' => 'Certificado PRODEP eliminado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al eliminar certificado PRODEP: " . $e->getMessage());
        }
        break;

    case 'get':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de certificado PRODEP no proporcionado");
            }

            $stmt = $conn->prepare("SELECT p.*, doc.nombre, doc.apellido_paterno, doc.apellido_materno 
                                  FROM certificados_prodep p 
                                  JOIN docentes doc ON p.id_empleado = doc.id_empleado 
                                  WHERE p.id_prodep = ?");
            $stmt->execute([$id]);
            $prodep = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$prodep) {
                handleError("Certificado PRODEP no encontrado");
            }

            echo json_encode(['success' => true, 'data' => $prodep]);
        } catch (PDOException $e) {
            handleError("Error al obtener certificado PRODEP: " . $e->getMessage());
        }
        break;

    default:
        handleError("Acción no válida");
}
?> 