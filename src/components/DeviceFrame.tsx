import React from 'react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  return (
    <div className="app-viewport-shell">
      <div className="app-screen-container">
        {children}
      </div>
    </div>
  );
};
