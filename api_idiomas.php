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
            $stmt = $conn->query("SELECT i.*, doc.nombre, doc.apellido_paterno, doc.apellido_materno 
                                 FROM idiomas_docentes i 
                                 JOIN docentes doc ON i.id_empleado = doc.id_empleado 
                                 ORDER BY doc.apellido_paterno, doc.apellido_materno, doc.nombre");
            $idiomas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $idiomas]);
        } catch (PDOException $e) {
            handleError("Error al obtener idiomas: " . $e->getMessage());
        }
        break;

    case 'create':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id_empleado'])) {
                handleError("El ID del empleado es requerido");
            }

            if (empty($data['idioma'])) {
                handleError("El idioma es requerido");
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

            $sql = "INSERT INTO idiomas_docentes (id_empleado, idioma, nivel, certificado, archivo_certificado) 
                    VALUES (?, ?, ?, ?, ?)";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['id_empleado'],
                $data['idioma'],
                $data['nivel'],
                $data['certificado'] ?? null,
                $data['archivo_certificado'] ?? null
            ]);

            echo json_encode(['success' => true, 'message' => 'Idioma creado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al crear idioma: " . $e->getMessage());
        }
        break;

    case 'update':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id_idioma'] ?? null;
            
            if (!$id) {
                handleError("ID de idioma no proporcionado");
            }

            if (empty($data['idioma'])) {
                handleError("El idioma es requerido");
            }

            if (empty($data['nivel'])) {
                handleError("El nivel es requerido");
            }

            $sql = "UPDATE idiomas_docentes SET 
                    idioma = ?, nivel = ?, certificado = ?, archivo_certificado = ? 
                    WHERE id_idioma = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['idioma'],
                $data['nivel'],
                $data['certificado'] ?? null,
                $data['archivo_certificado'] ?? null,
                $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Idioma actualizado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al actualizar idioma: " . $e->getMessage());
        }
        break;

    case 'delete':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de idioma no proporcionado");
            }

            $stmt = $conn->prepare("DELETE FROM idiomas_docentes WHERE id_idioma = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'message' => 'Idioma eliminado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al eliminar idioma: " . $e->getMessage());
        }
        break;

    case 'get':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de idioma no proporcionado");
            }

            $stmt = $conn->prepare("SELECT i.*, doc.nombre, doc.apellido_paterno, doc.apellido_materno 
                                  FROM idiomas_docentes i 
                                  JOIN docentes doc ON i.id_empleado = doc.id_empleado 
                                  WHERE i.id_idioma = ?");
            $stmt->execute([$id]);
            $idioma = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$idioma) {
                handleError("Idioma no encontrado");
            }

            echo json_encode(['success' => true, 'data' => $idioma]);
        } catch (PDOException $e) {
            handleError("Error al obtener idioma: " . $e->getMessage());
        }
        break;

    default:
        handleError("Acción no válida");
}
?> 