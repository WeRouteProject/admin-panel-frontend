import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  Box, Container, Typography, Button, CardContent, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  Chip, Paper, Stack, useTheme, alpha, CircularProgress, InputAdornment, MenuItem, Select
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ShoppingCart as ShoppingCartIcon,
  Remove as RemoveIcon, Close as CloseIcon, Category as CategoryIcon, LocalOffer as PriceIcon,
  Inventory as ProductIcon, Image as ImageIcon, Search as SearchIcon, Clear as ClearIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useCartStore from '../store/useCartStore';
import useProductStore from '../store/productStore';
import CardDesign from '../components/CardDesign';
import { VALID_NAME_REGEX } from '../constants/regex';
import axios from 'axios';

const API_BASE = 'https://logistic-project-backend.onrender.com/api';

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(6),
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  paddingBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  maxWidth: '400px',
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: theme.palette.grey[50],
    borderColor: theme.palette.grey[200],
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.grey[100],
      borderColor: theme.palette.grey[300],
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.common.white,
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(1.5),
    fontSize: '14px',
  },
  '& .MuiInputLabel-outlined': {
    fontSize: '14px',
    transform: 'translate(14px, 12px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -6px) scale(0.75)',
    },
  },
}));

const CartButton = styled(IconButton)(({ theme }) => ({
  width: '36px',
  height: '36px',
  background: theme.palette.primary.main,
  color: theme.palette.common.white,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: theme.palette.primary.dark,
    transform: 'scale(1.05)',
  },
}));

const QuantityButton = styled(IconButton)(({ theme }) => ({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  background: theme.palette.grey[200],
  color: theme.palette.text.primary,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: theme.palette.grey[300],
    transform: 'scale(1.05)',
  },
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  width: '32px',
  height: '32px',
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.grey[200]}`,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  }
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: '500',
  padding: theme.spacing(0.75, 2),
  fontSize: '14px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${theme.palette.grey[200]}`,
  }
}));

const EmptyStateContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6, 4),
  textAlign: 'center',
  borderRadius: '16px',
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: 'none',
}));

const LoaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '60vh',
  opacity: 1,
  transition: 'opacity 0.3s ease-in-out',
  '&.fade-out': {
    opacity: 0,
  },
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
  const [image, setImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [editProductId, setEditProductId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const { products, fetchProducts, fetchProductById, deleteProduct, saveProduct, loading } = useProductStore();
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const getCartItems = useCartStore((state) => state.getCartItems);

  useEffect(() => {
    fetchProducts(categoryId);
    setSearchTerm('');
  }, [categoryId, fetchProducts]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE}/categories`);
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (isAllProductsPage) {
      fetchCategories();
    }
  }, [isAllProductsPage]);

  useEffect(() => {
    getCartItems();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getQuantity = (productId) => {
    const item = cart.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  const handleCartClick = async (product) => {
    const currentQty = getQuantity(product.productId);
    if (currentQty === 0) {
      await addToCart(product);
      toast.success(`"${product.productName}" added to cart!`, {
        position: 'top-right',
        autoClose: 3000,
      });
    } else {
      await updateQuantity(product.productId, 1);
      toast.success(`Increased quantity of "${product.productName}" in cart!`, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const updateProductQuantity = async (productId, delta) => {
    const currentQty = getQuantity(productId);
    const newQty = currentQty + delta;
    const product = products.find((p) => p.productId === productId);
    if (newQty <= 0) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, delta);
      if (delta > 0) {
        toast.success(`Increased quantity of "${product.productName}" in cart!`, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    }
  };

  const handleDelete = (id) => {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);

  };

  const confirmDelete = async () => {
    try {

      const isInCart = cart.some((item) => item.productId === productToDelete);

      if (isInCart) {
        setDeleteConfirmOpen(false);
        setProductToDelete(null);
        toast.error('Product deletion failed: item is present in the cart.', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }

      await deleteProduct(productToDelete);
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
      toast.success('Product deleted successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      setDeleteConfirmOpen(false);
      toast.error('Failed to delete product. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleEdit = async (productId) => {
    try {
      const product = await fetchProductById(productId);
      setIsEditing(true);
      setEditProductId(productId);
      setProductName(product.productName);
      setDescription(product.description);
      setPrice(product.price);
      // Only set selectedCategory if we're on the all products page
      if (isAllProductsPage) {
        setSelectedCategory(product.categoryId);
      }
      setImage(null);
      setShowModal(true);

    } catch (err) {
      toast.error('Failed to fetch product details. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };


  const handleSave = async () => {

    if (!VALID_NAME_REGEX.test(productName)) {
      toast.error('Product name contains invalid characters. Only letters, numbers, spaces, hyphens, and apostrophes are allowed.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    // Validation - category is only required for all products page
    const requiredFields = [productName.trim(), description.trim(), price];
    if (isAllProductsPage) {
      requiredFields.push(selectedCategory);
    }

    if (requiredFields.some(field => !field)) {
      toast.error('Please fill in all required fields.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    try {
      setUploading(true);
      await saveProduct({
        productName,
        description,
        price: parseFloat(price),
        // Use current categoryId if not on all products page, otherwise use selected category
        categoryId: isAllProductsPage ? parseInt(selectedCategory) : parseInt(categoryId),
        image,
        isEditing,
        editProductId,
      });
      setShowModal(false);
      setProductName('');
      setDescription('');
      setPrice('');
      setImage(null);
      setSelectedCategory('');
      setEditProductId(null);
      setIsEditing(false);
      toast.success(isEditing ? 'Product updated successfully!' : 'Product added successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Failed to save product. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setProductName('');
    setDescription('');
    setPrice('');
    setImage(null);
    setSelectedCategory('');
    setEditProductId(null);
    setIsEditing(false);
    setUploading(false);
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const openAddProductModal = () => {
    setIsEditing(false);
    setProductName('');
    setDescription('');
    setPrice('');
    setImage(null);
    setSelectedCategory('');
    setShowModal(true);
  };

  return (
    <PageContainer maxWidth="xl">
      <HeaderContainer>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography
              variant="h4"
              fontWeight="600"
              color="text.primary"
              sx={{ mb: 0.5, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
            >
              {isAllProductsPage ? 'All Products' : `${location.state?.name || 'Category'}`}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '15px' }}
            >
              {isAllProductsPage
                ? 'Discover our complete product collection'
                : 'Explore products in this category'}
            </Typography>
          </Box>
          <SearchBar
            label="Search Products"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'grey.500' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchTerm('')} edge="end">
                    <ClearIcon sx={{ color: 'grey.500' }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <PrimaryButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddProductModal}
          sx={{ minWidth: '140px', flexShrink: 0 }}
        >
          Add Product
        </PrimaryButton>
      </HeaderContainer>

      {loading && (
        <LoaderContainer>
          <CircularProgress size={60} thickness={4} />
        </LoaderContainer>
      )}

      {!loading && filteredProducts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Chip
            icon={<ProductIcon />}
            label={`${filteredProducts.length} ${filteredProducts.length === 1 ? 'Product' : 'Products'}`}
            variant="outlined"
            sx={{
              borderColor: 'grey.300',
              backgroundColor: 'grey.50',
              '& .MuiChip-label': { fontWeight: '500' }
            }}
          />
        </Box>
      )}

      {!loading && filteredProducts.length === 0 && (
        <EmptyStateContainer>
          <ProductIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" fontWeight="500" color="text.primary" gutterBottom>
            {searchTerm ? 'No matching products found' : 'No products yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm
              ? 'Try a different search term'
              : 'Start adding products to see them here.'}
          </Typography>

        </EmptyStateContainer>
      )}

      {!loading && filteredProducts.length > 0 && (
        <Grid container spacing={3} justifyContent="center">
          {filteredProducts.map((product) => (
            <Grid item key={product.productId}>
              <CardDesign
                imageUrl={product.imageUrl}
                placeholderText="No Image"
                placeholderIcon={<ImageIcon sx={{ fontSize: 36, mb: 1 }} />}
                actions={
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={<CartButton sx={{ background: 'transparent' }}><ShoppingCartIcon fontSize="small" sx={{ color: theme.palette.text.primary }} /></CartButton>}
                        label={getQuantity(product.productId) === 0 ? 'Add to Cart' : getQuantity(product.productId)}
                        onClick={() => handleCartClick(product)}
                        sx={{
                          borderColor: 'grey.300',
                          backgroundColor: 'grey.50',
                          '& .MuiChip-label': { fontWeight: '500' },
                          '&:hover': { backgroundColor: 'grey.100', cursor: 'pointer' }
                        }}
                      />
                      {getQuantity(product.productId) > 0 && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <QuantityButton
                            size="small"
                            onClick={() => updateProductQuantity(product.productId, -1)}
                          >
                            <RemoveIcon fontSize="small" />
                          </QuantityButton>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            sx={{
                              minWidth: '24px',
                              textAlign: 'center',
                              background: theme.palette.grey[100],
                              borderRadius: '6px',
                              px: 1,
                              py: 0.5,
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
                    <Stack direction="row" spacing={1}>
                      <ActionIconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(product.productId);
                        }}
                      >
                        <EditIcon sx={{ fontSize: '16px' }} />
                      </ActionIconButton>
                      <ActionIconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product.productId);
                        }}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            borderColor: theme.palette.error.main,
                            color: theme.palette.error.main,
                          }
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: '16px' }} />
                      </ActionIconButton>
                    </Stack>
                  </>
                }
              >
                <CardContent sx={{ pt: 2, pb: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight="600"
                    gutterBottom
                    sx={{
                      fontSize: '16px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {product.productName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      fontSize: '13px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {product.description}
                  </Typography>
                  <Chip
                    icon={<PriceIcon />}
                    label={`₹ ${product.price}`}
                    size="small"
                    sx={{
                      background: theme.palette.grey[100],
                      color: theme.palette.text.primary,
                      fontWeight: 'medium',
                    }}
                  />
                </CardContent>
              </CardDesign>
            </Grid>
          ))}
        </Grid>
      )}

      <StyledDialog
        open={showModal}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="500">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </Typography>
            <IconButton
              onClick={handleModalClose}
              size="small"
              sx={{ color: 'grey.500' }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            variant="outlined"
            size="medium"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
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
            size="medium"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          />
          <TextField
            fullWidth
            type="number"
            label="Price (₹)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            variant="outlined"
            size="medium"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          />
          {/* Only show category selection on all products page */}
          {isAllProductsPage && (
            <Select
              fullWidth
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              displayEmpty
              variant="outlined"
              sx={{
                mb: 3,
                borderRadius: '8px',
              }}
            >
              <MenuItem value="" disabled>
                Select Category
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
          )}
          {/* Show current category info when on category page */}
          {!isAllProductsPage && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: '8px' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Category
              </Typography>
              <Typography variant="body1" fontWeight="500">
                {location.state?.name || 'Current Category'}
              </Typography>
            </Box>
          )}
          <Typography variant="subtitle2" color="text.primary" sx={{ mb: 2 }}>
            Product Image
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <Box
            onClick={() => document.getElementById('image-upload').click()}
            sx={{
              border: `2px dashed ${theme.palette.grey[300]}`,
              borderRadius: '12px',
              padding: theme.spacing(3),
              textAlign: 'center',
              backgroundColor: theme.palette.grey[50],
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            <Typography variant="body1" color="text.primary" gutterBottom>
              {image ? image.name : 'Click to upload'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              PNG, JPG, JPEG up to 10MB
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={handleModalClose}
            variant="outlined"
            disabled={uploading}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              borderColor: 'grey.300',
              color: 'text.primary',
            }}
          >
            Cancel
          </Button>
          <PrimaryButton
            onClick={handleSave}
            variant="contained"
            disabled={
              !productName ||
              !description ||
              !price ||
              (isAllProductsPage && !selectedCategory) ||
              uploading
            }
          >
            {uploading ? 'Saving...' : (isEditing ? 'Update' : 'Add')}
          </PrimaryButton>
        </DialogActions>
      </StyledDialog>

      <StyledDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="500">
              Confirm Deletion
            </Typography>
            <IconButton
              onClick={() => setDeleteConfirmOpen(false)}
              size="small"
              sx={{ color: 'grey.500' }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" color="text.primary">
            Are you sure you want to delete this product? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              borderColor: 'grey.300',
              color: 'text.primary',
            }}
          >
            Cancel
          </Button>
          <PrimaryButton
            onClick={confirmDelete}
            variant="contained"
            color="error"
          >
            Delete
          </PrimaryButton>
        </DialogActions>
      </StyledDialog>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        style={{ top: '80px' }}
        toastStyle={{ zIndex: 10000 }}
      />
    </PageContainer>
  );
};

export default Products;