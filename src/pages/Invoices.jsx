import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useOrderStore from '../store/useOrderStore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button, Card, Table } from 'react-bootstrap';
import logo from '../assets/logo.png'; 

const Invoice = () => {
  const { orderId } = useParams();
  const order = useOrderStore((state) =>
  state.orders.find((o) => o.id.replace('#', '') === orderId)
  );

  const invoiceRef = useRef();

  useEffect(() => {
    if (!order) {
      alert('Order not found');
    }
  }, [order]);

  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(invoiceRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`Invoice_${order.id}.pdf`);
  };

  if (!order) return <div className="text-center mt-5">Loading invoice...</div>;

  return (
    <div className="container py-4">
      <div ref={invoiceRef} className="bg-white p-4 shadow-sm border rounded">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <div>
            <img src={logo} alt="Logo" style={{ height: '50px' }} />
            <h5 className="mt-2 mb-0 fw-bold">GrocerEase Pvt Ltd</h5>
            <small>123 Market Street, Mumbai</small><br />
            <small>GSTIN: 27AAACI1234A1Z1</small>
          </div>
          <div className="text-end">
            <h3 className="fw-bold mb-0">Invoice</h3>
            <p className="mb-0">Invoice #: {order.id}</p>
            <p className="mb-0">Date: {order.orderDate}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-4">
          <h5 className="fw-bold">Bill To:</h5>
          <p className="mb-0">{order.customerName}</p>
          <p className="mb-0">{order.address}</p>
          <p className="mb-0">Delivery Date: {order.deliveryDate}</p>
          <p className="mb-0">Payment Mode: {order.paymentStatus}</p>
        </div>

        {/* Products */}
        <Table bordered responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {order.products.map((p, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{p.name}</td>
                <td>{p.quantity}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Totals */}
        <div className="d-flex justify-content-end mt-4">
          <div className="text-end">
            <h5 className="fw-bold">Total Amount: ₹{order.totalAmount.toFixed(2)}</h5>
            <p className="mb-0">Status: {order.status}</p>
            <p className="mb-0">Delivered By: {order.deliveryBoy || 'Unassigned'}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-top pt-3 mt-4">
          <small>Thank you for shopping with us!</small>
        </div>
      </div>

      {/* Download Button */}
      <div className="text-end mt-4">
        <Button onClick={handleDownloadPDF} variant="success">
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default Invoice;
