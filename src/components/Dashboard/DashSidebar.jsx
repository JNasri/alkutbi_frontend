import { useState } from "react";
import {
  Home,
  Users,
  FileText,
  Scroll,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Folder,
  Skull,
  ShieldAlert,
  Footprints,
  Package,
  ShoppingCart,
  Coins,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const DashSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isSpecialOpen, setIsSpecialOpen] = useState(false);
  const [isCasesOpen, setIsCasesOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const {
    isAdmin,
    isOperationManager,
    isOperationEmployee,
    isSpecialPapersManager,
    isSpecialPapersEmployee,
  } = useAuth();

  const isArabic = i18n.language === "ar";

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setIsSpecialOpen(false);
    setIsCasesOpen(false);
  };
  const toggleSpecial = () => setIsSpecialOpen(!isSpecialOpen);
  const toggleCases = () => setIsCasesOpen(!isCasesOpen);

  // Helper to check if route is active
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div
      className={`flex ${
        isArabic ? "border-l" : "border-r"
      } border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-lg`}
    >
      <div
        className={`h-full transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 py-4 px-3">
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="mt-2 space-y-1 px-2">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive("/dashboard") && location.pathname === "/dashboard"
                ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Home size={20} className="flex-shrink-0" />
            {isOpen && <span className="text-sm">{t("home")}</span>}
          </Link>

          {/* Users */}
          {isAdmin && (
            <Link
              to="/dashboard/users"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive("/dashboard/users")
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Users size={20} className="flex-shrink-0" />
              {isOpen && <span className="text-sm">{t("users")}</span>}
            </Link>
          )}

          {/* Purchase Orders */}
          <Link
            to="/dashboard/purchaseorders"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive("/dashboard/purchaseorders")
                ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <ShoppingCart size={20} className="flex-shrink-0" />
            {isOpen && <span className="text-sm">{t("purchase_orders")}</span>}
          </Link>

          {/* Collection Orders */}
          <Link
            to="/dashboard/collectionorders"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive("/dashboard/collectionorders")
                ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Coins size={20} className="flex-shrink-0" />
            {isOpen && <span className="text-sm">{t("collection_orders")}</span>}
          </Link>

          {/* Special Papers */}
          <div>
            <div
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                isActive("/dashboard/incomings") || isActive("/dashboard/outgoings")
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={toggleSpecial}
            >
              <div className="flex items-center gap-3">
                <Folder size={20} className="flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm">{t("special_papers")}</span>
                )}
              </div>
              {isOpen &&
                (isSpecialOpen ? (
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                ) : isArabic ? (
                  <ChevronLeft size={16} className="text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
                ))}
            </div>

            {isSpecialOpen && isOpen && (
              <div className="mt-1 space-y-1 ml-3">
                <Link to="/dashboard/incomings">
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive("/dashboard/incomings")
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}>
                    <FileText size={18} className="flex-shrink-0" />
                    <span className="text-sm">{t("incomings")}</span>
                  </div>
                </Link>
                <Link to="/dashboard/outgoings">
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive("/dashboard/outgoings")
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}>
                    <FileText size={18} className="flex-shrink-0" />
                    <span className="text-sm">{t("outgoings")}</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Special Cases */}
          <div>
            <div
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                isActive("/dashboard/deathcases") || isActive("/dashboard/prisoncases") || isActive("/dashboard/escapecases")
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={toggleCases}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert size={20} className="flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm">{t("special_cases")}</span>
                )}
              </div>
              {isOpen &&
                (isCasesOpen ? (
                  <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                ) : isArabic ? (
                  <ChevronLeft size={16} className="text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
                ))}
            </div>

            {isCasesOpen && isOpen && (
              <div className="mt-1 space-y-1 ml-3">
                <Link to="/dashboard/deathcases">
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive("/dashboard/deathcases")
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}>
                    <Skull size={18} className="flex-shrink-0" />
                    <span className="text-sm">{t("death_cases")}</span>
                  </div>
                </Link>
                <Link to="/dashboard/prisoncases">
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive("/dashboard/prisoncases")
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}>
                    <ShieldAlert size={18} className="flex-shrink-0" />
                    <span className="text-sm">{t("prison_cases")}</span>
                  </div>
                </Link>
                <Link to="/dashboard/escapecases">
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive("/dashboard/escapecases")
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}>
                    <Footprints size={18} className="flex-shrink-0" />
                    <span className="text-sm">{t("escape_cases")}</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Assets */}
          <Link
            to="/dashboard/assets"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive("/dashboard/assets")
                ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Package size={20} className="flex-shrink-0" />
            {isOpen && <span className="text-sm">{t("assets")}</span>}
          </Link>

          {/* Logs */}
          {isAdmin && (
            <Link
              to="/dashboard/logs"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive("/dashboard/logs")
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Scroll size={20} className="flex-shrink-0" />
              {isOpen && <span className="text-sm">{t("logs")}</span>}
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
};

export default DashSidebar;
