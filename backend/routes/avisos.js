import express from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(process.cwd(), 'uploads', 'avisos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Middleware para verificar token y rol
function authAdminOrCoord(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided' });
  const token = auth.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token inválido' });
    if (decoded.role !== 'admin' && decoded.role !== 'coordinador') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    req.user = decoded;
    next();
  });
}

export default (pool) => {
  // Enviar aviso (inmediato o programado)
  router.post('/', authAdminOrCoord, upload.array('adjuntos'), async (req, res) => {
    try {
      const { asunto, mensaje, programarEnvio, fechaEnvio, altaPrioridad } = req.body;
      // Obtener destinatarios personalizados si se envían
      let destinatarios = [];
      if (req.body.destinatarios) {
        if (Array.isArray(req.body.destinatarios)) {
          destinatarios = req.body.destinatarios;
        } else if (typeof req.body.destinatarios === 'string') {
          destinatarios = [req.body.destinatarios];
        }
      } else {
        // Si no se envían, usar todos los docentes
        const [docentes] = await pool.query("SELECT correo FROM docentes");
        destinatarios = docentes.map(d => d.correo).filter(Boolean);
      }
      if (!asunto || !mensaje) {
        return res.status(400).json({ error: 'Asunto y mensaje son requeridos' });
      }
      if (destinatarios.length === 0) {
        return res.status(400).json({ error: 'No hay destinatarios válidos.' });
      }
      // Si es programado, guardar en la base de datos con estado 'Programado' y salir
      if (programarEnvio === 'true' && fechaEnvio) {
        // 1. Guarda el aviso
        const [result] = await pool.query(
          'INSERT INTO avisos (asunto, mensaje, fecha_envio, alta_prioridad, estado, creador) VALUES (?, ?, ?, ?, ?, ?)',
          [asunto, mensaje, fechaEnvio, altaPrioridad === 'true', 'Programado', req.user.id]
        );
        const id_aviso = result.insertId;
        // 2. Guarda los adjuntos (si hay)
        if (req.files && req.files.length > 0) {
          for (const file of req.files) {
            await pool.query(
              'INSERT INTO adjuntos_avisos (id_aviso, nombre_archivo, ruta_archivo) VALUES (?, ?, ?)',
              [id_aviso, file.originalname, file.path]
            );
          }
        }
        // 3. Guarda destinatarios personalizados (si hay)
        if (req.body.destinatarios) {
          let destinatarios = [];
          if (Array.isArray(req.body.destinatarios)) {
            destinatarios = req.body.destinatarios;
          } else if (typeof req.body.destinatarios === 'string') {
            destinatarios = [req.body.destinatarios];
          }
          for (const correo of destinatarios) {
            await pool.query(
              'INSERT INTO destinatarios_avisos (id_aviso, correo) VALUES (?, ?)',
              [id_aviso, correo]
            );
          }
        }
        return res.json({ message: 'Aviso programado correctamente.' });
      }
      // Si es inmediato, enviar correo
      // Configurar nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'saduach01@gmail.com',
          pass: 'rtbg vpnd dwbl igey',
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      // Adjuntos
      const attachments = req.files?.map(file => ({
        filename: file.originalname,
        content: file.buffer,
      })) || [];
      // Enviar correo
      const cuerpoCorreo = `Estimado/a docente,\n\nHa recibido un nuevo aviso del Sistema de Administración a Docentes (SAD):\n\n--------------------------------------\n${mensaje}\n\n--------------------------------------\n\nAtentamente,\nFacultad de Contaduría y Administración`;
      const cuerpoCorreoHtml = `
        <div style="font-family: Arial, sans-serif; color: #222;">
          <p style="color: #b71c1c; font-size: 1.1em;"><b>Estimado/a docente,</b></p>
          <p>Ha recibido un nuevo aviso del <b>Sistema de Administración a Docentes (SAD)</b>:</p>
          <hr style="border: none; border-top: 1px solid #aaa; margin: 18px 0;" />
          <div style="margin: 18px 0; font-size: 1.1em;">${mensaje}</div>
          <hr style="border: none; border-top: 1px solid #aaa; margin: 18px 0;" />
          <p style="margin-top: 24px; color: #b71c1c; font-weight: bold;">Atentamente,<br>Facultad de Contaduría y Administración</p>
        </div>
      `;
      await transporter.sendMail({
        from: 'saduach01@gmail.com',
        to: destinatarios,
        subject: asunto + (altaPrioridad === 'true' ? ' [ALTA PRIORIDAD]' : ''),
        text: cuerpoCorreo,
        html: cuerpoCorreoHtml,
        attachments,
      });
      // Guardar aviso en la base de datos como enviado
      await pool.query(
        'INSERT INTO avisos (asunto, mensaje, fecha_envio, alta_prioridad, estado, creador) VALUES (?, ?, NOW(), ?, ?, ?)',
        [asunto, mensaje, altaPrioridad === 'true', 'Enviado', req.user.id]
      );
      res.json({ message: 'Aviso enviado correctamente.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al enviar aviso.' });
    }
  });

  // Obtener historial de avisos
  router.get('/', authAdminOrCoord, async (req, res) => {
    try {
      const [avisos] = await pool.query('SELECT * FROM avisos ORDER BY fecha_envio DESC');
      // Para cada aviso, busca sus adjuntos
      for (const aviso of avisos) {
        const [adjuntos] = await pool.query('SELECT id, nombre_archivo, ruta_archivo FROM adjuntos_avisos WHERE id_aviso = ?', [aviso.id_aviso]);
        aviso.adjuntos = adjuntos.map(a => ({
          id: a.id,
          nombre_archivo: a.nombre_archivo,
          ruta_archivo: a.ruta_archivo.replace(process.cwd(), '').replace(/\\/g, '/'), // ruta relativa
        }));
      }
      res.json(avisos);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener avisos.' });
    }
  });

  // Eliminar aviso por id
  router.delete('/:id', authAdminOrCoord, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM avisos WHERE id_aviso = ?', [id]);
      res.json({ message: 'Aviso eliminado correctamente.' });
    } catch (err) {
      res.status(500).json({ error: 'Error al eliminar aviso.' });
    }
  });

  // Servir archivos adjuntos de avisos de forma segura
  router.get('/adjunto/:id', authAdminOrCoord, async (req, res) => {
    try {
      const { id } = req.params;
      const [[adjunto]] = await pool.query('SELECT nombre_archivo, ruta_archivo FROM adjuntos_avisos WHERE id = ?', [id]);
      if (!adjunto) return res.status(404).send('Archivo no encontrado');
      res.download(adjunto.ruta_archivo, adjunto.nombre_archivo);
    } catch (err) {
      res.status(500).send('Error al descargar archivo');
    }
  });

  return router;
};

// --- PROCESO AUTOMÁTICO PARA ENVIAR AVISOS PROGRAMADOS ---
export function startAvisosScheduler(pool) {
  setInterval(async () => {
    try {
      // Buscar avisos programados cuya fecha ya pasó y no han sido enviados
      const [pendientes] = await pool.query(
        "SELECT * FROM avisos WHERE estado = 'Programado' AND fecha_envio <= NOW()"
      );
      for (const aviso of pendientes) {
        // Obtener destinatarios personalizados si existen
        const [destRows] = await pool.query('SELECT correo FROM destinatarios_avisos WHERE id_aviso = ?', [aviso.id_aviso]);
        let destinatarios = [];
        if (destRows.length > 0) {
          destinatarios = destRows.map(d => d.correo);
        } else {
          // Si no hay personalizados, usar todos los docentes
          const [docentes] = await pool.query("SELECT correo FROM docentes");
          destinatarios = docentes.map(d => d.correo).filter(Boolean);
        }
        if (destinatarios.length === 0) continue;
        // Configurar nodemailer
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'saduach01@gmail.com',
            pass: 'rtbg vpnd dwbl igey',
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        // Busca adjuntos
        const [adjuntosRows] = await pool.query(
          'SELECT nombre_archivo, ruta_archivo FROM adjuntos_avisos WHERE id_aviso = ?',
          [aviso.id_aviso]
        );
        const attachments = adjuntosRows.map(row => ({
          filename: row.nombre_archivo,
          path: row.ruta_archivo
        }));
        // Enviar correo
        const cuerpoCorreo = `Estimado/a docente,\n\nHa recibido un nuevo aviso del Sistema de Administración a Docentes (SAD):\n\n--------------------------------------\n${aviso.mensaje}\n\n--------------------------------------\n\nAtentamente,\nFacultad de Contaduría y Administración`;
        const cuerpoCorreoHtml = `
          <div style="font-family: Arial, sans-serif; color: #222;">
            <p style="color: #b71c1c; font-size: 1.1em;"><b>Estimado/a docente,</b></p>
            <p>Ha recibido un nuevo aviso del <b>Sistema de Administración a Docentes (SAD)</b>:</p>
            <hr style="border: none; border-top: 1px solid #aaa; margin: 18px 0;" />
            <div style="margin: 18px 0; font-size: 1.1em;">${aviso.mensaje}</div>
            <hr style="border: none; border-top: 1px solid #aaa; margin: 18px 0;" />
            <p style="margin-top: 24px; color: #b71c1c; font-weight: bold;">Atentamente,<br>Facultad de Contaduría y Administración</p>
          </div>
        `;
        await transporter.sendMail({
          from: 'saduach01@gmail.com',
          to: destinatarios,
          subject: aviso.asunto + (aviso.alta_prioridad ? ' [ALTA PRIORIDAD]' : ''),
          text: cuerpoCorreo,
          html: cuerpoCorreoHtml,
          attachments
        });
        // Actualizar estado a 'Enviado'
        await pool.query(
          "UPDATE avisos SET estado = 'Enviado' WHERE id_aviso = ?",
          [aviso.id_aviso]
        );
        console.log(`Aviso programado enviado: ${aviso.asunto}`);
      }
    } catch (err) {
      console.error('Error en el scheduler de avisos programados:', err);
    }
  }, 60000); // Cada minuto
} 