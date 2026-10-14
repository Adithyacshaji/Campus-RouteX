import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoadingScreen.css";

export default function LoadingScreen({ isLoading, gpsStatus, onExplore }) {
  const [shouldRender, setShouldRender] = useState(isLoading);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (tapCount > 0) {
      const timer = setTimeout(() => setTapCount(0), 1000);
      return () => clearTimeout(timer);
    }
  }, [tapCount]);

  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    if (newCount >= 3) {
      navigate('/admin');
    } else {
      setTapCount(newCount);
    }
  };

  // Show skip button quickly (after 800ms) so user is never trapped
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Smooth exit fade animation when loading completes
  useEffect(() => {
    if (!isLoading && shouldRender) {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 450); // Matches CSS transition duration
      return () => clearTimeout(timer);
    } else if (isLoading) {
      setShouldRender(true);
      setIsFadingOut(false);
    }
  }, [isLoading, shouldRender]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setShouldRender(false);
    }, 350);
    if (onExplore) onExplore();
  };

  if (!shouldRender) return null;

  const getStatusText = () => {
    switch (gpsStatus) {
      case "ok":
        return "Location acquired";
      case "poor":
        return "Using estimated location";
      case "failed":
        return "Position unavailable";
      case "timeout":
        return "GPS timed out";
      case "pending":
      default:
        return "Locating user...";
    }
  };

  return (
    <div className={`minimal-loading-overlay ${isFadingOut ? "minimal-loading-overlay--fade" : ""}`}>
      <div className="minimal-loading-content">
        <img 
          src="/logo.png"
          alt="Campus Compass Logo" 
          className={`loading-logo ${isFadingOut ? "loading-logo--zoom-fade" : ""}`} 
          onClick={handleLogoTap}
          style={{ cursor: "pointer", userSelect: "none", WebkitTapHighlightColor: "transparent" }}
        />
        <h1 className="minimal-title">Campus Compass</h1>
        <p className="minimal-status">{getStatusText()}</p>
        
        <div className="loading-line-container">
          <div className="loading-line"></div>
        </div>

        {showSkip && (
          <button 
            className="minimal-skip-btn" 
            onClick={handleSkip}
          >
            Skip to map
          </button>
        )}
      </div>
    </div>
  );
}
