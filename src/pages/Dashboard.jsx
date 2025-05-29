import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, Box, Chip, Avatar, IconButton, Tooltip,
  Card, CardContent, Fade, Zoom, useTheme, alpha, InputAdornment,
  TextField, MenuItem, Select, FormControl, InputLabel, Stack,
  Button, Badge, Divider, LinearProgress
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  LocalShipping as DeliveryIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import StatCardsGrid from '../components/StatCardsGrid';
import useOrderStore from '../store/useOrderStore';

const Dashboard = () => {
  const theme = useTheme();
  const getRecentOrders = useOrderStore((state) => state.getRecentOrders);
  const recentOrders = getRecentOrders();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Filter orders based on search and status
  const filteredOrders = recentOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.products.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (order.deliveryBoy && order.deliveryBoy.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5 }} />;
      case 'Pending':
        return <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />;
      case 'Processing':
        return <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />;
      default:
        return <ErrorIcon sx={{ fontSize: 16, mr: 0.5 }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Processing':
        return 'info';
      default:
        return 'error';
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <Box 
      sx={{ 
        p: { xs: 2, sm: 4 },
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
      }}
    >
      {/* Enhanced Stat Cards */}
      <Fade in timeout={800}>
        <Box>
          <StatCardsGrid />
        </Box>
      </Fade>

      {/* Modern Orders Section */}
      <Zoom in timeout={1000}>
        <Card 
          elevation={0}
          sx={{ 
            mt: 4,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Header Section */}
            <Box sx={{ p: 3, pb: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      width: 48,
                      height: 48,
                    }}
                  >
                    <ReceiptIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        mb: 0.5,
                      }}
                    >
                      Recent Orders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage and track your latest orders
                    </Typography>
                  </Box>
                </Box>
                
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Refresh Orders">
                    <IconButton 
                      onClick={handleRefresh}
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export Data">
                    <IconButton sx={{ 
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
                    }}>
                      <ExportIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              {/* Advanced Filters */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                sx={{ mb: 3 }}
              >
                <TextField
                  placeholder="Search orders, products, or delivery personnel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{ 
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status Filter"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                    }}
                  >
                    <MenuItem value="All">All Status</MenuItem>
                    <MenuItem value="Delivered">Delivered</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Processing">Processing</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  sx={{ 
                    borderRadius: 2,
                    minWidth: 120,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  }}
                >
                  More Filters
                </Button>
              </Stack>

              {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
            </Box>

            <Divider sx={{ mx: 3 }} />

            {/* Enhanced Table */}
            <Box sx={{ p: 3, pt: 2 }}>
              <TableContainer 
                component={Paper} 
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  overflow: 'hidden',
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: theme.palette.primary.main,
                          border: 'none',
                        }}
                      >
                        Order Details
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: theme.palette.primary.main,
                          border: 'none',
                        }}
                      >
                        Products
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: theme.palette.primary.main,
                          border: 'none',
                        }}
                      >
                        Delivery
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: theme.palette.primary.main,
                          border: 'none',
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: theme.palette.primary.main,
                          border: 'none',
                        }}
                      >
                        Date
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          width: 60,
                          border: 'none',
                        }}
                      />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map((order, index) => (
                      <Fade in timeout={300 + index * 100} key={order.id}>
                        <TableRow 
                          hover
                          sx={{ 
                            '&:hover': { 
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                              transform: 'scale(1.001)',
                              transition: 'all 0.2s ease-in-out',
                            },
                            '&:last-child td': { border: 0 },
                            cursor: 'pointer',
                          }}
                        >
                          <TableCell sx={{ border: 'none', py: 2 }}>
                            <Box>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: theme.palette.primary.main,
                                  mb: 0.5,
                                }}
                              >
                                #{order.id}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Order ID
                              </Typography>
                            </Box>
                          </TableCell>
                          
                          <TableCell sx={{ border: 'none', py: 2 }}>
                            <Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 500,
                                  mb: 0.5,
                                  maxWidth: 200,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {order.products.map(p => p.name).join(', ')}
                              </Typography>
                              <Chip
                                label={`${order.products.length} item${order.products.length > 1 ? 's' : ''}`}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.7rem',
                                  height: 20,
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  borderColor: alpha(theme.palette.info.main, 0.3),
                                  color: theme.palette.info.main,
                                }}
                              />
                            </Box>
                          </TableCell>
                          
                          <TableCell sx={{ border: 'none', py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: order.deliveryBoy ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.grey[500], 0.1),
                                  color: order.deliveryBoy ? theme.palette.success.main : theme.palette.grey[500],
                                  fontSize: '0.875rem',
                                }}
                              >
                                {order.deliveryBoy ? <DeliveryIcon fontSize="small" /> : '?'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {order.deliveryBoy || 'Unassigned'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {order.deliveryBoy ? 'Assigned' : 'Pending assignment'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          
                          <TableCell sx={{ border: 'none', py: 2 }}>
                            <Chip
                              icon={getStatusIcon(order.status)}
                              label={order.status}
                              color={getStatusColor(order.status)}
                              variant="filled"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 32,
                                borderRadius: 2,
                                '& .MuiChip-icon': {
                                  fontSize: 16,
                                },
                              }}
                            />
                          </TableCell>
                          
                          <TableCell sx={{ border: 'none', py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {order.orderDate}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Order date
                            </Typography>
                          </TableCell>
                          
                          <TableCell sx={{ border: 'none', py: 2 }}>
                            <Tooltip title="More actions">
                              <IconButton 
                                size="small"
                                sx={{ 
                                  opacity: 0.7,
                                  '&:hover': { 
                                    opacity: 1,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  }
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {filteredOrders.length === 0 && (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    opacity: 0.7,
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No orders found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search or filter criteria
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Zoom>
    </Box>
  );
};

export default Dashboard;