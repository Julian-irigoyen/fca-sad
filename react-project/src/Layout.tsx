import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Avatar } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CakeIcon from '@mui/icons-material/Cake';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import GroupIcon from '@mui/icons-material/Group';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useState, useEffect } from 'react';
import logo from './assets/logo-blanco.png';
import { createPortal } from 'react-dom';

const drawerWidth = 240;
const collapsedWidth = 64;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: 'dashboard' },
    { text: 'Docentes', icon: <PeopleIcon />, path: 'docentes' },
    { text: 'Avisos', icon: <NotificationsActiveIcon />, path: 'avisos' },
    { text: 'Cumpleaños', icon: <CakeIcon />, path: 'cumpleanos' },
    { text: 'Configuración', icon: <SettingsIcon />, path: 'configuracion' },
    { text: 'Ayuda', icon: <HelpIcon />, path: 'ayuda' },
    { text: 'Equipo', icon: <GroupIcon />, path: 'equipo' },
    { text: 'Mis Datos', icon: <AccountCircleIcon />, path: 'mis-datos' },
    { text: 'Cerrar Sesión', icon: <ExitToAppIcon />, path: 'logout' },
];

const getMenuItemsByRole = (role: string | null) => {
    if (role === 'admin' || role === 'coordinador') return menuItems;
    if (role === 'docente') return menuItems.filter(item => ['Dashboard', 'Cumpleaños', 'Mis Datos', 'Cerrar Sesión'].includes(item.text));
    return menuItems; // por defecto, mostrar todo
};

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        setRole(localStorage.getItem('role'));
    }, []);

    useEffect(() => {
        const checkModal = () => {
            setModalOpen(!!document.querySelector('.MuiDialog-root[open]'));
        };
        document.addEventListener('mousedown', checkModal);
        document.addEventListener('keydown', checkModal);
        const interval = setInterval(checkModal, 200);
        return () => {
            document.removeEventListener('mousedown', checkModal);
            document.removeEventListener('keydown', checkModal);
            clearInterval(interval);
        };
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const drawer = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(180deg, #861d1d 0%, #931010 100%)',
                color: '#fff',
                position: 'relative',
                zIndex: 1301,
            }}
        >
            <Toolbar sx={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', alignItems: 'center', px: 2, minHeight: 72 }}>
                <Avatar src={logo} alt="Logo" sx={{ width: 40, height: 40, mr: sidebarOpen ? 2 : 0 }} />
                {sidebarOpen && (
                    <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
                        FCA SAD
                    </Typography>
                )}
            </Toolbar>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
            <List sx={{ flexGrow: 1 }}>
                {getMenuItemsByRole(role).map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={() => navigate(item.path)}
                            sx={{
                                color: '#fff',
                                minHeight: 48,
                                justifyContent: sidebarOpen ? 'initial' : 'center',
                                px: 2.5,
                                '&:hover': { background: 'rgba(255,255,255,0.08)' },
                            }}
                        >
                            <ListItemIcon sx={{
                                color: '#fff',
                                minWidth: 0,
                                mr: sidebarOpen ? 3 : 'auto',
                                justifyContent: 'center',
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            {sidebarOpen && <ListItemText primary={item.text} />}
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: sidebarOpen ? 'flex-end' : 'center', alignItems: 'center', pb: 2 }}>
                <IconButton onClick={handleSidebarToggle} sx={{ color: '#fff' }}>
                    {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer - 1, background: 'linear-gradient(90deg, #861d1d 0%, #931010 100%)', height: 65, justifyContent: 'center' }}>
            </AppBar>
            <Box
                component="nav"
                sx={{
                    width: { sm: sidebarOpen ? drawerWidth : collapsedWidth },
                    flexShrink: { sm: 0 },
                    zIndex: 1200,
                }}
                aria-label="mailbox folders"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            background: 'linear-gradient(180deg, #861d1d 0%, #931010 100%)',
                            color: '#fff',
                            zIndex: 1200,
                        },
                        zIndex: 1200,
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    open={sidebarOpen}
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: sidebarOpen ? drawerWidth : collapsedWidth,
                            overflowX: 'hidden',
                            background: 'linear-gradient(180deg, #861d1d 0%, #931010 100%)',
                            color: '#fff',
                            transition: 'width 0.3s',
                            zIndex: 1200,
                        },
                        zIndex: 1200,
                    }}
                >
                    {drawer}
                    {modalOpen && createPortal(
                        <Box sx={{
                            position: 'fixed',
                            left: 0,
                            top: 0,
                            width: sidebarOpen ? drawerWidth : collapsedWidth,
                            height: '100vh',
                            bgcolor: 'rgba(255,255,255,0.35)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1299,
                            pointerEvents: 'auto',
                        }} />,
                        document.body
                    )}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : collapsedWidth}px)` },
                    background: 'linear-gradient(180deg, #fff 0%, #fff6f6 100%)',
                    minHeight: '100vh',
                    transition: 'width 0.3s',
                    mt: 0,
                }}
            >
                <Toolbar sx={{ minHeight: 72 }} />
                <Outlet />
            </Box>
        </Box>
    );
} 