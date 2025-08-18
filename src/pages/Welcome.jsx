import { Link } from "react-router-dom";
import PageLangSwitch from "../components/PageLangSwitch";
import { useTranslation } from "react-i18next";

const Welcome = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl"; // Detect if language is RTL (like Arabic)

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Content Section */}
      <div className="w-full h-screen lg:h-auto lg:w-1/2 flex flex-col items-center justify-center bg-yellow-50">
        {/* Language Switcher positioned based on language direction */}
        <div className={`absolute top-6 z-20 ${isRTL ? "right-6" : "left-6"}`}>
          <PageLangSwitch />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-md w-full mx-8 text-center py-10">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-gray-900  mb-6 leading-tight">
            {t("welcome")} <br />
            <span className="text-6xl bg-gradient-to-r from-green-600 to-yellow-400 bg-clip-text text-transparent">
              {t("alkutbi")}
            </span>
          </h1>
          {/* Additional Info */}
          <p className="text-md font-bold my-5">{t("welcome_info")}</p>
          {/* Login Button */}
          <div className="flex flex-col items-center space-y-4">
            <div>
              <Link
                to="/login"
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xl font-bold text-gray-900 rounded-lg group bg-gradient-to-br from-green-600 to-yellow-300 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200"
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                  {t("login")}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Image Section - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="alkutbi_bg.jpg"
          alt="Modern business office"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10 z-20"></div>
      </div>
    </div>
  );
};

export default Welcome;
