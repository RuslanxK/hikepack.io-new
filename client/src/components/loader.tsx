import React from "react";

const LoadingPage: React.FC = () => {
  return (
    <div className="loading-page flex flex-col items-center justify-center w-full bg-gray-100 dark:bg-dark h-screen">
      <div className="loader flex space-x-2 mb-4">
        <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
        <div className="w-4 h-4 bg-primary rounded-full animate-pulse delay-200"></div>
        <div className="w-4 h-4 bg-primary rounded-full animate-pulse delay-400"></div>
      </div>
    </div>
  );
};

export default LoadingPage;
