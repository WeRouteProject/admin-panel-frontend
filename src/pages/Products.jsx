import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Card, CardContent, CardActions, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  Chip, Fab, Skeleton, Tooltip, Badge, Paper, Divider, Stack, Zoom, Slide,
  useTheme, alpha
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ShoppingCart as ShoppingCartIcon,
  Remove as RemoveIcon, Close as CloseIcon, Category as CategoryIcon, LocalOffer as PriceIcon,
  Inventory as ProductIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import useCartStore from '../store/useCartStore';
import useProductStore from '../store/productStore';

const gradientColors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
];

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const StyledCard = styled(Card)(({ theme, gradient }) => ({
  width: '100%',
  aspectRatio: '1/1', // Makes it square
  borderRadius: '20px',
  background: gradient,
  color: 'white',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  transition: 'all 0.4s ease',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  // Responsive sizing
  [theme.breakpoints.down('sm')]: {
    minHeight: '330px',
    maxHeight: '330px',
  },
  [theme.breakpoints.up('sm')]: {
    minHeight: '350px',
    maxHeight: '350px',
  },
  [theme.breakpoints.up('md')]: {
    minHeight: '320px',
    maxHeight: '320px',
  },
  [theme.breakpoints.up('lg')]: {
    minHeight: '330px',
    maxHeight: '330px',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255,255,255,0.1)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    '&::before': {
      opacity: 1,
    },
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
  backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '1px', boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)',
  border: '1px solid rgba(255,255,255,0.2)', animation: `${float} 3s ease-in-out infinite`
}));

const CartButton = styled(IconButton)(({ theme }) => ({
  width: '50px', height: '50px', background: 'rgba(255,255,255,0.25)',
  backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255,255,255,0.4)', transform: 'scale(1.1)',
    animation: `${pulse} 0.6s ease-in-out`
  }
}));

const QuantityButton = styled(IconButton)(({ theme }) => ({
  width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)',
  color: 'white', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.4)',
  transition: 'all 0.2s ease',
  '&:hover': { background: 'rgba(255,255,255,0.5)', transform: 'scale(1.1)' }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: '24px', padding: theme.spacing(4), marginBottom: theme.spacing(4),
  color: 'white', position: 'relative', overflow: 'hidden',
  '&::before': {
    content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.5,
  }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px', backdropFilter: 'blur(20px)',
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.secondary.main, 0.95)} 100%)`,
    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  }
}));

const Products = () => {
  const theme = useTheme();
  const { categoryId } = useParams();
  const location = useLocation();
  const isAllProductsPage = !categoryId;

  const [showModal, setShowModal] = useState(false);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [editProductId, setEditProductId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const { products, fetchProducts, deleteProduct, saveProduct, loading } = useProductStore();
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  useEffect(() => {
    fetchProducts(categoryId);
  }, [categoryId, fetchProducts]);

  const getQuantity = (productId) => {
    const item = cart.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  const handleCartClick = async (product) => {
    const currentQty = getQuantity(product.productId);
    if (currentQty === 0) await addToCart(product);
    else await updateQuantity(product.productId, 1);
  };

  const updateProductQuantity = async (productId, delta) => {
    const currentQty = getQuantity(productId);
    const newQty = currentQty + delta;
    if (newQty <= 0) await removeFromCart(productId);
    else await updateQuantity(productId, delta);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const handleSave = async () => {
    await saveProduct({
      productName, description, price, categoryId, isEditing, editProductId
    });
    setShowModal(false);
    setProductName('');
    setDescription('');
    setPrice('');
    setEditProductId(null);
    setIsEditing(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setProductName('');
    setDescription('');
    setPrice('');
    setEditProductId(null);
    setIsEditing(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <HeaderSection>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CategoryIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {isAllProductsPage
                    ? 'All Products'
                    : `${location.state?.name || 'Category'}`}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {isAllProductsPage 
                    ? 'Discover our complete product collection'
                    : 'Explore products in this category'
                  }
                </Typography>
              </Box>
            </Stack>
          </Box>

          {!isAllProductsPage && (
            <Zoom in={true} timeout={1000}>
              <Fab
                color="secondary"
                variant="extended"
                onClick={() => {
                  setIsEditing(false);
                  setProductName('');
                  setDescription('');
                  setPrice('');
                  setShowModal(true);
                }}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <AddIcon sx={{ mr: 1 }} />
                Add New Product
              </Fab>
            </Zoom>
          )}
        </Stack>
      </HeaderSection>

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ borderRadius: '20px', height: 300 }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          }}
        >
          <ProductIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            No Products Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isAllProductsPage 
              ? 'Start adding products to see them here.'
              : 'This category is empty. Add some products to get started!'
            }
          </Typography>
        </Paper>
      )}

      {/* Products Grid */}
      <Grid container spacing={4}>
        {products.map((product, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.productId}>
            <Slide direction="up" in={!loading} timeout={300 + index * 100}>
              <StyledCard gradient={gradientColors[index % gradientColors.length]}>
                <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                  <IconWrapper sx={{ mx: 'auto', mb: 3 }}>
                    {product.productName.slice(0, 2).toUpperCase()}
                  </IconWrapper>
                  
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {product.productName}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    {product.description}
                  </Typography>
                  
                  <Chip
                    icon={<PriceIcon />}
                    label={`₹ ${product.price}`}
                    sx={{
                      background: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      height: '32px',
                    }}
                  />
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
                  {/* Cart Section */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge
                      badgeContent={getQuantity(product.productId)}
                      color="error"
                      invisible={getQuantity(product.productId) === 0}
                    >
                      <Tooltip title="Add to Cart" arrow>
                        <CartButton onClick={() => handleCartClick(product)}>
                          <ShoppingCartIcon />
                        </CartButton>
                      </Tooltip>
                    </Badge>

                    {/* Quantity Controls */}
                    {getQuantity(product.productId) > 0 && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <QuantityButton
                          size="small"
                          onClick={() => updateProductQuantity(product.productId, -1)}
                        >
                          <RemoveIcon fontSize="small" />
                        </QuantityButton>
                        
                        <Typography 
                          variant="h6" 
                          fontWeight="bold"
                          sx={{ 
                            minWidth: '30px', 
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.3)',
                            borderRadius: '8px',
                            px: 1,
                            py: 0.5
                          }}
                        >
                          {getQuantity(product.productId)}
                        </Typography>
                        
                        <QuantityButton
                          size="small"
                          onClick={() => updateProductQuantity(product.productId, 1)}
                        >
                          <AddIcon fontSize="small" />
                        </QuantityButton>
                      </Stack>
                    )}
                  </Box>

                  {/* Edit/Delete Actions */}
                  {!isAllProductsPage && (
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit Product" arrow>
                        <IconButton
                          size="small"
                          sx={{ 
                            background: 'rgba(255,255,255,0.3)',
                            color: 'white',
                            '&:hover': { background: 'rgba(255,255,255,0.5)' }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                            setEditProductId(product.productId);
                            setProductName(product.productName);
                            setDescription(product.description);
                            setPrice(product.price);
                            setShowModal(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete Product" arrow>
                        <IconButton
                          size="small"
                          sx={{ 
                            background: 'rgba(255,0,0,0.3)',
                            color: 'white',
                            '&:hover': { background: 'rgba(255,0,0,0.5)' }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete ${product.productName}?`)) {
                              handleDelete(product.productId);
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                </CardActions>
              </StyledCard>
            </Slide>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Product Modal */}
      <StyledDialog
        open={showModal}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        transitionDuration={400}
      >
        <DialogTitle
          sx={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <ProductIcon />
            <Typography variant="h5" fontWeight="bold">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </Typography>
          </Stack>
          <IconButton onClick={handleModalClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider sx={{ background: 'rgba(255,255,255,0.2)' }} />

        <DialogContent sx={{ pt: 3, color: 'white' }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.8)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
              }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.8)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
              }}
            />
            
            <TextField
              fullWidth
              type="number"
              label="Price (₹)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.8)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleModalClose}
            variant="outlined"
            sx={{
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                background: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!productName || !description || !price}
            sx={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              '&:hover': {
                background: 'rgba(255,255,255,0.3)',
              },
              '&:disabled': {
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
              },
            }}
          >
            {isEditing ? 'Update Product' : 'Add Product'}
          </Button>
        </DialogActions>
      </StyledDialog>
    </Container>
  );
};

export default Products;