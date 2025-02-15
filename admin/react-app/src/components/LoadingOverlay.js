import React from 'react';

function LoadingOverlay() {
  return (
    <div className="wda-fixed wda-inset-0 wda-z-50 wda-flex wda-items-center wda-justify-center wda-bg-black wda-bg-opacity-50">
      <div className="wda-bg-white wda-rounded-lg wda-p-6 wda-shadow-xl">
        <div className="wda-flex wda-items-center wda-space-x-4">
          <div className="wda-animate-spin wda-h-8 wda-w-8 wda-border-4 wda-border-primary-500 wda-border-t-transparent wda-rounded-full"></div>
          <span className="wda-text-gray-700 wda-font-medium">Loading...</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
