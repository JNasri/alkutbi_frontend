const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <span className="sr-only">Loading...</span>
      {/* Single bouncing logo */}
      <img
        src="/LOGO_ONLY.png"
        alt="Logo"
        className="h-32 w-38 animate-[bounce_0.8s_infinite] will-change-transform"
      />
    </div>
  );
};

export default LoadingSpinner;
