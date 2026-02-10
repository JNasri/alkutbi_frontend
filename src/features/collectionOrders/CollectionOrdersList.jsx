import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useGetCollectionOrdersQuery, useDeleteCollectionOrderMutation } from "./collectionOrdersApiSlice";
import { useGetPurchaseOrdersQuery } from "../purchaseOrders/purchaseOrdersApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { Plus, Paperclip, Pencil, Trash2, RefreshCw } from "lucide-react";
import CollectionOrderPrint from "./CollectionOrderPrint";
import useAuth from "../../hooks/useAuth";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";

const CollectionOrdersList = () => {
  const { t } = useTranslation();
  const { canEditFinance, canAddFinance, canDeleteFinance, isFinanceEmployee, isFinanceSubAdmin, username } = useAuth();
  const [deleteCollectionOrder] = useDeleteCollectionOrderMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isInitialSync, setIsInitialSync] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: collectionOrders,
    isLoading: isLoadingCO,
    isSuccess: isSuccessCO,
    isError: isErrorCO,
    error: errorCO,
    refetch: refetchCO,
    isFetching: isFetchingCO,
  } = useGetCollectionOrdersQuery("collectionOrdersList", {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: purchaseOrders,
    isLoading: isLoadingPO,
    isSuccess: isSuccessPO,
    isError: isErrorPO,
    error: errorPO,
    refetch: refetchPO,
    isFetching: isFetchingPO,
  } = useGetPurchaseOrdersQuery("purchaseOrdersList", {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  // Force refetch on mount to ensure status changes from edit forms are visible
  useEffect(() => {
    const syncData = async () => {
      await Promise.all([refetchCO(), refetchPO()]);
      setIsInitialSync(false);
    };
    syncData();
  }, [refetchCO, refetchPO]);

  if (isInitialSync || (isLoadingCO && !collectionOrders) || (isLoadingPO && !purchaseOrders)) return <LoadingSpinner />;

  if (isErrorCO || isErrorPO) {
    return (
      <div
        className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
        role="alert"
      >
        <span className="font-medium">Alert! :</span> {errorCO?.data?.message || errorPO?.data?.message}
      </div>
    );
  }

  if (isSuccessCO && isSuccessPO) {
    const collectionOrderList = collectionOrders.ids.map(
      (id) => collectionOrders.entities[id]
    );

    const sortedList = [...collectionOrderList].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    if (!collectionOrderList || collectionOrderList.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 p-6">
          {t("no_collection_orders_found")}
        </div>
      );
    }

    const collectMethodTranslations = {
      cash: t("cash"),
      bank_transfer: t("bank_transfer"),
    };

    const collectedFromTranslations = {
      umrah: t("umrah"),
      transport: t("transport"),
      hotels: t("hotels"),
      others: t("others_external"),
      additional: t("additional"),
    };

    const columns = [
      { field: "print", header: t("print"), autoWidth: true },
      { field: "attachments", header: t("attachments"), autoWidth: true },
      { field: "collectingId", header: t("collecting_id"), nowrap: true },
      { field: "issuer", header: t("issuer_collection"), nowrap: true },
      { field: "collectedFrom", header: t("collected_from") },
      { field: "status", header: t("status"), nowrap: true },
      { field: "dayName", header: t("day_name"), nowrap: true },
      { field: "dateHijri", header: t("date_hijri"), nowrap: true },
      { field: "dateAD", header: t("date_ad"), nowrap: true },
      { field: "collectMethod", header: t("collect_method") },
      { field: "voucherNumber", header: t("voucher_number") },
      { field: "receivingBankName", header: t("receiving_bank_name") },
      { 
        field: "totalAmount", 
        header: t("total_amount"), 
        nowrap: true,
        body: (item) => item.totalAmount ? `${item.totalAmount.toLocaleString()} ${t("sar")}` : "—"
      },
      { field: "totalAmountText", header: t("total_amount_text") },
      { field: "deductedFrom", header: t("deducted_from") },
      { field: "addedTo", header: t("added_to") },
      { field: "notes", header: t("notes") },
      { field: "createdAt", header: t("createdAt"), nowrap: true },
      { field: "updatedAt", header: t("updatedAt"), nowrap: true },
      { field: "actions", header: t("actions"), autoWidth: true },
    ];

    const getStatusBadge = (status) => {
      const statusConfig = {
        new: { label: t("status_new"), color: "bg-blue-500" },
        audited: { label: t("status_audited"), color: "bg-orange-500" },
        authorized: { label: t("status_authorized"), color: "bg-yellow-500" },
        finalized: { label: t("status_finalized"), color: "bg-green-500" },
      };

      const config = statusConfig[status] || statusConfig.new;
      
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-medium ${config.color}`}>
          <span className="w-2 h-2 rounded-full bg-white"></span>
          {config.label}
        </span>
      );
    };

    // Convert English day names to Arabic (in case old data has English names)
    const convertDayNameToArabic = (dayName) => {
      if (!dayName) return "—";
      
      const dayMap = {
        "Sunday": "الأحد",
        "Monday": "الإثنين",
        "Tuesday": "الثلاثاء",
        "Wednesday": "الأربعاء",
        "Thursday": "الخميس",
        "Friday": "الجمعة",
        "Saturday": "السبت",
      };
      
      // If it's already in Arabic, return as is
      if (dayName.match(/[\u0600-\u06FF]/)) {
        return dayName;
      }
      
      // Convert English to Arabic
      return dayMap[dayName] || dayName;
    };

    const transformedData = sortedList.map((item) => ({
      ...item,
      print: <CollectionOrderPrint collectionOrder={item} />,
      attachments: (
        <div className="flex items-center justify-center gap-2">
          {item.receiptUrl ? (
            <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer" title={t("receipt")} className="text-blue-500 hover:text-blue-700">
              <Paperclip size={20} />
            </a>
          ) : item.fileUrl ? (
            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" title={t("attachment")} className="text-blue-500 hover:text-blue-700">
              <Paperclip size={20} />
            </a>
          ) : null}
          {item.orderPrintUrl ? (
            <a href={item.orderPrintUrl} target="_blank" rel="noopener noreferrer" title={t("order_print")} className="text-green-500 hover:text-green-700">
              <Paperclip size={20} />
            </a>
          ) : null}
          {!item.receiptUrl && !item.orderPrintUrl && !item.fileUrl && <span className="text-gray-300">—</span>}
        </div>
      ),
      notes: item.notes ? (
        <div className="max-w-[150px] truncate" title={item.notes}>
          {item.notes}
        </div>
      ) : "—",
      collectingId: item.collectingId || "—",
      issuer: item.issuer?.ar_name || item.issuer?.username || "—",
      collectedFrom: collectedFromTranslations[item.collectedFrom] || item.collectedFrom || "—",
      status: getStatusBadge(item.status),
      dayName: convertDayNameToArabic(item.dayName), // Always show in Arabic
      collectMethod: collectMethodTranslations[item.collectMethod] || item.collectMethod || "—",
      voucherNumber: item.voucherNumber || "—",
      receivingBankName: item.receivingBankName || "—",
      totalAmount: item.totalAmount || 0,
      totalAmountText: item.totalAmountText || "—",
      deductedFrom: item.deductedFrom || "—",
      addedTo: item.addedTo || "—",
      createdAt: new Date(item.createdAt).toLocaleDateString(),
      updatedAt: new Date(item.updatedAt).toLocaleDateString(),
      actions: (
        <div className="flex items-center gap-2">
          {(canEditFinance || ((isFinanceEmployee || isFinanceSubAdmin) && item.issuer?.username === username)) && (
            <Link
              to={`/dashboard/collectionorders/edit/${item.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:shadow-sm group font-medium"
            >
              <Pencil size={14} className="group-hover:rotate-12 transition-transform" />
            </Link>
          )}
          {(canDeleteFinance || ((isFinanceEmployee || isFinanceSubAdmin) && item.issuer?.username === username)) && (
            <button
              onClick={() => {
                setItemToDelete(item.id);
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

    const totalCollectionAmount = collectionOrderList.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    const purchaseOrderList = purchaseOrders.ids.map(
      (id) => purchaseOrders.entities[id]
    );

    const totalPurchaseAmount = purchaseOrderList.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    const balance = totalCollectionAmount - totalPurchaseAmount;

    return (
      <>
        <div className="flex items-center mb-2 p-1">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            💰 {t("collection_orders")}
          </h1>
          <div className="flex items-center gap-2 ms-auto">
            <div className="relative group">
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  await Promise.all([refetchCO(), refetchPO()]);
                  setIsRefreshing(false);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw size={20} className={`${(isFetchingCO || isFetchingPO) ? "animate-spin" : ""}`} />
              </button>
              <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
                {t("refresh")}
              </div>
            </div>

            {canAddFinance && (
              <div className="relative group">
                <Link
                  to="/dashboard/collectionorders/add"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
                >
                  <Plus size={20} />
                </Link>
                <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
                  {t("add_collection_order")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Collection Orders */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("total_collection_orders")}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {collectionOrderList.length}
            </h3>
          </div>

          {/* Total Amount */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("total_amount_sum")}
            </p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalCollectionAmount.toLocaleString()} {t("sar")}
            </h3>
          </div>

          {/* Last Added Date */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("last_collection_order_date")}
            </p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {sortedList.length > 0
                ? new Date(sortedList[0].createdAt).toLocaleDateString()
                : "—"}
            </h3>
          </div>

          {/* Total Balance */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("total_balance")}
            </p>
            <h3 className={`text-lg font-bold ${balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {balance.toLocaleString()} {t("sar")}
            </h3>
          </div>
        </div>

        <DataTableWrapper
          data={transformedData}
          columns={columns}
          title={t("collection_orders_list")}
          sumField="totalAmount"
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            if (itemToDelete) {
              await deleteCollectionOrder({ id: itemToDelete });
              toast.success(t("collection_order_deleted_successfully"));
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
      {t("no_collection_orders_found")}
    </div>
  );
};

export default CollectionOrdersList;
