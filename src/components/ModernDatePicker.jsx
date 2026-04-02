import { useState, useRef } from "react";
import { Calendar, Keyboard, CalendarDays } from "lucide-react";

const valueToDigits = (str) => {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return `${d}${m}${y}`;
};

const ModernDatePicker = ({ value, onChange, label, className = "" }) => {
  const inputRef = useRef(null);
  const [mode, setMode] = useState("picker"); // "picker" | "manual"
  const [manualDigits, setManualDigits] = useState(() => valueToDigits(value));

  const handlePickerChange = (e) => {
    onChange(e.target.value);
    setManualDigits(valueToDigits(e.target.value));
  };

  const handleContainerClick = () => {
    inputRef.current?.showPicker?.();
    inputRef.current?.focus();
  };

  const formatDisplay = (digits) => {
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const handleManualChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    setManualDigits(raw);
    if (raw.length === 8) {
      const dd = raw.slice(0, 2);
      const mm = raw.slice(2, 4);
      const yyyy = raw.slice(4, 8);
      const date = new Date(+yyyy, +mm - 1, +dd);
      if (
        date.getFullYear() === +yyyy &&
        date.getMonth() === +mm - 1 &&
        date.getDate() === +dd
      ) {
        onChange(`${yyyy}-${mm}-${dd}`);
      }
    }
  };

  const toggleMode = () => {
    if (mode === "picker") {
      setManualDigits(valueToDigits(value));
      setMode("manual");
    } else {
      setMode("picker");
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
          {label}
        </label>
      )}

      <div className="flex gap-2 items-center">
        <div className="flex-1">
          {mode === "picker" ? (
            <div className="relative cursor-pointer" onClick={handleContainerClick}>
              <input
                ref={inputRef}
                type="date"
                value={value}
                onChange={handlePickerChange}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 pr-10 dark:bg-gray-800 dark:text-white cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full"
                style={{
                  colorScheme: document.documentElement.classList.contains("dark") ? "dark" : "light",
                }}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
            </div>
          ) : (
            <input
              type="text"
              value={formatDisplay(manualDigits)}
              onChange={handleManualChange}
              placeholder="DD/MM/YYYY"
              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
            />
          )}
        </div>

        <button
          type="button"
          onClick={toggleMode}
          title={mode === "picker" ? "Type date manually" : "Use date picker"}
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          {mode === "picker" ? <Keyboard size={15} /> : <CalendarDays size={15} />}
        </button>
      </div>
    </div>
  );
};

export default ModernDatePicker;
