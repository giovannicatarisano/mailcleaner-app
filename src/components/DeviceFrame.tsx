import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Smartphone, Tablet, Monitor } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  deviceType: 'iphone' | 'pixel' | 'fluid';
  onDeviceChange: (device: 'iphone' | 'pixel' | 'fluid') => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  deviceType,
  onDeviceChange
}) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="desktop-wrapper">
      {/* Device Simulator Bar */}
      <div className="top-bar-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            MailCleaner Mobile Preview
          </span>
        </div>

        <div className="device-segmented-btn">
          <button
            className={`device-btn ${deviceType === 'iphone' ? 'active' : ''}`}
            onClick={() => onDeviceChange('iphone')}
            title="iPhone 16 Pro View"
          >
            <Smartphone size={13} />
            <span>iPhone</span>
          </button>
          <button
            className={`device-btn ${deviceType === 'pixel' ? 'active' : ''}`}
            onClick={() => onDeviceChange('pixel')}
            title="Google Pixel 9 View"
          >
            <Tablet size={13} />
            <span>Android</span>
          </button>
          <button
            className={`device-btn ${deviceType === 'fluid' ? 'active' : ''}`}
            onClick={() => onDeviceChange('fluid')}
            title="Fluid Fullscreen View"
          >
            <Monitor size={13} />
            <span>Fluido</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className={`mobile-device-frame ${deviceType}`}>
        {/* iOS Status Bar */}
        <div className="ios-status-bar">
          <span>{currentTime}</span>

          {deviceType === 'iphone' && (
            <div className="dynamic-island">
              <div className="island-camera" />
              <div className="island-sensor" />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)' }}>5G</span>
            <Wifi size={13} />
            <Battery size={15} />
          </div>
        </div>

        {/* Screen Content */}
        <div className="app-screen-container">
          {children}
        </div>
      </div>
    </div>
  );
};
