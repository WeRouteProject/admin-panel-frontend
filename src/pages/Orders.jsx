import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  CircularProgress,
  alpha,
  Tooltip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import useOrderStore from '../store/useOrderStore';

// Styled components for modern look
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  padding: theme.spacing(1, 2),
  '&.compact': {
    padding: theme.spacing(0.5, 1),
    fontSize: '0.75rem',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(theme.palette.grey[100], 0.5),
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transition: 'background-color 0.3s ease',
  },
}));

const StyledTableCellBody = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  maxWidth: 0, 
  '&.compact': {
    padding: theme.spacing(0.5, 1),
    fontSize: '0.75rem',
  },
}));

// Mobile Card Component
const MobileOrderCard = ({ order, onViewInvoice }) => (
  <Card sx={{ mb: 2, borderRadius: 2 }}>
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
          {order.id}
        </Typography>
        <Chip
          label={order.status}
          size="small"
          color={order.status === 'Delivered' ? 'success' : order.status === 'Pending' ? 'warning' : 'default'}
        />
      </Box>

      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">Customer</Typography>
        <Typography variant="body1">{order.customerName}</Typography>
      </Box>

      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">Address</Typography>
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{order.address}</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Total</Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>₹{order.totalAmount}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">Delivery Date</Typography>
          <Typography variant="body1">{new Date(order.deliveryDate).toLocaleDateString()}</Typography>
        </Grid>
      </Grid>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Products</Typography>
        {order.products.slice(0, 2).map((p, index) => (
          <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
            {`${p.name} (x${p.quantity})`}
          </Typography>
        ))}
        {order.products.length > 2 && (
          <Typography variant="body2" color="primary.main">
            +{order.products.length - 2} more
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">Delivery Boy</Typography>
          <Typography variant="body2">{order.deliveryBoy || '-'}</Typography>
        </Box>
        <IconButton
          component={Link}
          to={`/invoice/${order.id.replace('#', '')}`}
          color="primary"
          size="small"
        >
          <VisibilityIcon />
        </IconButton>
      </Box>
    </CardContent>
  </Card>
);

const Orders = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const {
    orders,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    sortKey,
    sortAsc,
    setSort,
    fetchOrders,
  } = useOrderStore();

  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    };
    loadOrders();
  }, [fetchOrders]);

  useEffect(() => {
    console.log('Orders:', orders);
  }, [orders]);

  const getFilteredSortedOrders = () => {
    let filtered = [...orders];

    if (filterStatus) {
      filtered = filtered.filter((o) => o.status.toLowerCase() === filterStatus.toLowerCase());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          (o.deliveryBoy?.toLowerCase().includes(q)) ||
          o.id.toLowerCase().includes(q)
      );
    }

    if (sortKey) {
      filtered.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortAsc ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }

    return filtered;
  };

  const filteredOrders = getFilteredSortedOrders();

  const handleSort = (key) => {
    setSort(key);
  };

  // Function to truncate text with ellipsis
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Column configurations for different screen sizes
  const getColumnConfig = () => {
    if (isMobile) {
      return null; // Use cards for mobile
    } else if (isTablet) {
      return {
        minWidth: 900,
        columns: [
          { key: 'id', label: 'Order ID', width: 100 },
          { key: 'customerName', label: 'Customer', width: 120 },
          { key: 'address', label: 'Address', width: 140 },
          { key: 'deliveryDate', label: 'Delivery', width: 100 },
          { key: 'totalAmount', label: 'Total', width: 80 },
          { key: 'products', label: 'Products', width: 150 },
          { key: 'deliveryBoy', label: 'Delivery Boy', width: 120 },
          { key: 'status', label: 'Status', width: 100 },
          { key: 'invoice', label: 'Invoice', width: 60 },
        ]
      };
    } else {
      return {
        minWidth: 1200,
        columns: [
          { key: 'id', label: 'Order ID', width: 100 },
          { key: 'customerName', label: 'Customer', width: 120 },
          { key: 'address', label: 'Address', width: 150 },
          { key: 'deliveryDate', label: 'Delivery Date', width: 120 },
          { key: 'totalAmount', label: 'Total', width: 100 },
          { key: 'discountedPrice', label: 'Discounted Price', width: 130 },
          { key: 'orderDate', label: 'Order Date', width: 120 },
          { key: 'products', label: 'Products', width: 180 },

          { key: 'deliveryBoy', label: 'Delivery Boy', width: 120 },
          { key: 'status', label: 'Status', width: 100 },
          { key: 'invoice', label: 'Invoice', width: 80 },
        ]
      };
    }
  };

  const columnConfig = getColumnConfig();

  return (
    <Box sx={{
      p: { xs: 1, sm: 2, md: 3 },
      maxWidth: '100%',
      width: '100%',
      overflow: 'hidden'
    }}>
      <Typography variant="h5" gutterBottom sx={{
        fontWeight: 'bold',
        color: 'text.primary',
        mb: 3,
        fontSize: { xs: '1.25rem', sm: '1.5rem' }
      }}>
        Orders
      </Typography>

      {/* Filter & Search Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
              sx={{ borderRadius: 2, width: '200px' }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
              <MenuItem value="Assigned">Assigned</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, agent, or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Grid>
      </Grid>

      {/* Orders Display */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isMobile ? (
            // Mobile Card View
            <Box>
              {filteredOrders.map((order) => (
                <MobileOrderCard key={order.id} order={order} />
              ))}
            </Box>
          ) : (
            // Desktop/Tablet Table View
            <Box sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer
                component={Paper}
                elevation={3}
                sx={{
                  borderRadius: 2,
                  maxWidth: '100%',
                  '& .MuiTable-root': {
                    tableLayout: 'fixed',
                  }
                }}
              >
                <Table sx={{ minWidth: columnConfig.minWidth, width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      {columnConfig.columns.map((col) => (
                        <StyledTableCell
                          key={col.key}
                          onClick={col.key !== 'invoice' && col.key !== 'products' && col.key !== 'quantity' ? () => handleSort(col.key) : undefined}
                          sx={{
                            cursor: col.key !== 'invoice' && col.key !== 'products' && col.key !== 'quantity' ? 'pointer' : 'default',
                            width: col.width,
                            minWidth: col.width,
                            maxWidth: col.width,
                            ...(isTablet && { fontSize: '0.8rem', padding: '8px' })
                          }}
                          className={isTablet ? 'compact' : ''}
                        >
                          {col.label} {sortKey === col.key && (sortAsc ? '↑' : '↓')}
                        </StyledTableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const visibleProducts = order.products.slice(0, 2);
                      const extraProducts = order.products.length > 2 ? `+${order.products.length - 2} more` : '';

                      return (
                        <StyledTableRow key={order.id}>
                          {/* Order ID */}
                          <StyledTableCellBody className={isTablet ? 'compact' : ''}>
                            <Tooltip title={order.id} arrow>
                              <span>{truncateText(order.id, 12)}</span>
                            </Tooltip>
                          </StyledTableCellBody>

                          {/* Customer */}
                          <StyledTableCellBody className={isTablet ? 'compact' : ''}>
                            <Tooltip title={order.customerName} arrow>
                              <span>{truncateText(order.customerName, 15)}</span>
                            </Tooltip>
                          </StyledTableCellBody>

                          {/* Address */}
                          <StyledTableCellBody className={isTablet ? 'compact' : ''}>
                            <Tooltip title={order.address} arrow>
                              <span>{truncateText(order.address, 20)}</span>
                            </Tooltip>
                          </StyledTableCellBody>

                          {/* Delivery Date */}
                          <StyledTableCellBody className={isTablet ? 'compact' : ''}>
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </StyledTableCellBody>

                          {/* Total */}
                          <StyledTableCellBody className={isTablet ? 'compact' : ''}>
                            ₹{order.totalAmount}
                          </StyledTableCellBody>

                          {/* Discounted Price - Only on desktop */}
                          {!isTablet && (
                            <StyledTableCellBody>
                              ₹{order.discountedPrice || 'N/A'}
                            </StyledTableCellBody>
                          )}

                          {/* Order Date - Only on desktop */}
                          {!isTablet && (
                            <StyledTableCellBody>
                              {new Date(order.orderDate).toLocaleDateString()}
                            </StyledTableCellBody>
                          )}

                          {/* Products */}
                          <StyledTableCellBody className={isTablet ? 'compact' : ''}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              {visibleProducts.map((p, index) => (
                                <Typography
                                  key={index}
                                  variant="body2"
                                  sx={{
                                    fontSize: isTablet ? '0.7rem' : '0.875rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {truncateText(`${p.name} (x${p.quantity})`, 25)}
                                </Typography>
                              ))}
                              {extraProducts && (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'primary.main',
                                    mt: 0.5,
                                    fontSize: isTablet ? '0.7rem' : '0.875rem'
                                  }}
                                >
                                  {extraProducts}
                                </Typography>
                              )}
                            </Box>
                          </StyledTableCellBody>

                          {/* Quantity - Only on desktop */}


                          {/* Delivery Boy */}
                          <StyledTableCellBody className={isTablet ? 'compact' : ''}>
                            <Tooltip title={order.deliveryBoy || '-'} arrow>
                              <span>{truncateText(order.deliveryBoy || '-', 15)}</span>
                            </Tooltip>
                          </StyledTableCellBody>

                          {/* Status */}
                          <StyledTableCellBody className={isTablet ? 'compact' : ''}>
                            <Chip
                              label={order.status}
                              size="small"
                              color={order.status === 'Delivered' ? 'success' : order.status === 'Pending' ? 'warning' : 'default'}
                              sx={{ fontSize: isTablet ? '0.6rem' : '0.75rem' }}
                            />
                          </StyledTableCellBody>

                          {/* Invoice */}
                          <StyledTableCellBody>
                            <IconButton
                              component={Link}
                              to={`/invoice/${order.id.replace('#', '')}`}
                              color="primary"
                              size="small"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </StyledTableCellBody>
                        </StyledTableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </>
      )}

      {!loading && filteredOrders.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No orders found.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Orders;