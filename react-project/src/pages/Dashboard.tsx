import { Box, Typography, Grid, Card, LinearProgress, Avatar, Stack } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { keyframes } from '@mui/system';
import { useEffect, useState } from 'react';

// Animación de rebote
const bounce = keyframes`
  0% { transform: scale(1); }
  30% { transform: scale(1.18) translateY(-6px); }
  50% { transform: scale(0.95) translateY(2px); }
  70% { transform: scale(1.05) translateY(-2px); }
  100% { transform: scale(1); }
`;

function StatCard({ label, value, icon, progress, change, changeColor, since }: any) {
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2, boxShadow: 2 }}>
      <Avatar
        sx={{
          bgcolor: 'background.paper',
          color: 'primary.main',
          mr: 2,
          width: 56,
          height: 56,
          boxShadow: 1,
          transition: 'transform 0.2s',
          '&:hover': {
            animation: `${bounce} 0.6s`,
            cursor: 'pointer',
          },
        }}
      >
        {icon}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 5, my: 1 }} />
        <Typography variant="caption" sx={{ color: changeColor, fontWeight: 600 }}>{change} <span style={{ color: '#888', fontWeight: 400 }}> {since}</span></Typography>
      </Box>
    </Card>
  );
}

export default function Dashboard() {
  const [usuariosTotales, setUsuariosTotales] = useState<number | null>(null);
  const [actividadDocentes, setActividadDocentes] = useState<{ mes: string, total: number }[]>([]);
  const [activosPorHora, setActivosPorHora] = useState<{ hora: number, total: number }[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/usuarios/total')
      .then(res => res.json())
      .then(data => setUsuariosTotales(data.total))
      .catch(() => setUsuariosTotales(null));
  }, []);

  useEffect(() => {
    fetch('http://localhost:4000/api/docentes/actividad')
      .then(res => res.json())
      .then(data => setActividadDocentes(data))
      .catch(() => setActividadDocentes([]));
  }, []);

  useEffect(() => {
    fetch('http://localhost:4000/api/docentes/activos-por-hora')
      .then(res => res.json())
      .then(data => setActivosPorHora(data))
      .catch(() => setActivosPorHora([]));
  }, []);

  const stats = [
    {
      label: 'Docentes Totales',
      value: usuariosTotales !== null ? usuariosTotales : '...',
      icon: <PeopleIcon fontSize="large" color="primary" />, // azul
      progress: 80,
      change: '+12%',
      changeColor: 'success.main',
      since: 'desde el mes pasado',
    }
  ];

  const userActivityData = [
    { month: 'Ene', Activos: 400, Nuevos: 240, Inactivos: 60 },
    { month: 'Feb', Activos: 420, Nuevos: 200, Inactivos: 80 },
    { month: 'Mar', Activos: 460, Nuevos: 278, Inactivos: 90 },
    { month: 'Abr', Activos: 500, Nuevos: 189, Inactivos: 70 },
    { month: 'May', Activos: 480, Nuevos: 239, Inactivos: 60 },
    { month: 'Jun', Activos: 530, Nuevos: 349, Inactivos: 50 },
  ];

  const reportTypes = [
    { name: 'Incidencias', value: 40, color: '#b71c1c' },
    { name: 'Sugerencias', value: 25, color: '#9c27b0' },
    { name: 'Felicitaciones', value: 20, color: '#43a047' },
    { name: 'Otros', value: 15, color: '#ff9800' },
  ];

  const systemPerformance = 78; // %

  function TablaActividadDocentes() {
    return (
      <Box>
        <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 1, letterSpacing: 1 }}>
          Actividad de Docentes por Mes <span style={{ color: '#888', fontWeight: 400, fontSize: 18 }}>({new Date().getFullYear()})</span>
        </Typography>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            background: '#fff',
            borderRadius: 2,
            boxShadow: 2,
            overflow: 'hidden',
          }}
        >
          <Box component="thead">
            <Box component="tr" sx={{ background: '#b71c1c' }}>
              <Box component="th" sx={{ p: 1.5, textAlign: 'left', color: '#fff', fontWeight: 600, fontSize: 16, letterSpacing: 1 }}>Mes</Box>
              <Box component="th" sx={{ p: 1.5, textAlign: 'left', color: '#fff', fontWeight: 600, fontSize: 16, letterSpacing: 1 }}>Docentes con inicio de sesión</Box>
            </Box>
          </Box>
          <Box component="tbody">
            {actividadDocentes.map((row, idx) => (
              <Box
                component="tr"
                key={row.mes}
                sx={{
                  background: idx % 2 === 0 ? '#faf6f6' : '#fff',
                  borderBottom: '1.5px solid #e0e0e0',
                  transition: 'background 0.2s',
                  '&:hover': { background: '#ffeaea' },
                }}
              >
                <Box component="td" sx={{ p: 1.5, color: '#b71c1c', fontWeight: 500, fontSize: 15 }}>{row.mes}</Box>
                <Box component="td" sx={{ p: 1.5, color: '#333', fontWeight: 600, fontSize: 15 }}>{row.total}</Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  function SimpleReportDistribution() {
    const max = Math.max(...reportTypes.map(r => r.value));
    return (
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Distribución de Reportes</Typography>
        {reportTypes.map((r) => (
          <Box key={r.name} sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ minWidth: 32, display: 'inline-block' }}>{r.name}</Typography>
            <Box sx={{ display: 'inline-block', height: 10, bgcolor: r.color, width: `${(r.value / max) * 90 + 10}%`, borderRadius: 2, ml: 1 }} />
            <Typography variant="caption" sx={{ ml: 1 }}>{r.value}</Typography>
          </Box>
        ))}
      </Box>
    );
  }

  function SimpleSystemPerformance() {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Rendimiento del Sistema</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ position: 'relative', width: 80, height: 80, mb: 1 }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%', border: '8px solid #eee',
              position: 'absolute', top: 0, left: 0
            }} />
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%', border: '8px solid #b71c1c',
              borderRightColor: 'transparent', borderBottomColor: 'transparent',
              position: 'absolute', top: 0, left: 0,
              transform: `rotate(${systemPerformance * 1.8}deg)`
            }} />
            <Typography variant="h6" sx={{ position: 'absolute', top: 24, left: 0, width: 80, textAlign: 'center', fontWeight: 700 }}>{systemPerformance}%</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">Estable</Typography>
        </Box>
      </Box>
    );
  }

  function SimpleUsersByHour() {
    if (!activosPorHora.length) {
      return (
        <Box sx={{ textAlign: 'center', color: '#888', py: 4 }}>
          No hay datos para mostrar hoy.
        </Box>
      );
    }
    const max = Math.max(...activosPorHora.map(u => u.total), 1);
    const yMax = Math.max(10, max);
    const width = 600;
    const height = 180;
    const padding = 40;
    const barCount = activosPorHora.length;
    const step = (width - padding * 2) / (barCount - 1);
    const points = activosPorHora.map((u, i) => {
      const x = padding + i * step;
      const y = height - padding - (u.total / yMax) * (height - padding * 2);
      return { x, y, total: u.total, hora: u.hora };
    });

    // Tooltip state
    const [tooltip, setTooltip] = useState<{ x: number, y: number, hora: number, total: number } | null>(null);

    // Path para el área
    const areaPath = [
      `M ${points[0].x} ${height - padding}`,
      ...points.map(p => `L ${p.x} ${p.y}`),
      `L ${points[points.length - 1].x} ${height - padding}`,
      'Z'
    ].join(' ');
    // Path para la línea
    const linePath = [
      `M ${points[0].x} ${points[0].y}`,
      ...points.slice(1).map(p => `L ${p.x} ${p.y}`)
    ].join(' ');
    return (
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Docentes Activos por Hora (hoy)</Typography>
        <Box sx={{ width: width, height: height, mx: 'auto', background: '#fff', borderRadius: 2, boxShadow: 1, p: 1, position: 'relative' }}>
          <svg width={width} height={height} style={{ display: 'block' }}>
            {/* Eje Y */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
              const y = height - padding - t * (height - padding * 2);
              const value = Math.round(yMax * t);
              return (
                <g key={i}>
                  <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#eee" />
                  <text x={padding - 10} y={y + 4} fontSize={12} fill="#888" textAnchor="end">{value}</text>
                </g>
              );
            })}
            {/* Eje X (horas) */}
            {points.map((p, i) => (
              <text key={i} x={p.x} y={height - padding + 18} fontSize={12} fill="#888" textAnchor="middle">
                {p.hora.toString().padStart(2, '0')}
              </text>
            ))}
            {/* Área */}
            <path d={areaPath} fill="#b71c1c22" />
            {/* Línea */}
            <path d={linePath} fill="none" stroke="#b71c1c" strokeWidth={2} />
            {/* Puntos con tooltip */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={5}
                fill="#b71c1c"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ x: p.x, y: p.y, hora: p.hora, total: p.total })}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </svg>
          {/* Tooltip */}
          {tooltip && (
            <Box
              sx={{
                position: 'absolute',
                left: tooltip.x + 10,
                top: tooltip.y - 40,
                bgcolor: '#fff',
                color: '#222',
                border: '1px solid #ddd',
                borderRadius: 1,
                boxShadow: 2,
                px: 2,
                py: 1,
                fontSize: 14,
                pointerEvents: 'none',
                zIndex: 10,
                minWidth: 80
              }}
            >
              <Box fontWeight={700} mb={0.5}>{tooltip.hora.toString().padStart(2, '0')}:00</Box>
              <Box><b>Docentes:</b> {tooltip.total}</Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
      {/* Encabezado */}
      <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center">Dashboard</Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom textAlign="center">
        Bienvenido al panel principal del sistema FCA SAD.
      </Typography>

      {/* Tarjeta Docentes Totales */}
      <Box sx={{ width: 600, mx: 'auto', mb: 3 }}>
        <Grid container spacing={3} justifyContent="center">
          {stats.map((stat) => (
            <Grid item xs={12} key={stat.label}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Tabla de actividad de docentes */}
      <Box sx={{ width: 600, mx: 'auto', mb: 3 }}>
        <Card sx={{ p: 3, minHeight: 260 }}>
          <TablaActividadDocentes />
        </Card>
      </Box>

      {/* Gráfica de docentes activos por hora */}
      <Box sx={{ width: 600, mx: 'auto', mb: 3 }}>
        <Card sx={{ p: 3 }}>
          <SimpleUsersByHour />
        </Card>
      </Box>
    </Box>
  );
} 

