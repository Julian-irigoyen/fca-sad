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
