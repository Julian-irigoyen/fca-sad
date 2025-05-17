import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

function isValidEmail(email) {
  // Expresión regular simple para validar email
  return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email);
}

function isValidPhone(phone) {
  // Permite números, espacios, guiones y paréntesis, mínimo 7 dígitos
  return !phone || /^[0-9\\-\\s\\(\\)]{7,20}$/.test(phone);
}

function isValidRFC(rfc) {
  return !rfc || /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(rfc.toUpperCase());
}

function isValidCURP(curp) {
  // CURP: 18 caracteres alfanuméricos
  return !curp || /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}$/.test(curp.toUpperCase());
}

function isValidName(name) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(name);
}

function isValidSexo(sexo) {
  return ['M', 'F', 'Otro'].includes(sexo);
}

function isValidTipoContratacion(tc) {
  return !tc || ['Tiempo Completo', 'Medio Tiempo', 'Honorarios'].includes(tc);
}

function isValidTipoPlaza(tp) {
  return !tp || ['Base', 'Interino', 'Otro'].includes(tp);
}

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};
const pool = mysql.createPool(dbConfig);

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      'SELECT * FROM usuarios WHERE id_empleado = ? OR email = ?',
      [username, username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrecta.' });
    }
    const user = rows[0];
    // Use bcrypt for password check if hashes are stored
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrecta.' });
    }
    // Update last login
    await conn.execute('UPDATE usuarios SET ultimo_login = NOW() WHERE id_usuario = ?', [user.id_usuario]);
    // Create JWT
    const token = jwt.sign({ id: user.id_usuario, role: user.rol }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.rol });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// --- DOCENTES CRUD ENDPOINTS ---
// GET docentes con paginación y búsqueda por id_empleado, nombre, apellido_paterno, apellido_materno, correo
app.get('/api/docentes', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 25;
  const offset = (page - 1) * pageSize;
  const search = req.query.search ? String(req.query.search) : '';
  try {
    let where = '';
    let params = [];
    if (search) {
      // Permitir búsqueda por id_empleado (exacto si es número) o por nombre, apellidos, correo
      const searchFields = ['id_empleado', 'nombre', 'apellido_paterno', 'apellido_materno', 'correo'];
      where = 'WHERE ' + searchFields.map(f => f === 'id_empleado' ? `${f} = ?` : `${f} LIKE ?`).join(' OR ');
      params = searchFields.map(f => f === 'id_empleado' && !isNaN(Number(search)) ? Number(search) : `%${search}%`);
    }
    const [rows] = await pool.query(
      'SELECT * FROM docentes ' + where + ' LIMIT ? OFFSET ?',
      [...params, pageSize, offset]
    );
    const [[countResult]] = await pool.query(
      'SELECT COUNT(*) as total FROM docentes ' + where,
      params
    );
    res.json({ data: rows, total: countResult.total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener docentes.' });
  }
});

// GET facultades con paginación y búsqueda por nombre
app.get('/api/facultades', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 25;
  const offset = (page - 1) * pageSize;
  const search = req.query.search ? String(req.query.search) : '';
  try {
    let where = '';
    let params = [];
    if (search) {
      where = 'WHERE nombre LIKE ?';
      params = [`%${search}%`];
    }
    const [rows] = await pool.query(
      'SELECT * FROM facultades ' + where + ' LIMIT ? OFFSET ?',
      [...params, pageSize, offset]
    );
    const [[countResult]] = await pool.query(
      'SELECT COUNT(*) as total FROM facultades ' + where,
      params
    );
    res.json({ data: rows, total: countResult.total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener facultades.' });
  }
});

// POST create docente
app.post('/api/docentes', async (req, res) => {
  const {
    id_empleado, id_facultad, nombre, apellido_paterno, apellido_materno, sexo,
    fecha_nacimiento, correo, telefono, rfc, curp, tipo_contratacion, tipo_plaza,
    fecha_ingreso, imagen_perfil
  } = req.body;

  // Validación de campos obligatorios
  if (
    !id_empleado || !id_facultad || !nombre || !apellido_paterno || !apellido_materno ||
    !sexo || !fecha_nacimiento || !correo || !fecha_ingreso
  ) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }
  if (!isValidName(nombre)) {
    return res.status(400).json({ error: 'El nombre solo debe contener letras y espacios, mínimo 2 caracteres.' });
  }
  if (!isValidName(apellido_paterno)) {
    return res.status(400).json({ error: 'El apellido paterno solo debe contener letras y espacios, mínimo 2 caracteres.' });
  }
  if (!isValidName(apellido_materno)) {
    return res.status(400).json({ error: 'El apellido materno solo debe contener letras y espacios, mínimo 2 caracteres.' });
  }
  if (!isValidSexo(sexo)) {
    return res.status(400).json({ error: 'El sexo seleccionado no es válido.' });
  }
  if (!isValidEmail(correo)) {
    return res.status(400).json({ error: 'El correo no tiene un formato válido.' });
  }
  if (!isValidPhone(telefono)) {
    return res.status(400).json({ error: 'El teléfono no tiene un formato válido.' });
  }
  if (rfc && !isValidRFC(rfc)) {
    return res.status(400).json({ error: 'El RFC no tiene un formato válido.' });
  }
  if (curp && !isValidCURP(curp)) {
    return res.status(400).json({ error: 'El CURP no tiene un formato válido.' });
  }
  if (tipo_contratacion && !isValidTipoContratacion(tipo_contratacion)) {
    return res.status(400).json({ error: 'El tipo de contratación seleccionado no es válido.' });
  }
  if (tipo_plaza && !isValidTipoPlaza(tipo_plaza)) {
    return res.status(400).json({ error: 'El tipo de plaza seleccionado no es válido.' });
  }

  // Validar unicidad de correo
  try {
    const [existing] = await pool.query('SELECT 1 FROM docentes WHERE correo = ?', [correo]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error al validar correo único.' });
  }

  try {
    await pool.execute(
      `INSERT INTO docentes (
        id_empleado, id_facultad, nombre, apellido_paterno, apellido_materno, sexo,
        fecha_nacimiento, correo, telefono, rfc, curp, tipo_contratacion, tipo_plaza,
        fecha_ingreso, imagen_perfil
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_empleado, id_facultad, nombre, apellido_paterno, apellido_materno, sexo,
        fecha_nacimiento, correo, telefono || null, rfc || null, curp || null,
        tipo_contratacion || null, tipo_plaza || null, fecha_ingreso, imagen_perfil || null
      ]
    );
    res.status(201).json({ message: 'Docente creado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear docente.' });
  }
});

// PUT update docente
app.put('/api/docentes/:id', async (req, res) => {
  const { id } = req.params;
  const {
    id_facultad, nombre, apellido_paterno, apellido_materno, sexo,
    fecha_nacimiento, correo, telefono, rfc, curp, tipo_contratacion, tipo_plaza,
    fecha_ingreso, imagen_perfil
  } = req.body;

  // Validaciones adicionales
  if (!isValidName(nombre)) {
    return res.status(400).json({ error: 'El nombre solo debe contener letras y espacios, mínimo 2 caracteres.' });
  }
  if (!isValidName(apellido_paterno)) {
    return res.status(400).json({ error: 'El apellido paterno solo debe contener letras y espacios, mínimo 2 caracteres.' });
  }
  if (!isValidName(apellido_materno)) {
    return res.status(400).json({ error: 'El apellido materno solo debe contener letras y espacios, mínimo 2 caracteres.' });
  }
  if (!isValidSexo(sexo)) {
    return res.status(400).json({ error: 'El sexo seleccionado no es válido.' });
  }
  if (!isValidEmail(correo)) {
    return res.status(400).json({ error: 'El correo no tiene un formato válido.' });
  }
  if (!isValidPhone(telefono)) {
    return res.status(400).json({ error: 'El teléfono no tiene un formato válido.' });
  }
  if (rfc && !isValidRFC(rfc)) {
    return res.status(400).json({ error: 'El RFC no tiene un formato válido.' });
  }
  if (curp && !isValidCURP(curp)) {
    return res.status(400).json({ error: 'El CURP no tiene un formato válido.' });
  }
  if (tipo_contratacion && !isValidTipoContratacion(tipo_contratacion)) {
    return res.status(400).json({ error: 'El tipo de contratación seleccionado no es válido.' });
  }
  if (tipo_plaza && !isValidTipoPlaza(tipo_plaza)) {
    return res.status(400).json({ error: 'El tipo de plaza seleccionado no es válido.' });
  }

  // Validar unicidad de correo (excluyendo el propio registro)
  try {
    const [existing] = await pool.query('SELECT 1 FROM docentes WHERE correo = ? AND id_empleado != ?', [correo, id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error al validar correo único.' });
  }

  try {
    await pool.execute(
      `UPDATE docentes SET
        id_facultad=?, nombre=?, apellido_paterno=?, apellido_materno=?, sexo=?,
        fecha_nacimiento=?, correo=?, telefono=?, rfc=?, curp=?, tipo_contratacion=?,
        tipo_plaza=?, fecha_ingreso=?, imagen_perfil=?
      WHERE id_empleado=?`,
      [
        id_facultad, nombre, apellido_paterno, apellido_materno, sexo,
        fecha_nacimiento, correo, telefono || null, rfc || null, curp || null,
        tipo_contratacion || null, tipo_plaza || null, fecha_ingreso, imagen_perfil || null, id
      ]
    );
    res.json({ message: 'Docente actualizado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar docente.' });
  }
});

// DELETE (hard) docente
app.delete('/api/docentes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute(
      `DELETE FROM docentes WHERE id_empleado = ?`,
      [id]
    );
    res.json({ message: 'Docente eliminado.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar docente.' });
  }
});

app.get('/api/:table', async (req, res) => {
  const { table } = req.params;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 25;
  const offset = (page - 1) * pageSize;
  const search = req.query.search ? String(req.query.search) : '';
  try {
    // Determinar si la tabla tiene el campo id_empleado
    const [columns] = await pool.query('SHOW COLUMNS FROM `' + table + '`');
    const hasIdEmpleado = columns.some(col => col.Field === 'id_empleado');
    let where = '';
    let params = [];
    if (search) {
      // Campos comunes para búsqueda
      let searchFields = ['nombre', 'apellido_paterno', 'apellido_materno', 'correo'];
      // Si la tabla tiene id_empleado, agrégalo
      if (hasIdEmpleado) searchFields.unshift('id_empleado');
      // Filtra solo los campos que existen en la tabla
      const validFields = searchFields.filter(f => columns.some(col => col.Field === f));
      if (validFields.length > 0) {
        where = 'WHERE ' + validFields.map(f => f === 'id_empleado' ? `${f} = ?` : `${f} LIKE ?`).join(' OR ');
        params = validFields.map(f => f === 'id_empleado' && !isNaN(Number(search)) ? Number(search) : `%${search}%`);
      }
    }
    const [rows] = await pool.query(
      'SELECT * FROM `' + table + '` ' + where + ' LIMIT ? OFFSET ?',
      [...params, pageSize, offset]
    );
    const [[countResult]] = await pool.query(
      'SELECT COUNT(*) as total FROM `' + table + '` ' + where,
      params
    );
    res.json({ data: rows, total: countResult.total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos.' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
}); 