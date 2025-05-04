import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, TextField, Typography, CircularProgress, Alert, Snackbar, Tabs, Tab } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Download as DownloadIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Mock faculties (replace with API call if needed)
const faculties = [
    { id_facultad: 1, nombre: 'Facultad de Ingeniería' },
    { id_facultad: 2, nombre: 'Facultad de Derecho' },
    { id_facultad: 3, nombre: 'Facultad de Medicina' },
];

// Enum values (could be generated from schema in the future)
const sexoEnum = ['M', 'F', 'Otro'];
const tipoContratacionEnum = ['Tiempo Completo', 'Medio Tiempo', 'Honorarios'];
const tipoPlazaEnum = ['Base', 'Interino', 'Otro'];

// Mock docentes
type Docente = {
    id_empleado: number;
    id_facultad: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    sexo: string;
    fecha_nacimiento: string;
    correo: string;
    telefono?: string;
    rfc?: string;
    curp?: string;
    tipo_contratacion?: string;
    tipo_plaza?: string;
    fecha_ingreso: string;
    imagen_perfil?: string;
};

type DocenteForm = {
    id_empleado: string;
    id_facultad: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    sexo: string;
    fecha_nacimiento: string;
    correo: string;
    telefono: string;
    rfc: string;
    curp: string;
    tipo_contratacion: string;
    tipo_plaza: string;
    fecha_ingreso: string;
    imagen_perfil: string;
};

function isValidEmail(email: string) {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email);
}
function isValidPhone(phone: string) {
    return !phone || /^[0-9\-\s\(\)]{7,20}$/.test(phone);
}
function isValidRFC(rfc: string) {
    return !rfc || /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(rfc.toUpperCase());
}
function isValidCURP(curp: string) {
    return !curp || /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}$/.test(curp.toUpperCase());
}
function isValidName(name: string) {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(name);
}
function isValidSexo(sexo: string) {
    return sexoEnum.includes(sexo);
}
function isValidTipoContratacion(tc: string) {
    return !tc || tipoContratacionEnum.includes(tc);
}
function isValidTipoPlaza(tp: string) {
    return !tp || tipoPlazaEnum.includes(tp);
}

const TABLE_KEYS = [
    'docentes',
    'facultades',
    'domicilios_docentes',
    'certificados_academicos',
    'idiomas_docentes',
    'certificados_snii',
    'certificados_prodep',
    'publicaciones_docentes',
];

function toPrettyLabel(key: string) {
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Configuración de tablas basada en el schema
const TABLE_CONFIG: Record<string, {
    fields: { name: string, label: string, type: string, required?: boolean, enumValues?: string[] }[],
    endpoint: string
}> = {
    docentes: {
        fields: [
            { name: 'id_empleado', label: 'ID Empleado', type: 'number', required: true },
            { name: 'id_facultad', label: 'ID Facultad', type: 'number', required: true },
            { name: 'nombre', label: 'Nombre', type: 'text', required: true },
            { name: 'apellido_paterno', label: 'Apellido Paterno', type: 'text', required: true },
            { name: 'apellido_materno', label: 'Apellido Materno', type: 'text', required: true },
            { name: 'sexo', label: 'Sexo', type: 'enum', required: true, enumValues: ['M', 'F', 'Otro'] },
            { name: 'fecha_nacimiento', label: 'Fecha de Nacimiento', type: 'date', required: true },
            { name: 'correo', label: 'Correo', type: 'text', required: true },
            { name: 'telefono', label: 'Teléfono', type: 'text' },
            { name: 'rfc', label: 'RFC', type: 'text' },
            { name: 'curp', label: 'CURP', type: 'text' },
            { name: 'tipo_contratacion', label: 'Tipo Contratación', type: 'enum', enumValues: ['Tiempo Completo', 'Medio Tiempo', 'Honorarios'] },
            { name: 'tipo_plaza', label: 'Tipo Plaza', type: 'enum', enumValues: ['Base', 'Interino', 'Otro'] },
            { name: 'fecha_ingreso', label: 'Fecha de Ingreso', type: 'date', required: true },
            { name: 'imagen_perfil', label: 'Imagen de Perfil', type: 'text' },
        ],
        endpoint: 'docentes',
    },
    facultades: {
        fields: [
            { name: 'id_facultad', label: 'ID Facultad', type: 'number', required: true },
            { name: 'nombre', label: 'Nombre', type: 'text', required: true },
        ],
        endpoint: 'facultades',
    },
    domicilios_docentes: {
        fields: [
            { name: 'id_empleado', label: 'ID Empleado', type: 'number', required: true },
            { name: 'calle', label: 'Calle', type: 'text' },
            { name: 'numero', label: 'Número', type: 'text' },
            { name: 'colonia', label: 'Colonia', type: 'text' },
            { name: 'ciudad', label: 'Ciudad', type: 'text' },
            { name: 'estado', label: 'Estado', type: 'text' },
            { name: 'codigo_postal', label: 'Código Postal', type: 'text' },
        ],
        endpoint: 'domicilios_docentes',
    },
    certificados_academicos: {
        fields: [
            { name: 'id_certificado', label: 'ID Certificado', type: 'number', required: true },
            { name: 'id_empleado', label: 'ID Empleado', type: 'number' },
            { name: 'tipo', label: 'Tipo', type: 'enum', required: true, enumValues: ['Licenciatura', 'Maestría', 'Doctorado'] },
            { name: 'nombre_titulo', label: 'Nombre del Título', type: 'text', required: true },
            { name: 'institucion', label: 'Institución', type: 'text' },
            { name: 'anio_obtencion', label: 'Año de Obtención', type: 'number' },
            { name: 'archivo_pdf', label: 'Archivo PDF', type: 'text' },
        ],
        endpoint: 'certificados_academicos',
    },
    idiomas_docentes: {
        fields: [
            { name: 'id_idioma', label: 'ID Idioma', type: 'number', required: true },
            { name: 'id_empleado', label: 'ID Empleado', type: 'number' },
            { name: 'idioma', label: 'Idioma', type: 'text', required: true },
            { name: 'nivel', label: 'Nivel', type: 'enum', required: true, enumValues: ['Básico', 'Intermedio', 'Avanzado', 'Nativo'] },
            { name: 'certificado', label: 'Certificado', type: 'text' },
            { name: 'archivo_certificado', label: 'Archivo Certificado', type: 'text' },
        ],
        endpoint: 'idiomas_docentes',
    },
    certificados_snii: {
        fields: [
            { name: 'id_snii', label: 'ID SNI', type: 'number', required: true },
            { name: 'id_empleado', label: 'ID Empleado', type: 'number' },
            { name: 'nivel', label: 'Nivel', type: 'enum', required: true, enumValues: ['Candidato', 'Nivel I', 'Nivel II', 'Nivel III'] },
            { name: 'fecha_certificacion', label: 'Fecha Certificación', type: 'date' },
            { name: 'archivo_certificado', label: 'Archivo Certificado', type: 'text' },
        ],
        endpoint: 'certificados_snii',
    },
    certificados_prodep: {
        fields: [
            { name: 'id_prodep', label: 'ID PRODEP', type: 'number', required: true },
            { name: 'id_empleado', label: 'ID Empleado', type: 'number' },
            { name: 'fecha_fin', label: 'Fecha Fin', type: 'date' },
            { name: 'archivo_certificado', label: 'Archivo Certificado', type: 'text' },
        ],
        endpoint: 'certificados_prodep',
    },
    publicaciones_docentes: {
        fields: [
            { name: 'id_publicacion', label: 'ID Publicación', type: 'number', required: true },
            { name: 'id_empleado', label: 'ID Empleado', type: 'number' },
            { name: 'tipo', label: 'Tipo', type: 'enum', required: true, enumValues: ['Artículo', 'Libro', 'Ponencia', 'Otro'] },
            { name: 'titulo', label: 'Título', type: 'text', required: true },
            { name: 'fecha_publicacion', label: 'Fecha Publicación', type: 'date' },
            { name: 'revista_o_editorial', label: 'Revista o Editorial', type: 'text' },
            { name: 'archivo_pdf', label: 'Archivo PDF', type: 'text' },
        ],
        endpoint: 'publicaciones_docentes',
    },
};

const PDF_FIELDS: Record<string, string> = {
    certificados_academicos: 'archivo_pdf',
    idiomas_docentes: 'archivo_certificado',
    certificados_snii: 'archivo_certificado',
    certificados_prodep: 'archivo_certificado',
    publicaciones_docentes: 'archivo_pdf',
};

// Debounce hook
function useDebouncedValue<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
}

// Añadir hook para cargar facultades dinámicamente
function useFacultades() {
    const [facultades, setFacultades] = useState<any[]>([]);
    useEffect(() => {
        fetch(`${API_URL}/facultades?page=1&pageSize=1000`)
            .then(res => res.json())
            .then(data => setFacultades(data.data || []))
            .catch(() => setFacultades([]));
    }, []);
    return facultades;
}

export default function Docentes() {
    const [selectedTable, setSelectedTable] = useState('docentes');
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 400);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [form, setForm] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const facultades = useFacultades();

    // Fetch data from API
    useEffect(() => {
        fetchData(page, pageSize, debouncedSearch, selectedTable);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, debouncedSearch, selectedTable]);

    const fetchData = useCallback(async (page: number, pageSize: number, search: string, table: string) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: String(page + 1),
                pageSize: String(pageSize),
            });
            if (search) params.append('search', search);
            const res = await fetch(`${API_URL}/${TABLE_CONFIG[table].endpoint}?${params.toString()}`);
            if (!res.ok) throw new Error('Error al obtener datos');
            const data = await res.json();
            setData(data.data);
            setTotal(data.total);
        } catch (err: any) {
            setError(err.message || 'Error al obtener datos');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            setForm({ ...form, [name]: files[0] });
        }
    };

    const handleSave = async () => {
        const config = TABLE_CONFIG[selectedTable];
        for (const field of config.fields) {
            if (field.required && !form[field.name]) {
                setFormError(`El campo ${field.label} es obligatorio.`);
                return;
            }
        }
        if (selectedTable === 'docentes') {
            if (!isValidEmail(form.correo)) {
                setFormError('El correo no tiene un formato válido.');
                return;
            }
            if (form.rfc && !isValidRFC(form.rfc)) {
                setFormError('El RFC no tiene un formato válido.');
                return;
            }
            if (form.curp && !isValidCURP(form.curp)) {
                setFormError('El CURP no tiene un formato válido.');
                return;
            }
        }
        setFormError(null);
        setLoading(true);
        try {
            let res;
            const pdfField = PDF_FIELDS[selectedTable];
            if (pdfField) {
                const formData = new FormData();
                Object.entries(form).forEach(([key, value]) => {
                    if (
                        value !== undefined &&
                        value !== null &&
                        (typeof value === 'string' || typeof value === 'number' || value instanceof File || value instanceof Blob)
                    ) {
                        formData.append(key, value as any);
                    }
                });
                if (editing) {
                    res = await fetch(`${API_URL}/${config.endpoint}/${editing[config.fields[0].name]}`, {
                        method: 'PUT',
                        body: formData,
                    });
                } else {
                    res = await fetch(`${API_URL}/${config.endpoint}`, {
                        method: 'POST',
                        body: formData,
                    });
                }
            } else {
                if (editing) {
                    res = await fetch(`${API_URL}/${config.endpoint}/${editing[config.fields[0].name]}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(form),
                    });
                } else {
                    res = await fetch(`${API_URL}/${config.endpoint}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(form),
                    });
                }
            }
            if (!res.ok) {
                let errorMsg = '';
                try {
                    const data = await res.json();
                    errorMsg = data.error || '';
                } catch { }
                if (errorMsg && errorMsg.toLowerCase().includes('correo')) {
                    setFormError('El correo ya está registrado. Usa uno diferente.');
                } else if (errorMsg && errorMsg.toLowerCase().includes('id') && errorMsg.toLowerCase().includes('existe')) {
                    setFormError('El ID ya existe. Usa un ID diferente o deja el campo vacío para autoincrementar.');
                } else {
                    setFormError(errorMsg || 'Error al guardar');
                }
                setLoading(false);
                return;
            }
            setSuccess(editing ? 'Registro actualizado.' : 'Registro creado.');
            handleModalClose();
            fetchData(page, pageSize, debouncedSearch, selectedTable);
        } catch (err: any) {
            setFormError(`Error de red o inesperado: ${err.message || err}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = useCallback(async (row: any) => {
        if (!window.confirm('¿Seguro que desea eliminar este registro?')) return;
        setLoading(true);
        setError(null);
        try {
            const config = TABLE_CONFIG[selectedTable];
            const res = await fetch(`${API_URL}/${config.endpoint}/${row[config.fields[0].name]}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al eliminar');
            }
            setSuccess('Registro eliminado.');
            fetchData(page, pageSize, debouncedSearch, selectedTable);
        } catch (err: any) {
            setError(err.message || 'Error al eliminar');
        } finally {
            setLoading(false);
        }
    }, [fetchData, page, pageSize, debouncedSearch, selectedTable]);

    const handleEdit = useCallback((row: any) => {
        setEditing(row);
        setForm({ ...row });
        setModalOpen(true);
    }, []);

    const handleModalClose = () => {
        setModalOpen(false);
        setEditing(null);
        setForm({});
        setFormError(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Columnas dinámicas
    const columns = useMemo<GridColDef[]>(() => {
        const config = TABLE_CONFIG[selectedTable];
        return [
            ...config.fields.map(f => {
                // Si es campo PDF/BLOB, renderiza botón de descarga
                if (selectedTable in PDF_FIELDS && f.name === PDF_FIELDS[selectedTable]) {
                    return {
                        field: f.name,
                        headerName: 'Archivo PDF',
                        width: 160,
                        sortable: false,
                        renderCell: (params: GridRenderCellParams) => {
                            const pdfId = params.row[TABLE_CONFIG[selectedTable].fields[0].name];
                            const hasFile = !!params.row[f.name];
                            return hasFile ? (
                                <IconButton
                                    onClick={() => handleEdit(params.row)}
                                    sx={{ color: 'primary.main', backgroundColor: 'transparent', '&:hover': { backgroundColor: 'rgba(134,29,29,0.08)' } }}
                                >
                                    <EditIcon color="primary" />
                                </IconButton>
                            ) : null;
                        },
                    };
                }
                // Otros campos normales
                return {
                    field: f.name,
                    headerName: f.label,
                    width: 160,
                    valueFormatter: f.type === 'date'
                        ? (params: any) => {
                            let v = params && params.value;
                            if (v === null || v === undefined) return '—';
                            v = String(v).trim();
                            if (!v || v === 'null' || v === 'undefined') return '—';
                            if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
                            return v;
                        }
                        : undefined,
                };
            }),
            {
                field: 'actions',
                headerName: 'Acciones',
                width: 120,
                sortable: false,
                renderCell: (params: GridRenderCellParams) => (
                    <>
                        <IconButton 
                            onClick={() => handleEdit(params.row)}
                            sx={{ color: 'primary.main', backgroundColor: 'transparent', '&:hover': { backgroundColor: 'rgba(134,29,29,0.08)' } }}
                        >
                            <EditIcon color="primary" />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(params.row)}><DeleteIcon /></IconButton>
                    </>
                ),
            },
        ];
    }, [selectedTable, handleEdit, handleDelete]);

    // El DataGrid ya no filtra en frontend
    const filteredData = data;

    return (
        <Box>
            <Tabs
                value={selectedTable}
                onChange={(_, v) => { setSelectedTable(v); setPage(0); }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2, '& .MuiTab-root': { color: '#861d1d', fontWeight: 600 }, '& .Mui-selected': { color: '#861d1d !important' }, '& .MuiTabs-indicator': { backgroundColor: '#861d1d' } }}
            >
                {TABLE_KEYS.map(key => (
                    <Tab key={key} value={key} label={toPrettyLabel(key)} />
                ))}
            </Tabs>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">{toPrettyLabel(selectedTable)}</Typography>
                {selectedTable === 'docentes' ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />} 
                            onClick={() => { setForm({}); setEditing(null); setModalOpen(true); }}
                            sx={{ backgroundColor: '#861d1d', color: '#fff', '&:hover': { backgroundColor: '#a12a2a' } }}
                        >
                            Nuevo
                        </Button>
                        <Button 
                            variant="contained" 
                            disabled
                            sx={{ backgroundColor: '#861d1d', color: '#fff', '&:hover': { backgroundColor: '#a12a2a' } }}
                        >
                            Carga Masiva
                        </Button>
                    </Box>
                ) : (
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => { setForm({}); setEditing(null); setModalOpen(true); }}
                        sx={{ backgroundColor: '#861d1d', color: '#fff', '&:hover': { backgroundColor: '#a12a2a' } }}
                    >
                        Nuevo
                    </Button>
                )}
            </Box>
            <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                    placeholder="Buscar..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    size="small"
                    sx={{ width: 350, mr: 2 }}
                />
            </Box>
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
            {error && !modalOpen && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50, 100]}
                    paginationMode="server"
                    rowCount={total}
                    paginationModel={{ page, pageSize }}
                    onPaginationModelChange={({ page, pageSize }) => {
                        setPage(page);
                        setPageSize(pageSize);
                    }}
                    getRowId={row => row[TABLE_CONFIG[selectedTable].fields[0].name]}
                    autoHeight
                    disableColumnMenu={false}
                    sx={{ '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' } }}
                    loading={loading}
                />
            </Box>
            <Dialog open={modalOpen} onClose={handleModalClose} maxWidth="md" fullWidth>
                <DialogTitle>{editing ? `Editar ${toPrettyLabel(selectedTable).slice(0, -1)}` : `Nuevo ${toPrettyLabel(selectedTable).slice(0, -1)}`}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2, mt: 1, width: '100%', p: 0 }}>
                        {TABLE_CONFIG[selectedTable].fields.map(field => {
                            if (editing && field.name === TABLE_CONFIG[selectedTable].fields[0].name) return null;
                            // PDF/BLOB fields
                            if (
                                (selectedTable in PDF_FIELDS && field.name === PDF_FIELDS[selectedTable])
                            ) {
                                const pdfId = editing ? editing[TABLE_CONFIG[selectedTable].fields[0].name] : null;
                                let fileName = '';
                                if (form[field.name] instanceof File) {
                                    fileName = form[field.name].name;
                                } else if (editing && editing[field.name] && typeof editing[field.name] === 'string') {
                                    fileName = editing[field.name] || 'Archivo existente';
                                }
                                return (
                                    <Box key={field.name} sx={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                                        <label style={{ fontWeight: 500, marginBottom: 4 }}>Archivo PDF</label>
                                        <input
                                            type="file"
                                            name={field.name}
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            style={{ width: '100%' }}
                                        />
                                        {fileName && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {fileName}
                                            </Typography>
                                        )}
                                        {editing && pdfId && editing && editing[field.name] ? (
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                startIcon={<PdfIcon />}
                                                href={`${API_URL}/${TABLE_CONFIG[selectedTable].endpoint}/${pdfId}/pdf`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{ mt: 1, width: 'fit-content' }}
                                            >
                                                Ver/Descargar PDF
                                            </Button>
                                        ) : null}
                                    </Box>
                                );
                            }
                            // ...resto de campos...
                            return (
                                selectedTable === 'docentes' && field.name === 'id_facultad' ? (
                                    <TextField
                                        select
                                        key={field.name}
                                        label={field.label}
                                        name={field.name}
                                        value={form[field.name] || ''}
                                        onChange={handleFormChange}
                                        fullWidth
                                        required={field.required}
                                        sx={{ flex: '1 1 220px' }}
                                    >
                                        {facultades.map(f => (
                                            <MenuItem key={f.id_facultad} value={f.id_facultad}>{`${f.id_facultad} - ${f.nombre}`}</MenuItem>
                                        ))}
                                    </TextField>
                                ) : field.type === 'enum' ? (
                                    <TextField
                                        select
                                        key={field.name}
                                        label={field.label}
                                        name={field.name}
                                        value={form[field.name] || ''}
                                        onChange={handleFormChange}
                                        fullWidth
                                        required={field.required}
                                        sx={{ flex: '1 1 180px' }}
                                    >
                                        {field.enumValues?.map(opt => (
                                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                        ))}
                                    </TextField>
                                ) : (
                                    <TextField
                                        key={field.name}
                                        label={field.label}
                                        name={field.name}
                                        type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                                        value={form[field.name] || ''}
                                        onChange={handleFormChange}
                                        fullWidth
                                        required={field.required}
                                        sx={{ flex: '1 1 180px' }}
                                        InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                                    />
                                )
                            );
                        })}
                    </Box>
                    {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleModalClose}>Cancelar</Button>
                    <Button 
                        onClick={handleSave} 
                        variant="contained" 
                        disabled={loading}
                        sx={{ backgroundColor: '#861d1d', color: '#fff', '&:hover': { backgroundColor: '#a12a2a' } }}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={!!success}
                autoHideDuration={3000}
                onClose={() => setSuccess(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
} 