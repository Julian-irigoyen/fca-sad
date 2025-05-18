import express from 'express';
import multer from 'multer';
const router = express.Router();
const upload = multer();

export default (db) => {
  // Listar
  router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 25;
    const offset = (page - 1) * pageSize;
    try {
      const [rows] = await db.query('SELECT * FROM publicaciones_docentes LIMIT ? OFFSET ?', [pageSize, offset]);
      const [count] = await db.query('SELECT COUNT(*) as total FROM publicaciones_docentes');
      res.json({ data: rows, total: count[0].total });
    } catch {
      res.status(500).json({ error: 'Error al obtener publicaciones' });
    }
  });

  // Obtener uno
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM publicaciones_docentes WHERE id_publicacion = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(rows[0]);
    } catch {
      res.status(500).json({ error: 'Error al obtener publicación' });
    }
  });

  // Descargar PDF
  router.get('/:id/pdf', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT archivo_pdf FROM publicaciones_docentes WHERE id_publicacion = ?', [req.params.id]);
      if (!rows[0] || !rows[0].archivo_pdf) return res.status(404).json({ error: 'PDF no encontrado' });
      res.setHeader('Content-Type', 'application/pdf');
      res.send(rows[0].archivo_pdf);
    } catch {
      res.status(500).json({ error: 'Error al obtener PDF' });
    }
  });

  // Crear
  router.post('/', upload.single('archivo_pdf'), async (req, res) => {
    const { id_empleado, tipo, titulo, fecha_publicacion, revista_o_editorial, id_publicacion } = req.body;
    if (!id_empleado || !tipo || !titulo) {
      return res.status(400).json({ error: 'id_empleado, tipo y titulo son obligatorios' });
    }
    try {
      if (id_publicacion) {
        const [existing] = await db.query('SELECT 1 FROM publicaciones_docentes WHERE id_publicacion = ?', [id_publicacion]);
        if (existing.length > 0) {
          return res.status(400).json({ error: 'El ID de publicación ya existe' });
        }
      }
      const archivo_pdf = req.file ? req.file.buffer : null;
      const fields = ['id_empleado', 'tipo', 'titulo', 'fecha_publicacion', 'revista_o_editorial', 'archivo_pdf'];
      const values = [id_empleado, tipo, titulo, fecha_publicacion || null, revista_o_editorial || null, archivo_pdf];
      const [result] = await db.query(
        `INSERT INTO publicaciones_docentes (${fields.join(',')}) VALUES (?,?,?,?,?,?)`, values
      );
      res.json({ id_publicacion: result.insertId });
    } catch {
      res.status(500).json({ error: 'Error al crear publicación' });
    }
  });

  // Actualizar
  router.put('/:id', upload.single('archivo_pdf'), async (req, res) => {
    const { tipo, titulo, fecha_publicacion, revista_o_editorial } = req.body;
    if (!tipo || !titulo) {
      return res.status(400).json({ error: 'tipo y titulo son obligatorios' });
    }
    try {
      let query = `UPDATE publicaciones_docentes SET tipo=?, titulo=?, fecha_publicacion=?, revista_o_editorial=?`;
      let params = [tipo, titulo, fecha_publicacion || null, revista_o_editorial || null];
      if (req.file) {
        query += `, archivo_pdf=?`;
        params.push(req.file.buffer);
      }
      query += ` WHERE id_publicacion=?`;
      params.push(req.params.id);
      await db.query(query, params);
      res.json({ id_publicacion: req.params.id });
    } catch {
      res.status(500).json({ error: 'Error al actualizar publicación' });
    }
  });

  // Eliminar
  router.delete('/:id', async (req, res) => {
    try {
      await db.query('DELETE FROM publicaciones_docentes WHERE id_publicacion = ?', [req.params.id]);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar publicación' });
    }
  });

  return router;
}; 