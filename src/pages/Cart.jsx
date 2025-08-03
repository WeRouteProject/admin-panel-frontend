import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Grid, Button, IconButton,
  Avatar, Chip, Divider, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Paper, Stack, MenuItem, Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon, ShoppingCart as ShoppingCartIcon,
  LocalShipping as DeliveryIcon, Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon,
  LocationOn as LocationIcon, DateRange as DateIcon, CheckCircle as CheckIcon, ShoppingBag as BagIcon
} from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/authStore';
import useCustomerStore from '../store/customerStore';
import { useAssignDeliveryStore } from '../store/assignDeliveryStore';
import useProductStore from '../store/productStore';

const API_BASE = 'http://35.170.21.202:3000/api';

const Cart = () => {
  const cart = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const getCartItems = useCartStore((state) => state.getCartItems);
  const isLoading = useCartStore((state) => state.isLoading);
  const error = useCartStore((state) => state.error);
  const clearError = useCartStore((state) => state.clearError);
  const { assignDelivery } = useAssignDeliveryStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const clearCart = useCartStore((state) => state.clearCart);
  const { fetchProductById } = useProductStore();

  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const { token, user } = useAuthStore();
  const [customerName, setCustomerName] = useState(user?.username || '');
  const [address, setAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [agent, setAgent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [productDetails, setProductDetails] = useState({});
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/150';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE}/${imagePath}`;
  };
  

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (cart.length === 0) return;

      const detailsToFetch = cart.filter(item => !productDetails[item.productId] && !item.imageUrl);

      if (detailsToFetch.length === 0) return;

      const loadingStates = {};
      detailsToFetch.forEach(item => {
        loadingStates[item.productId] = true;
      });
      setImageLoadingStates(prev => ({ ...prev, ...loadingStates }));

      const details = {};
      const fetchPromises = detailsToFetch.map(async (item) => {
        try {
          const product = await fetchProductById(item.productId);
          const imageUrl = getImageUrl(product.imageUrl || product.image);
          details[item.productId] = { ...product, imageUrl };
        } catch (err) {
          console.error(`Failed to fetch product ${item.productId}:`, err);
          details[item.productId] = {
            imageUrl: 'https://via.placeholder.com/150',
            productName: item.name || item.productName || 'Unknown Product',
            price: item.price || 0,
            description: ''
          };
        }
      });

      await Promise.all(fetchPromises);
      setProductDetails(prev => ({ ...prev, ...details }));

      const clearedLoadingStates = {};
      detailsToFetch.forEach(item => {
        clearedLoadingStates[item.productId] = false;
      });
      setImageLoadingStates(prev => ({ ...prev, ...clearedLoadingStates }));
    };

    fetchProductDetails();
  }, [cart, fetchProductById]);

  useEffect(() => {
    if (token) {
      getCartItems();
      fetchCustomers();
    }
  }, [token, getCartItems, fetchCustomers]);

  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [error, clearError]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/deliveryboys`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setDeliveryAgents(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error('Failed to fetch delivery agents:', err);
        setDeliveryAgents([]);
      }
    };
    if (token) fetchAgents();
  }, [token]);

  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);

  // Calculate discounted price based on customer's discount percentage
  useEffect(() => {
  const selectedCustomer = customers.find((c) => c.customerId === selectedCustomerId);
  if (selectedCustomer) {
    const discountPercentage = Number(selectedCustomer.discount) || 0;
    setDiscountPercentage(discountPercentage);
    const discount = (subtotal * discountPercentage) / 100;
    setDiscountedPrice(subtotal - discount > 0 ? subtotal - discount : 0);
  } else {
    setDiscountPercentage(0);
    setDiscountedPrice(subtotal);
  }
}, [selectedCustomerId, customers, subtotal]);

const selectedCustomer = customers.find(c => c.customerId === selectedCustomerId);
const applyCustomerDiscount = selectedCustomer?.applyCustomerDiscount ?? false;

const totalBeforeDiscount = cart.reduce((sum, item) => {
  const basePrice = Number(item.price || 0); // original price
  const quantity = Number(item.quantity || 1);
  return sum + basePrice * quantity;
}, 0);

const totalProductLevelDiscounted = cart.reduce((sum, item) => {
  const discounted = Number(item.discountedPrice || item.price || 0);
  const quantity = Number(item.quantity || 1);
  return sum + discounted * quantity;
}, 0);

// Decide which discount to apply in UI
const finalDiscountedPrice = applyCustomerDiscount ? discountedPrice : totalProductLevelDiscounted;


  const handleUpdateQuantity = async (productId, delta) => {
    try {
      await updateQuantity(productId, delta);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      setProductDetails(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleCheckout = () => {
    if (!customerName || !address || !deliveryDate || !agent || !selectedCustomerId) {
      toast.error('Please fill in all delivery details before proceeding.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      toast.error('Please enter a valid email address.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    
    setShowModal(true);
  };

  const handleConfirmOrder = async () => {
    setIsCheckoutLoading(true);
    const selectedCustomer = customers.find((c) => c.customerName === customerName);
    const walletBalance = selectedCustomer ? Number(selectedCustomer.wallet) || 0 : 0;

    if (discountedPrice > walletBalance) {
      setIsCheckoutLoading(false);
      toast.error('Insufficient wallet balance.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
const applyCustomerDiscount = selectedCustomer?.applyCustomerDiscount ?? false;

    const payload = {
  cartItems: cart.map((item) => ({ cartItemId: item.cartItemId })),
  deliveryBoyId: Number(agent),
  customerName,
  customerNumber: customerPhone,
  customerEmail,
  deliveryDate: new Date(deliveryDate).toISOString(),
  status: 'ASSIGNED',
  deliveryAddress: address,
  discountedPrice: Number(discountedPrice.toFixed(2)),
  customerId: selectedCustomerId,
  applyCustomerDiscount 
};



    try {
      await assignDelivery(payload);
      await clearCart();
      setProductDetails({});
      setCustomerName(user?.username || '');
      setCustomerEmail('');
      setCustomerPhone('');
      setAddress('');
      setDeliveryDate('');
      setAgent('');
      setShowModal(false);
      toast.success('Order assigned successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Failed to place order:', err);
      toast.error('Failed to place order. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column">
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading your cart...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <ShoppingCartIcon sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
        <Typography variant="h4" fontWeight="600" color="text.primary">
          Shopping Cart
        </Typography>
        <Chip label={`${cart.length} ${cart.length === 1 ? 'item' : 'items'}`} size="small" sx={{ ml: 2 }} />
      </Box>

      {error && (
        <Alert severity="warning" onClose={clearError} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {cart.length === 0 ? (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
          <BagIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start shopping to add items to your cart
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {cart.map((item, index) => {
              const uniqueKey = `${item.productId}-${index}`;

             
const price = Number(item.price) || 0;
const discounted = Number(item.discountedPrice || 0);
const quantity = Number(item.quantity) || 0;
const finalPrice = discounted && discounted < price ? discounted : price;
const total = finalPrice * quantity;
              const product = productDetails[item.productId] || {};
              const productName = item.productName || product.productName || item.name || 'Unknown Product';
              const productImage = item.imageUrl ? getImageUrl(item.imageUrl) : product.imageUrl || 'https://via.placeholder.com/150';
              const isImageLoading = imageLoadingStates[item.productId];

              return (
                <Grid item xs={12} sm={6} md={4} key={uniqueKey}>
                  <Card elevation={1} sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 2 }}>
                    <Box sx={{ flexShrink: 0, mr: 2, position: 'relative' }}>
                      {isImageLoading && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1,
                          }}
                        >
                          <CircularProgress size={20} />
                        </Box>
                      )}
                      <Box
                        component="img"
                        src={productImage}
                        alt={productName}
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 2,
                          objectFit: 'cover',
                          bgcolor: 'grey.200',
                          opacity: isImageLoading ? 0.5 : 1,
                          display: productImage ? 'block' : 'none',
                        }}
                        onError={(e) => {
                          console.log(`Failed to load image for product ${item.productId}`);
                          e.target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                      {!productImage && (
                        <Avatar
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: 2,
                            bgcolor: 'primary.light',
                            fontSize: '1.5rem',
                          }}
                        >
                          {(productName || 'P').slice(0, 2)}
                        </Avatar>
                      )}
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      {discounted && discounted < price ? (
  <Box display="flex" alignItems="center" gap={1}>
    <Typography variant="h6" color="success.main" fontWeight="bold">
      ₹ {discounted.toFixed(2)}
    </Typography>
    <Typography variant="body2" color="text.disabled" sx={{ textDecoration: 'line-through' }}>
      ₹ {price.toFixed(2)}
    </Typography>
  </Box>
) : (
  <Typography variant="body2" color="text.secondary">
    Price: ₹ {price.toFixed(2)}
  </Typography>
)}


                      <Box display="flex" alignItems="center" my={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.productId, -1)}
                          disabled={quantity <= 1}
                          sx={{ bgcolor: 'grey.200', mr: 1 }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center' }}>
                          {quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.productId, 1)}
                          sx={{ bgcolor: 'grey.200', ml: 1 }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" fontWeight="600">
  TOTAL: ₹{total.toFixed(2)}
</Typography>
                    </Box>

                    <Box sx={{ flexShrink: 0 }}>
                      <Tooltip title="Remove item">
                        <IconButton
                          onClick={() => handleRemove(item.productId)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Card elevation={3} sx={{ mb: 4, borderRadius: 3, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Box display="flex" alignItems="center" mb={4}>
                <DeliveryIcon sx={{ color: 'primary.main', fontSize: 28, mr: 1.5 }} />
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  Delivery Details
                </Typography>
              </Box>
              <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
                <Grid container spacing={3} sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <Grid item xs={12} md={4} sx={{ minWidth: { md: '300px' }, flex: '1 1 auto' }}>
                    
                     <TextField
  fullWidth
  select
  label="Customer"
  value={selectedCustomerId || ''}
  onChange={(e) => {
    const customerId = e.target.value;
    const customer = customers.find((c) => c.customerId === customerId);
    if (customer) {
      setCustomerName(customer.customerName);
      setAddress(customer.address);
      setCustomerEmail(customer.email);
      setCustomerPhone(customer.contactNumber);
      setSelectedCustomerId(customer.customerId);
      setDiscountPercentage(Number(customer.discount) || 0);
    }
  }}
  variant="outlined"
  InputProps={{
    startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} />,
  }}
  sx={{
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      bgcolor: 'grey.50',
      height: '50px',
      display: 'flex',
      width: '330px',
      alignItems: 'center',
    },
  }}
>
  {customers.map((cust) => (
    <MenuItem key={cust.customerId} value={cust.customerId}>
      {cust.customerName}
    </MenuItem>
  ))}
</TextField>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ minWidth: { md: '300px' }, flex: '1 1 auto' }}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      error={customerEmail && !/\S+@\S+\.\S+/.test(customerEmail)}
                      helperText={
                        customerEmail && !/\S+@\S+\.\S+/.test(customerEmail) ? 'Invalid email format' : ''
                      }
                      variant="outlined"
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ color: 'action.active', mr: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          bgcolor: 'grey.50',
                          height: '50px',
                          display: 'flex',
                          width: '330px',
                          alignItems: 'center',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ minWidth: { md: '300px' }, flex: '1 1 auto' }}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ color: 'action.active', mr: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          bgcolor: 'grey.50',
                          height: '50px',
                          display: 'flex',
                          width: '330px',
                          alignItems: 'center',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ minWidth: { md: '300px' }, flex: '1 1 auto' }}>
                    <TextField
                      fullWidth
                      label="Delivery Date"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: new Date().toISOString().split('T')[0] }}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <DateIcon sx={{ color: 'action.active', mr: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          bgcolor: 'grey.50',
                          height: '50px',
                          display: 'flex',
                          width: '330px',
                          alignItems: 'center',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ minWidth: { md: '300px' }, flex: '1 1 auto' }}>
                    <TextField
                      fullWidth
                      label="Delivery Address"
                      value={
                        address.split(/\s+/).filter(Boolean).length > 4
                          ? `${address.split(/\s+/).slice(0, 4).join(' ')} ...`
                          : address
                      }
                      onChange={(e) => setAddress(e.target.value)}
                      multiline
                      rows={2}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <LocationIcon sx={{ color: 'action.active', mr: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          bgcolor: 'grey.50',
                          height: '50px',
                          alignItems: 'flex-start',
                          width: '330px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ minWidth: { md: '300px' }, flex: '1 1 auto' }}>
                    <TextField
                      fullWidth
                      select
                      label="Delivery Agent"
                      value={agent}
                      onChange={(e) => setAgent(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          bgcolor: 'grey.50',
                          height: '50px',
                          width: '330px',
                          display: 'flex',
                          alignItems: 'center',
                        },
                      }}
                    >
                      {deliveryAgents.map((d) => (
                        <MenuItem key={d.userId} value={d.userId}>
                          {d.username}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          <Paper elevation={1} sx={{ p: 3, bgcolor: 'grey.50' }}>
  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
    <Box>
      <Typography variant="h6" fontWeight="500" color="text.secondary">
        Total Before Discount: ₹{totalBeforeDiscount.toFixed(2)}
      </Typography>

      <Typography variant="h5" fontWeight="600" color="primary.main">
        Final Price After Discount: ₹{finalDiscountedPrice.toFixed(2)}
      </Typography>

      {customerName && selectedCustomerId && (
        <Typography variant="body2" color="info.main">
          {applyCustomerDiscount
            ? "Customer-level discount applied"
            : "Product-level discount applied"}
        </Typography>
      )}

      <Typography variant="body2" color="text.secondary">
        {cart.length} items in cart
      </Typography>
    </Box>

    <Button
      variant="contained"
      size="large"
      onClick={handleCheckout}
      disabled={!customerName || !address || !deliveryDate || !agent || cart.length === 0 || isCheckoutLoading}
      startIcon={isCheckoutLoading ? <CircularProgress size={20} /> : <CheckIcon />}
      sx={{ px: 4, py: 1.5, minWidth: 160 }}
    >
      {isCheckoutLoading ? 'Processing...' : 'Assign Order'}
    </Button>
  </Stack>
</Paper>


        </>
      )}

      <Dialog open={showModal} onClose={() => { if (!isCheckoutLoading) setShowModal(false) }} maxWidth="sm" fullWidth>
  <DialogTitle>
    <Box display="flex" alignItems="center" gap={2}>
      <CheckIcon color="success" />
      <Typography variant="h6">Confirm Order</Typography>
    </Box>
  </DialogTitle>
  <DialogContent>
  <Stack spacing={2}>
    <Box display="flex" justifyContent="space-between">
      <Typography variant="body1" fontWeight="500">Customer:</Typography>
      <Typography variant="body1">{customerName}</Typography>
    </Box>
    <Divider />
    <Box display="flex" justifyContent="space-between">
      <Typography variant="body1" fontWeight="500">Agent:</Typography>
      <Typography variant="body1">
        {deliveryAgents.find(a => a.userId == agent)?.username || agent}
      </Typography>
    </Box>
    <Divider />
    <Box display="flex" justifyContent="space-between">
      <Typography variant="body1" fontWeight="500">Delivery Date:</Typography>
      <Typography variant="body1">{deliveryDate}</Typography>
    </Box>
    <Divider />
    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
      <Typography variant="body1" fontWeight="500">Address:</Typography>
      <Typography variant="body1" textAlign="right" sx={{ maxWidth: '60%' }}>
        {address}
      </Typography>
    </Box>
    <Divider />
    <Box display="flex" justifyContent="space-between">
      <Typography variant="body1" fontWeight="500">Total Before Discount:</Typography>
      <Typography variant="body1">₹{totalBeforeDiscount.toFixed(2)}</Typography>
    </Box>
    <Box display="flex" justifyContent="space-between">
      <Typography variant="body1" fontWeight="500">Final Price After Discount:</Typography>
      <Typography variant="body1" color="success.main">
        ₹{finalDiscountedPrice.toFixed(2)}
      </Typography>
    </Box>
    <Box display="flex" justifyContent="space-between">
      <Typography variant="body2" color="info.main">
        {applyCustomerDiscount
          ? "Customer-level discount applied"
          : "Product-level discount applied"}
      </Typography>
    </Box>
  </Stack>
</DialogContent>

  <DialogActions sx={{ p: 3 }}>
    <Button onClick={() => { if (!isCheckoutLoading) setShowModal(false) }} variant="outlined" disabled={isCheckoutLoading}>
      Cancel
    </Button>
    <Button
      onClick={handleConfirmOrder}
      variant="contained"
      disabled={isCheckoutLoading}
      startIcon={isCheckoutLoading ? <CircularProgress size={16} /> : null}
    >
      {isCheckoutLoading ? 'Processing...' : 'Confirm Order'}
    </Button>
  </DialogActions>
</Dialog>


      <ToastContainer position="top-right" autoClose={3000} style={{ top: '80px' }} toastStyle={{ zIndex: 10000 }} />
    </Container>
  );
};

export default Cart;