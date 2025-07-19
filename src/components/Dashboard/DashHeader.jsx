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
  const userName = currentLang === "ar" ? user?.ar_name : user?.en_name;

  return (
    <header className="flex items-center justify-between h-20 border-b border-gray-200 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
      <Link
        to="/dashboard"
        className="text-xl font-bold tracking-wide flex items-center text-gray-800"
      >
        <img src="/LOGO_ONLY.png" alt="ss" className="w-15" />
        <span className="hidden md:block dark:text-gray-200 ">
          {t("alkutbi")}
        </span>
      </Link>

      <div className="flex items-center gap-6 px-3">
        <LanguageSwitcher />
        <ThemeToggleButton />
        <div className="relative group">
          <button
            className="flex items-center justify-center text-gray-500 transition-colors bg-gray-100 border border-gray-500 rounded-full hover:text-red-500 h-11 w-11 hover:bg-gray-100 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400 cursor-pointer"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>

          {/* Tooltip positioned below the button */}
          <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10 shadow-md font-medium">
            {t("logout")}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <UserCircle size={24} />
          <span className="text-sm">{userName || t("guest")}</span>
        </div>
      </div>
    </header>
  );
};

export default DashHeader;
