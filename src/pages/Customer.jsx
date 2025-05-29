import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Card, Modal } from 'react-bootstrap';
import { FaUserPlus, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaTrash } from 'react-icons/fa';
import useCustomerStore from '../store/customerStore';

const Customer = () => {
  const { customers, fetchCustomers, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore();

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    contactNumber: '',
    address: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editMode && editingCustomerId) {
      await updateCustomer(editingCustomerId, form);
    } else {
      await addCustomer(form);
    }

    setForm({ customerName: '', email: '', contactNumber: '', address: '' });
    setEditMode(false);
    setEditingCustomerId(null);
    setShowModal(false);
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
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await deleteCustomer(id);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">👥 Customers</h2>
        <Button variant="primary" onClick={() => {
          setShowModal(true);
          setForm({ customerName: '', email: '', contactNumber: '', address: '' });
          setEditMode(false);
          setEditingCustomerId(null);
        }}>
          <FaUserPlus className="me-2" /> Add Customer
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {!Array.isArray(customers) || customers.length === 0 ? (
            <p className="text-muted text-center mb-0">No customers yet.</p>
          ) : (
            <Table responsive bordered hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.customerId}>
                    <td>{c.customerName}</td>
                    <td>{c.email}</td>
                    <td>{c.contactNumber}</td>
                    <td>{c.address}</td>
                    <td className="d-flex justify-content-between">
                      <Button variant="outline-primary" size="sm" onClick={() => handleEdit(c)}>
                        <FaEdit />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(c.customerId)}>
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Customer' : 'Add New Customer'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label><FaUserPlus className="me-2" /> Name</Form.Label>
              <Form.Control
                type="text"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><FaEnvelope className="me-2" /> Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><FaPhone className="me-2" /> Phone</Form.Label>
              <Form.Control
                type="text"
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label><FaMapMarkerAlt className="me-2" /> Address</Form.Label>
              <Form.Control
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
            </Form.Group>

            <div className="text-end mt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editMode ? 'Update' : 'Add'} Customer
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Customer;
