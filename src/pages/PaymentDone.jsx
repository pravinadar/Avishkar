import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentDone = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract cart, total price, and payment details from the location state
  const { cart = [], totalPrice = 0, paymentDetails = {} } = location.state || {};
  
  const handleBackToHome = () => {
    navigate('/home'); // Navigate back to home or main page
  };

  const handlePrint = () => {
    window.print(); // Print the bill
  };

  return (
    <div className="payment-done-container d-flex flex-column align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
      <h2 className="mb-4" style={{ color: '#28a745' }}>Payment Successful!</h2>
      <Card className="shadow mb-4 bill-card" style={{ width: '100%', maxWidth: '600px', padding: '20px', backgroundColor: '#ffffff', borderRadius: '10px' }}>
        <Card.Body>
          <Card.Title className="text-center" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#343a40' }}>Bill Summary</Card.Title>
          <hr style={{ borderColor: '#28a745' }} />
          <h5 style={{ color: '#343a40' }}>Items Purchased:</h5>
          <div className="items-list" style={{ marginBottom: '20px' }}>
            {cart.length > 0 ? (
              cart.map((item, index) => (
                <div key={index} className="item" style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 'bold' }}>₹{item.price.toFixed(2)} x {item.quantity}</span>
                </div>
              ))
            ) : (
              <div>No items purchased.</div>
            )}
          </div>
          <h5 className="mt-3" style={{ color: '#343a40' }}>Total Amount: <span style={{ fontWeight: 'bold' }}>₹{parseFloat(totalPrice).toFixed(2)}</span></h5>
          <h5 className="mt-3" style={{ color: '#343a40' }}>Payment Details:</h5>
          <p><strong>Name on Card:</strong> {paymentDetails.name || 'N/A'}</p>
          <p><strong>Card Number:</strong> {paymentDetails.cardNumber ? paymentDetails.cardNumber.replace(/\d(?=\d{4})/g, "*") : 'N/A'}</p>
          <p><strong>Expiry Date:</strong> {paymentDetails.expiry || 'N/A'}</p>
          <div className="d-flex justify-content-between">
            <Button variant="success" className="mt-4" onClick={handlePrint} style={{ flex: 1, marginRight: '10px' }}>
              Print Bill
            </Button>
            <Button variant="secondary" className="mt-4" onClick={handleBackToHome} style={{ flex: 1, marginLeft: '10px' }}>
              Back to Home
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentDone;
