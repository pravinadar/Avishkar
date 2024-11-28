import React, { useState, useRef } from "react";
import * as faceapi from "@vladmandic/face-api";
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabase = createClient(
  'https://eigjsfnuexxzegklbrpe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpZ2pzZm51ZXh4emVna2xicnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNTcyMDQsImV4cCI6MjA0NDczMzIwNH0.UthdXU4fE95rie81KHPq9eusPq2LjhSKc_DUkTwIUSk' // Replace with your actual anon key
);

const Facial = () => {
  const VideoRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [name, setName] = useState("");
  const [stream, setStream] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const video = async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.ageGenderNet.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]);

    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    setStream(videoStream);
    VideoRef.current.srcObject = videoStream;

    const ctx = canvasRef.current.getContext("2d");

    VideoRef.current.onloadedmetadata = () => {
      VideoRef.current.play();
      canvasRef.current.width = VideoRef.current.videoWidth;
      canvasRef.current.height = VideoRef.current.videoHeight;
    };

    const detector = async () => {
      if (
        VideoRef.current &&
        canvasRef.current &&
        VideoRef.current.videoWidth > 0 &&
        VideoRef.current.videoHeight > 0
      ) {
        const detections = await faceapi
          .detectAllFaces(
            VideoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceDescriptors();
    
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(VideoRef.current, 0, 0);
    
        if (localStorage.getItem("arr")) {
          const storedFaces = JSON.parse(localStorage.getItem("arr"));
    
          const labeledFaceDescriptors = storedFaces.map(e => {
            // Check if descriptors exist and have at least one element
            if (e.descriptors && e.descriptors.length > 0) {
              return new faceapi.LabeledFaceDescriptors(e.label, [new Float32Array(e.descriptors[0])]);
            } else {
              console.warn(`No valid descriptor found for label: ${e.label}`);
              return null;  // Return null for invalid entries
            }
          }).filter(face => face !== null);  // Filter out any null values
    
          const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
          const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));
    
          results.forEach((result, i) => {
            const box = detections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {
              label: result.toString(),
            });
            drawBox.draw(canvasRef.current);
          });
        }
    
        faceapi.draw.drawDetections(ctx, detections);
      }
      requestAnimationFrame(detector);
    };
    

    detector();
  };

  const stopVideo = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      VideoRef.current.srcObject = null;
    }
  };

  const saveFace = async () => {
    const data = canvasRef.current.toDataURL("image/png");
    imgRef.current.src = data;
  
    const detection = await faceapi
      .detectSingleFace(imgRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
  
    if (detection) {
      let existingFaces = [];
  
      // Retrieve existing face data from local storage
      try {
        const storedFaces = localStorage.getItem("arr");
        if (storedFaces) {
          existingFaces = JSON.parse(storedFaces);
          if (!Array.isArray(existingFaces)) {
            throw new Error("Stored data is not an array.");
          }
        }
      } catch (error) {
        console.error("Error retrieving face data:", error);
        existingFaces = [];
      }
  
      // Check if the name already exists in the local storage
      const faceIndex = existingFaces.findIndex(face => face.label === name);
  
      if (faceIndex >= 0) {
        existingFaces[faceIndex].descriptors.push(detection.descriptor);
      } else {
        existingFaces.push(new faceapi.LabeledFaceDescriptors(name, [detection.descriptor]));
      }
  
      // Save the updated faces array back to local storage
      localStorage.setItem("arr", JSON.stringify(existingFaces));

      // Save to Supabase
      const { data: supabaseData, error } = await supabase
        .from('face_data')
        .insert([
          { name, image_url: data, descriptor: Array.from(detection.descriptor) } // Convert descriptor to array
        ]);

      if (error) {
        console.error("Error saving face data to Supabase:", error);
        setFeedbackMessage("Error saving face data: " + error.message);
      } else {
        console.log("Face data saved successfully to Supabase:", supabaseData);
        setFeedbackMessage("Face data saved successfully!");
      }
    } else {
      setFeedbackMessage("No face detected!");
    }
  };
  const resetPage = () => {
    setName("");
    setStream(null);
    setFeedbackMessage("");
    stopVideo();
    imgRef.current.src = ""; // Clear the image src
    canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear the canvas
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      maxWidth: '1200px',
      margin: 'auto',
    },
    video: {
      display: 'none',
    },
    canvas: {
      marginTop: '20px',
      border: '3px solid white',
      borderRadius: '10px',  // Rounded corners
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',  // Subtle shadow for depth
      width: '640px',
      height: '480px',
      backgroundColor: '#f0f0f0',  // Light background color
    },
    

    button: {
      margin: '10px',
      padding: '10px 20px',
      backgroundColor: '#4CAF50',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    buttonStop: {
      margin: '10px',
      padding: '10px 20px',
      backgroundColor: '#f44336',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    input: {
      margin: '10px',
      padding: '8px',
      width: '200px',
      borderRadius: '5px',
      border: '1px solid #ccc',
    },
    img: {
      marginTop: '20px',
      border: '1px solid #ddd',
      maxWidth: '100%',
    },
    feedback: {
      marginTop: '10px',
      color: '#333',
      fontSize: '16px',
    },
  };

  return (
    <div style={styles.container}>
      <h2>Facial Recognition</h2>
      <button style={styles.button} onClick={video}>Start Camera</button>
      <button style={styles.buttonStop} onClick={stopVideo}>Stop Camera</button>
      <button style={styles.buttonReset} onClick={resetPage}>Reset</button>

      <video ref={VideoRef} style={styles.video} autoPlay hidden></video>
      <canvas ref={canvasRef} style={styles.canvas}></canvas>
      <input
        style={styles.input}
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button style={styles.button} onClick={saveFace}>Save Face</button>
      <img ref={imgRef} style={styles.img} alt="Captured Face" />
      {feedbackMessage && <div style={styles.feedback}>{feedbackMessage}</div>}
    </div>
  );
};

export default Facial;
