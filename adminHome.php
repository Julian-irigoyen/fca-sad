<?php
session_start();
// Database connection
$db_host = 'localhost';
$db_user = 'laticsfc_admindocentes';
$db_pass = 'Laticsfcauach2025*';
$db_name = 'laticsfc_bdfca';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>

<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panel de Administración</title>
  <!-- Montserrat Font & Material Icons -->
   
  <link rel="icon" href="favicon.ico" type="image/x-icon">

  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,500" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <script src="https://www.gstatic.com/charts/loader.js"></script>
  <script type="module" src="script.js" defer></script>
  <style>
    /* Modal styles */
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
    }

    .modal-content {
      background-color: #fefefe;
      margin: 2% auto;
      padding: 20px;
      border: 1px solid #888;
      width: 90%;
      max-width: 800px;
      border-radius: 8px;
      position: relative;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .form-scroll {
      overflow-y: auto;
      max-height: calc(90vh - 150px);
      padding-right: 10px;
    }

    .form-scroll::-webkit-scrollbar {
      width: 8px;
    }

    .form-scroll::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    .form-scroll::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    .form-scroll::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    .close {
      color: #aaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
      position: absolute;
      right: 20px;
      top: 10px;
    }

    .close:hover {
      color: black;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .form-group input:invalid,
    .form-group select:invalid {
      border-color: #ff6b6b;
    }

    .form-text {
      display: block;
      font-size: 0.8em;
      color: #666;
      margin-top: 4px;
    }

    .form-actions {
      margin-top: 20px;
      text-align: right;
      padding-top: 15px;
      border-top: 1px solid #ddd;
    }

    .action-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 10px;
    }

    .action-btn.add {
      background-color: #4CAF50;
      color: white;
    }

    .action-btn.save {
      background-color: #2196F3;
      color: white;
    }

    .action-btn.cancel {
      background-color: #f44336;
      color: white;
    }

    .action-btn:hover {
      opacity: 0.9;
    }

    /* Loading indicator styles */
    #loading-indicator {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 10px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <!-- Top horizontal header -->
  <div class="top-header">
    <div class="user-profile">
      <div class="user-avatar">FCA</div>
      <span class="user-name">FCA</span>
    </div>
  </div>
  
  <!-- Header con navegación superior -->
  <header>
    <h1>
      <img src="logo-blanco.png" alt="Logo UACH" class="logo-placeholder">
      <span>FCA SAD</span>
    </h1> 
    <nav id="top-nav" aria-label="Navegación Principal">
      <ul>
        <li><a href="#dashboard" class="active"><i class="material-icons">dashboard</i><span>Dashboard</span></a></li>
        <li><a href="#usuarios"><i class="material-icons">people</i><span>Usuarios</span></a></li>
        <li><a href="#avisos"><i class="material-icons">mail</i><span>Avisos</span></a></li>
        <li><a href="#cumpleanos"><i class="material-icons">cake</i><span>Cumpleaños</span></a></li>
        <li><a href="#configuracion"><i class="material-icons">settings</i><span>Configuración</span></a></li>
        <li><a href="#ayuda"><i class="material-icons">help</i><span>Ayuda</span></a></li>
        <li><a href="#equipo"><i class="material-icons">groups</i><span>Equipo</span></a></li>
      </ul>
    </nav>
    
    <div class="sidebar-footer">
      <a href="#mis-datos" class="sidebar-footer-btn"><i class="material-icons">person</i><span>Mis Datos</span></a>
      <a href="/sad" class="sidebar-footer-btn"><i class="material-icons">exit_to_app</i><span>Cerrar Sesión</span></a>
    </div>
    
    <div class="sidebar-toggle">
      <i class="material-icons">chevron_left</i>
    </div>
  </header>
  <body>
  
  <!-- Área principal de contenido -->
  <main id="content">
    <!-- Sección Dashboard -->
    <section id="dashboard">
      <h2>Dashboard</h2>
      <p>
        Bienvenido al panel de administración. Aquí podrá tener una visión general de la actividad del sistema.
      </p>
      <div class="stats-overview">
        <div class="stat-box">
          <div class="stat-icon">
            <i class="material-icons">person</i>
          </div>
          <div class="stat-content">
            <h3>485</h3>
            <p>Usuarios Totales</p>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" style="width: 78%"></div>
          </div>
          <div class="stat-footer">
            <span>+12% desde el mes pasado</span>
          </div>
        </div>
        
        <div class="stat-box">
          <div class="stat-icon">
            <i class="material-icons">assessment</i>
          </div>
          <div class="stat-content">
            <h3>126</h3>
            <p>Reportes Nuevos</p>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" style="width: 45%"></div>
          </div>
          <div class="stat-footer">
            <span>+5% desde ayer</span>
          </div>
        </div>
        
        <div class="stat-box">
          <div class="stat-icon">
            <i class="material-icons">trending_up</i>
          </div>
          <div class="stat-content">
            <h3>92%</h3>
            <p>Tasa de Éxito</p>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" style="width: 92%"></div>
          </div>
          <div class="stat-footer">
            <span>+2% desde la semana pasada</span>
          </div>
        </div>
      </div>
      
      <div class="card-container">
        <div class="card chart-card">
          <h3>Actividad de Usuarios</h3>
          <div id="user-activity-chart" class="chart-container"></div>
        </div>
        
        <div class="card chart-card">
          <h3>Distribución de Reportes</h3>
          <div id="reports-distribution-chart" class="chart-container"></div>
        </div>
      </div>
      
      <div class="card-container">
        <div class="card chart-card">
          <h3>Rendimiento del Sistema</h3>
          <div id="system-performance-chart" class="chart-container"></div>
        </div>
        
        <div class="card chart-card">
          <h3>Usuarios Activos por Hora</h3>
          <div id="active-users-hourly-chart" class="chart-container"></div>
        </div>
      </div>
    </section>
    
    <!-- Sección Usuarios -->
    <section id="usuarios">
      <h2>Administrar Usuarios</h2>
      <p>
        Gestione la información y permisos de los usuarios registrados.
      </p>
      <div class="card" aria-label="Lista de Docentes">
        <h3>Lista de Docentes</h3>
        <button type="button" id="add-teacher-btn" class="action-btn add" style="margin-bottom: 20px;">
          <i class="material-icons">person_add</i> Dar de Alta a un Docente
        </button>

        <!-- Modal para agregar docente -->
        <div id="add-teacher-modal" class="modal" style="display: none;">
          <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Agregar Nuevo Docente</h2>
            <div id="loading-indicator" style="display: none;">
              <div class="spinner"></div>
              <p>Procesando...</p>
            </div>
            <form id="add-teacher-form" action="add_teacher.php" method="POST">
              <div class="form-scroll">
                <div class="form-group">
                  <label for="curp">CURP:</label>
                  <input type="text" id="curp" name="curp" required maxlength="18" pattern="^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$" 
                         onchange="extractInfoFromCURP(this.value)" 
                         title="Formato: 4 letras, 6 números, 1 letra (H/M), 5 letras, 2 alfanuméricos">
                  <small class="form-text">Ejemplo: XXXX000000HXXXXX00</small>
                </div>
                <div class="form-group">
                  <label for="rfc">RFC:</label>
                  <input type="text" id="rfc" name="rfc" required maxlength="13" pattern="^[A-Z]{4}[0-9]{6}[A-Z0-9]{3}$"
                         title="Formato: 4 letras, 6 números, 3 alfanuméricos">
                  <small class="form-text">Ejemplo: XXXX000000XXX</small>
                </div>
                <div class="form-group">
                  <label for="id_empleado">ID Empleado:</label>
                  <input type="text" id="id_empleado" name="id_empleado" required>
                </div>
                <div class="form-group">
                  <label for="nombre">Nombre:</label>
                  <input type="text" id="nombre" name="nombre" required>
                </div>
                <div class="form-group">
                  <label for="apellido_paterno">Apellido Paterno:</label>
                  <input type="text" id="apellido_paterno" name="apellido_paterno" required>
                </div>
                <div class="form-group">
                  <label for="apellido_materno">Apellido Materno:</label>
                  <input type="text" id="apellido_materno" name="apellido_materno" required>
                </div>
                <div class="form-group">
                  <label for="sexo">Sexo:</label>
                  <select id="sexo" name="sexo" required>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="fecha_nacimiento">Fecha de Nacimiento:</label>
                  <input type="date" id="fecha_nacimiento" name="fecha_nacimiento" required>
                </div>
                <div class="form-group">
                  <label for="correo">Correo:</label>
                  <input type="email" id="correo" name="correo" required>
                </div>
                <div class="form-group">
                  <label for="telefono">Teléfono:</label>
                  <input type="tel" id="telefono" name="telefono" required pattern="[0-9]{10}" title="Ingrese 10 dígitos">
                </div>
                <div class="form-group">
                  <label for="tipo_contratacion">Tipo de Contratación:</label>
                  <select id="tipo_contratacion" name="tipo_contratacion" required>
                    <option value="Tiempo Completo">Tiempo Completo</option>
                    <option value="Medio Tiempo">Medio Tiempo</option>
                    <option value="Por Hora">Por Hora</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="tipo_plaza">Tipo de Plaza:</label>
                  <select id="tipo_plaza" name="tipo_plaza" required>
                    <option value="Base">Base</option>
                    <option value="Interino">Interino</option>
                    <option value="Temporal">Temporal</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="fecha_ingreso">Fecha de Ingreso:</label>
                  <input type="date" id="fecha_ingreso" name="fecha_ingreso" required>
                </div>
                <div class="form-group">
                  <label for="facultad">Facultad:</label>
                  <select id="facultad" name="id_facultad" required>
                    <option value="1">Facultad de Contaduría y Administración</option>
                    <option value="2">Facultad de Economía Internacional</option>
                    <option value="3">Facultad de Informática</option>
                    <option value="4">Facultad de Ciencias Políticas y Sociales</option>
                    <option value="5">Facultad de Ciencias Químicas</option>
                    <option value="6">Facultad de Ingeniería</option>
                    <option value="7">Facultad de Medicina y Ciencias Biomédicas</option>
                    <option value="8">Facultad de Odontología</option>
                    <option value="9">Facultad de Enfermería y Nutriología</option>
                    <option value="10">Facultad de Filosofía y Letras</option>
                    <option value="11">Facultad de Artes</option>
                    <option value="12">Facultad de Ciencias de la Cultura Física</option>
                    <option value="13">Facultad de Zootecnia y Ecología</option>
                    <option value="14">Facultad de Ciencias Agrícolas y Forestales</option>
                    <option value="15">Facultad de Medicina Veterinaria y Zootecnia</option>
                  </select>
                </div>
              </div>
              <div class="form-actions">
                <button type="submit" class="action-btn save">Guardar</button>
                <button type="button" class="action-btn cancel" onclick="closeModal()">Cancelar</button>
              </div>
            </form>
          </div>
        </div>

        <div class="table-search-container">
          <input type="text" id="user-search" placeholder="Buscar usuario por nombre, correo, RFC...">
          <button type="button" id="search-btn"><i class="material-icons">search</i> Buscar</button>
        </div>
        <div class="table-container">
        <?php
          // Query to get all docentes with all requested fields
          $query = "SELECT id_empleado, nombre, apellido_paterno, apellido_materno, sexo, fecha_nacimiento, correo, telefono, rfc, curp, 
                    tipo_contratacion, tipo_plaza, fecha_ingreso, id_facultad 
                    FROM docentes 
                    ORDER BY id_empleado";
          $result = $conn->query($query);

          if ($result) {
              echo '<table class="data-table">
                      <thead>
                          <tr>
                              <th>ID Empleado</th>
                              <th>Nombre</th>
                              <th>Apellido Paterno</th>
                              <th>Apellido Materno</th>
                              <th>Sexo</th>
                              <th>Fecha Nacimiento</th>
                              <th>Correo</th>
                              <th>Teléfono</th>
                              <th>RFC</th>
                              <th>CURP</th>
                              <th>Tipo Contratación</th>
                              <th>Tipo Plaza</th>
                              <th>Fecha Ingreso</th>
                              <th>ID Facultad</th>
                              <th>Editar</th>
                              <th>Eliminar</th>
                          </tr>
                      </thead>
                      <tbody>';

              while ($row = $result->fetch_assoc()) {
                  echo '<tr>
                          <td>'.htmlspecialchars($row['id_empleado']).'</td>
                          <td>'.htmlspecialchars($row['nombre']).'</td>
                          <td>'.htmlspecialchars($row['apellido_paterno']).'</td>
                          <td>'.htmlspecialchars($row['apellido_materno']).'</td>
                          <td>'.htmlspecialchars($row['sexo']).'</td>
                          <td>'.htmlspecialchars($row['fecha_nacimiento']).'</td>
                          <td>'.htmlspecialchars($row['correo']).'</td>
                          <td>'.htmlspecialchars($row['telefono']).'</td>
                          <td>'.htmlspecialchars($row['rfc']).'</td>
                          <td>'.htmlspecialchars($row['curp']).'</td>
                          <td>'.htmlspecialchars($row['tipo_contratacion']).'</td>
                          <td>'.htmlspecialchars($row['tipo_plaza']).'</td>
                          <td>'.htmlspecialchars($row['fecha_ingreso']).'</td>
                          <td>'.htmlspecialchars($row['id_facultad']).'</td>
                          <td>
                              <button class="action-btn edit" data-id="'.htmlspecialchars($row['id_empleado']).'">
                                  Editar
                              </button>
                          </td>
                          <td>
                              <button class="action-btn delete" data-id="'.htmlspecialchars($row['id_empleado']).'">
                                  Eliminar
                              </button>
                          </td>
                      </tr>';
              }

              echo '</tbody></table>';
          } else {
              echo '<p class="error-message">Error al cargar los docentes: ' . $conn->error . '</p>';
          }
          ?> 
          <div id="usuarios">
          </div>
        </div>
      </div>
    </section>
    

    <!-- Sección envio de Correos/Avisos -->
    <section id="avisos">
      <div class="container mt-4">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Enviar Aviso a Docentes</h4>
          </div>
          <div class="card-body">
            <form action="enviar.php" method="POST">
              <div class="mb-3">
                <label for="nombre" class="form-label">Nombre del remitente:</label>
                <input type="text" class="form-control" name="nombre" id="nombre" placeholder="Ej. Coordinación FCA" required>
              </div>
              <div class="mb-3">
                <label for="correos" class="form-label">Correos de los docentes:</label>
                <input type="text" class="form-control" name="correos" id="correos" placeholder="Separar con comas" required>
                <div class="form-text">Ej: docente1@fca.edu.mx, docente2@fca.edu.mx</div>
              </div>
              <div class="mb-3">
                <label for="mensaje" class="form-label">Mensaje del aviso:</label>
                <textarea class="form-control" name="mensaje" id="mensaje" rows="6" placeholder="Escribe aquí el contenido del aviso..." required></textarea>
              </div>
              <button type="submit" class="btn btn-success w-100">Enviar Aviso</button>
            </form>
          </div>
        </div>
      </div>
    </section>


    <!-- Sección Cumpleaños -->
    <section id="cumpleanos">
      <h2>Próximos Cumpleaños</h2>
      <p>
        Visualice los próximos cumpleaños de los usuarios registrados.
      </p>
      <div class="card" aria-label="Lista de Cumpleaños">
        <h3>Cumpleaños del Mes</h3>
        <div class="birthdays-container">
          <div id="current-month" class="birthday-month active">
            <h4>Cumpleaños de este mes</h4>
            <div id="current-month-birthdays" class="birthday-list"></div>
          </div>
          <div id="next-month" class="birthday-month">
            <h4>Cumpleaños del próximo mes</h4>
            <div id="next-month-birthdays" class="birthday-list"></div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Sección Configuración -->
    <section id="configuracion">
      <h2>Configuración</h2>
      <p>
        Ajuste las opciones del sistema según sus necesidades.
      </p>
      <div class="card" aria-label="Configuración General">
        <h3>Configuración General</h3>
        <form>
          <div class="form-group">
            <label for="system-name">Nombre del Sistema:</label>
            <input type="text" id="system-name" name="system-name" placeholder="Ingrese el nombre del sistema">
          </div>
          <div class="form-group">
            <label for="admin-email">Email del Administrador:</label>
            <input type="email" id="admin-email" name="admin-email" placeholder="admin@example.com">
          </div>
          <button type="submit">Guardar Cambios</button>
        </form>
      </div>
    </section>
    
    <!-- Sección Ayuda -->
    <section id="ayuda">
      <h2>Ayuda</h2>
      <p>
        Encuentre respuestas a sus preguntas o contacte al soporte para obtener asistencia.
      </p>
      <div class="card" aria-label="Preguntas Frecuentes">
        <h3>Preguntas Frecuentes</h3>
        <p>
          ... contenido de ayuda ...
        </p>
      </div>
    </section>

    <!-- Sección Equipo -->
    <section id="equipo">
      <h2>Equipo</h2>
      <p>
        Conoce a nuestro equipo de liderazgo.
      </p>
      <div class="team-container">
        <div class="team-card card" aria-label="Julián Irigoyen, CEO">
          <svg width="50" height="50" viewBox="0 0 100 100" role="img" aria-label="Avatar de Julián Irigoyen">
            <circle cx="50" cy="50" r="45" fill="var(--light-color)" />
            <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" fill="var(--dark-color)" font-size="30">JI</text>
          </svg>
          <h3>Julián Irigoyen</h3>
          <p>CEO</p>
        </div>
        <div class="team-card card" aria-label="Axel Rose, COO">
          <svg width="50" height="50" viewBox="0 0 100 100" role="img" aria-label="Avatar de Axel Rose">
            <circle cx="50" cy="50" r="45" fill="var(--light-color)" />
            <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" fill="var(--dark-color)" font-size="30">AR</text>
          </svg>
          <h3>Axel Rose</h3>
          <p>COO</p>
        </div>
        <div class="team-card card" aria-label="Joan Castillo, CIO">
          <svg width="50" height="50" viewBox="0 0 100 100" role="img" aria-label="Avatar de Joan Castillo">
            <circle cx="50" cy="50" r="45" fill="var(--light-color)" />
            <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" fill="var(--dark-color)" font-size="30">JC</text>
          </svg>
          <h3>Joan Castillo</h3>
          <p>CIO</p>
        </div>
        <div class="team-card card" aria-label="Alex Alvidrez, CFO">
          <svg width="50" height="50" viewBox="0 0 100 100" role="img" aria-label="Avatar de Alex Alvidrez">
            <circle cx="50" cy="50" r="45" fill="var(--light-color)" />
            <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" fill="var(--dark-color)" font-size="30">AA</text>
          </svg>
          <h3>Alex Alvidrez</h3>
          <p>CFO</p>
        </div>
        <div class="team-card card" aria-label="Miriam Rivera, CMO">
          <svg width="50" height="50" viewBox="0 0 100 100" role="img" aria-label="Avatar de Miriam Rivera">
            <circle cx="50" cy="50" r="45" fill="var(--light-color)" />
            <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" fill="var(--dark-color)" font-size="30">MR</text>
          </svg>
          <h3>Miriam Rivera</h3>
          <p>CMO</p>
        </div>
        <div class="team-card card" aria-label="Pedro Aranada, CAO">
          <svg width="50" height="50" viewBox="0 0 100 100" role="img" aria-label="Avatar de Pedro Aranada">
            <circle cx="50" cy="50" r="45" fill="var(--light-color)" />
            <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" fill="var(--dark-color)" font-size="30">PA</text>
          </svg>
          <h3>Pedro Aranada</h3>
          <p>CAO</p>
        </div>
      </div>
    </section>
    
    <!-- Sección Mis Datos -->
    <section id="mis-datos" class="hidden">
      <h2>Mis Datos</h2>
      <p>
        Gestione su información personal y preferencias de cuenta.
      </p>
      <div class="card">
        <h3>Información Personal</h3>
        <form>
          <div class="form-group">
            <label for="user-name">Nombre Completo:</label>
            <input type="text" id="user-name" name="user-name" value="Admin Usuario">
          </div>
          <div class="form-group">
            <label for="user-email">Email:</label>
            <input type="email" id="user-email" name="user-email" value="admin@example.com">
          </div>
          <div class="form-group">
            <label for="user-password">Nueva Contraseña:</label>
            <input type="password" id="user-password" name="user-password">
          </div>
          <div class="form-group">
            <label for="user-password-confirm">Confirmar Contraseña:</label>
            <input type="password" id="user-password-confirm" name="user-password-confirm">
          </div>
          <button type="submit">Actualizar Datos</button>
        </form>
      </div>
    </section>
  </main>
</body>
  <!-- Footer -->
  <footer>
    <p>&copy; 2023 Panel de Administración. Todos los derechos reservados.</p>
  </footer>
  <script>
    // Modal functionality
    const modal = document.getElementById('add-teacher-modal');
    const btn = document.getElementById('add-teacher-btn');
    const span = document.getElementsByClassName('close')[0];
    const loadingIndicator = document.getElementById('loading-indicator');

    btn.onclick = function() {
      modal.style.display = "block";
    }

    span.onclick = function() {
      modal.style.display = "none";
    }

    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }

    function closeModal() {
      modal.style.display = "none";
    }

    // Function to extract information from CURP
    function extractInfoFromCURP(curp) {
      if (curp.length !== 18) return;

      // Extract sex from CURP (position 10)
      const sex = curp.charAt(10);
      document.getElementById('sexo').value = sex === 'H' ? 'M' : 'F';

      // Extract birth date from CURP (positions 4-9)
      const year = curp.substring(4, 6);
      const month = curp.substring(6, 8);
      const day = curp.substring(8, 10);
      
      // Determine century (19xx or 20xx)
      const fullYear = parseInt(year) > 50 ? '19' + year : '20' + year;
      
      // Set the date
      const birthDate = `${fullYear}-${month}-${day}`;
      document.getElementById('fecha_nacimiento').value = birthDate;

      // Extract first letter of first surname (position 0)
      const firstSurname = curp.charAt(0);
      // Extract first letter of second surname (position 1)
      const secondSurname = curp.charAt(1);
      // Extract first letter of name (position 2)
      const name = curp.charAt(2);

      // If RFC is empty, generate it from CURP
      const rfcInput = document.getElementById('rfc');
      if (!rfcInput.value) {
        rfcInput.value = curp.substring(0, 10) + curp.substring(11, 13);
      }
    }

    // Form validation
    function validateForm() {
      const form = document.getElementById('add-teacher-form');
      const inputs = form.querySelectorAll('input[required], select[required]');
      let isValid = true;

      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.classList.add('invalid');
          isValid = false;
        } else {
          input.classList.remove('invalid');
        }
      });

      return isValid;
    }

    // Check for duplicate ID
    let idCheckTimeout;
    const idEmpleadoInput = document.getElementById('id_empleado');
    const idEmpleadoFeedback = document.createElement('div');
    idEmpleadoFeedback.className = 'form-text';
    idEmpleadoInput.parentNode.appendChild(idEmpleadoFeedback);

    idEmpleadoInput.addEventListener('input', function() {
      clearTimeout(idCheckTimeout);
      const id = this.value.trim();
      
      if (id.length > 0) {
        idCheckTimeout = setTimeout(() => {
          fetch(`check_duplicate.php?id_empleado=${encodeURIComponent(id)}`)
            .then(response => response.json())
            .then(data => {
              if (data.isDuplicate) {
                idEmpleadoInput.classList.add('invalid');
                idEmpleadoFeedback.textContent = data.message;
                idEmpleadoFeedback.style.color = '#dc3545';
              } else {
                idEmpleadoInput.classList.remove('invalid');
                idEmpleadoFeedback.textContent = data.message;
                idEmpleadoFeedback.style.color = '#28a745';
              }
            })
            .catch(error => {
              console.error('Error:', error);
              idEmpleadoFeedback.textContent = 'Error al verificar el ID';
              idEmpleadoFeedback.style.color = '#dc3545';
            });
        }, 500); // Debounce for 500ms
      } else {
        idEmpleadoFeedback.textContent = '';
      }
    });

    // Form submission handling
    document.getElementById('add-teacher-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!validateForm()) {
        alert('Por favor, complete todos los campos requeridos correctamente.');
        return;
      }

      // Check if ID is duplicate before submitting
      const idEmpleado = idEmpleadoInput.value.trim();
      const isDuplicate = idEmpleadoInput.classList.contains('invalid');
      
      if (isDuplicate) {
        alert('Por favor, ingrese un ID de empleado válido y único.');
        return;
      }

      const formData = new FormData(this);
      loadingIndicator.style.display = 'flex';
      
      fetch('add_teacher.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        loadingIndicator.style.display = 'none';
        if (data.success) {
          alert('Docente agregado exitosamente');
          closeModal();
          location.reload(); // Reload the page to show the new teacher
        } else {
          alert('Error al agregar docente: ' + data.message);
        }
      })
      .catch(error => {
        loadingIndicator.style.display = 'none';
        console.error('Error:', error);
        alert('Error al procesar la solicitud');
      });
    });

    // Add input validation on blur
    document.querySelectorAll('input[required], select[required]').forEach(input => {
      input.addEventListener('blur', function() {
        if (!this.value.trim()) {
          this.classList.add('invalid');
        } else {
          this.classList.remove('invalid');
        }
      });
    });
  </script>
</body>
</html>