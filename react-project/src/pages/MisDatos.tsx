import { Tabs, Tab, Box, TextField, MenuItem, Button, Grid, Typography, Snackbar, Alert, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';

// Enums y helpers
const sexoEnum = ['M', 'F', 'Otro'];
const tipoContratacionEnum = ['Tiempo Completo', 'Medio Tiempo', 'Honorarios'];
const tipoPlazaEnum = ['Base', 'Interino', 'Otro'];
const tipoCertificadoEnum = ['Licenciatura', 'Maestría', 'Doctorado'];
const nivelIdiomaEnum = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];
const nivelSniiEnum = ['Candidato', 'Nivel I', 'Nivel II', 'Nivel III'];
const tipoPublicacionEnum = ['Artículo', 'Libro', 'Ponencia', 'Otro'];

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

// Hook para obtener facultades dinámicamente
function useFacultades() {
    const [facultades, setFacultades] = useState<any[]>([]);
    useEffect(() => {
        fetch('http://localhost:4000/api/facultades?page=1&pageSize=1000')
            .then(res => res.json())
            .then(data => setFacultades(data.data || []))
            .catch(() => setFacultades([]));
    }, []);
    return facultades;
}

export default function MisDatos() {
    // Obtener datos del usuario logueado
    const id_empleado = localStorage.getItem('id_empleado') || '';
    const nombreUsuario = localStorage.getItem('nombre') || '';
    const apellidoPaternoUsuario = localStorage.getItem('apellido_paterno') || '';
    const apellidoMaternoUsuario = localStorage.getItem('apellido_materno') || '';
    const correoUsuario = localStorage.getItem('email') || '';
    const facultades = useFacultades();
    const [tabValue, setTabValue] = useState(0);
    // Estados locales para formularios (mock, luego se conectarán a la API)
    const [personal, setPersonal] = useState({
        id_empleado: id_empleado,
        id_facultad: '',
        nombre: nombreUsuario,
        apellido_paterno: apellidoPaternoUsuario,
        apellido_materno: apellidoMaternoUsuario,
        sexo: '',
        fecha_nacimiento: '',
        telefono: '',
        rfc: '',
        curp: '',
        tipo_contratacion: '',
        tipo_plaza: '',
        fecha_ingreso: '',
        imagen_perfil: '', // Puede ser base64 o url temporal para preview
        imagen_perfil_file: null as File | null,
    });
    const [domicilio, setDomicilio] = useState({
        calle: '', numero: '', colonia: '', ciudad: '', estado: '', codigo_postal: ''
    });
    const [certificado, setCertificado] = useState({
        tipo: '', nombre_titulo: '', institucion: '', anio_obtencion: '', archivo_pdf: '', archivo_pdf_nombre: ''
    });
    const [idioma, setIdioma] = useState({
        idioma: '', nivel: '', certificado: '', archivo_certificado: '', archivo_certificado_nombre: ''
    });
    const [snii, setSnii] = useState({
        nivel: '', fecha_certificacion: '', archivo_certificado: '', archivo_certificado_nombre: ''
    });
    const [prodep, setProdep] = useState({
        fecha_fin: '', archivo_certificado: '', archivo_certificado_nombre: ''
    });
    const [publicacion, setPublicacion] = useState({
        tipo: '', titulo: '', fecha_publicacion: '', revista_o_editorial: '', archivo_pdf: '', archivo_pdf_nombre: ''
    });
    const [personalError, setPersonalError] = useState<string | null>(null);
    const [personalSuccess, setPersonalSuccess] = useState<string | null>(null);
    const [imagenPreview, setImagenPreview] = useState<string | null>(null);
    const [imagenError, setImagenError] = useState<string | null>(null);

    // Handlers genéricos
    const handleChange = (setState: any) => (e: any) => {
        setState((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Validación de campos requeridos para datos personales
    function validatePersonal(p: typeof personal) {
        if (!p.id_empleado || !p.id_facultad || !p.nombre || !p.apellido_paterno || !p.apellido_materno || !p.sexo || !p.fecha_nacimiento || !p.fecha_ingreso) {
            return 'Por favor, completa todos los campos obligatorios marcados con *';
        }
        // Validaciones básicas de formato
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(p.nombre)) return 'El nombre solo debe contener letras y espacios, mínimo 2 caracteres.';
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(p.apellido_paterno)) return 'El apellido paterno solo debe contener letras y espacios, mínimo 2 caracteres.';
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(p.apellido_materno)) return 'El apellido materno solo debe contener letras y espacios, mínimo 2 caracteres.';
        if (!['M', 'F', 'Otro'].includes(p.sexo)) return 'El sexo seleccionado no es válido.';
        return null;
    }

    // Guardar datos personales
    async function handleSavePersonal() {
        setPersonalError(null);
        setPersonalSuccess(null);
        const error = validatePersonal(personal);
        if (error) {
            setPersonalError(error);
            return;
        }
        try {
            // Si ya existe el usuario, hacer PUT (update), si no, hacer POST (create)
            const resCheck = await fetch(`http://localhost:4000/api/docentes?search=${id_empleado}`);
            const dataCheck = await resCheck.json();
            let res, data;
            if (dataCheck.data && dataCheck.data.length > 0) {
                // Ya existe, hacer update
                res = await fetch(`http://localhost:4000/api/docentes/${id_empleado}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...personal, id_empleado }),
                });
            } else {
                // No existe, hacer create
                res = await fetch('http://localhost:4000/api/docentes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...personal, id_empleado }),
                });
            }
            data = await res.json();
            if (!res.ok) {
                setPersonalError(data.error || 'Error al guardar los datos personales.');
            } else {
                setPersonalSuccess('Datos personales guardados correctamente.');
            }
        } catch (err) {
            setPersonalError('Error de red o inesperado al guardar.');
        }
    }

    // Handler para imagen de perfil
    const handleImagenPerfil = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImagenError(null);
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.match(/^image\/(jpeg|png|jpg|gif)$/)) {
            setImagenError('Solo se permiten imágenes (.jpg, .jpeg, .png, .gif)');
            return;
        }
        const reader = new FileReader();
        reader.onload = ev => {
            setImagenPreview(ev.target?.result as string);
            setPersonal(prev => ({ ...prev, imagen_perfil: ev.target?.result as string, imagen_perfil_file: file }));
        };
        reader.readAsDataURL(file);
    };

    // Handler para eliminar imagen de perfil
    const handleRemoveImagen = () => {
        setImagenPreview(null);
        setPersonal(prev => ({ ...prev, imagen_perfil: '', imagen_perfil_file: null }));
    };

    // Guardar domicilio
    async function handleSaveDomicilio() {
        try {
            const res = await fetch('http://localhost:4000/api/domicilios_docentes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...domicilio, id_empleado }),
            });
            const data = await res.json();
            // Manejar respuesta según éxito o error
        } catch (err) {
            // Manejar error
        }
    }

    useEffect(() => {
        if (!id_empleado) return;
        // Datos personales
        fetch(`http://localhost:4000/api/docentes?search=${id_empleado}`)
            .then(res => res.json())
            .then(data => {
                if (data.data && data.data.length > 0) {
                    setPersonal((prev: any) => ({ ...prev, ...data.data[0] }));
                    if (data.data[0].imagen_perfil) setImagenPreview(data.data[0].imagen_perfil);
                }
            });
        // Domicilio
        fetch(`http://localhost:4000/api/domicilios_docentes/${id_empleado}`)
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setDomicilio((prev: any) => ({ ...prev, ...data }));
            });
        // Certificados académicos (solo uno, el más reciente)
        fetch(`http://localhost:4000/api/certificados_academicos?page=1&pageSize=1&search=${id_empleado}`)
            .then(res => res.json())
            .then(data => {
                if (data.data && data.data.length > 0) setCertificado((prev: any) => ({ ...prev, ...data.data[0] }));
            });
        // Idiomas (solo uno, el más reciente)
        fetch(`http://localhost:4000/api/idiomas_docentes?page=1&pageSize=1&search=${id_empleado}`)
            .then(res => res.json())
            .then(data => {
                if (data.data && data.data.length > 0) setIdioma((prev: any) => ({ ...prev, ...data.data[0] }));
            });
        // SNI (solo uno, el más reciente)
        fetch(`http://localhost:4000/api/certificados_snii?page=1&pageSize=1&search=${id_empleado}`)
            .then(res => res.json())
            .then(data => {
                if (data.data && data.data.length > 0) setSnii((prev: any) => ({ ...prev, ...data.data[0] }));
            });
        // PRODEP (solo uno, el más reciente)
        fetch(`http://localhost:4000/api/certificados_prodep?page=1&pageSize=1&search=${id_empleado}`)
            .then(res => res.json())
            .then(data => {
                if (data.data && data.data.length > 0) setProdep((prev: any) => ({ ...prev, ...data.data[0] }));
            });
        // Publicaciones (solo una, la más reciente)
        fetch(`http://localhost:4000/api/publicaciones_docentes?page=1&pageSize=1&search=${id_empleado}`)
            .then(res => res.json())
            .then(data => {
                if (data.data && data.data.length > 0) setPublicacion((prev: any) => ({ ...prev, ...data.data[0] }));
            });
    }, [id_empleado]);

    return (
        <Box sx={{ width: '100%', height: 'calc(100vh - 100px)', overflowY: 'auto', pr: 2 }}>
            <Typography variant="h4" gutterBottom>Mis Datos</Typography>
            <Typography sx={{ mb: 2 }}>Consulte y edite su información personal aquí.</Typography>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="mis datos tabs"
                    TabIndicatorProps={{ style: { display: 'none' } }}
                    sx={{
                        minHeight: 48,
                    }}
                >
                    {[
                        'Datos Personales',
                        'Domicilio',
                        'Certificados Académicos',
                        'Idiomas',
                        'SNI',
                        'PRODEP',
                        'Publicaciones',
                    ].map((label, idx) => (
                        <Tab
                            key={label}
                            label={label}
                            sx={{
                                minHeight: 48,
                                fontWeight: 'normal',
                                textTransform: 'none',
                                bgcolor: tabValue === idx ? '#861d1d' : 'transparent',
                                color: tabValue === idx ? '#fff' : 'inherit',
                                borderRadius: '8px 8px 0 0',
                                transition: 'background 0.2s',
                                position: 'relative',
                                '&:hover': {
                                    bgcolor: tabValue === idx ? '#861d1d' : 'rgba(134,29,29,0.08)',
                                },
                                '&:hover::after': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    height: '4px',
                                    bgcolor: '#861d1d',
                                },
                                '&.Mui-selected': {
                                    bgcolor: '#861d1d',
                                    color: '#fff',
                                },
                                '& .MuiTab-wrapper': {
                                    fontWeight: 'normal',
                                },
                            }}
                        />
                    ))}
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={2}>
                    <Grid item xs={12} md={8} container spacing={2}>
                        <Grid item xs={12} sm={5}>
                            <TextField
                                select
                                label="Facultad"
                                name="id_facultad"
                                value={personal.id_facultad}
                                onChange={handleChange(setPersonal)}
                                fullWidth
                                required
                            >
                                {facultades.map(f => (
                                    <MenuItem key={f.id_facultad} value={f.id_facultad}>
                                        {f.id_facultad} - {f.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField label="Nombre" name="nombre" value={personal.nombre} onChange={handleChange(setPersonal)} fullWidth required />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField label="Apellido Paterno" name="apellido_paterno" value={personal.apellido_paterno} onChange={handleChange(setPersonal)} fullWidth required />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField label="Apellido Materno" name="apellido_materno" value={personal.apellido_materno} onChange={handleChange(setPersonal)} fullWidth required />
                        </Grid>
                        <Grid item xs={12} sm={3}><TextField select label="Sexo" name="sexo" value={personal.sexo} onChange={handleChange(setPersonal)} fullWidth required>{sexoEnum.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField></Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField label="Fecha de Nacimiento" name="fecha_nacimiento" type="date" value={personal.fecha_nacimiento ? personal.fecha_nacimiento.slice(0, 10) : ''} onChange={handleChange(setPersonal)} fullWidth required InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField label="Teléfono" name="telefono" value={personal.telefono} onChange={handleChange(setPersonal)} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField label="RFC" name="rfc" value={personal.rfc} onChange={handleChange(setPersonal)} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField label="CURP" name="curp" value={personal.curp} onChange={handleChange(setPersonal)} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField select label="Tipo Contratación" name="tipo_contratacion" value={personal.tipo_contratacion} onChange={handleChange(setPersonal)} fullWidth>{tipoContratacionEnum.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField select label="Tipo Plaza" name="tipo_plaza" value={personal.tipo_plaza} onChange={handleChange(setPersonal)} fullWidth>{tipoPlazaEnum.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField label="Fecha de Ingreso" name="fecha_ingreso" type="date" value={personal.fecha_ingreso ? personal.fecha_ingreso.slice(0, 10) : ''} onChange={handleChange(setPersonal)} fullWidth required InputLabelProps={{ shrink: true }} />
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, alignSelf: 'flex-start' }}>Imagen de perfil</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                                <Box sx={{ width: 120, height: 120, position: 'relative', mr: 2, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {imagenPreview ? (
                                        <>
                                            <img src={imagenPreview} alt="Vista previa" style={{ width: 120, height: 120, objectFit: 'cover', display: 'block' }} />
                                            <IconButton
                                                size="small"
                                                onClick={handleRemoveImagen}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    background: 'rgba(255,255,255,0.8)',
                                                    color: '#861d1d',
                                                    boxShadow: 1,
                                                    zIndex: 2,
                                                    '&:hover': {
                                                        background: '#fff',
                                                        color: '#5e1414',
                                                    },
                                                }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">Sin imagen</Typography>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120 }}>
                                    <input
                                        accept="image/jpeg,image/png,image/jpg,image/gif"
                                        type="file"
                                        style={{ display: 'none' }}
                                        id="imagen-perfil-upload"
                                        onChange={handleImagenPerfil}
                                    />
                                    <label htmlFor="imagen-perfil-upload">
                                        <Button
                                            variant="contained"
                                            component="span"
                                            sx={{
                                                backgroundColor: '#861d1d',
                                                color: '#fff',
                                                borderRadius: 2,
                                                boxShadow: '0 2px 8px 0 rgba(134,29,29,0.15)',
                                                textTransform: 'none',
                                                fontWeight: 'normal',
                                                mb: 1,
                                                '&:hover': {
                                                    backgroundColor: '#5e1414',
                                                },
                                            }}
                                        >
                                            Seleccionar imagen
                                        </Button>
                                    </label>
                                    {imagenError && (
                                        <Typography color="error" variant="caption">{imagenError}</Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                    <Button 
                        variant="contained"
                        sx={{
                            backgroundColor: '#861d1d',
                            color: '#fff',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px 0 rgba(134,29,29,0.15)',
                            textTransform: 'none',
                            fontWeight: 'normal',
                            '&:hover': {
                                backgroundColor: '#5e1414',
                            },
                        }}
                        onClick={handleSavePersonal}
                    >
                        Guardar Datos Personales
                    </Button>
                    {personalError && (
                        <Snackbar open autoHideDuration={4000} onClose={() => setPersonalError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                            <Alert severity="error" onClose={() => setPersonalError(null)}>{personalError}</Alert>
                        </Snackbar>
                    )}
                    {personalSuccess && (
                        <Snackbar open autoHideDuration={4000} onClose={() => setPersonalSuccess(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                            <Alert severity="success" onClose={() => setPersonalSuccess(null)}>{personalSuccess}</Alert>
                        </Snackbar>
                    )}
                </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}><TextField label="Calle" name="calle" value={domicilio.calle} onChange={handleChange(setDomicilio)} fullWidth /></Grid>
                        <Grid item xs={12} sm={2}><TextField label="Número" name="numero" value={domicilio.numero} onChange={handleChange(setDomicilio)} fullWidth /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Colonia" name="colonia" value={domicilio.colonia} onChange={handleChange(setDomicilio)} fullWidth /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Ciudad" name="ciudad" value={domicilio.ciudad} onChange={handleChange(setDomicilio)} fullWidth /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Estado" name="estado" value={domicilio.estado} onChange={handleChange(setDomicilio)} fullWidth /></Grid>
                        <Grid item xs={12} sm={2}><TextField label="Código Postal" name="codigo_postal" value={domicilio.codigo_postal} onChange={handleChange(setDomicilio)} fullWidth /></Grid>
                    </Grid>
                <Box sx={{ mt: 2 }}>
                    <Button 
                        variant="contained"
                        sx={{
                            backgroundColor: '#861d1d',
                            color: '#fff',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px 0 rgba(134,29,29,0.15)',
                            textTransform: 'none',
                            fontWeight: 'normal',
                            '&:hover': {
                                backgroundColor: '#5e1414',
                            },
                        }}
                        onClick={handleSaveDomicilio}
                    >
                        Guardar Domicilio
                    </Button>
                </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}><TextField select label="Tipo" name="tipo" value={certificado.tipo} onChange={handleChange(setCertificado)} fullWidth required>{tipoCertificadoEnum.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField></Grid>
                        <Grid item xs={12} sm={4}><TextField label="Nombre del Título" name="nombre_titulo" value={certificado.nombre_titulo} onChange={handleChange(setCertificado)} fullWidth required /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Institución" name="institucion" value={certificado.institucion} onChange={handleChange(setCertificado)} fullWidth /></Grid>
                        <Grid item xs={12} sm={2}><TextField label="Año de Obtención" name="anio_obtencion" type="number" value={certificado.anio_obtencion} onChange={handleChange(setCertificado)} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <label htmlFor="certificado-pdf-upload" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                                <PictureAsPdfIcon sx={{ fontSize: 32, color: '#861d1d' }} />
                                <Button
                                    variant="outlined"
                                    component="span"
                                    sx={{
                                        backgroundColor: '#f5f5f5',
                                        color: '#861d1d',
                                        border: '2px solid #861d1d',
                                        borderRadius: 2,
                                        boxShadow: '0 2px 8px 0 rgba(134,29,29,0.08)',
                                        textTransform: 'none',
                                        fontWeight: 'normal',
                                        fontSize: '1rem',
                                        px: 2,
                                        py: 1,
                                        minWidth: 120,
                                        '&:hover': {
                                            backgroundColor: '#e9e9e9',
                                            border: '2px solid #861d1d',
                                            color: '#5e1414',
                                        },
                                    }}
                                >
                                    Subir PDF
                                </Button>
                            </label>
                            <input
                                id="certificado-pdf-upload"
                                type="file"
                                accept="application/pdf"
                                style={{ display: 'none' }}
                                onChange={e => {
                                    const file = e.target.files && e.target.files[0];
                                    if (file && file.type === 'application/pdf') {
                                        setCertificado(prev => ({ ...prev, archivo_pdf_nombre: file.name }));
                                        const reader = new FileReader();
                                        reader.onload = ev => setCertificado(prev => ({ ...prev, archivo_pdf: ev.target?.result as string }));
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </Box>
                        {certificado.archivo_pdf && (
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>PDF cargado correctamente</Typography>
                                {certificado.archivo_pdf_nombre && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{certificado.archivo_pdf_nombre}</Typography>
                                        <IconButton size="small" onClick={() => setCertificado(prev => ({ ...prev, archivo_pdf: '', archivo_pdf_nombre: '' }))} sx={{ p: 0.5, color: '#861d1d' }}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                    <Button 
                        variant="contained"
                        sx={{
                            backgroundColor: '#861d1d',
                            color: '#fff',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px 0 rgba(134,29,29,0.15)',
                            textTransform: 'none',
                            fontWeight: 'normal',
                            '&:hover': {
                                backgroundColor: '#5e1414',
                            },
                        }}
                    >
                        Guardar Certificado
                    </Button>
                </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}><TextField label="Idioma" name="idioma" value={idioma.idioma} onChange={handleChange(setIdioma)} fullWidth required /></Grid>
                        <Grid item xs={12} sm={3}><TextField select label="Nivel" name="nivel" value={idioma.nivel} onChange={handleChange(setIdioma)} fullWidth required>{nivelIdiomaEnum.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Certificado" name="certificado" value={idioma.certificado} onChange={handleChange(setIdioma)} fullWidth /></Grid>
                        <Grid item xs={12} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <label htmlFor="idioma-pdf-upload" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                                    <PictureAsPdfIcon sx={{ fontSize: 32, color: '#861d1d' }} />
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        sx={{
                                            backgroundColor: '#f5f5f5',
                                            color: '#861d1d',
                                            border: '2px solid #861d1d',
                                            borderRadius: 2,
                                            boxShadow: '0 2px 8px 0 rgba(134,29,29,0.08)',
                                            textTransform: 'none',
                                            fontWeight: 'normal',
                                            fontSize: '1rem',
                                            px: 2,
                                            py: 1,
                                            minWidth: 120,
                                            '&:hover': {
                                                backgroundColor: '#e9e9e9',
                                                border: '2px solid #861d1d',
                                                color: '#5e1414',
                                            },
                                        }}
                                    >
                                        Subir PDF
                                    </Button>
                                </label>
                                <input
                                    id="idioma-pdf-upload"
                                    type="file"
                                    accept="application/pdf"
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                        const file = e.target.files && e.target.files[0];
                                        if (file && file.type === 'application/pdf') {
                                            setIdioma(prev => ({ ...prev, archivo_certificado_nombre: file.name }));
                                            const reader = new FileReader();
                                            reader.onload = ev => setIdioma(prev => ({ ...prev, archivo_certificado: ev.target?.result as string }));
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </Box>
                            {idioma.archivo_certificado && (
                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>PDF cargado correctamente</Typography>
                                    {idioma.archivo_certificado_nombre && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{idioma.archivo_certificado_nombre}</Typography>
                                            <IconButton size="small" onClick={() => setIdioma(prev => ({ ...prev, archivo_certificado: '', archivo_certificado_nombre: '' }))} sx={{ p: 0.5, color: '#861d1d' }}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                <Box sx={{ mt: 2 }}>
                    <Button 
                        variant="contained"
                        sx={{
                            backgroundColor: '#861d1d',
                            color: '#fff',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px 0 rgba(134,29,29,0.15)',
                            textTransform: 'none',
                            fontWeight: 'normal',
                            '&:hover': {
                                backgroundColor: '#5e1414',
                            },
                        }}
                    >
                        Guardar Idioma
                    </Button>
                </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}><TextField select label="Nivel" name="nivel" value={snii.nivel} onChange={handleChange(setSnii)} fullWidth required>{nivelSniiEnum.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Fecha Certificación" name="fecha_certificacion" type="date" value={snii.fecha_certificacion} onChange={handleChange(setSnii)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <label htmlFor="snii-pdf-upload" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                                    <PictureAsPdfIcon sx={{ fontSize: 32, color: '#861d1d' }} />
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        sx={{
                                            backgroundColor: '#f5f5f5',
                                            color: '#861d1d',
                                            border: '2px solid #861d1d',
                                            borderRadius: 2,
                                            boxShadow: '0 2px 8px 0 rgba(134,29,29,0.08)',
                                            textTransform: 'none',
                                            fontWeight: 'normal',
                                            fontSize: '1rem',
                                            px: 2,
                                            py: 1,
                                            minWidth: 120,
                                            '&:hover': {
                                                backgroundColor: '#e9e9e9',
                                                border: '2px solid #861d1d',
                                                color: '#5e1414',
                                            },
                                        }}
                                    >
                                        Subir PDF
                                    </Button>
                                </label>
                                <input
                                    id="snii-pdf-upload"
                                    type="file"
                                    accept="application/pdf"
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                        const file = e.target.files && e.target.files[0];
                                        if (file && file.type === 'application/pdf') {
                                            setSnii(prev => ({ ...prev, archivo_certificado_nombre: file.name }));
                                            const reader = new FileReader();
                                            reader.onload = ev => setSnii(prev => ({ ...prev, archivo_certificado: ev.target?.result as string }));
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </Box>
                            {snii.archivo_certificado && (
                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>PDF cargado correctamente</Typography>
                                    {snii.archivo_certificado_nombre && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{snii.archivo_certificado_nombre}</Typography>
                                            <IconButton size="small" onClick={() => setSnii(prev => ({ ...prev, archivo_certificado: '', archivo_certificado_nombre: '' }))} sx={{ p: 0.5, color: '#861d1d' }}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                <Box sx={{ mt: 2 }}>
                    <Button 
                        variant="contained"
                        sx={{
                            backgroundColor: '#861d1d',
                            color: '#fff',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px 0 rgba(134,29,29,0.15)',
                            textTransform: 'none',
                            fontWeight: 'normal',
                            '&:hover': {
                                backgroundColor: '#5e1414',
                            },
                        }}
                    >
                        Guardar SNI
                    </Button>
                </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}><TextField label="Fecha Fin" name="fecha_fin" type="date" value={prodep.fecha_fin} onChange={handleChange(setProdep)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <label htmlFor="prodep-pdf-upload" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                                    <PictureAsPdfIcon sx={{ fontSize: 32, color: '#861d1d' }} />
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        sx={{
                                            backgroundColor: '#f5f5f5',
                                            color: '#861d1d',
                                            border: '2px solid #861d1d',
                                            borderRadius: 2,
                                            boxShadow: '0 2px 8px 0 rgba(134,29,29,0.08)',
                                            textTransform: 'none',
                                            fontWeight: 'normal',
                                            fontSize: '1rem',
                                            px: 2,
                                            py: 1,
                                            minWidth: 120,
                                            '&:hover': {
                                                backgroundColor: '#e9e9e9',
                                                border: '2px solid #861d1d',
                                                color: '#5e1414',
                                            },
                                        }}
                                    >
                                        Subir PDF
                                    </Button>
                                </label>
                                <input
                                    id="prodep-pdf-upload"
                                    type="file"
                                    accept="application/pdf"
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                        const file = e.target.files && e.target.files[0];
                                        if (file && file.type === 'application/pdf') {
                                            setProdep(prev => ({ ...prev, archivo_certificado_nombre: file.name }));
                                            const reader = new FileReader();
                                            reader.onload = ev => setProdep(prev => ({ ...prev, archivo_certificado: ev.target?.result as string }));
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </Box>
                            {prodep.archivo_certificado && (
                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>PDF cargado correctamente</Typography>
                                    {prodep.archivo_certificado_nombre && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{prodep.archivo_certificado_nombre}</Typography>
                                            <IconButton size="small" onClick={() => setProdep(prev => ({ ...prev, archivo_certificado: '', archivo_certificado_nombre: '' }))} sx={{ p: 0.5, color: '#861d1d' }}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                <Box sx={{ mt: 2 }}>
                    <Button 
                        variant="contained"
                        sx={{
                            backgroundColor: '#861d1d',
                            color: '#fff',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px 0 rgba(134,29,29,0.15)',
                            textTransform: 'none',
                            fontWeight: 'normal',
                            '&:hover': {
                                backgroundColor: '#5e1414',
                            },
                        }}
                    >
                        Guardar PRODEP
                    </Button>
                </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={6}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}><TextField select label="Tipo" name="tipo" value={publicacion.tipo} onChange={handleChange(setPublicacion)} fullWidth required>{tipoPublicacionEnum.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField></Grid>
                        <Grid item xs={12} sm={4}><TextField label="Título" name="titulo" value={publicacion.titulo} onChange={handleChange(setPublicacion)} fullWidth required /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Fecha Publicación" name="fecha_publicacion" type="date" value={publicacion.fecha_publicacion} onChange={handleChange(setPublicacion)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={4}><TextField label="Revista o Editorial" name="revista_o_editorial" value={publicacion.revista_o_editorial} onChange={handleChange(setPublicacion)} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <label htmlFor="publicacion-pdf-upload" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                                    <PictureAsPdfIcon sx={{ fontSize: 32, color: '#861d1d' }} />
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        sx={{
                                            backgroundColor: '#f5f5f5',
                                            color: '#861d1d',
                                            border: '2px solid #861d1d',
                                            borderRadius: 2,
                                            boxShadow: '0 2px 8px 0 rgba(134,29,29,0.08)',
                                            textTransform: 'none',
                                            fontWeight: 'normal',
                                            fontSize: '1rem',
                                            px: 2,
                                            py: 1,
                                            minWidth: 120,
                                            '&:hover': {
                                                backgroundColor: '#e9e9e9',
                                                border: '2px solid #861d1d',
                                                color: '#5e1414',
                                            },
                                        }}
                                    >
                                        Subir PDF
                                    </Button>
                                </label>
                                <input
                                    id="publicacion-pdf-upload"
                                    type="file"
                                    accept="application/pdf"
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                        const file = e.target.files && e.target.files[0];
                                        if (file && file.type === 'application/pdf') {
                                            setPublicacion(prev => ({ ...prev, archivo_pdf_nombre: file.name }));
                                            const reader = new FileReader();
                                            reader.onload = ev => setPublicacion(prev => ({ ...prev, archivo_pdf: ev.target?.result as string }));
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </Box>
                            {publicacion.archivo_pdf && (
                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>PDF cargado correctamente</Typography>
                                    {publicacion.archivo_pdf_nombre && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{publicacion.archivo_pdf_nombre}</Typography>
                                            <IconButton size="small" onClick={() => setPublicacion(prev => ({ ...prev, archivo_pdf: '', archivo_pdf_nombre: '' }))} sx={{ p: 0.5, color: '#861d1d' }}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                <Box sx={{ mt: 2 }}>
                    <Button 
                        variant="contained"
                        sx={{
                            backgroundColor: '#861d1d',
                            color: '#fff',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px 0 rgba(134,29,29,0.15)',
                            textTransform: 'none',
                            fontWeight: 'normal',
                            '&:hover': {
                                backgroundColor: '#5e1414',
                            },
                        }}
                    >
                        Guardar Publicación
                    </Button>
                </Box>
            </TabPanel>
        </Box>
    );
} 