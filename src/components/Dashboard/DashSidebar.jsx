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
  Package,
  ShoppingCart,
  Coins,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const DashSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isAdmin, isFinanceAdmin, isFinanceEmployee, isSpecialPapersManager, isSpecialPapersEmployee, isOperationManager, isOperationEmployee } = useAuth();

  const isArabic = i18n.language === "ar";

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Helper to check if route is active
  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const isFinanceRole = isFinanceAdmin || isFinanceEmployee;
  const isSpecialPapersRole = isAdmin || isSpecialPapersManager || isSpecialPapersEmployee;
  const isAssetsRole = !isFinanceRole; // Finance roles don't see assets

  const navItems = [
    { to: "/dashboard", icon: Home, label: t("home"), show: true, exact: true },
    { to: "/dashboard/users", icon: Users, label: t("users"), show: isAdmin },
    { to: "/dashboard/incomings", icon: FileText, label: t("incomings"), show: !isFinanceRole },
    { to: "/dashboard/outgoings", icon: FileText, label: t("outgoings"), show: !isFinanceRole },
    { to: "/dashboard/purchaseorders", icon: ShoppingCart, label: t("purchase_orders"), show: true },
    { to: "/dashboard/collectionorders", icon: Coins, label: t("collection_orders"), show: true },
    { to: "/dashboard/deathcases", icon: Skull, label: t("death_cases"), show: !isFinanceRole },
    { to: "/dashboard/prisoncases", icon: ShieldAlert, label: t("prison_cases"), show: !isFinanceRole },
    { to: "/dashboard/assets", icon: Package, label: t("assets"), show: isAssetsRole },
    { to: "/dashboard/logs", icon: Scroll, label: t("logs"), show: isAdmin || isFinanceAdmin},
  ];

  return (
    <div
      className={`flex screen sticky top-0 ${
        isArabic ? "border-l" : "border-r"
      } border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-lg z-50`}
    >
      <div
        className={`h-full transition-all duration-300 ease-in-out ${
          isOpen ? "w-56" : "w-16"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 py-4 px-3">
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="mt-2 space-y-1 px-2">
          {navItems.map((item) => {
            if (!item.show) return null;
            const active = item.exact 
              ? location.pathname === item.to
              : isActive(item.to);
            
            return (
              <div key={item.to} className="relative group">
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {isOpen && <span className="text-sm truncate">{item.label}</span>}
                </Link>

                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div
                    className={`absolute z-[999] invisible group-hover:visible bg-gray-900 dark:bg-gray-600 text-white text-[11px] font-medium rounded px-2 py-1 shadow-xl whitespace-nowrap top-1/2 -translate-y-1/2 ${
                      isArabic ? "right-full mr-3" : "left-full ml-3"
                    } transition-opacity duration-300 pointer-events-none`}
                  >
                    {item.label}
                    {/* Tooltip Arrow */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 border-[5px] border-transparent ${
                        isArabic
                          ? "left-full border-l-gray-900 dark:border-l-gray-600"
                          : "right-full border-r-gray-900 dark:border-r-gray-600"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default DashSidebar;
