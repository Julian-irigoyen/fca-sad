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
      const [rows] = await db.query('SELECT * FROM certificados_snii LIMIT ? OFFSET ?', [pageSize, offset]);
      const [count] = await db.query('SELECT COUNT(*) as total FROM certificados_snii');
      res.json({ data: rows, total: count[0].total });
    } catch {
      res.status(500).json({ error: 'Error al obtener certificados SNI' });
    }
  });

  // Obtener uno
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM certificados_snii WHERE id_snii = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(rows[0]);
    } catch {
      res.status(500).json({ error: 'Error al obtener certificado SNI' });
    }
  });

  // Descargar PDF
  router.get('/:id/pdf', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT archivo_certificado FROM certificados_snii WHERE id_snii = ?', [req.params.id]);
      if (!rows[0] || !rows[0].archivo_certificado) return res.status(404).json({ error: 'PDF no encontrado' });
      res.setHeader('Content-Type', 'application/pdf');
      res.send(rows[0].archivo_certificado);
    } catch {
      res.status(500).json({ error: 'Error al obtener PDF' });
    }
  });

  // Crear
  router.post('/', upload.any(), async (req, res) => {
    const { id_empleado, nivel, fecha_certificacion, id_snii } = req.body;
    if (!id_empleado || !nivel) {
      return res.status(400).json({ error: 'id_empleado y nivel son obligatorios' });
    }
    try {
      if (id_snii) {
        const [existing] = await db.query('SELECT 1 FROM certificados_snii WHERE id_snii = ?', [id_snii]);
        if (existing.length > 0) {
          return res.status(400).json({ error: 'El ID de SNI ya existe' });
        }
      }
      const archivo = req.files?.find(f => f.fieldname === 'archivo_certificado' || f.fieldname === 'archivo_pdf');
      const archivo_certificado = archivo ? archivo.buffer : null;
      const fields = ['id_empleado', 'nivel', 'fecha_certificacion', 'archivo_certificado'];
      const values = [id_empleado, nivel, fecha_certificacion || null, archivo_certificado];
      const [result] = await db.query(
        `INSERT INTO certificados_snii (${fields.join(',')}) VALUES (?,?,?,?)`, values
      );
      res.json({ id_snii: result.insertId });
    } catch {
      res.status(500).json({ error: 'Error al crear certificado SNI' });
    }
  });

  // Actualizar
  router.put('/:id', upload.any(), async (req, res) => {
    const { nivel, fecha_certificacion } = req.body;
    if (!nivel) {
      return res.status(400).json({ error: 'nivel es obligatorio' });
    }
    try {
      let query = `UPDATE certificados_snii SET nivel=?, fecha_certificacion=?`;
      let params = [nivel, fecha_certificacion || null];
      const archivo = req.files?.find(f => f.fieldname === 'archivo_certificado' || f.fieldname === 'archivo_pdf');
      if (archivo) {
        query += `, archivo_certificado=?`;
        params.push(archivo.buffer);
      }
      query += ` WHERE id_snii=?`;
      params.push(req.params.id);
      await db.query(query, params);
      res.json({ id_snii: req.params.id });
    } catch {
      res.status(500).json({ error: 'Error al actualizar certificado SNI' });
    }
  });

  // Eliminar
  router.delete('/:id', async (req, res) => {
    try {
      await db.query('DELETE FROM certificados_snii WHERE id_snii = ?', [req.params.id]);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar certificado SNI' });
    }
  });

  return router;
}; 