import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  TextField,
  IconButton,
  Stack,
  Divider,
  Grid,
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  PersonAdd, 
  Email, 
  Phone, 
  LocationOn, 
  Close, 
  Percent, 
  AccountBalanceWallet 
} from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useCustomerStore from '../store/customerStore';
import { VALID_NAME_REGEX, VALID_EMAIL_REGEX} from '../constants/regex';

const Customer = () => {
  const { customers, fetchCustomers, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    contactNumber: '',
    address: '',
    discount: '',
    walletBalance: '',
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCustomers();
      } catch (error) {
        toast.error('Failed to fetch customers. Please try again.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    };
    fetchData();
  }, [fetchCustomers]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!VALID_NAME_REGEX.test(form.customerName.trim())) {
      toast.error('Customer name contains invalid characters. Only letters, numbers, spaces, hyphens, and apostrophes are allowed.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    if (!VALID_EMAIL_REGEX.test(form.email.trim())) {
      toast.error('Please enter a valid email address.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    if (!form.customerName || !form.email || !form.contactNumber || !form.address) {
      toast.error('Please fill in all required fields.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    // Validate discount percentage
    if (form.discount && (isNaN(form.discount) || form.discount < 0 || form.discount > 100)) {
      toast.error('Discount must be a number between 0 and 100.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    // Validate wallet balance
    if (form.walletBalance && (isNaN(form.walletBalance) || form.walletBalance < 0)) {
      toast.error('Wallet balance must be a positive number.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    try {
      const customerData = {
        ...form,
        discount: form.discount ? parseFloat(form.discount) : 0,
        walletBalance: form.walletBalance ? parseFloat(form.walletBalance) : 0,
      };

      if (editMode && editingCustomerId) {
        await updateCustomer(editingCustomerId, customerData);
        toast.success('Customer updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await addCustomer(customerData);
        toast.success('Customer added successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
      setForm({ 
        customerName: '', 
        email: '', 
        contactNumber: '', 
        address: '', 
        discount: '', 
        walletBalance: '' 
      });
      setEditMode(false);
      setEditingCustomerId(null);
      setOpenModal(false);
    } catch (error) {
      toast.error('Failed to save customer. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleEdit = (customer) => {
    setForm({
      customerName: customer.customerName,
      email: customer.email,
      contactNumber: customer.contactNumber,
      address: customer.address,
      discount: customer.discount || '',
      walletBalance: customer.walletBalance || '',
    });
    setEditingCustomerId(customer.customerId);
    setEditMode(true);
    setOpenModal(true);
  };

  const handleDelete = (id) => {
    setCustomerToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCustomer(customerToDelete);
      setDeleteConfirmOpen(false);
      setCustomerToDelete(null);
      toast.success('Customer deleted successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      setDeleteConfirmOpen(false);
      toast.error('Failed to delete customer. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
          👥 Customers
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => {
            setForm({ 
              customerName: '', 
              email: '', 
              contactNumber: '', 
              address: '', 
              discount: '', 
              walletBalance: '' 
            });
            setEditMode(false);
            setEditingCustomerId(null);
            setOpenModal(true);
          }}
        >
          Add Customer
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3} sx={{ overflowX: 'auto' }}>
        {(!Array.isArray(customers) || customers.length === 0) ? (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
            No customers yet.
          </Typography>
        ) : (
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Discount (%)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Wallet Balance</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 120 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.customerId} hover>
                  <TableCell>{customer.customerName}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.contactNumber}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {customer.discount || 0}
                      <Percent sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                      <AccountBalanceWallet sx={{ fontSize: 16, mr: 0.5 }} />
                      {formatCurrency(customer.walletBalance)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(customer)}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(customer.customerId)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="customer-modal-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '90%', md: 600 },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography id="customer-modal-title" variant="h6" component="h2">
              {editMode ? 'Edit Customer' : 'Add New Customer'}
            </Typography>
            <IconButton
              onClick={() => setOpenModal(false)}
              size="small"
              sx={{ color: 'grey.500' }}
            >
              <Close />
            </IconButton>
          </Stack>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: <PersonAdd sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Discount (%)"
                  name="discount"
                  type="number"
                  value={form.discount}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  InputProps={{
                    startAdornment: <Percent sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  helperText="Enter discount percentage (0-100)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Wallet Balance"
                  name="walletBalance"
                  type="number"
                  value={form.walletBalance}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: <AccountBalanceWallet sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  helperText="Enter wallet balance amount"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />,
                  }}
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                {editMode ? 'Update' : 'Add'} Customer
              </Button>
            </Stack>
          </form>
        </Box>
      </Modal>

      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="delete-confirm-modal-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography id="delete-confirm-modal-title" variant="h6" component="h2">
              Confirm Deletion
            </Typography>
            <IconButton
              onClick={() => setDeleteConfirmOpen(false)}
              size="small"
              sx={{ color: 'grey.500' }}
            >
              <Close />
            </IconButton>
          </Stack>
          <Typography variant="body1" color="text.primary" sx={{ mb: 3 }}>
            Are you sure you want to delete this customer? This action cannot be undone.
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Modal>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        style={{ top: '80px' }}
        toastStyle={{ zIndex: 10000 }}
      />
    </Container>
  );
};

export default Customer;