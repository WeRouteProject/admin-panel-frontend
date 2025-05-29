import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent, CardActions,
  Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Fab, Skeleton, Tooltip, Paper, Divider, Stack, Zoom,
  Slide, useTheme, alpha
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Category as CategoryIcon, Close as CloseIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'https://logistic-project-backend.onrender.com/api/categories';

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
  aspectRatio: '1/1',
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
  cursor: 'pointer',
  [theme.breakpoints.down('sm')]: {
    minHeight: '280px',
    maxHeight: '280px',
  },
  [theme.breakpoints.up('sm')]: {
    minHeight: '300px',
    maxHeight: '300px',
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
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.2)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.8rem',
  fontWeight: 'bold',
  letterSpacing: '1px',
  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)',
  border: '1px solid rgba(255,255,255,0.2)',
  animation: `${float} 3s ease-in-out infinite`
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  width: '40px',
  height: '40px',
  background: 'rgba(255,255,255,0.25)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.3)',
  color: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255,255,255,0.4)',
    transform: 'scale(1.1)',
    animation: `${pulse} 0.6s ease-in-out`
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: '24px',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")',
    opacity: 0.5,
  }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    backdropFilter: 'blur(20px)',
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.secondary.main, 0.95)} 100%)`,
    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  }
}));

const Categories = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCategoryInitials = (category) => {
    return category.name?.substring(0, 2).toUpperCase() || '';
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE);
      const categoriesData = response.data.map(category => ({
        id: category.categoryId,
        name: category.categoryName
      }));
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSaveCategory = async () => {
    if (!categoryName) return;
    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/${editCategoryId}`, {
          categoryName: categoryName
        });
        setCategories(prev =>
          prev.map(cat =>
            cat.id === editCategoryId ? { ...cat, name: categoryName } : cat
          )
        );
      } else {
        const response = await axios.post(API_BASE, {
          categoryName: categoryName
        });
        const newCategory = response.data;
        const categoryToAdd = {
          id: newCategory.categoryId,
          name: categoryName
        };
        setCategories(prev => [...prev, categoryToAdd]);
      }
      handleModalClose();
    } catch (err) {
      console.error('Error saving category:', err);
      alert(`Error saving category: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Error deleting category. Please try again.');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCategoryName('');
    setIsEditing(false);
    setEditCategoryId(null);
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
                  Categories
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Manage your product categories
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Zoom in={true} timeout={1000}>
            <Fab
              color="secondary"
              variant="extended"
              onClick={() => {
                setIsEditing(false);
                setCategoryName('');
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
              Add Category
            </Fab>
          </Zoom>
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
      {!loading && categories.length === 0 && (
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          }}
        >
          <CategoryIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            No Categories Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start adding categories to organize your products.
          </Typography>
        </Paper>
      )}

      {/* Categories Grid */}
      <Grid container spacing={4}>
        {categories.map((cat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
            <Slide direction="up" in={!loading} timeout={300 + index * 100}>
              <StyledCard 
                gradient={gradientColors[index % gradientColors.length]}
                onClick={() => navigate(`/products/${cat.id}`, { state: cat })}
              >
                <CardContent sx={{ textAlign: 'center', pt: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <IconWrapper sx={{ mx: 'auto', mb: 3 }}>
                    {getCategoryInitials(cat)}
                  </IconWrapper>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {cat.name}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', px: 3, pb: 3 }}>
                  <Stack direction="row" spacing={2}>
                    <Tooltip title="Edit Category" arrow>
                      <ActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(true);
                          setEditCategoryId(cat.id);
                          setCategoryName(cat.name || '');
                          setShowModal(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                    <Tooltip title="Delete Category" arrow>
                      <ActionButton
                        sx={{
                          background: 'rgba(255,0,0,0.3)',
                          '&:hover': { background: 'rgba(255,0,0,0.5)' }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${cat.name}"?`)) {
                            handleDelete(cat.id);
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </ActionButton>
                    </Tooltip>
                  </Stack>
                </CardActions>
              </StyledCard>
            </Slide>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Category Modal */}
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
            <CategoryIcon />
            <Typography variant="h5" fontWeight="bold">
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </Typography>
          </Stack>
          <IconButton onClick={handleModalClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider sx={{ background: 'rgba(255,255,255,0.2)' }} />
        <DialogContent sx={{ pt: 3, color: 'white' }}>
          <TextField
            fullWidth
            label="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
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
            onClick={handleSaveCategory}
            variant="contained"
            disabled={!categoryName}
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
            {isEditing ? 'Update Category' : 'Add Category'}
          </Button>
        </DialogActions>
      </StyledDialog>
    </Container>
  );
};

export default Categories;