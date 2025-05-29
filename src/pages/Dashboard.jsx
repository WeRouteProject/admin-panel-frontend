// Dashboard.jsx - Main Dashboard Component
import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Container,
  Stack,
  Avatar,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  Edit,
  Delete,
  LocalShipping,
  PendingActions,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import useOrderStore from '../store/useOrderStore';
import StatCardsGrid from '../components/StatCardsGrid';

const Dashboard = () => {
  const theme = useTheme();
  const { 
    orders, 
    loading, 
    error, 
    fetchOrders, 
    getRecentOrders 
  } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const recentOrders = getRecentOrders();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'cancelled':
        return theme.palette.error.main;
      case 'in transit':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'pending':
        return <Schedule sx={{ fontSize: 16 }} />;
      case 'in transit':
        return <LocalShipping sx={{ fontSize: 16 }} />;
      default:
        return <PendingActions sx={{ fontSize: 16 }} />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Stack spacing={2} alignItems="center">
            <LinearProgress sx={{ width: 200 }} />
            <Typography variant="h6" color="text.secondary">
              Loading Dashboard...
            </Typography>
          </Stack>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), border: `1px solid ${theme.palette.error.main}` }}>
          <CardContent>
            <Typography variant="h6" color="error" gutterBottom>
              Error Loading Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {error}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Stats Cards Section */}
      <StatCardsGrid />

      {/* Recent Orders Section */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Fade in timeout={1000}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Section Header */}
              <Box sx={{ p: 3, pb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        mb: 1,
                      }}
                    >
                      Recent Orders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Latest orders and their current status
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      width: 48,
                      height: 48,
                    }}
                  >
                    <LocalShipping />
                  </Avatar>
                </Stack>
              </Box>

              {/* Orders Table */}
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Order ID
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Customer
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Products
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Delivery Date
                      </TableCell>
                      
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order, index) => (
                      <Zoom in timeout={600 + index * 100} key={order.id}>
                        <TableRow
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                            },
                            transition: 'background-color 0.2s ease',
                          }}
                        >
                          <TableCell>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                              }}
                            >
                              {order.id}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                  color: theme.palette.secondary.main,
                                  fontSize: '0.875rem',
                                }}
                              >
                                {order.customerName?.charAt(0)?.toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {order.customerName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {order.deliveryBoy || 'Unassigned'}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          
                          <TableCell>
                            <Box>
                              {order.products?.slice(0, 2).map((product, idx) => (
                                <Typography
                                  key={idx}
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    color: 'text.secondary',
                                  }}
                                >
                                  {product.name} (×{product.quantity})
                                </Typography>
                              ))}
                              {order.products?.length > 2 && (
                                <Typography variant="caption" color="primary">
                                  +{order.products.length - 2} more
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                color: theme.palette.success.main,
                              }}
                            >
                              ₹{order.totalAmount?.toLocaleString() || '0'}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(order.status)}
                              label={order.status}
                              size="small"
                              sx={{
                                bgcolor: alpha(getStatusColor(order.status), 0.1),
                                color: getStatusColor(order.status),
                                fontWeight: 600,
                                '& .MuiChip-icon': {
                                  color: 'inherit',
                                },
                              }}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {order.deliveryDate ? 
                                new Date(order.deliveryDate).toLocaleDateString() : 
                                'Not set'
                              }
                            </Typography>
                          </TableCell>
                          
                          
                        </TableRow>
                      </Zoom>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {recentOrders.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Recent Orders
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Orders will appear here once you start receiving them.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default Dashboard;