import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import feature1 from '../images/feature1.jpg';
import feature2 from '../images/feature2.jpg';
import feature3 from '../images/feature3.jpg';
import feature4 from '../images/feature4.jpg';
import feature5 from '../images/feature5.jpg';
import videoSrc from '../images/supermarket.mp4';

const HomePage = () => {
  const [clickedFeature, setClickedFeature] = useState(null);
  const [inView, setInView] = useState(Array(5).fill(false));
  const featureRefs = useRef([]);
  const textRefs = useRef([]);
  const [textInView, setTextInView] = useState(false);

  const handleClick = (featureId) => {
    setClickedFeature(featureId);
    setTimeout(() => {
      setClickedFeature(null);
    }, 1000);
  };

  const features = [
    {
      id: 1,
      title: 'Real-Time People Counting',
      description: 'Accurately track the number of people in real-time.',
      image: feature1,
      link: '/camera-interface',
    },
    {
      id: 2,
      title: 'QR Scanner',
      description: 'Scan QR codes using the camera to quickly add items to the cart effortlessly.',
      image: feature2,
      link: '/qr-scanner',
    },
    {
      id: 3,
      title: 'People Analysis',
      description: 'Analyze people by tracking their age group, emotions, and gender for comprehensive analysis.',
      image: feature3,
      link: '/people-analysis',
    },
    {
      id: 4,
      title: 'Path Tracking using Heatmap',
      description: 'Streamline path tracking with heatmaps to visualize movement patterns.',
      image: feature4,
      link: '/store-heatmap',
    },
    {
      id: 5,
      title: 'Attendance Tracking',
      description: 'Track employee attendance accurately using our advanced system.',
      image: feature5,
      link: '/face',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setInView((prev) => {
            const newInView = [...prev];
            newInView[index] = true;
            return newInView;
          });
          observer.unobserve(entry.target);
        }
      });
    });

    featureRefs.current.forEach((feature) => {
      if (feature) observer.observe(feature);
    });

    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTextInView(true);
          textObserver.unobserve(entry.target);
        }
      });
    });

    textRefs.current.forEach((text) => {
      if (text) textObserver.observe(text);
    });

    return () => {
      featureRefs.current.forEach((feature) => {
        if (feature) observer.unobserve(feature);
      });
      textRefs.current.forEach((text) => {
        if (text) textObserver.unobserve(text);
      });
    };
  }, []);

  return (
    <div className="bg-[#E4CFA1] text-[#1C2E4A]"> {/* Beige background and navy text */}
      {/* Hero Section */}
      <div className="relative">
        <video className="w-full object-cover" autoPlay loop muted>
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white ">
          <h1 ref={(el) => (textRefs.current[0] = el)} className={`text-4xl font-bold transition-opacity ${textInView ? 'opacity-100' : 'opacity-0'}`}>
            Welcome to SmartSpace Analytics
          </h1>
          <p ref={(el) => (textRefs.current[1] = el)} className={`text-xl mt-4 transition-opacity ${textInView ? 'opacity-100' : 'opacity-0'}`}>
            An Innovative Analysis of Your Business
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 px-4">
        <h2 className="text-3xl font-semibold text-center mb-8">Our Features</h2>
        <div className="space-y-8">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              ref={(el) => (featureRefs.current[index] = el)}
              className={`flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-lg shadow-lg transition-transform transform ${clickedFeature === feature.id ? 'scale-105' : ''} ${inView[index] ? 'opacity-100' : 'opacity-0'}`}
              onClick={() => handleClick(feature.id)}
            >
              <div className="flex-shrink-0 mb-4 md:mb-0">
                <img src={feature.image} alt={feature.title} className="w-32 h-32 object-cover rounded-full shadow-md" />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="mt-2 text-gray-700">{feature.description}</p>
                <Link to={feature.link}>
                  <button className="mt-4 bg-[#7E1F28] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"> {/* Crimson background */}
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      
    </div>
  );
};

export default HomePage;
