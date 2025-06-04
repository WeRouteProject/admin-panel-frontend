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
} from '@mui/material';
import { Add, Edit, Delete, PersonAdd, Email, Phone, LocationOn, Close } from '@mui/icons-material';
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

    try {
      if (editMode && editingCustomerId) {
        await updateCustomer(editingCustomerId, form);
        toast.success('Customer updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        await addCustomer(form);
        toast.success('Customer added successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
      setForm({ customerName: '', email: '', contactNumber: '', address: '' });
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

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
          👥 Customers
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => {
            setForm({ customerName: '', email: '', contactNumber: '', address: '' });
            setEditMode(false);
            setEditingCustomerId(null);
            setOpenModal(true);
          }}
        >
          Add Customer
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        {(!Array.isArray(customers) || customers.length === 0) ? (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
            No customers yet.
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
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
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
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
            <Stack spacing={3}>
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
              <TextField
                label="Address"
                name="address"
                value={form.address}
                onChange={handleInputChange}
                required
                fullWidth
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Stack>
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