import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const QRScanner = () => {
  const [scannedData, setScannedData] = useState('');
  const [cart, setCart] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProductScanned, setIsProductScanned] = useState(false);
  const navigate = useNavigate();
  let qrScanner = null;

  useEffect(() => {
    const loadHtml5QrCode = async () => {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      qrScanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10,
      });

      qrScanner.render(
        (result) => {
          if (!isProductScanned) {
            handleScan(result);
          }
        },
        (err) => {
          console.error('QR Scanner Error:', err);
        }
      );
    };

    loadHtml5QrCode();

    return () => {
      if (qrScanner) {
        qrScanner.clear();
      }
    };
  }, [isProductScanned]);

  const handleScan = (data) => {
    if (data) {
      const productInfo = parseProductData(data);
      if (productInfo) {
        addProductToCart(productInfo);
      } else {
        setErrorMessage('Invalid QR data format. Please scan again.');
      }
    }
  };

  const addProductToCart = (productInfo) => {
    const existingProductIndex = cart.findIndex((item) => item.name === productInfo.name);

    if (existingProductIndex >= 0) {
      setErrorMessage('This product is already in the cart. Please scan a different product.');
    } else {
      const newCart = [...cart, { name: productInfo.name, price: productInfo.price, quantity: 1 }];
      setCart(newCart);
      setScannedData(productInfo.name);
      setErrorMessage('');
      setIsProductScanned(true);

      setTimeout(() => {
        setIsProductScanned(false);
      }, 1000);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { cart, totalPrice: calculateTotalPrice() } });
  };

  const handleRemoveFromCart = (productName) => {
    setCart((prevCart) => prevCart.filter((item) => item.name !== productName));
  };

  const increaseQuantity = (productName) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.name === productName ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (productName) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.name === productName && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const parseProductData = (data) => {
    try {
      const productData = data.split(';');
      if (productData.length === 2) {
        const name = productData[0].split(':')[1].trim();
        const price = parseFloat(productData[1].split(':')[1].trim());
        return { name, price };
      } else {
        throw new Error('Incorrect data format');
      }
    } catch (err) {
      console.error('Error parsing data:', err);
      return null;
    }
  };

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <div
      className="qr-scanner-container d-flex flex-column align-items-center"
      style={{
        minHeight: '100vh',
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        padding: '20px',
      }}
    >
      <h2 className="mb-4" style={{ color: '#e74c3c' }}>
        QR Scanner
      </h2>
      <div
        id="reader"
        style={{
          width: '100%',
          maxWidth: '600px',
          marginTop: '20px',
          border: '2px solid #e74c3c',
          padding: '10px',
          borderRadius: '10px',
        }}
      ></div>

      {scannedData && (
        <Alert variant="success" className="mt-3" style={{ backgroundColor: '#27ae60', color: '#ecf0f1' }}>
          Scanned: {scannedData}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="danger" style={{ backgroundColor: '#e74c3c', color: '#ecf0f1' }}>
          {errorMessage}
        </Alert>
      )}

      <Card
        className="shadow mb-4"
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#34495e',
          borderRadius: '10px',
          color: '#ecf0f1',
        }}
      >
        <Card.Body>
          <Card.Title>Cart</Card.Title>
          <Table striped bordered hover variant="dark" style={{ color: '#ecf0f1' }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price (₹)</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.length > 0 ? (
                cart.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>₹{item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <Button
                        variant="outline-light"
                        onClick={() => increaseQuantity(item.name)}
                        style={{ color: '#27ae60', borderColor: '#27ae60' }}
                      >
                        +
                      </Button>
                      <Button
                        variant="outline-light"
                        onClick={() => decreaseQuantity(item.name)}
                        className="mx-2"
                        disabled={item.quantity <= 1}
                        style={{ color: '#e74c3c', borderColor: '#e74c3c' }}
                      >
                        -
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleRemoveFromCart(item.name)}
                        className="ml-2"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No items in cart.</td>
                </tr>
              )}
            </tbody>
          </Table>
          <h5 className="mt-3">Total: ₹{calculateTotalPrice()}</h5>
          <Button
            variant="success"
            className="mt-3"
            onClick={handleCheckout}
            disabled={cart.length === 0}
            style={{ backgroundColor: '#27ae60', border: 'none' }}
          >
            Checkout
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default QRScanner;
