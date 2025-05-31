import { useState, useEffect } from 'react';
import { Box, Button, Checkbox, FormControlLabel, TextField, Typography, Paper, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Snackbar, Alert, Chip, Stack, ToggleButton, ToggleButtonGroup, Autocomplete } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import GroupIcon from '@mui/icons-material/Group';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import SearchIcon from '@mui/icons-material/Search';

export default function Avisos() {
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [adjuntos, setAdjuntos] = useState<File[]>([]);
  const [programarEnvio, setProgramarEnvio] = useState(false);
  const [fechaEnvio, setFechaEnvio] = useState('');
  const [altaPrioridad, setAltaPrioridad] = useState(false);
  const [avisos, setAvisos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [docentes, setDocentes] = useState<any[]>([]);
  const [destinatarios, setDestinatarios] = useState<any[]>([]);
  const [destMode, setDestMode] = useState<'todos' | 'personalizado'>('todos');
  const [openAviso, setOpenAviso] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // Obtener docentes al cargar
  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/api/docentes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        // data.data si viene paginado
        setDocentes(Array.isArray(data.data) ? data.data : []);
        if (destMode === 'todos') {
          setDestinatarios(Array.isArray(data.data) ? data.data : []);
        }
      } catch (err) {
        setDocentes([]);
      }
    };
    fetchDocentes();
  }, []);

  // Cambiar destinatarios según modo
  useEffect(() => {
    if (destMode === 'todos') {
      setDestinatarios(docentes);
    } else if (destMode === 'personalizado' && destinatarios.length === 0) {
      setDestinatarios([]);
    }
  }, [destMode, docentes]);

  // Cargar historial de avisos
  useEffect(() => {
    const fetchAvisos = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/api/avisos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al obtener avisos');
        const data = await res.json();
        const avisosArray = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        setAvisos(avisosArray);
      } catch (err: any) {
        setAvisos([]); // Previene error de .map
        setErrorMsg(err.message || 'Error al cargar avisos');
      }
    };
    fetchAvisos();
  }, []);

  const handleAdjuntos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAdjuntos(Array.from(e.target.files));
    }
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('asunto', asunto);
      formData.append('mensaje', mensaje);
      formData.append('altaPrioridad', altaPrioridad ? 'true' : 'false');
      formData.append('programarEnvio', programarEnvio ? 'true' : 'false');
      if (programarEnvio && fechaEnvio) {
        formData.append('fechaEnvio', fechaEnvio);
      }
      // Solo enviar los correos seleccionados
      destinatarios.forEach((d: any) => formData.append('destinatarios', d.correo));
      adjuntos.forEach(file => formData.append('adjuntos', file));
      const res = await fetch('http://localhost:4000/api/avisos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar aviso');
      setSuccessMsg(data.message || 'Aviso enviado correctamente');
      setAsunto('');
      setMensaje('');
      setAdjuntos([]);
      setProgramarEnvio(false);
      setFechaEnvio('');
      setAltaPrioridad(false);
      setDestMode('todos');
      setDestinatarios(docentes);
      // Recargar avisos
      const avisosRes = await fetch('http://localhost:4000/api/avisos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const avisosData = await avisosRes.json();
      const avisosArray = Array.isArray(avisosData) ? avisosData : (Array.isArray(avisosData.data) ? avisosData.data : []);
      setAvisos(avisosArray);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar aviso');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar aviso
  const handleDelete = async (id_aviso: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este aviso?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/avisos/${id_aviso}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar aviso');
      setAvisos(avisos.filter(a => a.id_aviso !== id_aviso));
      setSuccessMsg('Aviso eliminado correctamente');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al eliminar aviso');
    }
  };

  // Filtrar avisos por asunto
  const avisosFiltrados = avisos.filter(a => a.asunto.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box sx={{
      width: '100%',
      px: { xs: 0, md: 2 },
      mt: 2,
      height: 'calc(100vh - 100px)',
      overflowY: 'auto',
      pr: 1,
      scrollbarWidth: 'thin',
      '&::-webkit-scrollbar': {
        width: '8px',
        backgroundColor: '#f5f5f5',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#b71c1c',
        borderRadius: '8px',
      },
    }}>
      {/* Título y subtítulo */}
      <Typography variant="h4" fontWeight={700} color="#222" sx={{ mb: 0.5, textAlign: 'left' }}>Avisos Masivos</Typography>
      <Typography variant="subtitle1" color="#444" sx={{ mb: 3, textAlign: 'left' }}>Redacte y envíe avisos importantes por correo electrónico a todos los usuarios del sistema.</Typography>
      {/* Feedback */}
      <Snackbar open={!!successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ width: '100%' }}>{successMsg}</Alert>
      </Snackbar>
      <Snackbar open={!!errorMsg} autoHideDuration={5000} onClose={() => setErrorMsg('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setErrorMsg('')} severity="error" sx={{ width: '100%' }}>{errorMsg}</Alert>
      </Snackbar>
      {/* Nuevo Aviso */}
      <Paper elevation={2} sx={{
        p: { xs: 2, sm: 4 },
        mb: 4,
        borderRadius: 3,
        boxShadow: '0 4px 24px 0 rgba(183,28,28,0.08)',
        background: '#fff',
        width: '100%',
        maxWidth: 'none',
        mx: 0,
        textAlign: 'left',
      }}>
        <Typography variant="h5" fontWeight={700} color="#222" gutterBottom sx={{ mb: 2, textAlign: 'left' }}>Nuevo Aviso</Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} onSubmit={handleEnviar}>
          <Typography fontWeight={600} sx={{ mb: 1, color: '#444' }}>Destinatarios</Typography>
          <Box sx={{ mb: 1 }}>
            {destMode === 'personalizado' ? (
              <Autocomplete
                multiple
                options={docentes}
                getOptionLabel={d => `${d.nombre} ${d.apellido_paterno} ${d.apellido_materno}`}
                value={destinatarios}
                onChange={(_, v) => setDestinatarios(v)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={`${option.nombre} ${option.apellido_paterno} ${option.apellido_materno}`} {...getTagProps({ index })} key={option.id_empleado}
                      sx={{
                        fontSize: 16,
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.5,
                        background: '#f5f5f5',
                        color: '#b71c1c',
                        fontWeight: 600,
                        m: 0.5
                      }}
                    />
                  ))
                }
                renderInput={params => <TextField {...params} label="Selecciona destinatarios" placeholder="Buscar docente..." />}
                sx={{ maxWidth: 700 }}
              />
            ) : (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}>
                <Chip label={`Todos los usuarios (${docentes.length})`} color="primary" sx={{ fontSize: 16, borderRadius: 2, px: 1.5, py: 0.5, fontWeight: 600, background: '#b71c1c', color: '#fff' }} />
              </Stack>
            )}
          </Box>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant={destMode === 'todos' ? 'contained' : 'outlined'}
              color="error"
              startIcon={<GroupIcon />}
              onClick={() => setDestMode('todos')}
              sx={{ fontWeight: 700, fontSize: 16, borderRadius: 2, px: 2, minWidth: 180 }}
            >
              Todos los usuarios
            </Button>
            <Button
              variant={destMode === 'personalizado' ? 'contained' : 'outlined'}
              color="error"
              startIcon={<FilterListIcon />}
              onClick={() => setDestMode('personalizado')}
              sx={{ fontWeight: 700, fontSize: 16, borderRadius: 2, px: 2, minWidth: 220 }}
            >
              Selección personalizada
            </Button>
          </Stack>
          <TextField label="Asunto" value={asunto} onChange={e => setAsunto(e.target.value)} fullWidth required sx={{ background: '#fafafa', borderRadius: 2 }} />
          <TextField label="Mensaje" value={mensaje} onChange={e => setMensaje(e.target.value)} fullWidth required multiline minRows={4} sx={{ background: '#fafafa', borderRadius: 2 }} />
          {/* Adjuntos */}
          <Typography sx={{ color: '#666', fontWeight: 500, mb: 0.5 }}>Adjuntos</Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<AttachFileIcon />}
            sx={{
              width: '100%',
              justifyContent: 'flex-start',
              background: '#f5f5f5',
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              color: '#444',
              fontWeight: 500,
              fontSize: 18,
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': {
                background: '#ececec',
                borderColor: '#bdbdbd',
              },
              mb: 1
            }}
          >
            Seleccionar archivos
            <input type="file" hidden multiple onChange={handleAdjuntos} />
          </Button>
          {adjuntos.length > 0 && (
            <Box sx={{ fontSize: 15, color: '#444', mb: 1, mt: -1 }}>
              {adjuntos.map((file, idx) => <span key={idx}>{file.name}{idx < adjuntos.length - 1 ? ', ' : ''}</span>)}
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mt: 1 }}>
            <FormControlLabel control={<Checkbox checked={programarEnvio} onChange={e => setProgramarEnvio(e.target.checked)} />} label={<span>Programar envío <ScheduleIcon fontSize="small" sx={{ color: '#b71c1c', ml: 0.5 }} /></span>} />
            {programarEnvio && (
              <TextField
                label="Fecha y hora de envío"
                type="datetime-local"
                value={fechaEnvio}
                onChange={e => setFechaEnvio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                sx={{ minWidth: 240, background: '#fafafa', borderRadius: 2 }}
              />
            )}
            <FormControlLabel control={<Checkbox checked={altaPrioridad} onChange={e => setAltaPrioridad(e.target.checked)} />} label={<span>Alta prioridad <PriorityHighIcon fontSize="small" sx={{ color: '#b71c1c', ml: 0.5 }} /></span>} />
            <Button type="submit" variant="contained" color="error" endIcon={<SendIcon />} sx={{ ml: 'auto', px: 4, fontWeight: 700, fontSize: 16, borderRadius: 2 }} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar'}
            </Button>
          </Box>
        </Box>
      </Paper>
      {/* Avisos Enviados */}
      <Paper elevation={3} sx={{ p: 3, borderTop: '6px solid #b71c1c' }}>
        <Typography variant="h5" fontWeight={700} color="#b71c1c" gutterBottom>Avisos Enviados</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            placeholder="Buscar por asunto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            sx={{ width: 320, background: '#fff' }}
          />
        </Box>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#f8d7da' }}>
                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Asunto</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Prioridad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {avisosFiltrados.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No hay avisos registrados.</TableCell></TableRow>
              ) : avisosFiltrados.map((aviso, idx) => (
                <TableRow key={aviso.id_aviso || idx}>
                  <TableCell>{new Date(aviso.fecha_envio).toLocaleString()}</TableCell>
                  <TableCell>{aviso.asunto}</TableCell>
                  <TableCell>{aviso.alta_prioridad ? <PriorityHighIcon sx={{ color: '#b71c1c' }} /> : ''}</TableCell>
                  <TableCell>
                    <Typography color={aviso.estado === 'Enviado' ? 'green' : '#b71c1c'} fontWeight={600}>{aviso.estado}</Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Ver"><IconButton onClick={() => setOpenAviso(aviso)}><VisibilityIcon /></IconButton></Tooltip>
                    <Tooltip title="Eliminar"><IconButton color="error" onClick={() => handleDelete(aviso.id_aviso)}><CloseIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* Modal de detalle de aviso */}
      <Dialog open={!!openAviso} onClose={() => setOpenAviso(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle del Aviso</DialogTitle>
        <DialogContent dividers>
          {openAviso && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}><b>Asunto:</b> {openAviso.asunto}</Typography>
              <Typography variant="subtitle2" sx={{ mb: 1 }}><b>Fecha:</b> {new Date(openAviso.fecha_envio).toLocaleString()}</Typography>
              <Typography variant="subtitle2" sx={{ mb: 1 }}><b>Prioridad:</b> {openAviso.alta_prioridad ? 'Alta' : 'Normal'}</Typography>
              <Typography variant="subtitle2" sx={{ mb: 1 }}><b>Estado:</b> {openAviso.estado}</Typography>
              <Typography variant="subtitle2" sx={{ mb: 1 }}><b>Mensaje:</b></Typography>
              <Box sx={{ border: '1px solid #eee', borderRadius: 2, p: 2, background: '#fafafa', mt: 1 }}>
                <div dangerouslySetInnerHTML={{ __html: openAviso.mensaje }} />
              </Box>
              {openAviso.adjuntos && openAviso.adjuntos.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}><b>Archivos adjuntos:</b></Typography>
                  {openAviso.adjuntos.map((adj: any) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(adj.nombre_archivo);
                    const fileUrl = `http://localhost:4000/api/avisos/adjunto/${adj.id}`;
                    return (
                      <Box key={adj.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AttachFileIcon sx={{ color: '#b71c1c', mr: 1 }} />
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#b71c1c', textDecoration: 'underline', fontWeight: 500 }}
                          >
                            {adj.nombre_archivo}
                          </a>
                        </Box>
                        {isImage && (
                          <Box sx={{ mt: 1, mb: 1 }}>
                            <img src={fileUrl} alt={adj.nombre_archivo} style={{ maxWidth: 220, maxHeight: 180, borderRadius: 8, border: '1px solid #eee', boxShadow: '0 2px 8px #0001' }} />
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAviso(null)} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 