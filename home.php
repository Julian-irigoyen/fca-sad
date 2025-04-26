<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panel de Administración</title>
  <!-- Montserrat Font & Material Icons -->
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,500" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  
  <link rel="icon" href="favicon.ico" type="image/x-icon">

  <link rel="stylesheet" href="style.css">
  <script src="https://www.gstatic.com/charts/loader.js"></script>
  <script type="module" src="script.js" defer></script>
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
        <li><a href="#avisos"><i class="material-icons">email</i><span>Envio de Avisos</span></a></li>
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
      <div class="card" aria-label="Lista de Usuarios">
        <h3>Lista de Usuarios</h3>
        <div class="table-search-container">
          <input type="text" id="user-search" placeholder="Buscar usuario por nombre, correo, RFC...">
          <button type="button" id="search-btn"><i class="material-icons">search</i> Buscar</button>
        </div>
        <div class="table-container">
          <div id="usuarios"></div>
        </div>
      </div>
    </section>

    <!-- Sección Avisos -->
<section id="avisos">
  <h2>Envio de Avisos</h2>
  <p>
    Utiliza este formulario para enviar avisos importantes a los docentes.
  </p>
  <div class="card" aria-label="Formulario de Avisos">
    <h3>Formulario de Envío</h3>
    <form action="enviar.php" method="POST">
      <div class="form-group">
        <label for="nombre">Nombre del remitente:</label>
        <input type="text" id="nombre" name="nombre" placeholder="Ej. Coordinación FCA" required>
      </div>
      <div class="form-group">
        <label for="correos">Correos de los docentes:</label>
        <input type="text" id="correos" name="correos" placeholder="Separar con comas" required>
        <small>Ej: docente1@fca.edu.mx, docente2@fca.edu.mx</small>
      </div>
      <div class="form-group">
        <label for="mensaje">Mensaje del aviso:</label>
        <textarea id="mensaje" name="mensaje" rows="6" placeholder="Escribe aquí el contenido del aviso..." required></textarea>
      </div>
      <button type="submit" class="btn btn-success">Enviar Aviso</button>
    </form>
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
</body>
</html>