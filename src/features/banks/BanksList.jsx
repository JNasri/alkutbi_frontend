import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useGetBanksSummaryQuery, useDeleteBankMutation } from "./banksApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { prefetchHandlers } from "../../hooks/usePrefetch";
import useAuth from "../../hooks/useAuth";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { Calendar } from "primereact/calendar";

const formatDateParam = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const BanksList = () => {
  const { t } = useTranslation();
  const { isAdmin, isFinanceAdmin } = useAuth();
  const [deleteBank] = useDeleteBankMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  const summaryQuery = useMemo(() => {
    const from = formatDateParam(dateRange?.[0]);
    const to = formatDateParam(dateRange?.[1] || dateRange?.[0]);

    return {
      dateBasis: "createdAt",
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    };
  }, [dateRange]);

  const {
    data: banksSummary,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetBanksSummaryQuery(summaryQuery, {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: 300,
  });

  if (isLoading && !banksSummary) return <LoadingSpinner />;

  if (isError)
    return (
      <div className="p-4 text-red-700 dark:text-red-400 bg-red-100 dark:bg-gray-800 rounded-lg">
        {error?.data?.message || t("error_loading_banks")}
      </div>
    );

  const canManage = isAdmin || isFinanceAdmin;

  if (isSuccess) {
    const banksList = banksSummary || [];

    const columns = [
      { field: "name", header: t("bank_name") },
      { field: "ibanNumber", header: t("iban_number") },
      { field: "totalCollectionOrders", header: t("total_collection_orders") },
      { field: "totalPurchaseOrders", header: t("total_purchase_orders") },
      { field: "balance", header: t("balance") },
      { field: "actions", header: t("actions") },
    ];

    const transformedData = banksList.map((bank) => {
      const coTotal = Number(bank.totalCollectionOrders) || 0;
      const poTotal = Number(bank.totalPurchaseOrders) || 0;
      const balance = Number(bank.balance) || 0;
      const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return {
        ...bank,
        totalCollectionOrders: fmt(coTotal),
        totalPurchaseOrders: fmt(poTotal),
        balance: fmt(balance),
      };
    }).map((bank) => ({
      ...bank,
      actions: (
        <div className="flex items-center gap-2">
          {canManage && (
            <Link
              to={`/dashboard/banks/edit/${bank.id}`}
              {...prefetchHandlers(`/dashboard/banks/edit/${bank.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:shadow-sm group font-medium"
            >
              <Pencil size={14} className="group-hover:rotate-12 transition-transform" />
            </Link>
          )}
          {canManage && (
            <button
              onClick={() => {
                setItemToDelete(bank.id);
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
        <div className="flex items-center mb-4 p-1">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            🏦 {t("banks")}
          </h1>
          <div className="flex items-center gap-2 ms-auto">
            {/* New Date Picker for Bank Totals */}
            <div className="relative group flex items-center">
              <Calendar
                value={dateRange}
                onChange={(e) => setDateRange(e.value)}
                selectionMode="range"
                dateFormat="yy-mm-dd"
                showIcon
                showButtonBar
                readOnlyInput
                placeholder={t("select_date")}
                className="w-56 sm:w-[18rem] bg-gray-100 hover:bg-gray-200 border border-gray-500 dark:border-white dark:bg-gray-900 rounded-full overflow-hidden text-sm h-10 transition-colors"
                inputClassName="bg-transparent border-none text-gray-800 dark:text-gray-100 text-sm font-medium w-full px-3 py-2 outline-none h-full"
              />
            </div>

            <div className="relative group">
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  await refetch();
                  setIsRefreshing(false);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw size={20} className={`${isFetching ? "animate-spin" : ""}`} />
              </button>
              <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
                {t("refresh")}
              </div>
            </div>

            {canManage && (
              <div className="relative group">
                <Link
                  to="/dashboard/banks/add"
                  {...prefetchHandlers("/dashboard/banks/add")}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
                >
                  <Plus size={20} />
                </Link>
                <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
                  {t("add_bank")}
                </div>
              </div>
            )}
          </div>
        </div>

        <DataTableWrapper
          data={transformedData}
          columns={columns}
          title={t("banks_list")}
          onRefresh={refetch}
          dateField={null}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            if (itemToDelete) {
              await deleteBank({ id: itemToDelete });
              toast.success(t("bank_deleted_successfully"));
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
      {t("no_banks_found")}
    </div>
  );
};

export default BanksList;
