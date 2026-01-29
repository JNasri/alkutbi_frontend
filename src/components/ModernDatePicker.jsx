import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

const ModernDatePicker = ({ value, onChange, label, className = '' }) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker?.(); // Modern browsers
      inputRef.current.focus(); // Fallback
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
          {label}
        </label>
      )}
      <div 
        className="relative cursor-pointer"
        onClick={handleContainerClick}
      >
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={handleChange}
          className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 pr-10 dark:bg-gray-800 dark:text-white cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full"
          style={{
            colorScheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
          }}
        />
        <Calendar 
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" 
        />
      </div>
    </div>
  );
};

export default ModernDatePicker;
