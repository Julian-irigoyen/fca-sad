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
            $stmt = $conn->query("SELECT c.*, doc.nombre, doc.apellido_paterno, doc.apellido_materno 
                                 FROM certificados_academicos c 
                                 JOIN docentes doc ON c.id_empleado = doc.id_empleado 
                                 ORDER BY doc.apellido_paterno, doc.apellido_materno, doc.nombre");
            $certificados = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $certificados]);
        } catch (PDOException $e) {
            handleError("Error al obtener certificados: " . $e->getMessage());
        }
        break;

    case 'create':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id_empleado'])) {
                handleError("El ID del empleado es requerido");
            }

            if (empty($data['tipo'])) {
                handleError("El tipo de certificado es requerido");
            }

            if (empty($data['nombre_titulo'])) {
                handleError("El nombre del título es requerido");
            }

            // Check if docente exists
            $stmt = $conn->prepare("SELECT COUNT(*) FROM docentes WHERE id_empleado = ?");
            $stmt->execute([$data['id_empleado']]);
            if ($stmt->fetchColumn() == 0) {
                handleError("El docente no existe");
            }

            $sql = "INSERT INTO certificados_academicos (id_empleado, tipo, nombre_titulo, institucion, anio_obtencion, archivo_pdf) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['id_empleado'],
                $data['tipo'],
                $data['nombre_titulo'],
                $data['institucion'] ?? null,
                $data['anio_obtencion'] ?? null,
                $data['archivo_pdf'] ?? null
            ]);

            echo json_encode(['success' => true, 'message' => 'Certificado creado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al crear certificado: " . $e->getMessage());
        }
        break;

    case 'update':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id_certificado'] ?? null;
            
            if (!$id) {
                handleError("ID de certificado no proporcionado");
            }

            if (empty($data['tipo'])) {
                handleError("El tipo de certificado es requerido");
            }

            if (empty($data['nombre_titulo'])) {
                handleError("El nombre del título es requerido");
            }

            $sql = "UPDATE certificados_academicos SET 
                    tipo = ?, nombre_titulo = ?, institucion = ?, anio_obtencion = ?, archivo_pdf = ? 
                    WHERE id_certificado = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['tipo'],
                $data['nombre_titulo'],
                $data['institucion'] ?? null,
                $data['anio_obtencion'] ?? null,
                $data['archivo_pdf'] ?? null,
                $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Certificado actualizado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al actualizar certificado: " . $e->getMessage());
        }
        break;

    case 'delete':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de certificado no proporcionado");
            }

            $stmt = $conn->prepare("DELETE FROM certificados_academicos WHERE id_certificado = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'message' => 'Certificado eliminado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al eliminar certificado: " . $e->getMessage());
        }
        break;

    case 'get':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de certificado no proporcionado");
            }

            $stmt = $conn->prepare("SELECT c.*, doc.nombre, doc.apellido_paterno, doc.apellido_materno 
                                  FROM certificados_academicos c 
                                  JOIN docentes doc ON c.id_empleado = doc.id_empleado 
                                  WHERE c.id_certificado = ?");
            $stmt->execute([$id]);
            $certificado = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$certificado) {
                handleError("Certificado no encontrado");
            }

            echo json_encode(['success' => true, 'data' => $certificado]);
        } catch (PDOException $e) {
            handleError("Error al obtener certificado: " . $e->getMessage());
        }
        break;

    default:
        handleError("Acción no válida");
}
?> 