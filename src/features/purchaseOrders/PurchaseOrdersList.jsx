import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useGetPurchaseOrdersQuery, useDeletePurchaseOrderMutation } from "./purchaseOrdersApiSlice";
import { useGetCollectionOrdersQuery } from "../collectionOrders/collectionOrdersApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { Plus, Paperclip, Pencil, Trash2 } from "lucide-react";
import PurchaseOrderPrint from "./PurchaseOrderPrint";
import useAuth from "../../hooks/useAuth";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";

const PurchaseOrdersList = () => {
  const { t } = useTranslation();
  const { canEditFinance, canAddFinance, canDeleteFinance, isFinanceEmployee, username } = useAuth();
  const [deletePurchaseOrder] = useDeletePurchaseOrderMutation();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const {
    data: purchaseOrders,
    isLoading: isLoadingPO,
    isSuccess: isSuccessPO,
    isError: isErrorPO,
    error: errorPO,
    refetch: refetchPO,
  } = useGetPurchaseOrdersQuery("purchaseOrdersList", {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: collectionOrders,
    isLoading: isLoadingCO,
    isSuccess: isSuccessCO,
    isError: isErrorCO,
    error: errorCO,
    refetch: refetchCO,
  } = useGetCollectionOrdersQuery("collectionOrdersList", {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  // Force refetch on mount to ensure status changes from edit forms are visible
  useEffect(() => {
    refetchPO();
    refetchCO();
  }, [refetchPO, refetchCO]);

  if (isLoadingPO || isLoadingCO) return <LoadingSpinner />;

  if (isErrorPO || isErrorCO) {
    return (
      <div
        className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
        role="alert"
      >
        <span className="font-medium">Alert! :</span> {errorPO?.data?.message || errorCO?.data?.message}
      </div>
    );
  }

  if (isSuccessPO && isSuccessCO) {
    const purchaseOrderList = purchaseOrders.ids.map(
      (id) => purchaseOrders.entities[id]
    );

    const sortedList = [...purchaseOrderList].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    if (!purchaseOrderList || purchaseOrderList.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 p-6">
          {t("no_purchase_orders_found")}
        </div>
      );
    }

    const paymentMethodTranslations = {
      cash: t("cash"),
      visa: t("visa"),
      bank_transfer: t("bank_transfer"),
      sadad: t("sadad"),
    };

    const transactionTypeTranslations = {
      expenses: t("expenses"),
      receivables: t("receivables"),
      custody: t("custody"),
      advance: t("advance"),
    };

    const columns = [
      { field: "print", header: t("print"), autoWidth: true },
      { field: "attachment", header: t("Voucher.file"), autoWidth: true },
      { field: "purchasingId", header: t("purchasing_id"), nowrap: true },
      { field: "issuer", header: t("issuer_purchase"), nowrap: true },
      { field: "transactionType", header: t("transaction_type") },
      { field: "status", header: t("po_status"), nowrap: true },
      { field: "dayName", header: t("day_name"), nowrap: true },
      { field: "dateHijri", header: t("date_hijri"), nowrap: true },
      { field: "dateAD", header: t("date_ad"), nowrap: true },
      { field: "paymentMethod", header: t("payment_method") },
      { field: "bankNameFrom", header: t("bank_name_from") },
      { field: "ibanNumberFrom", header: t("iban_number_from") },
      { field: "bankNameTo", header: t("bank_name_to") },
      { field: "ibanNumberTo", header: t("iban_number_to") },
      { field: "managementName", header: t("management_name") },
      { field: "supplier", header: t("supplier") },
      { field: "item", header: t("item") },
      { field: "totalAmount", header: t("total_amount"), nowrap: true },
      { field: "totalAmountText", header: t("total_amount_text") },
      { field: "deductedFrom", header: t("deducted_from") },
      { field: "addedTo", header: t("added_to") },
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
      print: <PurchaseOrderPrint purchaseOrder={item} />,
      attachment: item.fileUrl ? (
        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 flex justify-center">
          <Paperclip size={20} />
        </a>
      ) : (
        <span className="text-gray-300 flex justify-center">—</span>
      ),
      purchasingId: item.purchasingId || "—",
      issuer: item.issuer?.ar_name || item.issuer?.username || "—",
      transactionType: transactionTypeTranslations[item.transactionType] || item.transactionType || "—",
      status: getStatusBadge(item.status),
      dayName: convertDayNameToArabic(item.dayName), // Always show in Arabic
      paymentMethod: paymentMethodTranslations[item.paymentMethod] || item.paymentMethod || "—",
      bankNameFrom: item.bankNameFrom || "—",
      ibanNumberFrom: item.ibanNumberFrom || "—",
      bankNameTo: item.bankNameTo || "—",
      ibanNumberTo: item.ibanNumberTo || "—",
      managementName: item.managementName || "—",
      supplier: item.supplier || "—",
      item: item.item || "—",
      totalAmount: item.totalAmount ? `${item.totalAmount.toLocaleString()} ${t("sar")}` : "—",
      totalAmountText: item.totalAmountText || "—",
      deductedFrom: item.deductedFrom || "—",
      addedTo: item.addedTo || "—",
      createdAt: new Date(item.createdAt).toLocaleDateString(),
      updatedAt: new Date(item.updatedAt).toLocaleDateString(),
      actions: (
        <div className="flex items-center gap-2">
          {(canEditFinance || (isFinanceEmployee && item.issuer?.username === username)) && (
            <Link
              to={`/dashboard/purchaseorders/edit/${item.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:shadow-sm group font-medium"
            >
              <Pencil size={14} className="group-hover:rotate-12 transition-transform" />
            </Link>
          )}
          {(canDeleteFinance || (isFinanceEmployee && item.issuer?.username === username)) && (
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

    const totalPurchaseAmount = purchaseOrderList.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    const collectionOrderList = collectionOrders.ids.map(
      (id) => collectionOrders.entities[id]
    );

    const totalCollectionAmount = collectionOrderList.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    const balance = totalCollectionAmount - totalPurchaseAmount;

    return (
      <>
        <div className="flex items-center mb-2 p-1">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            🛒 {t("purchase_orders")}
          </h1>
          {canAddFinance && (
            <div className="relative group ms-auto">
              <Link
                to="/dashboard/purchaseorders/add"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
              >
                <Plus size={20} />
              </Link>
              <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
                {t("add_purchase_order")}
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Purchase Orders */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("total_purchase_orders")}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {purchaseOrderList.length}
            </h3>
          </div>

          {/* Total Amount */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("total_amount_sum")}
            </p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalPurchaseAmount.toLocaleString()} {t("sar")}
            </h3>
          </div>

          {/* Last Added Date */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("last_purchase_order_date")}
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
          title={t("purchase_orders_list")}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            if (itemToDelete) {
              await deletePurchaseOrder({ id: itemToDelete });
              toast.success(t("purchase_order_deleted_successfully"));
              setShowDeleteModal(false);
              setItemToDelete(null);
            }
          }}
        />
      </>
    );
  }

  return (
    <div className="text-center text-gray-500 dark:text-gray-400 p-6">
      {t("no_purchase_orders_found")}
    </div>
  );
};

export default PurchaseOrdersList;
