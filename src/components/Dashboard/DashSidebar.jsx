import { useState } from "react";
import {
  Home,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Folder,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const DashSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isSpecialOpen, setIsSpecialOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setIsSpecialOpen(false);
  };
  const toggleSpecial = () => setIsSpecialOpen(!isSpecialOpen);

  return (
    <div
      className={`flex ${
        isArabic ? "border-l" : "border-r"
      }   border-gray-200 bg-gray-100dark:bg-gray-800 dark:border-gray-700 shadow-md`}
    >
      <div
        className={`h-screen shadow transition-all duration-300 ${
          isOpen ? "w-60" : "w-14"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleSidebar}
            className="rounded-xl m-3 p-1.5 text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="mt-4 font-bold">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <Home size={20} />
            {isOpen && <span className="text-sm">{t("home")}</span>}
          </Link>

          {/* Users */}
          <Link
            to="/dashboard/users"
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <Users size={20} />
            {isOpen && <span className="text-sm">{t("users")}</span>}
          </Link>

          {/* Special Papers */}
          <div>
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              onClick={toggleSpecial}
            >
              <div className="flex items-center gap-4">
                <Folder size={20} />
                {isOpen && (
                  <span className="text-sm">{t("special_papers")}</span>
                )}
              </div>
              {isOpen &&
                (isSpecialOpen ? (
                  <ChevronDown size={16} className="text-gray-500" />
                ) : isArabic ? (
                  <ChevronLeft size={16} className="text-gray-500" />
                ) : (
                  <ChevronRight size={16} className="text-gray-500" />
                ))}
            </div>

            {/* Nested items (with RTL margin swap) */}
            {isSpecialOpen && (
              <div className={`${isArabic ? "mr-2" : "ml-2"}`}>
                <Link to="/dashboard/incomings">
                  <div className="flex items-center gap-6 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    <FileText size={18} />
                    {isOpen && (
                      <span className="text-sm">{t("incomings")}</span>
                    )}
                  </div>
                </Link>
                <Link to="/dashboard/outgoings">
                  <div className="flex items-center gap-6 p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    <FileText size={18} />
                    {isOpen && (
                      <span className="text-sm">{t("outgoings")}</span>
                    )}
                  </div>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default DashSidebar;
