import { Link } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Welcome = () => {
  const { t } = useTranslation();
  return (
    <>
      {/* <div className="relative h-screen text-black overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/bg.png"
            alt="Background Image"
            className="object-cover object-center w-full h-full"
          />
          <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>
        <div className="relative z-10 flex flex-col py-10 items-center h-full text-center">
          <h1 className="text-6xl font-bold leading-tight mb-8">
            Welcome to Alkutbi System
          </h1>
          <Link
            className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 py-2 px-6 rounded-full text-3xl font-semibold transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            to="/login"
          >
            Login - تسجيل الدخول
          </Link>
        </div>
      </div> */}
      <div className="min-h-screen flex">
        {/* Image Section - Hidden on mobile */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 z-10"></div>
          <img
            src="https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Modern business office"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10 z-20"></div>
        </div>

        {/* Content Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative ">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-yellow-200"></div>
          {/* Main Content */}
          <LanguageSwitcher />
          <div className="relative z-10 max-w-md w-full mx-8 text-center">
            {/* Logo/Icon */}
            <div className="mb-8 flex justify-center">
              <div className="p-4 rounded-2xl shadow-2xl">
                <img
                  src="LOGO_ONLY.png"
                  alt="ALKUTBI LOGO"
                  className="w-50 h-50 object-cover"
                />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {t("welcome")} <br />
              <span className="bg-gradient-to-r from-green-800 to-yellow-500 bg-clip-text text-transparent">
                {t("alkutbi")}
              </span>
            </h1>

            {/* Additional Info */}
            <p className="text-md text-black font-bold my-5">
              {t("welcome_info")}
            </p>

            {/* Login Button */}
            <div className="space-y-4">
              <Link
                className="py-2 px-6 rounded-full text-2xl font-semibold transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg inline-block border"
                to="/login"
              >
                {t("login")}
              </Link>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-300 rounded-full opacity-20 blur-xl"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
