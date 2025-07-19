import React from "react";
import { useTranslation } from "react-i18next";

const DashFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="flex items-center justify-between h-16 border-t border-gray-200 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm px-6">
      <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
        © 2025 {t("alkutbi")} |{" "}
        {t("footer_rights", { defaultValue: "All rights reserved" })}
      </span>
      <span className="text-xs text-gray-400 dark:text-gray-400">
        Powered by <span className="font-extrabold">Nasri</span>
      </span>
    </footer>
  );
};

export default DashFooter;
