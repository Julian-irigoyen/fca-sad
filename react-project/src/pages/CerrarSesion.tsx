import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
export default function CerrarSesion() {
    const navigate = useNavigate();
    useEffect(() => {
        localStorage.clear();
        setTimeout(() => navigate('/'), 1000);
    }, [navigate]);
    return (
        <Box>
            <Typography variant="h4" gutterBottom>Cerrando sesión...</Typography>
            <Typography>Gracias por usar FCA SAD. ¡Hasta pronto!</Typography>
        </Box>
    );
} 