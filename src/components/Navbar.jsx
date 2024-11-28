import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import logo from '../images/llogo.png';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Define a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1A202C', // Dark gray/black color for the navbar
    },
    secondary: {
      main: '#38B2AC', // Teal color for buttons and highlights
    },
    text: {
      primary: '#FFFFFF', // White text
      secondary: '#A0AEC0', // Light gray for secondary text
    },
  },
});

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [qrMenuOpen, setQrMenuOpen] = useState(null);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setQrMenuOpen(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuOpen(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(null);
  };

  const handleQrMenuClick = (event) => {
    setQrMenuOpen(event.currentTarget);
  };

  const handleQrMenuClose = () => {
    setQrMenuOpen(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static" color="primary" elevation={4}>
        <Toolbar>
          {/* Logo */}
          <img
            src={logo}
            alt="Logo"
            style={{ width: '40px', height: '40px', marginRight: '10px' }}
          />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: 'bold', color: 'text.primary' }}
          >
            SmartSpace Analytics
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button color="secondary" component={Link} to="/home">
              Home
            </Button>
            <Button
              color="secondary"
              onClick={handleMenuClick}
              sx={{ color: 'text.secondary' }}
            >
              Camera Interface
            </Button>
            <Menu
              id="camera-interface-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                style: {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.text.primary,
                },
              }}
            >
              <MenuItem
                component={Link}
                to="/camera-interface"
                onClick={handleMenuClose}
              >
                People Counting
              </MenuItem>
              <MenuItem onClick={handleQrMenuClick}>QR Options</MenuItem>
              <Menu
                id="qr-options-menu"
                anchorEl={qrMenuOpen}
                open={Boolean(qrMenuOpen)}
                onClose={handleQrMenuClose}
                PaperProps={{
                  style: {
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <MenuItem
                  component={Link}
                  to="/qr-scanner"
                  onClick={handleQrMenuClose}
                >
                  QR Scanner
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/generate-qr"
                  onClick={handleQrMenuClose}
                >
                  QR Generator
                </MenuItem>
              </Menu>
              <MenuItem
                component={Link}
                to="/people-analysis"
                onClick={handleMenuClose}
              >
                People Analysis
              </MenuItem>
              <MenuItem
                component={Link}
                to="/face"
                onClick={handleMenuClose}
              >
                Attendance
              </MenuItem>
              <MenuItem
                component={Link}
                to="/store-heatmap"
                onClick={handleMenuClose}
              >
                Store Heatmap
              </MenuItem>
            </Menu>
            <Button color="secondary" component={Link} to="/dashboard">
              Dashboard
            </Button>
            <Button color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </Box>

          {/* Mobile Navigation */}
          <IconButton
            color="inherit"
            edge="end"
            aria-label="menu"
            onClick={handleMobileMenuOpen}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={mobileMenuOpen}
            open={Boolean(mobileMenuOpen)}
            onClose={handleMobileMenuClose}
            PaperProps={{
              style: {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.text.primary,
              },
            }}
          >
            <MenuItem component={Link} to="/home" onClick={handleMobileMenuClose}>
              Home
            </MenuItem>
            <MenuItem
              component={Link}
              to="/camera-interface"
              onClick={handleMobileMenuClose}
            >
              Camera Interface
            </MenuItem>
            <MenuItem
              component={Link}
              to="/qr-scanner"
              onClick={handleMobileMenuClose}
            >
              QR Scanner
            </MenuItem>
            <MenuItem
              component={Link}
              to="/generate-qr"
              onClick={handleMobileMenuClose}
            >
              QR Generator
            </MenuItem>
            <MenuItem
              component={Link}
              to="/people-analysis"
              onClick={handleMobileMenuClose}
            >
              People Analysis
            </MenuItem>
            <MenuItem
              component={Link}
              to="/face"
              onClick={handleMobileMenuClose}
            >
              Attendance
            </MenuItem>
            <MenuItem
              component={Link}
              to="/dashboard"
              onClick={handleMobileMenuClose}
            >
              Dashboard
            </MenuItem>
            <MenuItem component={Link} to="/store-heatmap" onClick={handleMobileMenuClose}>
              Store Heatmap
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
};

export default Navbar;
