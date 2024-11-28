import React, { useRef, useState } from 'react';
import { Button, Card, CardContent, Typography, Container, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FastAverageColor } from 'fast-average-color';

// Initial Material-UI theme
const defaultTheme = createTheme({
  palette: {
    primary: { main: '#4CAF50' },
    secondary: { main: '#FFC107' },
    error: { main: '#F44336' },
    success: { main: '#2196F3' },
    text: { primary: '#212121', secondary: '#757575' },
    background: { default: '#FAFAFA' },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: { color: '#4CAF50' },
  },
});

const StoreHeatmap = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const heatmapRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState(null);
  const [theme, setTheme] = useState(defaultTheme);

  const HEATMAP_WIDTH = 500;
  const HEATMAP_HEIGHT = 400;
  const FRAME_INTERVAL = 10;
  const HEATMAP_SCALE = 10;

  const heatmapData = Array(HEATMAP_WIDTH / HEATMAP_SCALE)
    .fill(0)
    .map(() => Array(HEATMAP_HEIGHT / HEATMAP_SCALE).fill(0));

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setVideoSrc(videoUrl);
      stopProcessing();
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const fac = new FastAverageColor();
      const image = document.createElement('img');
      image.src = URL.createObjectURL(file);

      image.onload = () => {
        const color = fac.getColor(image);
        setTheme(
          createTheme({
            ...defaultTheme,
            palette: {
              ...defaultTheme.palette,
              background: { default: color.hex },
            },
          })
        );
      };
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
      setVideoSrc(null);
      startProcessing();
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const startProcessing = () => {
    setIsProcessing(true);
    processVideo();
  };

  const stopProcessing = () => {
    setIsProcessing(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    resetHeatmap();
  };

  const resetHeatmap = () => {
    for (let x = 0; x < heatmapData.length; x++) {
      for (let y = 0; y < heatmapData[x].length; y++) {
        heatmapData[x][y] = 0;
      }
    }

    const heatmapCanvas = heatmapRef.current;
    const heatmapCtx = heatmapCanvas.getContext('2d');
    heatmapCtx.clearRect(0, 0, HEATMAP_WIDTH, HEATMAP_HEIGHT);
  };

  const processVideo = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const heatmapCanvas = heatmapRef.current;

    if (!canvas || !heatmapCanvas || !video) {
      console.error('Canvas or video element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    const heatmapCtx = heatmapCanvas.getContext('2d');
    let frameCount = 0;

    const processFrame = () => {
      if (!isProcessing || video.paused || video.ended) return;

      ctx.drawImage(video, 0, 0, HEATMAP_WIDTH, HEATMAP_HEIGHT);
      const frameData = ctx.getImageData(0, 0, HEATMAP_WIDTH, HEATMAP_HEIGHT);

      if (frameCount % FRAME_INTERVAL === 0) {
        detectMovement(frameData);
        renderHeatmap(heatmapCtx);
      }

      frameCount++;
      requestAnimationFrame(processFrame);
    };

    video.play();
    requestAnimationFrame(processFrame);
  };

  const detectMovement = (frameData) => {
    const pixels = frameData.data;
    for (let y = 0; y < HEATMAP_HEIGHT; y += HEATMAP_SCALE) {
      for (let x = 0; x < HEATMAP_WIDTH; x += HEATMAP_SCALE) {
        const pixelIndex = (y * HEATMAP_WIDTH + x) * 4;
        const red = pixels[pixelIndex];
        const green = pixels[pixelIndex + 1];
        const blue = pixels[pixelIndex + 2];

        const brightness = (red + green + blue) / 3;

        if (brightness < 100) {
          const heatX = Math.floor(x / HEATMAP_SCALE);
          const heatY = Math.floor(y / HEATMAP_SCALE);
          heatmapData[heatX][heatY]++;
        }
      }
    }
  };

  const renderHeatmap = (ctx) => {
    ctx.clearRect(0, 0, HEATMAP_WIDTH, HEATMAP_HEIGHT);
    for (let x = 0; x < heatmapData.length; x++) {
      for (let y = 0; y < heatmapData[x].length; y++) {
        const intensity = heatmapData[x][y];
        let color = 'green';

        if (intensity > 30) {
          color = 'red';
        } else if (intensity > 10) {
          color = 'yellow';
        }

        ctx.fillStyle = color;
        ctx.fillRect(x * HEATMAP_SCALE, y * HEATMAP_SCALE, HEATMAP_SCALE, HEATMAP_SCALE);
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" style={{ marginTop: '50px', backgroundColor: theme.palette.background.default }}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom align="center">
              Store Heatmap Tracker
            </Typography>

            <Box display="flex" justifyContent="center" marginBottom={3}>
              <Button variant="contained" component="label" color="primary" style={{ marginRight: '10px' }}>
                Upload Video
                <input type="file" accept="video/*" hidden onChange={handleVideoUpload} />
              </Button>
              <Button variant="contained" component="label" color="secondary" style={{ marginRight: '10px' }}>
                Upload Image
                <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
              </Button>
              <Button variant="contained" color="success" onClick={startCamera} disabled={isProcessing}>
                Start Camera
              </Button>
              <Button variant="contained" color="error" onClick={stopProcessing} disabled={!isProcessing}>
                Stop
              </Button>
            </Box>

            <Box display="flex" justifyContent="center">
              {videoSrc && (
                <video ref={videoRef} src={videoSrc} width={HEATMAP_WIDTH} height={HEATMAP_HEIGHT} controls muted />
              )}
              {stream && <video ref={videoRef} width={HEATMAP_WIDTH} height={HEATMAP_HEIGHT} autoPlay muted />}
            </Box>

            <Box marginTop={3}>
              <Typography variant="h5" align="center">
                Heatmap
              </Typography>
              <Box display="flex" justifyContent="center">
                <canvas ref={canvasRef} width={HEATMAP_WIDTH} height={HEATMAP_HEIGHT} style={{ display: 'none' }}></canvas>
                <canvas ref={heatmapRef} width={HEATMAP_WIDTH} height={HEATMAP_HEIGHT}></canvas>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default StoreHeatmap;
