import React from 'react';
import { FiLoader } from 'react-icons/fi';

const LoadingSpinner = ({ 
  size = 'default', 
  text = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-10 w-10',
    large: 'h-16 w-16'
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.default;

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <FiLoader className={`${spinnerSize} text-primary-600 animate-spin mb-4`} />
      {text && (
        <p className="text-gray-600 text-sm font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner; 