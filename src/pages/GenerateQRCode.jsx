import React, { useState, useRef } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';

const GenerateQRCode = () => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const qrCodeRef = useRef();

  const colors = {
    navy: "#1C2E4A",
    burgundy: "#7E1F28",
    green: "#236C4B",
    orange: "#D97C29",
    cream: "#E4CFA1",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = `name: ${productName}; price: ${productPrice}`;
    setQrCodeData(data);
  };

  const handleDownload = () => {
    const canvas = qrCodeRef.current.querySelector('canvas');
    if (canvas) {
      const imageUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${productName}_QRCode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      className="generate-qr-container d-flex flex-column align-items-center"
      style={{
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: colors.navy,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1
        className="mb-4"
        style={{
          color: colors.cream,
          fontSize: '36px',
          textAlign: 'center',
        }}
      >
        QR Code Generator
      </h1>
      <p
        className="mb-4"
        style={{
          fontSize: '18px',
          maxWidth: '600px',
          textAlign: 'center',
          color: colors.orange,
        }}
      >
        Create a QR code for your product. Enter the product name and price, then click "Generate QR Code."
      </p>
      <Card
        className="shadow mb-4"
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '20px',
          backgroundColor: colors.cream,
          borderRadius: '10px',
        }}
      >
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: colors.green }}>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
                required
                style={{
                  border: `2px solid ${colors.green}`,
                  borderRadius: '5px',
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: colors.green }}>Product Price</Form.Label>
              <Form.Control
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="Enter product price"
                required
                style={{
                  border: `2px solid ${colors.green}`,
                  borderRadius: '5px',
                }}
              />
            </Form.Group>
            <Button
              variant="success"
              type="submit"
              style={{
                width: '100%',
                backgroundColor: colors.green,
                borderColor: colors.green,
                borderRadius: '5px',
                padding: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              Generate QR Code
            </Button>
          </Form>

          {qrCodeData && (
            <div className="mt-4 text-center" ref={qrCodeRef}>
              <h5 style={{ color: colors.navy }}>Your QR Code:</h5>
              <QRCodeCanvas
                value={qrCodeData}
                size={256}
                style={{
                  margin: '20px auto',
                  border: `1px solid ${colors.green}`,
                  borderRadius: '10px',
                }}
              />
              <div className="d-flex justify-content-center mt-3">
                <Button
                  variant="primary"
                  onClick={handleDownload}
                  style={{
                    marginRight: '10px',
                    backgroundColor: colors.burgundy,
                    borderColor: colors.burgundy,
                    borderRadius: '5px',
                    padding: '10px 20px',
                    fontSize: '16px',
                  }}
                >
                  Download QR Code
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setQrCodeData('')}
                  style={{
                    borderColor: colors.orange,
                    color: colors.orange,
                    borderRadius: '5px',
                    padding: '10px 20px',
                    fontSize: '16px',
                  }}
                >
                  Generate Another QR Code
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default GenerateQRCode;
