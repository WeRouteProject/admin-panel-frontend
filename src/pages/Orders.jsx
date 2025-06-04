import React, { useEffect } from 'react';
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

const Orders = () => {
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

  // State for loading
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    };
    loadOrders();
  }, [fetchOrders]);

  // Log orders to debug data
  useEffect(() => {
    console.log('Orders:', orders);
  }, [orders]);

  const getFilteredSortedOrders = () => {
    let filtered = [...orders];

    if (filterStatus) {
      console.log('Filter Status:', filterStatus);
      filtered = filtered.filter((o) => o.status.toLowerCase() === filterStatus.toLowerCase());
      console.log('Filtered Orders:', filtered);
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

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '100%', overflowX: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', mb: 3 }}>
        Orders
      </Typography>

      {/* Filter & Search Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth variant="outlined" sx={{ minWidth: 240 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => {
                console.log('Selected Status:', e.target.value);
                setFilterStatus(e.target.value);
              }}
              label="Status"
              sx={{ borderRadius: 2, minWidth: 240 }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
              <MenuItem value="Assigned">Assigned</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={8} md={6}>
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

      {/* Orders Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell onClick={() => handleSort('id')} sx={{ cursor: 'pointer' }}>
                  Order ID {sortKey === 'id' && (sortAsc ? '↑' : '↓')}
                </StyledTableCell>
                <StyledTableCell>Customer</StyledTableCell>
                <StyledTableCell>Address</StyledTableCell>
                <StyledTableCell onClick={() => handleSort('deliveryDate')} sx={{ cursor: 'pointer' }}>
                  Delivery Date {sortKey === 'deliveryDate' && (sortAsc ? '↑' : '↓')}
                </StyledTableCell>
                <StyledTableCell>Total</StyledTableCell>
                <StyledTableCell onClick={() => handleSort('orderDate')} sx={{ cursor: 'pointer' }}>
                  Order Date {sortKey === 'orderDate' && (sortAsc ? '↑' : '↓')}
                </StyledTableCell>
                <StyledTableCell>Products</StyledTableCell>
                <StyledTableCell align="center">Quantity</StyledTableCell>
                <StyledTableCell>Delivery Boy</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Invoice</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {filteredOrders.map((order) => {
    // Process products for display: show up to 2 products, stacked vertically
    const visibleProducts = order.products.slice(0, 2);
    const extraProducts = order.products.length > 2 ? `+${order.products.length - 2} more` : '';

    // Process address for display (truncate if more than 5 words, as per previous request)
    const addressWords = order.address.split(' ');
    const displayAddress = addressWords.length > 5 
      ? addressWords.slice(0, 5).join(' ') + '...' 
      : order.address;

    return (
      <StyledTableRow key={order.id}>
        <TableCell>{order.id}</TableCell>
        <TableCell>{order.customerName}</TableCell>
        <TableCell>{displayAddress}</TableCell>
        <TableCell>{order.deliveryDate}</TableCell>
        <TableCell>₹{order.totalAmount}</TableCell>
        <TableCell>{order.orderDate}</TableCell>
        <TableCell>
          <Box sx={{ maxWidth: 200, display: 'flex', flexDirection: 'column' }}>
            {visibleProducts.map((p, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}
              >
                {`${p.name} (x${p.quantity})`}
              </Typography>
            ))}
            {extraProducts && (
              <Typography
                variant="body2"
                sx={{ color: 'primary.main', mt: 0.5 }}
              >
                {extraProducts}
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell align="center">
          <Typography variant="body2">
            {order.products.map((p) => p.quantity).join(', ')}
          </Typography>
        </TableCell>
        <TableCell>{order.deliveryBoy || '-'}</TableCell>
        <TableCell>{order.status}</TableCell>
        <TableCell>
          <IconButton
            component={Link}
            to={`/invoice/${order.id.replace('#', '')}`}
            color="primary"
            size="small"
          >
            <VisibilityIcon />
          </IconButton>
        </TableCell>
      </StyledTableRow>
    );
  })}
</TableBody>
          </Table>
        </TableContainer>
      )}

      {/* No Orders Message */}
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