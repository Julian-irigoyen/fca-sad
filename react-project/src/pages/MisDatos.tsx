import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, TextField, MenuItem, Button, Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';

// Enums y helpers
const sexoEnum = ['M', 'F', 'Otro'];
const tipoContratacionEnum = ['Tiempo Completo', 'Medio Tiempo', 'Honorarios'];
const tipoPlazaEnum = ['Base', 'Interino', 'Otro'];
const tipoCertificadoEnum = ['Licenciatura', 'Maestría', 'Doctorado'];
const nivelIdiomaEnum = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];
const nivelSniiEnum = ['Candidato', 'Nivel I', 'Nivel II', 'Nivel III'];
const tipoPublicacionEnum = ['Artículo', 'Libro', 'Ponencia', 'Otro'];

export default function MisDatos() {
    // Estados locales para formularios (mock, luego se conectarán a la API)
    const [personal, setPersonal] = useState({
        id_empleado: '',
        id_facultad: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        sexo: '',
        fecha_nacimiento: '',
        correo: '',
        telefono: '',
        rfc: '',
        curp: '',
        tipo_contratacion: '',
        tipo_plaza: '',
        fecha_ingreso: '',
        imagen_perfil: '',
    });
    const [domicilio, setDomicilio] = useState({
        calle: '', numero: '', colonia: '', ciudad: '', estado: '', codigo_postal: ''
    });
    const [certificado, setCertificado] = useState({
        tipo: '', nombre_titulo: '', institucion: '', anio_obtencion: '', archivo_pdf: ''
    });
    const [idioma, setIdioma] = useState({
        idioma: '', nivel: '', certificado: '', archivo_certificado: ''
    });
    const [snii, setSnii] = useState({
        nivel: '', fecha_certificacion: '', archivo_certificado: ''
    });
    const [prodep, setProdep] = useState({
        fecha_fin: '', archivo_certificado: ''
    });
    const [publicacion, setPublicacion] = useState({
        tipo: '', titulo: '', fecha_publicacion: '', revista_o_editorial: '', archivo_pdf: ''
    });

    // Handlers genéricos
    const handleChange = (setState: any) => (e: any) => {
        setState((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Mis Datos</Typography>
            <Typography sx={{ mb: 2 }}>Consulte y edite su información personal aquí.</Typography>
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><b>Datos Personales</b></AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}><TextField label="Nombre" name="nombre" value={personal.nombre} onChange={handleChange(setPersonal)} fullWidth required /></Grid>
                        <Grid item xs={12} sm={4}><TextField label="Apellido Paterno" name="apellido_paterno" value={personal.apellido_paterno} onChange={handleChange(setPersonal)} fullWidth required /></Grid>
                        <Grid item xs={12} sm={4}><TextField label="Apellido Materno" name="apellido_materno" value={personal.apellido_materno} onChange={handleChange(setPersonal)} fullWidth required /></Grid>
                        <Grid item xs={12} sm={3}><TextField select label="Sexo" name="sexo" value={personal.sexo} onChange={handleChange(setPersonal)} fullWidth required>{sexoEnum.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Fecha de Nacimiento" name="fecha_nacimiento" type="date" value={personal.fecha_nacimiento} onChange={handleChange(setPersonal)} fullWidth required InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Correo" name="correo" value={personal.correo} onChange={handleChange(setPersonal)} fullWidth required /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Teléfono" name="telefono" value={personal.telefono} onChange={handleChange(setPersonal)} fullWidth /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="RFC" name="rfc" value={personal.rfc} onChange={handleChange(setPersonal)} fullWidth /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="CURP" name="curp" value={personal.curp} onChange={handleChange(setPersonal)} fullWidth /></Grid>
                        <Grid item xs={12} sm={3}><TextField select label="Tipo Contratación" name="tipo_contratacion" value={personal.tipo_contratacion} onChange={handleChange(setPersonal)} fullWidth>{tipoContratacionEnum.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField></Grid>
                        <Grid item xs={12} sm={3}><TextField select label="Tipo Plaza" name="tipo_plaza" value={personal.tipo_plaza} onChange={handleChange(setPersonal)} fullWidth>{tipoPlazaEnum.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Fecha de Ingreso" name="fecha_ingreso" type="date" value={personal.fecha_ingreso} onChange={handleChange(setPersonal)} fullWidth required InputLabelProps={{ shrink: true }} /></Grid>
                        {/* Imagen de perfil: input tipo file (mock) */}
                        <Grid item xs={12} sm={6}><TextField label="Imagen de Perfil (URL o base64)" name="imagen_perfil" value={personal.imagen_perfil} onChange={handleChange(setPersonal)} fullWidth /></Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}><Button variant="contained">Guardar Datos Personales</Button></Box>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><b>Domicilio</b></AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}><TextField label="Calle" name="calle" value={domicilio.calle} onChange={handleChange(setDomicilio)} fullWidth /></Grid>
                        <Grid item xs={12} sm={2}><TextField label="Número" name="numero" value={domicilio.numero} onChange={handleChange(setDomicilio)} fullWidth /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Colonia" name="colonia" value={domicilio.colonia} onChange={handleChange(setDomicilio)} fullWidth /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Ciudad" name="ciudad" value={domicilio.ciudad} onChange={handleChange(setDomicilio)} fullWidth /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Estado" name="estado" value={domicilio.estado} onChange={handleChange(setDomicilio)} fullWidth /></Grid>
                        <Grid item xs={12} sm={2}><TextField label="Código Postal" name="codigo_postal" value={domicilio.codigo_postal} onChange={handleChange(setDomicilio)} fullWidth /></Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}><Button variant="contained">Guardar Domicilio</Button></Box>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><b>Certificados Académicos</b></AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}><TextField select label="Tipo" name="tipo" value={certificado.tipo} onChange={handleChange(setCertificado)} fullWidth required>{tipoCertificadoEnum.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField></Grid>
                        <Grid item xs={12} sm={4}><TextField label="Nombre del Título" name="nombre_titulo" value={certificado.nombre_titulo} onChange={handleChange(setCertificado)} fullWidth required /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Institución" name="institucion" value={certificado.institucion} onChange={handleChange(setCertificado)} fullWidth /></Grid>
                        <Grid item xs={12} sm={2}><TextField label="Año de Obtención" name="anio_obtencion" type="number" value={certificado.anio_obtencion} onChange={handleChange(setCertificado)} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Archivo PDF (URL/base64)" name="archivo_pdf" value={certificado.archivo_pdf} onChange={handleChange(setCertificado)} fullWidth /></Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}><Button variant="contained">Guardar Certificado</Button></Box>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><b>Idiomas</b></AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}><TextField label="Idioma" name="idioma" value={idioma.idioma} onChange={handleChange(setIdioma)} fullWidth required /></Grid>
                        <Grid item xs={12} sm={3}><TextField select label="Nivel" name="nivel" value={idioma.nivel} onChange={handleChange(setIdioma)} fullWidth required>{nivelIdiomaEnum.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Certificado" name="certificado" value={idioma.certificado} onChange={handleChange(setIdioma)} fullWidth /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Archivo Certificado (URL/base64)" name="archivo_certificado" value={idioma.archivo_certificado} onChange={handleChange(setIdioma)} fullWidth /></Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}><Button variant="contained">Guardar Idioma</Button></Box>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><b>Certificado SNI</b></AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}><TextField select label="Nivel" name="nivel" value={snii.nivel} onChange={handleChange(setSnii)} fullWidth required>{nivelSniiEnum.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Fecha Certificación" name="fecha_certificacion" type="date" value={snii.fecha_certificacion} onChange={handleChange(setSnii)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Archivo Certificado (URL/base64)" name="archivo_certificado" value={snii.archivo_certificado} onChange={handleChange(setSnii)} fullWidth /></Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}><Button variant="contained">Guardar SNI</Button></Box>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><b>Certificado PRODEP</b></AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}><TextField label="Fecha Fin" name="fecha_fin" type="date" value={prodep.fecha_fin} onChange={handleChange(setProdep)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Archivo Certificado (URL/base64)" name="archivo_certificado" value={prodep.archivo_certificado} onChange={handleChange(setProdep)} fullWidth /></Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}><Button variant="contained">Guardar PRODEP</Button></Box>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><b>Publicaciones</b></AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}><TextField select label="Tipo" name="tipo" value={publicacion.tipo} onChange={handleChange(setPublicacion)} fullWidth required>{tipoPublicacionEnum.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}</TextField></Grid>
                        <Grid item xs={12} sm={4}><TextField label="Título" name="titulo" value={publicacion.titulo} onChange={handleChange(setPublicacion)} fullWidth required /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Fecha Publicación" name="fecha_publicacion" type="date" value={publicacion.fecha_publicacion} onChange={handleChange(setPublicacion)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={4}><TextField label="Revista o Editorial" name="revista_o_editorial" value={publicacion.revista_o_editorial} onChange={handleChange(setPublicacion)} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Archivo PDF (URL/base64)" name="archivo_pdf" value={publicacion.archivo_pdf} onChange={handleChange(setPublicacion)} fullWidth /></Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}><Button variant="contained">Guardar Publicación</Button></Box>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
} 