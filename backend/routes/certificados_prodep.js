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
      const [rows] = await db.query('SELECT * FROM certificados_prodep LIMIT ? OFFSET ?', [pageSize, offset]);
      const [count] = await db.query('SELECT COUNT(*) as total FROM certificados_prodep');
      res.json({ data: rows, total: count[0].total });
    } catch {
      res.status(500).json({ error: 'Error al obtener certificados PRODEP' });
    }
  });

  // Obtener uno
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM certificados_prodep WHERE id_prodep = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(rows[0]);
    } catch {
      res.status(500).json({ error: 'Error al obtener certificado PRODEP' });
    }
  });

  // Descargar PDF
  router.get('/:id/pdf', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT archivo_certificado FROM certificados_prodep WHERE id_prodep = ?', [req.params.id]);
      if (!rows[0] || !rows[0].archivo_certificado) return res.status(404).json({ error: 'PDF no encontrado' });
      res.setHeader('Content-Type', 'application/pdf');
      res.send(rows[0].archivo_certificado);
    } catch {
      res.status(500).json({ error: 'Error al obtener PDF' });
    }
  });

  // Crear
  router.post('/', upload.any(), async (req, res) => {
    const { id_empleado, fecha_fin, id_prodep } = req.body;
    if (!id_empleado) {
      return res.status(400).json({ error: 'id_empleado es obligatorio' });
    }
    try {
      if (id_prodep) {
        const [existing] = await db.query('SELECT 1 FROM certificados_prodep WHERE id_prodep = ?', [id_prodep]);
        if (existing.length > 0) {
          return res.status(400).json({ error: 'El ID de PRODEP ya existe' });
        }
      }
      const archivo = req.files?.find(f => f.fieldname === 'archivo_certificado' || f.fieldname === 'archivo_pdf');
      const archivo_certificado = archivo ? archivo.buffer : null;
      const fields = ['id_empleado', 'fecha_fin', 'archivo_certificado'];
      const values = [id_empleado, fecha_fin || null, archivo_certificado];
      const [result] = await db.query(
        `INSERT INTO certificados_prodep (${fields.join(',')}) VALUES (?,?,?)`, values
      );
      res.json({ id_prodep: result.insertId });
    } catch {
      res.status(500).json({ error: 'Error al crear certificado PRODEP' });
    }
  });

  // Actualizar
  router.put('/:id', upload.any(), async (req, res) => {
    const { fecha_fin } = req.body;
    try {
      let query = `UPDATE certificados_prodep SET fecha_fin=?`;
      let params = [fecha_fin || null];
      const archivo = req.files?.find(f => f.fieldname === 'archivo_certificado' || f.fieldname === 'archivo_pdf');
      if (archivo) {
        query += `, archivo_certificado=?`;
        params.push(archivo.buffer);
      }
      query += ` WHERE id_prodep=?`;
      params.push(req.params.id);
      await db.query(query, params);
      res.json({ id_prodep: req.params.id });
    } catch {
      res.status(500).json({ error: 'Error al actualizar certificado PRODEP' });
    }
  });

  // Eliminar
  router.delete('/:id', async (req, res) => {
    try {
      await db.query('DELETE FROM certificados_prodep WHERE id_prodep = ?', [req.params.id]);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar certificado PRODEP' });
    }
  });

  return router;
}; 