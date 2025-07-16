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

        <button
          className="hover:text-red-400 transition cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut size={22} />
        </button>

        <div className="flex items-center gap-2">
          <UserCircle size={24} />
          <span className="text-sm">{userName || t("guest")}</span>
        </div>
      </div>
    </header>
  );
};

export default DashHeader;
