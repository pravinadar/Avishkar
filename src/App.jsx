import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage'; 
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import CameraInterface from './pages/CameraInterface';
import PeopleAnalysis from './pages/PeopleAnalysis';
import QRScanner from './pages/QRScanner';
import Checkout from './pages/Checkout';
import PaymentDone from './pages/PaymentDone'; // Import PaymentDone
import ProtectedRoute from './components/ProtectedRoute'; 
import StoreHeatmap from './pages/StoreHeatmap'; // Ensure this is imported

import GenerateQRCode from './pages/GenerateQRCode';
import Chatbox from './pages/Chatbox';

import './App.css'; 

import supabase from './components/database';
import Facial from './pages/facial';

const App = () => {
  
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Change this to manage authentication properly

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Navbar onLogout={handleLogout} /> 
      <div className="container">
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          
          {/* Protect the routes that need authentication */}
          <Route path="/home" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          } />
           <Route path="/store-heatmap" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <StoreHeatmap />
            </ProtectedRoute>
          } />
          <Route path="/camera-interface" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CameraInterface />
            </ProtectedRoute>
          } />
          <Route path="/people-analysis" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PeopleAnalysis />
            </ProtectedRoute>
          } />
        
          <Route path="/qr-scanner" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <QRScanner />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/generate-qr" element={<GenerateQRCode />} />

          <Route path="/payment-done" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PaymentDone />
            </ProtectedRoute>
          } />
          <Route path="/face" element={<Facial/>}/>
        </Routes>
      </div>
      {/* Chatbox Component */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', position: 'fixed', bottom: '20px', right: '20px' }}>
        <Chatbox />
      </div>
      <Footer />
    </Router>
  );
};

export default App;
