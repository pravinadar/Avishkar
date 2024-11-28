import React, { useState, useRef } from 'react';
import { Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import supabase from '../components/database';

const CameraInterface = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [peopleCount, setPeopleCount] = useState(0);
  const [lastCount, setLastCount] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const handleStartCamera = async () => {
    setShowCamera(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    mediaStreamRef.current = stream;
    videoRef.current.srcObject = stream;

    videoRef.current.onloadedmetadata = () => {
      videoRef.current.play();
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      const modelPromise = cocoSsd.load();
      modelPromise.then(model => {
        detectObjects(model);
      });
    };
  };

  const handleStopCamera = async () => {
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);

    setLastCount(peopleCount);
    const currentTimestamp = new Date();
    const formattedDate = `${currentTimestamp.getFullYear()}-${String(
      currentTimestamp.getMonth() + 1
    ).padStart(2, '0')}-${String(currentTimestamp.getDate()).padStart(2, '0')}`;
    const formattedTime = `${String(currentTimestamp.getHours()).padStart(
      2,
      '0'
    )}:${String(currentTimestamp.getMinutes()).padStart(
      2,
      '0'
    )}:${String(currentTimestamp.getSeconds()).padStart(2, '0')}`;

    const { error } = await supabase.from('peopledata').insert({
      lastCount: peopleCount,
      timestamp: `${formattedDate} ${formattedTime}`
    });

    setPeopleCount(0);
    console.log(error);
  };

  const detectObjects = model => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const detect = async () => {
      if (
        video &&
        canvas &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        const predictions = await model.detect(video);
        const peoplePredictions = predictions.filter(
          p => p.class === 'person'
        );
        setPeopleCount(peoplePredictions.length);
        drawBoxes(
          canvas.getContext('2d'),
          video,
          peoplePredictions
        );
      }
      requestAnimationFrame(() => detect());
    };

    detect();
  };

  const drawBoxes = (context, video, predictions) => {
    if (!context || !canvasRef.current) return;
    context.clearRect(0, 0, video.videoWidth, video.videoHeight);
    context.strokeStyle = '#236C4B';
    context.lineWidth = 2;

    const scaleX = canvasRef.current.width / video.videoWidth;
    const scaleY = canvasRef.current.height / video.videoHeight;

    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;
      context.strokeRect(
        x * scaleX,
        y * scaleY,
        width * scaleX,
        height * scaleY
      );
    });
  };

  return (
    <div
      className="camera-container d-flex flex-column align-items-center"
      style={{
        minHeight: '100vh',
        backgroundColor: '#1C2E4A',
        color: '#E4CFA1',
        padding: '20px'
      }}
    >
      <style>
        {`
          body, html {
            margin: 0;
            padding: 0;
          }
        `}
      </style>
      <h2 style={{ color: 'white' }}>Webcam People Counting</h2>
      <Card
        className="shadow"
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'grey',
          border: `2px solid #1C2E4A`
        }}
      >
        <Card.Body>
          {showCamera ? (
            <Button
              variant="danger"
              onClick={handleStopCamera}
              style={{
                backgroundColor: '#7E1F28',
                borderColor: '#7E1F28',
                color: '#fff'
              }}
            >
              Stop Camera
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleStartCamera}
              style={{
                backgroundColor: '#7E1F28',
                borderColor: '#7E1F28',
                color: '#fff'
              }}
            >
              Start Camera
            </Button>
          )}
        </Card.Body>
      </Card>

      {showCamera && (
        <div
          className="video-stream mt-4"
          style={{ position: 'relative' }}
        >
          <Card className="shadow">
            <Card.Body>
              <video
                ref={videoRef}
                id="videoElement"
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'cover'
                }}
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1,
                  width: '100%',
                  height: '100%'
                }}
              />
            </Card.Body>
          </Card>
        </div>
      )}

      <h4 style={{ color: '#236C4B' }}>
        Current People Count: {peopleCount}
      </h4>
      {!showCamera && lastCount !== null && (
        <h4 style={{ color: '#D97C29' }}>Last Count: {lastCount}</h4>
      )}
    </div>
  );
};

export default CameraInterface;
