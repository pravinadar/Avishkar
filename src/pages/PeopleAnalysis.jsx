import React, { useState, useRef } from 'react';
import { Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as faceapi from '@vladmandic/face-api';
import supabase from '../components/database'; // Import Supabase client

const PeopleAnalysis = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [finalMaleCount, setFinalMaleCount] = useState(0);
  const [finalFemaleCount, setFinalFemaleCount] = useState(0);
  const [mood, setMood] = useState('Neutral');
  const [finalMood, setFinalMood] = useState('UNKNOWN');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [isPersonDetected, setIsPersonDetected] = useState(false);
  const [collectedData, setCollectedData] = useState([]);
  const [summaryVisible, setSummaryVisible] = useState(false); // Track if summary is visible

  const handleStartCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      mediaStreamRef.current = stream;
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = async () => {
        videoRef.current.play();
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        try {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.ageGenderNet.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models'),
          ]);
          detectFaces();
        } catch (error) {
          console.error('Error loading models:', error);
        }
      };

      // Reset summary when starting the camera
      setSummaryVisible(false);
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  };

  const handleStopCamera = async () => {
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
    setIsPersonDetected(false);

    // Save final counts and mood before stopping
    const totalMale = maleCount;
    const totalFemale = femaleCount;

    console.log(`Stopping camera: Total Male: ${totalMale}, Total Female: ${totalFemale}, Mood: ${mood}`);

    // Send collected data to Supabase
    if (collectedData.length > 0) {
      await saveDataToSupabase(totalMale, totalFemale);
    }

    // Update the final counts and mood
    setFinalMaleCount(totalMale);
    setFinalFemaleCount(totalFemale);
    setFinalMood(mood);
    setSummaryVisible(true); // Show the summary after stopping the camera
  };

  const detectFaces = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const detect = async () => {
      if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withAgeAndGender()
          .withFaceExpressions();

        drawBoxes(canvas.getContext('2d'), video, detections);
      }
      requestAnimationFrame(detect);
    };

    detect();
  };

  const drawBoxes = (context, video, detections) => {
    if (!context || !canvasRef.current) return;

    context.clearRect(0, 0, video.videoWidth, video.videoHeight);
    context.strokeStyle = '#2ecc71';
    context.lineWidth = 2;

    const scaleX = canvasRef.current.width / video.videoWidth;
    const scaleY = canvasRef.current.height / video.videoHeight;

    detections.forEach((detection) => {
      const { x, y, width, height } = detection.detection.box;
      context.strokeRect(x * scaleX, y * scaleY, width * scaleX, height * scaleY);

      const age = Math.round(detection.age);
      const gender = detection.gender === 'male' ? 'MALE' : 'FEMALE';
      const expressions = detection.expressions;

      const newMood = Object.keys(expressions).reduce((a, b) =>
        expressions[a] > expressions[b] ? a : b
      );

      // Draw overlay info
      context.fillStyle = 'rgba(255, 255, 255, 0.8)';
      context.fillRect(x * scaleX + 10, y * scaleY + 10, 200, 60);

      context.fillStyle = 'black';
      context.font = '16px Arial';
      context.fillText(`Age: ${age}`, x * scaleX + 15, y * scaleY + 30);
      context.fillText(`Gender: ${gender}`, x * scaleX + 15, y * scaleY + 50);
    });
  };

  return (
    <div style={{ backgroundColor: '#2c3e50', color: '#ecf0f1', minHeight: '100vh', padding: '20px' }}>
      <h2 className="text-center">Webcam People Analysis</h2>
      <div className="d-flex flex-column align-items-center">
        <Card style={{ backgroundColor: '#34495e', color: '#ecf0f1', width: '100%', maxWidth: '600px' }}>
          <Card.Body className="d-flex justify-content-center">
            {showCamera ? (
              <Button variant="danger" onClick={handleStopCamera} style={{ backgroundColor: '#e74c3c', border: 'none' }}>
                Stop Camera
              </Button>
            ) : (
              <Button variant="primary" onClick={handleStartCamera} style={{ backgroundColor: '#3498db', border: 'none' }}>
                Start Camera
              </Button>
            )}
          </Card.Body>
        </Card>

        {showCamera && (
          <div className="mt-4" style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              style={{ width: '100%', height: 'auto', borderRadius: '8px', border: '2px solid #2ecc71' }}
            />
            <canvas
              ref={canvasRef}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', borderRadius: '8px' }}
            />
          </div>
        )}

        {summaryVisible && (
          <Card className="mt-4" style={{ backgroundColor: '#34495e', color: '#ecf0f1' }}>
            <Card.Body>
              <h5>Analysis Summary</h5>
              <p>Total Male: {finalMaleCount}</p>
              <p>Total Female: {finalFemaleCount}</p>
              <p>Overall Mood: {finalMood}</p>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PeopleAnalysis;
