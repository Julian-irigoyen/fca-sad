import { Typography, Box, Grid, Card, CardContent, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

// Interface for teacher data
interface Teacher {
    id_empleado: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    fecha_nacimiento: string;
    correo: string;
    imagen_perfil?: string;
}

// Styled components
const BirthdayCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    margin: theme.spacing(1),
    transition: 'all 0.3s ease',
    borderRadius: '15px',
    '&:hover': {
        backgroundColor: '#8B0000', // Color rojo oscuro
        transform: 'translateY(-3px)',
        boxShadow: '0 4px 8px rgba(139, 0, 0, 0.2)',
        '& .MuiTypography-root': {
            color: '#ffffff',
        },
        '& .MuiTypography-colorTextSecondary': {
            color: 'rgba(255, 255, 255, 0.7) !important',
        }
    }
}));

const TeacherAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(12),
    height: theme.spacing(12),
    margin: theme.spacing(2),
}));

const BirthdaySection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '& .cards-container': {
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 250px)', // Ajustable según necesidad
        marginTop: theme.spacing(2),
        msOverflowStyle: 'none',  // Para Internet Explorer
        scrollbarWidth: 'none',   // Para Firefox
        '&::-webkit-scrollbar': {
            display: 'none',      // Para Chrome, Safari y Opera
        }
    }
}));

const CardContentStyled = styled(CardContent)({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
});

// Mock data - This will be replaced with actual data from the backend
const mockTeachers: Teacher[] = [
    {
        id_empleado: 1001,
        nombre: "Juan Carlos",
        apellido_paterno: "Pérez",
        apellido_materno: "García",
        fecha_nacimiento: (() => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 45); // 45 años
            return date.toISOString().split('T')[0];
        })(),
        correo: "jc.perez@uaslp.mx",
        imagen_perfil: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
    },
    {
        id_empleado: 1002,
        nombre: "María Elena",
        apellido_paterno: "López",
        apellido_materno: "Sánchez",
        fecha_nacimiento: (() => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 38); // 38 años
            return date.toISOString().split('T')[0];
        })(),
        correo: "me.lopez@uaslp.mx",
        imagen_perfil: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces"
    },
    {
        id_empleado: 1003,
        nombre: "Roberto",
        apellido_paterno: "González",
        apellido_materno: "Martínez",
        fecha_nacimiento: (() => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 52); // 52 años
            date.setDate(date.getDate() + 3);
            return date.toISOString().split('T')[0];
        })(),
        correo: "r.gonzalez@uaslp.mx",
        imagen_perfil: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces"
    },
    {
        id_empleado: 1004,
        nombre: "Ana Patricia",
        apellido_paterno: "Ramírez",
        apellido_materno: "Velázquez",
        fecha_nacimiento: (() => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 41); // 41 años
            date.setDate(date.getDate() + 5);
            return date.toISOString().split('T')[0];
        })(),
        correo: "ap.ramirez@uaslp.mx",
        imagen_perfil: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=faces"
    },
    {
        id_empleado: 1005,
        nombre: "Francisco",
        apellido_paterno: "Torres",
        apellido_materno: "Hernández",
        fecha_nacimiento: (() => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 58); // 58 años
            date.setDate(date.getDate() + 7);
            return date.toISOString().split('T')[0];
        })(),
        correo: "f.torres@uaslp.mx",
        imagen_perfil: "https://images.unsplash.com/photo-1584999734482-0361aecad844?w=150&h=150&fit=crop&crop=faces"
    },
    {
        id_empleado: 1006,
        nombre: "Laura",
        apellido_paterno: "Mendoza",
        apellido_materno: "Flores",
        fecha_nacimiento: (() => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 35); // 35 años
            date.setDate(date.getDate() + 10);
            return date.toISOString().split('T')[0];
        })(),
        correo: "l.mendoza@uaslp.mx",
        imagen_perfil: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=150&h=150&fit=crop&crop=faces"
    },
    {
        id_empleado: 1007,
        nombre: "Miguel Ángel",
        apellido_paterno: "Castillo",
        apellido_materno: "Ruiz",
        fecha_nacimiento: (() => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 62); // 62 años
            date.setDate(date.getDate() + 12);
            return date.toISOString().split('T')[0];
        })(),
        correo: "ma.castillo@uaslp.mx",
        imagen_perfil: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=150&h=150&fit=crop&crop=faces"
    },
    {
        id_empleado: 1008,
        nombre: "Carmen",
        apellido_paterno: "Jiménez",
        apellido_materno: "Morales",
        fecha_nacimiento: (() => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 48); // 48 años
            date.setDate(date.getDate() + 15);
            return date.toISOString().split('T')[0];
        })(),
        correo: "c.jimenez@uaslp.mx",
        imagen_perfil: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=150&h=150&fit=crop&crop=faces"
    }
];

export default function Cumpleanos() {
    // Function to format date
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long'
        });
    };

    // Function to get full name
    const getFullName = (teacher: Teacher) => {
        return `${teacher.nombre} ${teacher.apellido_paterno} ${teacher.apellido_materno}`;
    };

    // Function to check if it's teacher's birthday today
    const isBirthdayToday = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        return today.getDate() === birth.getDate() && 
               today.getMonth() === birth.getMonth();
    };

    // Function to check if birthday is in next 15 days
    const isUpcomingBirthday = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        
        // Set birth year to current year for comparison
        birth.setFullYear(today.getFullYear());
        
        // If the birthday has passed this year, check for next year
        if (birth < today) {
            birth.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = birth.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 && diffDays <= 15;
    };

    // Filter teachers for today's birthdays and upcoming birthdays
    const todaysBirthdays = mockTeachers.filter(teacher => isBirthdayToday(teacher.fecha_nacimiento));
    const upcomingBirthdays = mockTeachers.filter(teacher => 
        !isBirthdayToday(teacher.fecha_nacimiento) && 
        isUpcomingBirthday(teacher.fecha_nacimiento)
    );

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Cumpleaños</Typography>
            
            <Grid container spacing={3}>
                {/* Today's Birthdays Section */}
                <Grid item xs={12} md={6}>
                    <BirthdaySection>
                        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 'bold', position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1, pb: 2 }}>
                            Cumpleaños de Hoy
                        </Typography>
                        <Box className="cards-container">
                            <Grid container spacing={2}>
                                {todaysBirthdays.length > 0 ? (
                                    todaysBirthdays.map((teacher) => (
                                        <Grid item xs={12} key={teacher.id_empleado}>
                                            <BirthdayCard>
                                                <TeacherAvatar src={teacher.imagen_perfil} />
                                                <CardContentStyled>
                                                    <Typography variant="h6">
                                                        {getFullName(teacher)}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {formatDate(teacher.fecha_nacimiento)}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {teacher.correo}
                                                    </Typography>
                                                </CardContentStyled>
                                            </BirthdayCard>
                                        </Grid>
                                    ))
                                ) : (
                                    <Grid item xs={12}>
                                        <Typography variant="body1" color="textSecondary">
                                            No hay cumpleañeros hoy
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    </BirthdaySection>
                </Grid>

                {/* Upcoming Birthdays Section */}
                <Grid item xs={12} md={6}>
                    <BirthdaySection>
                        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 'bold', position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1, pb: 2 }}>
                            Próximos Cumpleaños
                        </Typography>
                        <Box className="cards-container">
                            <Grid container spacing={2}>
                                {upcomingBirthdays.length > 0 ? (
                                    upcomingBirthdays.map((teacher) => (
                                        <Grid item xs={12} key={teacher.id_empleado}>
                                            <BirthdayCard>
                                                <TeacherAvatar src={teacher.imagen_perfil} />
                                                <CardContentStyled>
                                                    <Typography variant="h6">
                                                        {getFullName(teacher)}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {formatDate(teacher.fecha_nacimiento)}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {teacher.correo}
                                                    </Typography>
                                                </CardContentStyled>
                                            </BirthdayCard>
                                        </Grid>
                                    ))
                                ) : (
                                    <Grid item xs={12}>
                                        <Typography variant="body1" color="textSecondary">
                                            No hay próximos cumpleaños en los siguientes 15 días
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    </BirthdaySection>
                </Grid>
            </Grid>
        </Box>
    );
} 