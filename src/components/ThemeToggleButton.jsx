import React, { useState, useEffect } from "react";

const ThemeToggleButton = () => {
  // 1. State to manage the current theme: 'light' or 'dark'
  // Initialize from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      // Check if dark mode preference is stored
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme) {
        return storedTheme;
      }
      // Check user's system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light"; // Default theme
  });

  // 2. useEffect to apply the theme class to the documentElement (<html>)
  useEffect(() => {
    const root = document.documentElement; // This refers to the <html> tag
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]); // Re-run this effect whenever the 'theme' state changes

  // 3. Function to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <button
      className="relative flex items-center justify-center text-gray-500 transition-colors bg-gray-100 border border-gray-500 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} // Improved accessibility
    >
      {/* Sun icon for light mode (visible when theme is light) */}
      {theme === "light" ? (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="12"
            y1="2"
            x2="12"
            y2="6"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="12"
            y1="18"
            x2="12"
            y2="22"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="2"
            y1="12"
            x2="6"
            y2="12"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="18"
            y1="12"
            x2="22"
            y2="12"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="4.22"
            y1="4.22"
            x2="7.05"
            y2="7.05"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="16.95"
            y1="16.95"
            x2="19.78"
            y2="19.78"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="4.22"
            y1="19.78"
            x2="7.05"
            y2="16.95"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="16.95"
            y1="7.05"
            x2="19.78"
            y2="4.22"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ) : (
        // Moon icon for dark mode (visible when theme is dark)
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          ></path>
        </svg>
      )}
    </button>
  );
};

export default ThemeToggleButton;
