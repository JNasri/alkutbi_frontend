import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen py-8 items-center text-center justify-center bg-gray-200">
      <h1 className="text-4xl font-bold text-red-600">404 - Page Not Found</h1>
      <p className="text-lg text-gray-700">
        Sorry, the page you are looking for does not exist.
      </p>
      <button
        onClick={handleGoBack}
        className="px-6 py-3 text-base bg-gray-700 border border-black text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
      >
        Go Back
      </button>
    </div>
  );
};

export default NotFound;
