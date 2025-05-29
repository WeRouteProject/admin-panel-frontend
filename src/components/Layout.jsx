import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  useTheme,
  alpha,
  Avatar,
  Divider,
  ListItemButton,
  useMediaQuery,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Category,
  Inventory,
  Group,
  ShoppingCart,
  ListAlt,
  Logout,
  Notifications,
  Settings,
  AccountCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const drawerWidth = 280;

const navItems = [
  { label: 'Dashboard', path: '/', icon: <Dashboard />, color: '#667eea' },
  { label: 'Categories', path: '/categories', icon: <Category />, color: '#f093fb' },
  { label: 'Products', path: '/products', icon: <Inventory />, color: '#4facfe' },
  { label: 'Customers', path: '/customer', icon: <Group />, color: '#43e97b' },
  { label: 'Cart', path: '/cart', icon: <ShoppingCart />, color: '#fa709a' },
  { label: 'Orders', path: '/orders', icon: <ListAlt />, color: '#ffecd2' },
];

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Enhanced Header */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: alpha('#fff', 0.1),
            mx: 'auto',
            mb: 2,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Dashboard sx={{ fontSize: 32, color: '#fff' }} />
        </Avatar>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(45deg, #fff, #e0e7ff)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 1,
          }}
        >
          Admin Panel
        </Typography>
        <Typography variant="caption" sx={{ color: alpha('#fff', 0.7) }}>
          Logistics Management System
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: alpha('#fff', 0.1), mx: 2 }} />

      {/* Enhanced Navigation */}
      <List sx={{ flex: 1, px: 2, py: 3 }}>
        {navItems.map((item, index) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  bgcolor: alpha('#fff', 0.1),
                  transform: 'translateX(8px)',
                  '&::before': {
                    transform: 'scaleX(1)',
                  },
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  bgcolor: item.color,
                  transform: 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform 0.3s ease',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: '#fff',
                  minWidth: 48,
                  '& .MuiSvgIcon-root': {
                    fontSize: 24,
                    filter: `drop-shadow(0 0 8px ${alpha(item.color, 0.3)})`,
                  }
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ bgcolor: alpha('#fff', 0.1), mx: 2 }} />

      {/* Enhanced Logout */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 2,
            transition: 'all 0.3s ease',
            bgcolor: alpha('#ff4757', 0.1),
            border: `1px solid ${alpha('#ff4757', 0.2)}`,
            '&:hover': {
              bgcolor: alpha('#ff4757', 0.2),
              transform: 'translateY(-2px)',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#ff6b7d', minWidth: 48 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontWeight: 600,
              color: '#ff6b7d',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Enhanced AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          color: '#333',
          boxShadow: `0 4px 20px ${alpha('#000', 0.08)}`,
          borderBottom: `1px solid ${alpha('#000', 0.05)}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                display: { md: 'none' },
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Logistics Application
            </Typography>
          </Box>


        </Toolbar>
      </AppBar>

      {/* Enhanced Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              border: 'none',
            }
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              border: 'none',
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Enhanced Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: '100vh',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;