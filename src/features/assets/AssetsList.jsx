import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetAssetsQuery } from "./assetsApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const AssetsList = () => {
  const { t } = useTranslation();
  const { roles } = useAuth(); // get roles array from token

  const {
    data: assetsData,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetAssetsQuery("assetsList", {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) return <LoadingSpinner />;

  if (isError)
    return (
      <div className="p-4 text-red-700 dark:text-red-400 bg-red-100 dark:bg-gray-800 rounded-lg">
        {error?.data?.message || t("error_loading_assets")}
      </div>
    );

  if (isSuccess && assetsData?.ids?.length > 0) {
    const assetsList = assetsData.ids.map((id) => assetsData.entities[id]);

    const sortedList = [...assetsList].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const columns = [
      { field: "identifier", header: t("asset_id") },
      { field: "description", header: t("description") },
      { field: "employeeName", header: t("employee_name") },
      { field: "department", header: t("department") },
      { field: "addedinJisr", header: t("added_in_jisr") },
      { field: "handoverDate", header: t("handover_date") },
      { field: "comment", header: t("comment") },
      { field: "edit", header: t("edit") },
    ];

    const transformedData = sortedList.map((asset) => ({
      ...asset,
      addedinJisr: asset.addedinJisr ? t("yes") : t("no"),
      edit: (
        <Link
          to={`/dashboard/assets/edit/${asset.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:shadow-sm group font-medium"
        >
          <Pencil size={14} className="group-hover:rotate-12 transition-transform" />
          {t("edit")}
        </Link>
      ),
    }));
    
    return (
      <>
        {/* Header */}
        <div className="flex items-center mb-4 p-1">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            🗂️ {t("assets")}
          </h1>
          <div className="relative group ms-auto">
            <Link
              to="/dashboard/assets/add"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
            >
              <Plus size={20} />
            </Link>
            <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
              {t("add_asset")}
            </div>
          </div>
        </div>

        <DataTableWrapper
          data={transformedData}
          columns={columns}
          title={t("assets_list")}
        />
      </>
    );
  }

  return (
    <div className="text-center text-gray-500 dark:text-gray-400 p-6">
      {t("no_assets_found")}
    </div>
  );
};

export default AssetsList;
