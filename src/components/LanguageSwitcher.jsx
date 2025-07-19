import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { FaGlobe } from "react-icons/fa"; // Import the globe icon

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  // Effect to change the document direction and font-family whenever the language changes
  useEffect(() => {
    const direction = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.lang = i18n.language; // Also set the html lang attribute

    // Set font-family based on selected language
    const font =
      i18n.language === "ar" ? "'Tajawal', sans-serif" : "'Nunito Sans', serif";
    document.body.style.fontFamily = font;
  }, [i18n.language]); // Re-run this effect when the language changes

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    // The useEffect will handle setting 'dir' and 'lang' attributes
  };

  return (
    <div className="relative group">
      <button
        className="flex items-center justify-center text-gray-500 transition-colors bg-gray-100 border border-gray-500 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
        onClick={toggleLanguage}
        aria-label="Toggle language"
      >
        <FaGlobe className="h-5 w-5" />
      </button>

      {/* Tooltip positioned below the button */}
      <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10 shadow-md font-medium">
        {t("toggle_language")}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
