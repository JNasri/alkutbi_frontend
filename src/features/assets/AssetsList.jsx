import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useGetAssetsQuery, useDeleteAssetMutation } from "./assetsApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";

const AssetsList = () => {
  const { t } = useTranslation();
  const { canEditAssets, canAddAssets, canDelete } = useAuth(); // get permission flags
  const [deleteAsset] = useDeleteAssetMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isInitialSync, setIsInitialSync] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: assetsData,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetAssetsQuery("assetsList", {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    const syncData = async () => {
      await refetch();
      setIsInitialSync(false);
    };
    syncData();
  }, [refetch]);

  if (isInitialSync || (isLoading && !assetsData)) return <LoadingSpinner />;

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
      { field: "actions", header: t("actions") },
    ];

    const transformedData = sortedList.map((asset) => ({
      ...asset,
      addedinJisr: asset.addedinJisr ? t("yes") : t("no"),
      actions: (
        <div className="flex items-center gap-2">
          {canEditAssets && (
            <Link
              to={`/dashboard/assets/edit/${asset.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:shadow-sm group font-medium"
            >
              <Pencil size={14} className="group-hover:rotate-12 transition-transform" />
            </Link>
          )}
          {canDelete && (
            <button
              onClick={() => {
                setItemToDelete(asset.id);
                setShowDeleteModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 transition-all hover:bg-red-100 dark:hover:bg-red-900/50 hover:shadow-sm group font-medium cursor-pointer"
            >
              <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
      ),
    }));
    
    return (
      <>
        {/* Header */}
        <div className="flex items-center mb-4 p-1">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            🗂️ {t("assets")}
          </h1>
          <div className="flex items-center gap-2 ms-auto">
            <div className="relative group">
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  await refetch();
                  setIsRefreshing(false);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw size={20} className={`${isFetching ? "animate-spin" : ""}`} />
              </button>
              <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
                {t("refresh")}
              </div>
            </div>

            {canAddAssets && (
              <div className="relative group">
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
            )}
          </div>
        </div>

        <DataTableWrapper
          data={transformedData}
          columns={columns}
          title={t("assets_list")}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            if (itemToDelete) {
              await deleteAsset({ id: itemToDelete });
              toast.success(t("asset_deleted_successfully"));
              setShowDeleteModal(false);
              setItemToDelete(null);
            }
          }}
        />
        {isRefreshing && <LoadingSpinner />}
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
