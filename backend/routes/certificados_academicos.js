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
      const [rows] = await db.query('SELECT * FROM certificados_academicos LIMIT ? OFFSET ?', [pageSize, offset]);
      const [count] = await db.query('SELECT COUNT(*) as total FROM certificados_academicos');
      res.json({ data: rows, total: count[0].total });
    } catch {
      res.status(500).json({ error: 'Error al obtener certificados' });
    }
  });

  // Obtener uno
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM certificados_academicos WHERE id_certificado = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(rows[0]);
    } catch {
      res.status(500).json({ error: 'Error al obtener certificado' });
    }
  });

  // Descargar PDF
  router.get('/:id/pdf', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT archivo_pdf FROM certificados_academicos WHERE id_certificado = ?', [req.params.id]);
      if (!rows[0] || !rows[0].archivo_pdf) return res.status(404).json({ error: 'PDF no encontrado' });
      res.setHeader('Content-Type', 'application/pdf');
      res.send(rows[0].archivo_pdf);
    } catch {
      res.status(500).json({ error: 'Error al obtener PDF' });
    }
  });

  // Crear
  router.post('/', upload.single('archivo_pdf'), async (req, res) => {
    const { id_empleado, tipo, nombre_titulo, institucion, anio_obtencion, id_certificado } = req.body;
    if (!id_empleado || !tipo || !nombre_titulo) {
      return res.status(400).json({ error: 'id_empleado, tipo y nombre_titulo son obligatorios' });
    }
    try {
      if (id_certificado) {
        const [existing] = await db.query('SELECT 1 FROM certificados_academicos WHERE id_certificado = ?', [id_certificado]);
        if (existing.length > 0) {
          return res.status(400).json({ error: 'El ID de certificado ya existe' });
        }
      }
      const archivo_pdf = req.file ? req.file.buffer : null;
      const [result] = await db.query(
        `INSERT INTO certificados_academicos (id_empleado, tipo, nombre_titulo, institucion, anio_obtencion, archivo_pdf) VALUES (?, ?, ?, ?, ?, ?)`,
        [id_empleado, tipo, nombre_titulo, institucion, anio_obtencion, archivo_pdf]
      );
      res.json({ id_certificado: result.insertId });
    } catch {
      res.status(500).json({ error: 'Error al crear certificado' });
    }
  });

  // Actualizar
  router.put('/:id', upload.single('archivo_pdf'), async (req, res) => {
    const { tipo, nombre_titulo, institucion, anio_obtencion } = req.body;
    if (!tipo || !nombre_titulo) {
      return res.status(400).json({ error: 'tipo y nombre_titulo son obligatorios' });
    }
    try {
      let query = `UPDATE certificados_academicos SET tipo=?, nombre_titulo=?, institucion=?, anio_obtencion=?`;
      let params = [tipo, nombre_titulo, institucion, anio_obtencion];
      if (req.file) {
        query += `, archivo_pdf=?`;
        params.push(req.file.buffer);
      }
      query += ` WHERE id_certificado=?`;
      params.push(req.params.id);
      await db.query(query, params);
      res.json({ id_certificado: req.params.id });
    } catch {
      res.status(500).json({ error: 'Error al actualizar certificado' });
    }
  });

  // Eliminar
  router.delete('/:id', async (req, res) => {
    try {
      await db.query('DELETE FROM certificados_academicos WHERE id_certificado = ?', [req.params.id]);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar certificado' });
    }
  });

  return router;
}; 