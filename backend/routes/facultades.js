import express from 'express';
const router = express.Router();

export default (db) => {
  // Listar
  router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 25;
    const offset = (page - 1) * pageSize;
    try {
      const [rows] = await db.query('SELECT * FROM facultades LIMIT ? OFFSET ?', [pageSize, offset]);
      const [count] = await db.query('SELECT COUNT(*) as total FROM facultades');
      res.json({ data: rows, total: count[0].total });
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener facultades' });
    }
  });

  // Obtener uno
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM facultades WHERE id_facultad = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(rows[0]);
    } catch {
      res.status(500).json({ error: 'Error al obtener facultad' });
    }
  });

  // Crear
  router.post('/', async (req, res) => {
    const { nombre, id_facultad } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    try {
      if (id_facultad) {
        const [existing] = await db.query('SELECT 1 FROM facultades WHERE id_facultad = ?', [id_facultad]);
        if (existing.length > 0) {
          return res.status(400).json({ error: 'El ID de facultad ya existe' });
        }
      }
      const [result] = await db.query('INSERT INTO facultades (nombre) VALUES (?)', [nombre]);
      res.json({ id_facultad: result.insertId, nombre });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'El nombre de la facultad ya existe' });
      } else {
        res.status(500).json({ error: 'Error al crear facultad' });
      }
    }
  });

  // Actualizar
  router.put('/:id', async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    try {
      await db.query('UPDATE facultades SET nombre = ? WHERE id_facultad = ?', [nombre, req.params.id]);
      res.json({ id_facultad: req.params.id, nombre });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'El nombre de la facultad ya existe' });
      } else {
        res.status(500).json({ error: 'Error al actualizar facultad' });
      }
    }
  });

  // Eliminar
  router.delete('/:id', async (req, res) => {
    try {
      await db.query('DELETE FROM facultades WHERE id_facultad = ?', [req.params.id]);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar facultad' });
    }
  });

  return router;
}; 