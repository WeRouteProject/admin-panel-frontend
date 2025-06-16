import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, CardContent, Grid, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  Paper, Stack, Chip, useTheme, alpha, CircularProgress, InputAdornment,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Category as CategoryIcon, Close as CloseIcon,
  Visibility as ViewIcon, Business as BusinessIcon,
  CloudUpload as CloudUploadIcon, Image as ImageIcon,
  Search as SearchIcon, Clear as ClearIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import CardDesign from '../components/CardDesign';
import { VALID_NAME_REGEX } from '../constants/regex';

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

const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: '500',
  padding: theme.spacing(0.5, 1.5),
  fontSize: '13px',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.grey[200]}`,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
    borderColor: theme.palette.grey[300],
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

const ImageUploadContainer = styled(Box)(({ theme }) => ({
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
  '&.dragover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  }
}));

const PreviewImage = styled('img')({
  width: '100%',
  maxHeight: '200px',
  objectFit: 'cover',
  borderRadius: '8px',
  marginTop: '16px',
});

const Categories = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [categoryType, setCategoryType] = useState('active');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    console.log('Current categoryType:', categoryType);
  }, [categoryType]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/categories`);
      const categoriesData = response.data.map(category => ({
        id: category.categoryId,
        name: category.categoryName,
        status: category.status === true || category.status === 'true' ? 'active' : 'inactive',
        imageUrl: category.imageUrl ? `${category.imageUrl}?t=${new Date().getTime()}` : ''
      }));
      setCategories(categoriesData);
      setSearchTerm('');
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error('Failed to fetch categories. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
      toast.info('Image selected successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
      toast.info('Image dropped successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
  };

  const handleSaveCategory = async () => {
    console.log('Saving with categoryType:', categoryType);

    if (!VALID_NAME_REGEX.test(categoryName)) {
      toast.error('Category name contains invalid characters. Only letters, numbers, spaces, hyphens, and apostrophes are allowed.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    if (!categoryName.trim()) {
      toast.error('Please enter a category name.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('categoryName', categoryName);
      formData.append('status', categoryType === 'active' ? 'true' : 'false');

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      let response;
      if (isEditing) {
        response = await axios.put(`${API_BASE}/categories/${editCategoryId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // If category is set to inactive, update all products under this category to inactive
        if (categoryType === 'inactive') {
          try {
            const productsResponse = await axios.get(`${API_BASE}/products/category/${editCategoryId}`);
            const products = productsResponse.data;
            for (const product of products) {
              const productFormData = new FormData();
              productFormData.append('productName', product.productName);
              productFormData.append('description', product.description);
              productFormData.append('price', product.price);
              productFormData.append('categoryId', product.categoryId);
              productFormData.append('status', 'false');
              if (product.imageUrl) {
                productFormData.append('imageUrl', product.imageUrl);
              }
              await axios.put(`${API_BASE}/products/${product.productId}`, productFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
            }
            toast.info(`All products under category "${categoryName}" set to inactive.`, {
              position: 'top-right',
              autoClose: 3000,
            });
          } catch (error) {
            console.error('Error updating products status:', error);
            toast.error('Failed to update products status. Please try again.', {
              position: 'top-right',
              autoClose: 3000,
            });
          }
        }

        setCategories(prev =>
          prev.map(cat =>
            cat.id === editCategoryId
              ? {
                  ...cat,
                  name: categoryName,
                  status: categoryType,
                  imageUrl: response.data.imageUrl ? `${response.data.imageUrl}?t=${new Date().getTime()}` : cat.imageUrl
                }
              : cat
          )
        );
        toast.success('Category updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        response = await axios.post(`${API_BASE}/categories/category`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const newCategory = {
          id: response.data.categoryId,
          name: response.data.categoryName,
          status: categoryType,
          imageUrl: response.data.imageUrl ? `${response.data.imageUrl}?t=${new Date().getTime()}` : ''
        };
        setCategories(prev => [...prev, newCategory]);
        toast.success('Category created successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      }

      // Refresh categories to ensure latest data
      await fetchCategories();
      handleModalClose();
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error(`Error saving category: ${err.response?.data?.message || err.message || 'Unknown error'}`, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    setCategoryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/categories/${categoryToDelete}`);
      setCategories(categories.filter(cat => cat.id !== categoryToDelete));
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
      toast.success('Category deleted successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Error deleting category:', err);
      setDeleteConfirmOpen(false);
      toast.error('Error deleting category. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCategoryName('');
    setCategoryType('active');
    setSelectedImage(null);
    setPreviewUrl('');
    setIsEditing(false);
    setEditCategoryId(null);
  };

  const handleViewProducts = (categoryId, categoryName) => {
    navigate(`/products/${categoryId}`, {
      state: { id: categoryId, name: categoryName }
    });
    toast.info(`Viewing products for category "${categoryName}"`, {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const handleEditCategory = (category) => {
    console.log('Editing category:', category);
    console.log('Category status:', category.status);

    setIsEditing(true);
    setEditCategoryId(category.id);
    const status = category.status === 'active' ? 'active' : 'inactive';
    setCategoryType(status);
    console.log('Setting categoryType to:', category.status);
    setCategoryName(category.name || '');
    setPreviewUrl(category.imageUrl || '');
    setSelectedImage(null);
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
              Categories
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '15px' }}
            >
              Organize and manage your product categories with images
            </Typography>
          </Box>
          <SearchBar
            label="Search Categories"
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
          onClick={() => {
            setIsEditing(false);
            setCategoryName('');
            setSelectedImage(null);
            setPreviewUrl('');
            setShowModal(true);
          }}
          sx={{ minWidth: '140px', flexShrink: 0 }}
        >
          Add Category
        </PrimaryButton>
      </HeaderContainer>

      {loading && (
        <LoaderContainer>
          <CircularProgress size={60} thickness={4} />
        </LoaderContainer>
      )}

      {!loading && filteredCategories.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Chip
            icon={<BusinessIcon />}
            label={`${filteredCategories.length} ${filteredCategories.length === 1 ? 'Category' : 'Categories'}`}
            variant="outlined"
            sx={{
              borderColor: 'grey.300',
              backgroundColor: 'grey.50',
              '& .MuiChip-label': { fontWeight: '500' }
            }}
          />
        </Box>
      )}

      {!loading && filteredCategories.length === 0 && (
        <EmptyStateContainer>
          <CategoryIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" fontWeight="500" color="text.primary" gutterBottom>
            {searchTerm ? 'No matching categories found' : 'No categories yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm ? 'Try a different search term' : 'Create your first category to start organizing products'}
          </Typography>
          {!searchTerm && (
            <PrimaryButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setIsEditing(false);
                setCategoryName('');
                setSelectedImage(null);
                setPreviewUrl('');
                setShowModal(true);
                toast.info('Opening form to add a new category', {
                  position: 'top-right',
                  autoClose: 3000,
                });
              }}
            >
              Create Category
            </PrimaryButton>
          )}
        </EmptyStateContainer>
      )}

      {!loading && filteredCategories.length > 0 && (
        <Grid container spacing={3} justifyContent="center">
          {filteredCategories.map((cat) => (
            <Grid item key={cat.id}>
              <Box
                sx={{
                  opacity: cat.status === 'inactive' ? 0.5 : 1,
                  filter: cat.status === 'inactive' ? 'grayscale(1)' : 'none',
                }}
              >
                <CardDesign
                  imageUrl={cat.imageUrl}
                  placeholderText="No Image"
                  placeholderIcon={<ImageIcon sx={{ fontSize: 36, mb: 1 }} />}
                  actions={
                    <>
                      <Typography variant="caption" color="text.secondary">
                        Manage
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <ActionIconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(cat);
                          }}
                        >
                          <EditIcon sx={{ fontSize: '16px' }} />
                        </ActionIconButton>
                        <ActionIconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(cat.id);
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
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="h6"
                      fontWeight="500"
                      color="text.primary"
                      sx={{
                        mb: 0.5,
                        fontSize: '15px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cat.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: '12px', mb: 1.5 }}
                    >
                      Product category
                    </Typography>
                    <SecondaryButton
                      fullWidth
                      startIcon={<ViewIcon sx={{ fontSize: '16px' }} />}
                      onClick={() => handleViewProducts(cat.id, cat.name)}
                    >
                      View Products
                    </SecondaryButton>
                  </CardContent>
                </CardDesign>
              </Box>
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
              {isEditing ? 'Edit Category' : 'Create New Category'}
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
            label="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            variant="outlined"
            size="medium"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          />

          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel
              component="legend"
              sx={{
                color: 'text.primary',
                fontWeight: '500',
                fontSize: '0.875rem',
                mb: 1,
              }}
            >
              Category Status
            </FormLabel>
            <RadioGroup
              row
              value={categoryType}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log('Radio button changed to:', newValue);
                setCategoryType(newValue);
              }}
              sx={{ gap: 2 }}
            >
              <FormControlLabel
                value="active"
                control={
                  <Radio
                    sx={{
                      color: 'grey.400',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: '14px' }}>
                    Active
                  </Typography>
                }
              />
              <FormControlLabel
                value="inactive"
                control={
                  <Radio
                    sx={{
                      color: 'grey.400',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: '14px' }}>
                    Inactive
                  </Typography>
                }
              />
            </RadioGroup>
          </FormControl>

          <Typography variant="subtitle2" color="text.primary" sx={{ mb: 2 }}>
            Category Image
          </Typography>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            id="image-upload"
          />

          <ImageUploadContainer
            onClick={() => document.getElementById('image-upload').click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {previewUrl ? (
              <Box>
                <PreviewImage src={previewUrl} alt="Preview" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Click to change image
                </Typography>
              </Box>
            ) : (
              <Box>
                <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="body1" color="text.primary" gutterBottom>
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PNG, JPG, JPEG up to 10MB
                </Typography>
              </Box>
            )}
          </ImageUploadContainer>
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
            onClick={handleSaveCategory}
            variant="contained"
            disabled={!categoryName.trim() || uploading}
          >
            {uploading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
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
            Are you sure you want to delete this category? This action cannot be undone.
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

export default Categories;