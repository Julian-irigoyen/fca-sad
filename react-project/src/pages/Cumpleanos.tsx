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
    transition: 'background-color 0.3s ease',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
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
        id_empleado: 1,
        nombre: "Juan",
        apellido_paterno: "Pérez",
        apellido_materno: "García",
        fecha_nacimiento: "1980-05-15",
        correo: "juan.perez@example.com",
    },
    {
        id_empleado: 2,
        nombre: "María",
        apellido_paterno: "López",
        apellido_materno: "Sánchez",
        fecha_nacimiento: "1985-05-20",
        correo: "maria.lopez@example.com",
    },
    // Add more mock data as needed
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
                        <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                            Cumpleaños de Hoy
                        </Typography>
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
                    </BirthdaySection>
                </Grid>

                {/* Upcoming Birthdays Section */}
                <Grid item xs={12} md={6}>
                    <BirthdaySection>
                        <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                            Próximos Cumpleaños
                        </Typography>
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
                    </BirthdaySection>
                </Grid>
            </Grid>
        </Box>
    );
} 