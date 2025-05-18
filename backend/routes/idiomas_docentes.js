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
      const [rows] = await db.query('SELECT * FROM idiomas_docentes LIMIT ? OFFSET ?', [pageSize, offset]);
      const [count] = await db.query('SELECT COUNT(*) as total FROM idiomas_docentes');
      res.json({ data: rows, total: count[0].total });
    } catch {
      res.status(500).json({ error: 'Error al obtener idiomas' });
    }
  });

  // Obtener uno
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM idiomas_docentes WHERE id_idioma = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(rows[0]);
    } catch {
      res.status(500).json({ error: 'Error al obtener idioma' });
    }
  });

  // Descargar PDF
  router.get('/:id/pdf', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT archivo_certificado FROM idiomas_docentes WHERE id_idioma = ?', [req.params.id]);
      if (!rows[0] || !rows[0].archivo_certificado) return res.status(404).json({ error: 'PDF no encontrado' });
      res.setHeader('Content-Type', 'application/pdf');
      res.send(rows[0].archivo_certificado);
    } catch {
      res.status(500).json({ error: 'Error al obtener PDF' });
    }
  });

  // Crear
  router.post('/', upload.any(), async (req, res) => {
    const { id_empleado, idioma, nivel, certificado, id_idioma } = req.body;
    if (!id_empleado || !idioma || !nivel) {
      return res.status(400).json({ error: 'id_empleado, idioma y nivel son obligatorios' });
    }
    try {
      if (id_idioma) {
        const [existing] = await db.query('SELECT 1 FROM idiomas_docentes WHERE id_idioma = ?', [id_idioma]);
        if (existing.length > 0) {
          return res.status(400).json({ error: 'El ID de idioma ya existe' });
        }
      }
      const archivo = req.files?.find(f => f.fieldname === 'archivo_certificado' || f.fieldname === 'archivo_pdf');
      const archivo_certificado = archivo ? archivo.buffer : null;
      const fields = ['id_empleado', 'idioma', 'nivel', 'certificado', 'archivo_certificado'];
      const values = [id_empleado, idioma, nivel, certificado || null, archivo_certificado];
      const [result] = await db.query(
        `INSERT INTO idiomas_docentes (${fields.join(',')}) VALUES (?,?,?,?,?)`, values
      );
      res.json({ id_idioma: result.insertId });
    } catch {
      res.status(500).json({ error: 'Error al crear idioma' });
    }
  });

  // Actualizar
  router.put('/:id', upload.any(), async (req, res) => {
    const { idioma, nivel, certificado } = req.body;
    if (!idioma || !nivel) {
      return res.status(400).json({ error: 'idioma y nivel son obligatorios' });
    }
    try {
      let query = `UPDATE idiomas_docentes SET idioma=?, nivel=?, certificado=?`;
      let params = [idioma, nivel, certificado || null];
      const archivo = req.files?.find(f => f.fieldname === 'archivo_certificado' || f.fieldname === 'archivo_pdf');
      if (archivo) {
        query += `, archivo_certificado=?`;
        params.push(archivo.buffer);
      }
      query += ` WHERE id_idioma=?`;
      params.push(req.params.id);
      await db.query(query, params);
      res.json({ id_idioma: req.params.id });
    } catch {
      res.status(500).json({ error: 'Error al actualizar idioma' });
    }
  });

  // Eliminar
  router.delete('/:id', async (req, res) => {
    try {
      await db.query('DELETE FROM idiomas_docentes WHERE id_idioma = ?', [req.params.id]);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar idioma' });
    }
  });

  return router;
}; 