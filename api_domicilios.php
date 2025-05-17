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
            $stmt = $conn->query("SELECT d.*, doc.nombre, doc.apellido_paterno, doc.apellido_materno 
                                 FROM domicilios_docentes d 
                                 JOIN docentes doc ON d.id_empleado = doc.id_empleado 
                                 ORDER BY doc.apellido_paterno, doc.apellido_materno, doc.nombre");
            $domicilios = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $domicilios]);
        } catch (PDOException $e) {
            handleError("Error al obtener domicilios: " . $e->getMessage());
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

            // Check if domicilio already exists for this docente
            $stmt = $conn->prepare("SELECT COUNT(*) FROM domicilios_docentes WHERE id_empleado = ?");
            $stmt->execute([$data['id_empleado']]);
            if ($stmt->fetchColumn() > 0) {
                handleError("Este docente ya tiene un domicilio registrado");
            }

            $sql = "INSERT INTO domicilios_docentes (id_empleado, calle, numero, colonia, ciudad, estado, codigo_postal) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['id_empleado'],
                $data['calle'] ?? null,
                $data['numero'] ?? null,
                $data['colonia'] ?? null,
                $data['ciudad'] ?? null,
                $data['estado'] ?? null,
                $data['codigo_postal'] ?? null
            ]);

            echo json_encode(['success' => true, 'message' => 'Domicilio creado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al crear domicilio: " . $e->getMessage());
        }
        break;

    case 'update':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id_empleado'] ?? null;
            
            if (!$id) {
                handleError("ID de empleado no proporcionado");
            }

            // Check if domicilio exists
            $stmt = $conn->prepare("SELECT COUNT(*) FROM domicilios_docentes WHERE id_empleado = ?");
            $stmt->execute([$id]);
            if ($stmt->fetchColumn() == 0) {
                handleError("No existe un domicilio para este docente");
            }

            $sql = "UPDATE domicilios_docentes SET 
                    calle = ?, numero = ?, colonia = ?, ciudad = ?, estado = ?, codigo_postal = ? 
                    WHERE id_empleado = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['calle'] ?? null,
                $data['numero'] ?? null,
                $data['colonia'] ?? null,
                $data['ciudad'] ?? null,
                $data['estado'] ?? null,
                $data['codigo_postal'] ?? null,
                $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Domicilio actualizado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al actualizar domicilio: " . $e->getMessage());
        }
        break;

    case 'delete':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de empleado no proporcionado");
            }

            $stmt = $conn->prepare("DELETE FROM domicilios_docentes WHERE id_empleado = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'message' => 'Domicilio eliminado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al eliminar domicilio: " . $e->getMessage());
        }
        break;

    case 'get':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de empleado no proporcionado");
            }

            $stmt = $conn->prepare("SELECT d.*, doc.nombre, doc.apellido_paterno, doc.apellido_materno 
                                  FROM domicilios_docentes d 
                                  JOIN docentes doc ON d.id_empleado = doc.id_empleado 
                                  WHERE d.id_empleado = ?");
            $stmt->execute([$id]);
            $domicilio = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$domicilio) {
                handleError("Domicilio no encontrado");
            }

            echo json_encode(['success' => true, 'data' => $domicilio]);
        } catch (PDOException $e) {
            handleError("Error al obtener domicilio: " . $e->getMessage());
        }
        break;

    default:
        handleError("Acción no válida");
}
?> 