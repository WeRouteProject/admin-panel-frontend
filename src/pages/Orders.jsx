import React, { useEffect } from 'react';
import { Form, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useOrderStore from '../store/useOrderStore';

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

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getFilteredSortedOrders = () => {
    let filtered = [...orders];

    if (filterStatus) {
      filtered = filtered.filter((o) => o.status === filterStatus);
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
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Orders</h2>

      {/* Filter & Search */}
      <div className="d-flex gap-3 mb-3">
        <Form.Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ width: '180px' }}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </Form.Select>
        <Form.Control
          placeholder="Search by name, agent, or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Orders Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
              Order ID {sortKey === 'id' && (sortAsc ? '↑' : '↓')}
            </th>
            <th>Customer</th>
            <th>Address</th>
            <th onClick={() => handleSort('deliveryDate')} style={{ cursor: 'pointer' }}>
              Delivery Date {sortKey === 'deliveryDate' && (sortAsc ? '↑' : '↓')}
            </th>
            <th>Total</th>
            
            <th onClick={() => handleSort('orderDate')} style={{ cursor: 'pointer' }}>
              Order Date {sortKey === 'orderDate' && (sortAsc ? '↑' : '↓')}
            </th>
            <th>Products</th>
            <th>Quantity</th>
            <th>Delivery Boy</th>
            <th>Status</th>
            <th>Invoice</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customerName}</td>
              <td>{o.address}</td>
              <td>{o.deliveryDate}</td>
              <td>₹{o.totalAmount}</td>
              <td>{o.orderDate}</td>
              <td>{o.products.map((p) => p.name).join(', ')}</td>
              <td>{o.products.map((p) => p.quantity).join(', ')}</td>

              {/* Replace dropdown with static text */}
              <td>{o.deliveryBoy || '-'}</td>
              <td>{o.status}</td>
              <td>
                <Link to={`/invoice/${o.id.replace('#', '')}`} className="btn btn-sm btn-primary">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {filteredOrders.length === 0 && (
        <p className="text-muted text-center mt-4">No orders found.</p>
      )}
    </div>
  );
};

export default Orders;
