import { LogOut, UserCircle } from "lucide-react";
import LanguageSwitcher from "../LanguageSwitcher";
import ThemeToggleButton from "../ThemeToggleButton";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSendLogoutMutation } from "../../features/auth/authApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";

const DashHeader = () => {
  const [sendLogout] = useSendLogoutMutation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const currentLang = i18n.language;

  const handleLogout = () => {
    sendLogout();
    navigate("/");
  };

  // Dynamically choose name
  const userName = currentLang === "ar" ? user.ar_name : user.en_name;

  return (
    <header className="flex items-center justify-between h-16 px-2 border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
      <Link
        to="/dashboard"
        className="flex items-center gap-3 text-xl font-bold tracking-wide text-gray-800 dark:text-gray-200 hover:opacity-80 transition-opacity"
      >
        <img src="/LOGO_ONLY.png" alt="Logo" className="h-12 w-auto" />
        <span className="hidden md:block">
          {t("alkutbi")}
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <ThemeToggleButton />
        
        <div className="relative group">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-600 dark:text-gray-300 transition-all bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-red-300 dark:hover:border-red-500 cursor-pointer"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>

          {/* Tooltip */}
          <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 text-xs font-medium text-white bg-gray-800 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-lg">
            {t("logout")}
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <UserCircle size={20} className="text-gray-600 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{userName || t("guest")}</span>
        </div>
      </div>
    </header>
  );
};

export default DashHeader;
