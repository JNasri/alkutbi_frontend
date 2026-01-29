import { useTranslation } from "react-i18next";
import { useGetCollectionOrdersQuery } from "./collectionOrdersApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import CollectionOrderPrint from "./CollectionOrderPrint";

const CollectionOrdersList = () => {
  const { t } = useTranslation();

  const {
    data: collectionOrders,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetCollectionOrdersQuery("collectionOrdersList", {
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
      { field: "print", header: t("print"), width: "80px" },
      { field: "collectingId", header: t("collecting_id"), width: "180px" },
      { field: "collectedFrom", header: t("collected_from"), width: "150px" },
      { field: "status", header: t("status"), width: "150px" },
      { field: "dayName", header: t("day_name"), width: "120px" },
      { field: "dateHijri", header: t("date_hijri"), width: "150px" },
      { field: "dateAD", header: t("date_ad"), width: "150px" },
      { field: "collectMethod", header: t("collect_method"), width: "150px" },
      { field: "voucherNumber", header: t("voucher_number"), width: "180px" },
      { field: "receivingBankName", header: t("receiving_bank_name"), width: "200px" },
      { field: "totalAmount", header: t("total_amount"), width: "150px" },
      { field: "totalAmountText", header: t("total_amount_text"), width: "400px" },
      { field: "createdAt", header: t("createdAt"), width: "150px" },
      { field: "updatedAt", header: t("updatedAt"), width: "150px" },
      { field: "edit", header: t("edit"), width: "80px" },
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
      collectingId: item.collectingId || "—",
      collectedFrom: collectedFromTranslations[item.collectedFrom] || item.collectedFrom || "—",
      status: getStatusBadge(item.status),
      dayName: convertDayNameToArabic(item.dayName), // Always show in Arabic
      collectMethod: collectMethodTranslations[item.collectMethod] || item.collectMethod || "—",
      voucherNumber: item.voucherNumber || "—",
      receivingBankName: item.receivingBankName || "—",
      totalAmount: item.totalAmount ? `${item.totalAmount.toLocaleString()} ${t("sar")}` : "—",
      totalAmountText: item.totalAmountText || "—",
      createdAt: new Date(item.createdAt).toLocaleDateString(),
      updatedAt: new Date(item.updatedAt).toLocaleDateString(),
      edit: (
        <Link
          to={`/dashboard/collectionorders/edit/${item.id}`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {t("edit")}
        </Link>
      ),
    }));

    const totalAmount = collectionOrderList.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    return (
      <>
        <div className="flex items-center mb-2 p-1">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            💰 {t("collection_orders")}
          </h1>
          <div className="relative group ms-auto">
            <Link
              to="/dashboard/collectionorders/add"
              className="mr-auto w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
              data-tooltip-target="tooltip-right"
            >
              <Plus size={20} />
            </Link>
            <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
              {t("add_collection_order")}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
              {totalAmount.toLocaleString()} {t("sar")}
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
        </div>

        <DataTableWrapper
          data={transformedData}
          columns={columns}
          title={t("collection_orders_list")}
        />
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
