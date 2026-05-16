import React, { useEffect, useState, useRef, useCallback } from 'react';

/**
 * DynamicWatermark — Moving semi-transparent watermark overlay.
 * Displays student name, email, timestamp, and device ID.
 * Repositions every 8-10 seconds with smooth transitions.
 *
 * Props:
 * - name: string
 * - email: string
 * - timestamp: string
 * - deviceId: string (optional)
 */
const DynamicWatermark = ({ name, email, timestamp, deviceId }) => {
  const [positions, setPositions] = useState([
    { top: 15, left: 20 },
    { top: 60, left: 55 },
    { top: 35, left: 75 },
  ]);
  const intervalRef = useRef(null);

  const getRandomPosition = useCallback(() => ({
    top: Math.floor(Math.random() * 70) + 10,   // 10-80%
    left: Math.floor(Math.random() * 60) + 10,  // 10-70%
  }), []);

  useEffect(() => {
    // Randomize initial positions
    setPositions([getRandomPosition(), getRandomPosition(), getRandomPosition()]);

    // Move watermarks every 8-10 seconds
    const moveWatermarks = () => {
      setPositions([getRandomPosition(), getRandomPosition(), getRandomPosition()]);
    };

    const baseInterval = 8000;
    const jitter = Math.floor(Math.random() * 2000);
    intervalRef.current = setInterval(moveWatermarks, baseInterval + jitter);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [getRandomPosition]);

  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  const watermarkContent = [
    name || 'Student',
    email || '',
    formatTime(timestamp),
    deviceId ? `ID: ${deviceId.substring(0, 8)}...` : '',
  ].filter(Boolean).join(' • ');

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 15, pointerEvents: 'none' }}>
      {positions.map((pos, index) => (
        <div
          key={index}
          className="watermark-text absolute whitespace-nowrap"
          style={{
            top: `${pos.top}%`,
            left: `${pos.left}%`,
            transform: `rotate(-${20 + index * 5}deg)`,
            transition: 'top 2.5s ease-in-out, left 2.5s ease-in-out',
            fontSize: index === 0 ? '15px' : '12px',
            opacity: index === 0 ? 0.15 : 0.1,
          }}
        >
          {watermarkContent}
        </div>
      ))}

      {/* Diagonal repeating pattern for better coverage */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 180px,
            rgba(255,255,255,0.02) 180px,
            rgba(255,255,255,0.02) 182px
          )`,
        }}
      />
    </div>
  );
};

export default DynamicWatermark;
