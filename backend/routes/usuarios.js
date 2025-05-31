import express from 'express';
const router = express.Router();

export default (db) => {
  // Listar
  router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 25;
    const offset = (page - 1) * pageSize;
    try {
      const [rows] = await db.query('SELECT * FROM usuarios LIMIT ? OFFSET ?', [pageSize, offset]);
      const [count] = await db.query('SELECT COUNT(*) as total FROM usuarios');
      res.json({ data: rows, total: count[0].total });
    } catch {
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  });

  // Obtener uno
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM usuarios WHERE id_usuario = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(rows[0]);
    } catch {
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  });

  // Crear
  router.post('/', async (req, res) => {
    const { id_empleado, email, password_hash, rol, id_usuario } = req.body;
    if (!id_empleado || !email || !password_hash || !rol) {
      return res.status(400).json({ error: 'id_empleado, email, password_hash y rol son obligatorios' });
    }
    try {
      if (id_usuario) {
        const [existingId] = await db.query('SELECT 1 FROM usuarios WHERE id_usuario = ?', [id_usuario]);
        if (existingId.length > 0) {
          return res.status(400).json({ error: 'El ID de usuario ya existe' });
        }
      }
      const fields = ['id_empleado', 'email', 'password_hash', 'rol', 'ultimo_login', 'imagen_perfil'];
      const values = fields.map(f => req.body[f] || null);
      const [result] = await db.query(
        `INSERT INTO usuarios (${fields.join(',')}) VALUES (?,?,?,?,?,?)`, values
      );
      res.json({ id_usuario: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'El email ya está registrado' });
      } else {
        res.status(500).json({ error: 'Error al crear usuario' });
      }
    }
  });

  // Actualizar
  router.put('/:id', async (req, res) => {
    const { email, password_hash, rol } = req.body;
    if (!email || !password_hash || !rol) {
      return res.status(400).json({ error: 'email, password_hash y rol son obligatorios' });
    }
    try {
      const fields = ['email', 'password_hash', 'rol', 'ultimo_login', 'imagen_perfil'];
      const updates = fields.map(f => `${f} = ?`).join(', ');
      const values = fields.map(f => req.body[f] || null);
      await db.query(`UPDATE usuarios SET ${updates} WHERE id_usuario = ?`, [...values, req.params.id]);
      res.json({ id_usuario: req.params.id });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'El email ya está registrado' });
      } else {
        res.status(500).json({ error: 'Error al actualizar usuario' });
      }
    }
  });

  // Eliminar
  router.delete('/:id', async (req, res) => {
    try {
      await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [req.params.id]);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  });

  return router;
}; 