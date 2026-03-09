const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: document.documentElement.classList.contains("dark")
      ? "#1f2937" // bg-gray-800
      : "#f9fafb", // bg-gray-50
    borderColor: document.documentElement.classList.contains("dark")
      ? "#ffffff" // border-white
      : "#d1d5db", // border-gray-300
    color: document.documentElement.classList.contains("dark")
      ? "#ffffff"
      : "#111827", // text-gray-900
    borderRadius: "0.5rem", // rounded-lg
    minHeight: "40px",
    boxShadow: state.isFocused ? "0 0 0 1px #60a5fa" : "none", // focus ring
    "&:hover": {
      borderColor: "#60a5fa", // blue-400
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: document.documentElement.classList.contains("dark")
      ? "#1f2937" // bg-gray-800
      : "#f9fafb", // bg-gray-50
    borderRadius: "0.5rem",
    zIndex: 50,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? document.documentElement.classList.contains("dark")
        ? "#374151" // bg-gray-700
        : "#e5e7eb" // bg-gray-200
      : "transparent",
    color: document.documentElement.classList.contains("dark")
      ? "#ffffff"
      : "#111827", // text-white or text-gray-900
    "&:active": {
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#4b5563" // darker gray
        : "#d1d5db", // gray-300
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: document.documentElement.classList.contains("dark")
      ? "#ffffff"
      : "#111827",
  }),
  input: (provided) => ({
    ...provided,
    color: document.documentElement.classList.contains("dark")
      ? "#ffffff"
      : "#111827",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: document.documentElement.classList.contains("dark")
      ? "#9ca3af" // text-gray-400
      : "#6b7280", // text-gray-500
  }),
};

export default customSelectStyles;
