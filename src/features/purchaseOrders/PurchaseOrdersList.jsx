import { useTranslation } from "react-i18next";
import { useGetPurchaseOrdersQuery } from "./purchaseOrdersApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import PurchaseOrderPrint from "./PurchaseOrderPrint";

const PurchaseOrdersList = () => {
  const { t } = useTranslation();

  const {
    data: purchaseOrders,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetPurchaseOrdersQuery("purchaseOrdersList", {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <div
        className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
        role="alert"
      >
        <span className="font-medium">Alert! :</span> {error?.data?.message}
      </div>
    );
  }

  if (isSuccess) {
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

    const columns = [
      { field: "print", header: t("print") },
      { field: "purchasingId", header: t("purchasing_id") },
      { field: "status", header: t("po_status") },
      { field: "dayName", header: t("day_name") },
      { field: "dateHijri", header: t("date_hijri") },
      { field: "dateAD", header: t("date_ad") },
      { field: "paymentMethod", header: t("payment_method") },
      { field: "bankName", header: t("bank_name") },
      { field: "ibanNumber", header: t("iban_number") },
      { field: "managementName", header: t("management_name") },
      { field: "supplier", header: t("supplier") },
      { field: "item", header: t("item") },
      { field: "totalAmount", header: t("total_amount") },
      { field: "totalAmountText", header: t("total_amount_text") },
      { field: "deductedFrom", header: t("deducted_from") },
      { field: "addedTo", header: t("added_to") },
      { field: "createdAt", header: t("createdAt") },
      { field: "updatedAt", header: t("updatedAt") },
      { field: "edit", header: t("edit") },
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
      purchasingId: item.purchasingId || "—",
      status: getStatusBadge(item.status),
      dayName: convertDayNameToArabic(item.dayName), // Always show in Arabic
      paymentMethod: paymentMethodTranslations[item.paymentMethod] || item.paymentMethod || "—",
      bankName: item.bankName || "—",
      ibanNumber: item.ibanNumber || "—",
      managementName: item.managementName || "—",
      supplier: item.supplier || "—",
      item: item.item || "—",
      totalAmount: item.totalAmount ? `${item.totalAmount.toLocaleString()} ${t("sar")}` : "—",
      totalAmountText: item.totalAmountText || "—",
      deductedFrom: item.deductedFrom || "—",
      addedTo: item.addedTo || "—",
      createdAt: new Date(item.createdAt).toLocaleDateString(),
      updatedAt: new Date(item.updatedAt).toLocaleDateString(),
      edit: (
        <Link
          to={`/dashboard/purchaseorders/edit/${item.id}`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {t("edit")}
        </Link>
      ),
    }));

    const totalAmount = purchaseOrderList.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    return (
      <>
        <div className="flex items-center mb-2 p-1">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            🛒 {t("purchase_orders")}
          </h1>
          <div className="relative group ms-auto">
            <Link
              to="/dashboard/purchaseorders/add"
              className="mr-auto w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
              data-tooltip-target="tooltip-right"
            >
              <Plus size={20} />
            </Link>
            <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
              {t("add_purchase_order")}
            </div>
          </div>
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
              {totalAmount.toLocaleString()} {t("sar")}
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

          {/* Last Supplier */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("last_supplier")}
            </p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {sortedList.length > 0 ? sortedList[0].supplier : "—"}
            </h3>
          </div>
        </div>

        <DataTableWrapper
          data={transformedData}
          columns={columns}
          title={t("purchase_orders_list")}
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
