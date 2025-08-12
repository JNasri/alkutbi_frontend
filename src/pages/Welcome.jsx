import { Link } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Welcome = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Image Section - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 z-10"></div>
        <img
          src="alkutbi_bg.jpg"
          alt="Modern business office"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10 z-20"></div>
      </div>

      {/* Content Section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative bg-gray-200 dark:bg-gray-800">
        {/* Language Switcher */}
        <div className="absolute top-6 z-20">
          <LanguageSwitcher />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-md w-full mx-8 text-center py-10">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {t("welcome")} <br />
            <span className="bg-gradient-to-r from-green-800 to-yellow-500 bg-clip-text text-transparent">
              {t("alkutbi")}
            </span>
          </h1>

          {/* Logo/Icon */}
          <div className="mb-8 flex justify-center">
            <div className="p-4 rounded-2xl shadow-2xl bg-white dark:bg-gray-900">
              <img
                src="LOGO_ONLY.png"
                alt="ALKUTBI LOGO"
                className="w-32 h-32 object-cover"
              />
            </div>
          </div>

          {/* Additional Info */}
          <p className="text-md text-black font-bold my-5 dark:text-white">
            {t("welcome_info")}
          </p>

          {/* Login Button */}
          <div className="space-y-4">
            <Link
              to="/login"
              className="dark:text-white py-2 px-6 rounded-full text-2xl font-semibold transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg inline-block border"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
