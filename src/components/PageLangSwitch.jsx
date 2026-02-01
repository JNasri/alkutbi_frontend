import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Languages } from "lucide-react";

const PageLangSwitch = () => {
  const { t, i18n } = useTranslation();

  // Effect to change the document direction and font-family whenever the language changes
  useEffect(() => {
    const isArabic = i18n.language?.startsWith("ar");
    const direction = isArabic ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.lang = i18n.language;

    // Set font-family based on selected language
    const font = isArabic
      ? "'Tajawal', sans-serif"
      : "'Nunito Sans', serif";
    document.body.style.fontFamily = font;
  }, [i18n.language]); // Re-run this effect when the language changes

  const toggleLanguage = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const currentLang = i18n.language || "en";
    const newLang = currentLang.startsWith("ar") ? "en" : "ar";
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      className="relative inline-flex p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-600 to-yellow-300 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200   cursor-pointer"
      onClick={toggleLanguage}
      aria-label="Toggle language"
    >
      <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent font-bold">
        {t("toggle_language")}
      </span>
    </button>
  );
};

export default PageLangSwitch;
