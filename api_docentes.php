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
            $stmt = $conn->query("SELECT d.*, f.nombre as facultad_nombre 
                                 FROM docentes d 
                                 LEFT JOIN facultades f ON d.id_facultad = f.id_facultad 
                                 ORDER BY d.id_empleado");
            $docentes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $docentes]);
        } catch (PDOException $e) {
            handleError("Error al obtener docentes: " . $e->getMessage());
        }
        break;

    case 'create':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            $required = ['id_empleado', 'nombre', 'apellido_paterno', 'apellido_materno', 
                        'sexo', 'fecha_nacimiento', 'correo', 'id_facultad'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    handleError("El campo $field es requerido");
                }
            }

            // Check for duplicate email
            $stmt = $conn->prepare("SELECT COUNT(*) FROM docentes WHERE correo = ?");
            $stmt->execute([$data['correo']]);
            if ($stmt->fetchColumn() > 0) {
                handleError("El correo electrónico ya está registrado");
            }

            $sql = "INSERT INTO docentes (id_empleado, nombre, apellido_paterno, apellido_materno, 
                    sexo, fecha_nacimiento, correo, telefono, rfc, curp, tipo_contratacion, 
                    tipo_plaza, fecha_ingreso, id_facultad) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['id_empleado'],
                $data['nombre'],
                $data['apellido_paterno'],
                $data['apellido_materno'],
                $data['sexo'],
                $data['fecha_nacimiento'],
                $data['correo'],
                $data['telefono'] ?? null,
                $data['rfc'] ?? null,
                $data['curp'] ?? null,
                $data['tipo_contratacion'] ?? null,
                $data['tipo_plaza'] ?? null,
                $data['fecha_ingreso'] ?? date('Y-m-d'),
                $data['id_facultad']
            ]);

            echo json_encode(['success' => true, 'message' => 'Docente creado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al crear docente: " . $e->getMessage());
        }
        break;

    case 'update':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id_empleado'] ?? null;
            
            if (!$id) {
                handleError("ID de empleado no proporcionado");
            }

            // Check for duplicate email excluding current record
            $stmt = $conn->prepare("SELECT COUNT(*) FROM docentes WHERE correo = ? AND id_empleado != ?");
            $stmt->execute([$data['correo'], $id]);
            if ($stmt->fetchColumn() > 0) {
                handleError("El correo electrónico ya está registrado");
            }

            $sql = "UPDATE docentes SET 
                    nombre = ?, apellido_paterno = ?, apellido_materno = ?, 
                    sexo = ?, fecha_nacimiento = ?, correo = ?, telefono = ?, 
                    rfc = ?, curp = ?, tipo_contratacion = ?, tipo_plaza = ?, 
                    fecha_ingreso = ?, id_facultad = ? 
                    WHERE id_empleado = ?";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                $data['nombre'],
                $data['apellido_paterno'],
                $data['apellido_materno'],
                $data['sexo'],
                $data['fecha_nacimiento'],
                $data['correo'],
                $data['telefono'] ?? null,
                $data['rfc'] ?? null,
                $data['curp'] ?? null,
                $data['tipo_contratacion'] ?? null,
                $data['tipo_plaza'] ?? null,
                $data['fecha_ingreso'] ?? null,
                $data['id_facultad'],
                $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Docente actualizado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al actualizar docente: " . $e->getMessage());
        }
        break;

    case 'delete':
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de empleado no proporcionado");
            }

            // Check for related records
            $tables = ['domicilios_docentes', 'certificados_academicos', 'idiomas_docentes', 
                      'certificados_snii', 'certificados_prodep', 'publicaciones_docentes'];
            
            foreach ($tables as $table) {
                $stmt = $conn->prepare("DELETE FROM $table WHERE id_empleado = ?");
                $stmt->execute([$id]);
            }

            // Delete the docente
            $stmt = $conn->prepare("DELETE FROM docentes WHERE id_empleado = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'message' => 'Docente eliminado exitosamente']);
        } catch (PDOException $e) {
            handleError("Error al eliminar docente: " . $e->getMessage());
        }
        break;

    case 'get':
        try {
    $id = $_GET['id'] ?? null;
            if (!$id) {
                handleError("ID de empleado no proporcionado");
            }

            $stmt = $conn->prepare("SELECT d.*, f.nombre as facultad_nombre 
                                  FROM docentes d 
                                  LEFT JOIN facultades f ON d.id_facultad = f.id_facultad 
                                  WHERE d.id_empleado = ?");
            $stmt->execute([$id]);
            $docente = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$docente) {
                handleError("Docente no encontrado");
            }

            echo json_encode(['success' => true, 'data' => $docente]);
        } catch (PDOException $e) {
            handleError("Error al obtener docente: " . $e->getMessage());
        }
        break;

    default:
        handleError("Acción no válida");
}
?> 