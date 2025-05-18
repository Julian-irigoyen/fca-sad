import express from 'express';
const router = express.Router();

export default (db) => {
  // Listar
  router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 25;
    const offset = (page - 1) * pageSize;
    try {
      const [rows] = await db.query('SELECT * FROM domicilios_docentes LIMIT ? OFFSET ?', [pageSize, offset]);
      const [count] = await db.query('SELECT COUNT(*) as total FROM domicilios_docentes');
      res.json({ data: rows, total: count[0].total });
    } catch {
      res.status(500).json({ error: 'Error al obtener domicilios' });
    }
  });

  // Obtener uno
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM domicilios_docentes WHERE id_empleado = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(rows[0]);
    } catch {
      res.status(500).json({ error: 'Error al obtener domicilio' });
    }
  });

  // Crear
  router.post('/', async (req, res) => {
    const { id_empleado } = req.body;
    if (!id_empleado) return res.status(400).json({ error: 'El id_empleado es obligatorio' });
    try {
      const [existing] = await db.query('SELECT 1 FROM domicilios_docentes WHERE id_empleado = ?', [id_empleado]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'El ID de empleado ya tiene domicilio registrado' });
      }
      const fields = ['id_empleado', 'calle', 'numero', 'colonia', 'ciudad', 'estado', 'codigo_postal'];
      const values = fields.map(f => req.body[f] || null);
      const [result] = await db.query(
        `INSERT INTO domicilios_docentes (${fields.join(',')}) VALUES (?,?,?,?,?,?,?)`, values
      );
      res.json({ id_empleado });
    } catch (err) {
      res.status(500).json({ error: 'Error al crear domicilio' });
    }
  });

  // Actualizar
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const fields = ['calle', 'numero', 'colonia', 'ciudad', 'estado', 'codigo_postal'];
      const updates = fields.map(f => `${f} = ?`).join(', ');
      const values = fields.map(f => req.body[f] || null);
      await db.query(`UPDATE domicilios_docentes SET ${updates} WHERE id_empleado = ?`, [...values, id]);
      res.json({ id_empleado: id });
    } catch {
      res.status(500).json({ error: 'Error al actualizar domicilio' });
    }
  });

  // Eliminar
  router.delete('/:id', async (req, res) => {
    try {
      await db.query('DELETE FROM domicilios_docentes WHERE id_empleado = ?', [req.params.id]);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar domicilio' });
    }
  });

  return router;
}; 