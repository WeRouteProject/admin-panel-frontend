import React, { useState, useEffect } from 'react';
import { Switch } from '@mui/material';
import { Visibility } from '@mui/icons-material';
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
  InputAdornment,
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
import useCustomerStore, { getCustomerStoreState } from '../store/customerStore';
import { VALID_NAME_REGEX, VALID_EMAIL_REGEX } from '../constants/regex';


const Customer = () => {
  const { customers, fetchCustomers, addCustomer, updateCustomer, deleteCustomer, getCustomerById, fetchWalletHistory,walletHistory, } = useCustomerStore();
  // ✅ Local state
  const [selectedWalletHistory, setSelectedWalletHistory] = useState([]);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');

  // ✅ Your function – correct place
  const handleViewWalletHistory = async (customerId, customerName) => {
  try {
    await useCustomerStore.getState().fetchWalletHistory(customerId);

    const updatedHistory = getCustomerStoreState().walletHistory[customerId] || [];

    setSelectedWalletHistory(updatedHistory);
    setSelectedCustomerName(customerName);
    setWalletModalOpen(true);
  } catch (error) {
    console.error('Wallet history fetch failed:', error);
    toast.error('Failed to fetch wallet history.', {
      position: 'top-right',
      autoClose: 3000,
    });
  }
};



  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    contactNumber: '',
    address: '',
    discount: '',
    wallet: '',
    remainingCredit: '',
    applyCustomerDiscount: false,
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
    if (form.wallet && (isNaN(form.wallet) || form.wallet < 0)) {
      toast.error('Wallet balance must be a positive number.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    // Validate remaining credit
    if (form.remainingCredit && (isNaN(form.remainingCredit) || form.remainingCredit < 0)) {
      toast.error('Remaining credit must be a positive number.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    try {
      let customerData = {
        ...form,
        discount: form.discount ? parseFloat(form.discount) : 0,
        wallet: form.wallet ? parseFloat(form.wallet) : 0,
        remainingCredit: form.remainingCredit ? parseFloat(form.remainingCredit) : (form.wallet ? parseFloat(form.wallet) : 0),
      };

      // Handle update case for remainingCredit sync
      if (editMode && editingCustomerId) {
        const currentCustomer = getCustomerById(editingCustomerId);
        if (currentCustomer) {
          const oldRemainingCredit = currentCustomer.remainingCredit || 0;
          const oldWallet = currentCustomer.wallet || 0;
          const newWallet = customerData.wallet;
          // If remainingCredit matches old value and wallet has changed, sync with new wallet
          if (form.remainingCredit && parseFloat(form.remainingCredit) === oldRemainingCredit && newWallet !== oldWallet) {
            customerData.remainingCredit = newWallet;
          }
        }
      }

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
        wallet: '',
        remainingCredit: ''
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
    wallet: customer.wallet || '',
    remainingCredit: customer.remainingCredit || '',
    applyCustomerDiscount: customer.applyCustomerDiscount || false,
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

  // const formatCurrency = (amount) => {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: 'USD',
  //   }).format(amount || 0);
  // };

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
              wallet: '',
              remainingCredit: ''
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
                <TableCell sx={{ fontWeight: 'bold' }}>Remaining Credit</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Wallet History</TableCell>

                <TableCell sx={{ fontWeight: 'bold' }}>Apply Discount</TableCell>
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
                      {customer.wallet}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'info.main' }}>
                      <AccountBalanceWallet sx={{ fontSize: 16, mr: 0.5 }} />
                      {customer.remainingCredit}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="info"
                      onClick={() => handleViewWalletHistory(customer.customerId, customer.customerName)}
                      size="small"
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>

                  <TableCell>{customer.applyCustomerDiscount ? 'Yes' : 'No'}</TableCell>

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
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Name *"
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
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Email *"
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
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Phone *"
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
              <Grid item xs={12} sm={6} md={4}>
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
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Wallet Balance"
                  name="wallet"
                  type="number"
                  value={form.wallet}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: <AccountBalanceWallet sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  helperText="Enter wallet balance amount"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Remaining Credit"
                  name="remainingCredit"
                  type="number"
                  value={form.remainingCredit}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: <AccountBalanceWallet sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    Apply Discount
                  </Typography>
                  <Switch
                    checked={form.applyCustomerDiscount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        applyCustomerDiscount: e.target.checked,
                      }))
                    }
                    color="primary"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={12} md={12}>
                <TextField
                  label="Address *"
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  required
                  width="100%"
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
      <Modal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        aria-labelledby="wallet-history-modal-title"
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
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography id="wallet-history-modal-title" variant="h6" component="h2">
              Wallet History for {selectedCustomerName}
            </Typography>
            <IconButton onClick={() => setWalletModalOpen(false)} size="small">
              <Close />
            </IconButton>
          </Stack>

          {selectedWalletHistory.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No wallet history found.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
  {selectedWalletHistory.map((entry, idx) => (
    <TableRow key={idx}>
      <TableCell>{new Date(entry.createdAt).toLocaleString()}</TableCell>
      <TableCell>{entry.type}</TableCell>
      <TableCell>{entry.amount}</TableCell>
      <TableCell>{entry.reason}</TableCell>
    </TableRow>
  ))}
</TableBody>
              </Table>
            </TableContainer>
          )}
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