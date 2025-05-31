import { Navigate, Outlet, useLocation } from 'react-router-dom';

const allowedRoutesByRole: Record<string, string[]> = {
  admin: [
    '/dashboard', '/docentes', '/avisos', '/cumpleanos', '/configuracion', '/ayuda', '/equipo', '/mis-datos', '/logout'
  ],
  coordinador: [
    '/dashboard', '/docentes', '/avisos', '/cumpleanos', '/configuracion', '/ayuda', '/equipo', '/mis-datos', '/logout'
  ],
  docente: [
    '/dashboard', '/cumpleanos', '/mis-datos', '/logout'
  ]
};

export default function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si no hay rol, no permitir acceso
  if (!role) {
    return <Navigate to="/" replace />;
  }

  // Permitir todo a admin y coordinador, restringir a docente
  const allowedRoutes = allowedRoutesByRole[role] || [];
  // Si la ruta actual no está permitida para el rol, redirigir al dashboard
  if (!allowedRoutes.some(route => location.pathname.startsWith(route))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
} 