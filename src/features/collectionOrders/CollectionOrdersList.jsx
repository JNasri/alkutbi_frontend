import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useGetCollectionOrdersQuery, useDeleteCollectionOrderMutation, useAddBulkCollectionOrdersMutation } from "./collectionOrdersApiSlice";
import { useGetPurchaseOrdersQuery } from "../purchaseOrders/purchaseOrdersApiSlice";
import { useGetSignedUrlMutation } from "../s3/s3ApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { prefetchHandlers } from "../../hooks/usePrefetch";
import { Plus, Paperclip, Pencil, Trash2, RefreshCw, Upload, X, CheckCircle } from "lucide-react";
import CollectionOrderPrint from "./CollectionOrderPrint";
import useAuth from "../../hooks/useAuth";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import * as XLSX from "xlsx";
import moment from "moment-hijri";
import { numberToArabicText } from "../../utils/numberToArabicText";
import { useGetBanksQuery } from "../banks/banksApiSlice";


const AttachmentButton = ({ s3Key, iconColorClass, title }) => {
  const [getSignedUrl, { isLoading }] = useGetSignedUrlMutation();

  const handleClick = async () => {
    if (!s3Key) return;
    try {
      const res = await getSignedUrl(s3Key).unwrap();
      window.open(res.url, "_blank");
    } catch (e) {
      toast.error("Failed to load attachment");
    }
  };

  return (
    <button onClick={handleClick} title={title} disabled={isLoading} className={`${iconColorClass} hover:opacity-80 transition disabled:opacity-50 cursor-pointer`}>
      {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Paperclip size={20} />}
    </button>
  );
};

const CollectionOrdersList = () => {
  const { t } = useTranslation();
  const { canEditFinance, canAddFinance, canDeleteFinance, isFinanceEmployee, isFinanceSubAdmin, username } = useAuth();
  const [deleteCollectionOrder] = useDeleteCollectionOrderMutation();
  const [addBulkCollectionOrders, { isLoading: isImporting }] = useAddBulkCollectionOrdersMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Excel import preview state
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [parsedRecords, setParsedRecords] = useState([]);

  const {
    data: collectionOrders,
    isLoading: isLoadingCO,
    isSuccess: isSuccessCO,
    isError: isErrorCO,
    error: errorCO,
    refetch: refetchCO,
    isFetching: isFetchingCO,
  } = useGetCollectionOrdersQuery("collectionOrdersList", {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: 300,
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
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: 300,
  });

  const { data: banksData } = useGetBanksQuery("banksList");

  // Build bank name → IBAN lookup from banks data
    const bankIbanMap = useMemo(() => {
      if (!banksData?.ids) return {};
      const map = {};
      banksData.ids.forEach((id) => {
        const bank = banksData.entities[id];
        if (bank?.name) map[bank.name.trim()] = bank.ibanNumber || "";
      });
      return map;
    }, [banksData]);



  if ((isLoadingCO && !collectionOrders) || (isLoadingPO && !purchaseOrders)) return <LoadingSpinner />;

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

    const statusWeight = {
      new: 1,
      audited: 2,
      authorized: 3,
      finalized: 4,
    };

    const sortedList = [...collectionOrderList].sort((a, b) => {
      const weightA = statusWeight[a.status] || 5;
      const weightB = statusWeight[b.status] || 5;
      if (weightA !== weightB) {
        return weightA - weightB;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

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

    const truncateWords = (text, maxWords) => {
      if (!text) return "—";
      const words = text.split(/\s+/);
      if (words.length <= maxWords) return text;
      return words.slice(0, maxWords).join(" ") + " ...";
    };

    const columns = [
      { 
        field: "print", 
        header: t("print"), 
        autoWidth: true,
        body: (item) => <CollectionOrderPrint collectionOrder={item} />
      },
      { 
        field: "attachments", 
        header: t("attachments"), 
        autoWidth: true,
        body: (item) => (
          <div className="flex items-center justify-center gap-2">
            {item.receiptUrl ? (
              <AttachmentButton s3Key={item.receiptUrl} title={t("receipt")} iconColorClass="text-blue-500 hover:text-blue-700" />
            ) : item.fileUrl ? (
              <AttachmentButton s3Key={item.fileUrl} title={t("attachment")} iconColorClass="text-blue-500 hover:text-blue-700" />
            ) : null}
            {item.orderPrintUrl ? (
              <AttachmentButton s3Key={item.orderPrintUrl} title={t("order_print")} iconColorClass="text-green-500 hover:text-green-700" />
            ) : null}
            {!item.receiptUrl && !item.orderPrintUrl && !item.fileUrl && <span className="text-gray-300">—</span>}
          </div>
        )
      },
      { field: "collectingId", header: t("collecting_id"), nowrap: true },
      { field: "issuerName", header: t("issuer_collection"), nowrap: true },
      { field: "collectedFrom", header: t("collected_from") },
      { 
        field: "status", 
        header: t("status"), 
        nowrap: true,
        body: (item) => getStatusBadge(item.statusKey)
      },
      { field: "dayName", header: t("day_name"), nowrap: true },
      { field: "dateHijri", header: t("date_hijri"), nowrap: true },
      { field: "dateAD", header: t("date_ad"), nowrap: true },
      { field: "collectMethod", header: t("collect_method") },
      { field: "voucherNumber", header: t("voucher_number") },
      { field: "item", header: t("item") },
      { field: "receivingBankName", header: t("receiving_bank_name") },
      { field: "receivingIbanNumber", header: t("iban_number_to") },
      { 
        field: "totalAmount", 
        header: t("total_amount"), 
        nowrap: true,
        body: (item) => item.totalAmount ? `${item.totalAmount.toLocaleString()} ${t("sar")}` : "—"
      },
      { field: "totalAmountText", header: t("total_amount_text") },
      { field: "deductedFrom", header: t("deducted_from") },
      { field: "addedTo", header: t("added_to") },
      { 
        field: "notes", 
        header: t("notes"),
        body: (rowData) => (
          <div title={rowData.notes}>
            {truncateWords(rowData.notes, 20)}
          </div>
        )
      },
      { field: "createdAt", header: t("createdAt"), nowrap: true },
      { field: "time", header: t("time"), nowrap: true },
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
      // Searchable fields (strings)
      issuerName: item.issuer?.ar_name || item.issuer?.username || "—",
      collectedFrom: collectedFromTranslations[item.collectedFrom] || item.collectedFrom || "—",
      status: (Object.values({
        new: t("status_new"),
        audited: t("status_audited"),
        authorized: t("status_authorized"),
        finalized: t("status_finalized"),
      })[Object.keys({new:1,audited:1,authorized:1,finalized:1}).indexOf(item.status)] || item.status || "—"),
      statusKey: item.status, // Used for Badge rendering logic
      dayName: convertDayNameToArabic(item.dayName),
      collectMethod: collectMethodTranslations[item.collectMethod] || item.collectMethod || "—",
      createdAt: new Date(item.createdAt).toLocaleDateString(),
      time: new Date(item.createdAt).toLocaleTimeString(),
      actions: (
        <div className="flex items-center gap-2">
          {(canEditFinance || ((isFinanceEmployee || isFinanceSubAdmin) && item.issuer?.username === username)) && (
            <Link
              to={`/dashboard/collectionorders/edit/${item.id}`}
              {...prefetchHandlers(`/dashboard/collectionorders/edit/${item.id}`)}
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

    const handleExcelImport = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const rawData = XLSX.utils.sheet_to_json(ws);

          if (rawData.length === 0) {
            toast.error(t("excel_empty"));
            return;
          }

          const formattedOrders = rawData.map((row) => {
            const collectedFrom = row["Collected From"] || row["collected from"] || row["مجال التحصيل"] || "";
            const adDate = row["AD Date"] || row["AD date"] || row["Date"] || row["التاريخ"];
            const totalAmount = row["Total Amount"] || row["total amount"] || row["Amount"] || row["المبلغ"];
            const voucherNumber = row["Voucher Number"] || row["voucher number"] || row["VoucherNumber"] || row["رقم السند"] || "";
            const item = row["Item"] || row["item"] || row["الصنف"] || "";
            const collectMethod = row["Collection Method"] || row["collect method"] || row["طريقة التحصيل"] || "";
            const receivingBankName = row["Receiving Bank Name"] || row["receivingbank name"] || row["اسم البنك المستقبل"] || "";
            const notes = row["Notes"] || row["notes"] || row["الملاحظات"] || "";

            if (!adDate || !totalAmount) return null;

            let jsDate;
            if (typeof adDate === "number") {
              jsDate = new Date((adDate - 25569) * 86400 * 1000);
            } else {
              // Try DD-MM-YYYY or DD/MM/YYYY format first
              const ddmmyyyy = String(adDate).match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
              if (ddmmyyyy) {
                jsDate = new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));
              } else {
                jsDate = new Date(adDate);
              }
            }

            if (isNaN(jsDate.getTime())) return null;

            const year = jsDate.getFullYear();
            const month = String(jsDate.getMonth() + 1).padStart(2, "0");
            const day = String(jsDate.getDate()).padStart(2, "0");
            const dateAD = `${year}-${month}-${day}`;

            const days = [
              "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"
            ];
            const dayName = days[jsDate.getDay()];
            const dateHijri = moment(jsDate).format("iYYYY/iM/iD");

            const amountValue = typeof totalAmount === "string" 
              ? parseFloat(totalAmount.replace(/,/g, "")) 
              : parseFloat(totalAmount);

            // Map collected from
            const cfMap = {
              "umrah": "umrah", "عمرة": "umrah",
              "transport": "transport", "نقل": "transport",
              "hotels": "hotels", "فنادق": "hotels",
              "others": "others", "أخرى": "others",
              "additional": "additional", "إضافي": "additional",
            };
            const mappedCf = cfMap[collectedFrom.toLowerCase()] || collectedFrom || "umrah";

            // Map collect method
            const cmMap =  {
              "cash": "cash", "نقدي": "cash",
              "visa": "visa", "الفيزا": "visa",
              "bank transfer": "bank_transfer", "bank_transfer": "bank_transfer", "تحويل بنكي": "bank_transfer",
              "sadad": "sadad", "سداد": "sadad",
            };
            const mappedCm = cmMap[collectMethod.toLowerCase()] || "cash";

            return {
              dateAD,
              dayName,
              dateHijri,
              totalAmount: amountValue,
              totalAmountText: numberToArabicText(amountValue),
              collectedFrom: mappedCf,
              collectMethod: mappedCm,
              receivingBankName: receivingBankName,
              ibanNumberFrom: bankIbanMap[receivingBankName.trim()] || "",
              voucherNumber: voucherNumber,
              item: item,
              notes: notes,
              status: "new"
            };
          }).filter(Boolean);

          if (formattedOrders.length === 0) {
            toast.error(t("no_valid_data_found"));
            return;
          }

          // Show preview modal instead of sending immediately
          setParsedRecords(formattedOrders);
          setShowImportPreview(true);
        } catch (error) {
          console.error("Excel parse error:", error);
          toast.error(t("excel_parse_error"));
        }
      };
      reader.readAsBinaryString(file);
      e.target.value = ""; // Reset file input
    };

    const handleConfirmImport = async () => {
      try {
        await addBulkCollectionOrders(parsedRecords).unwrap();
        toast.success(t("bulk_import_success", { count: parsedRecords.length }));
        setShowImportPreview(false);
        setParsedRecords([]);
      } catch (error) {
        console.error("Bulk import error:", error);
        toast.error(t("bulk_import_error"));
      }
    };

    const collectedFromLabels = {
      umrah: t("umrah"),
      transport: t("transport"),
      hotels: t("hotels"),
      others: t("others_external"),
      additional: t("additional"),
    };

    return (
      <>
        {/* Import Preview Modal */}
        {showImportPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-700">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Upload size={22} className="text-green-500" />
                    {t("import_preview_title")}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t("records_to_import", { count: parsedRecords.length })}
                  </p>
                </div>
                <button
                  onClick={() => { setShowImportPreview(false); setParsedRecords([]); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Modal Body - Scrollable table */}
              <div className="overflow-auto flex-1 p-4">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-10">
                    <tr>
                      <th className="px-3 py-2 text-start font-semibold text-gray-700 dark:text-gray-300">#</th>
                      <th className="px-3 py-2 text-start font-semibold text-gray-700 dark:text-gray-300">{t("collected_from")}</th>
                      <th className="px-3 py-2 text-start font-semibold text-gray-700 dark:text-gray-300">{t("date_ad")}</th>
                      <th className="px-3 py-2 text-start font-semibold text-gray-700 dark:text-gray-300">{t("total_amount")}</th>
                      <th className="px-3 py-2 text-start font-semibold text-gray-700 dark:text-gray-300">{t("voucher_number")}</th>
                      <th className="px-3 py-2 text-start font-semibold text-gray-700 dark:text-gray-300">{t("item")}</th>
                      <th className="px-3 py-2 text-start font-semibold text-gray-700 dark:text-gray-300">{t("collect_method")}</th>
                      <th className="px-3 py-2 text-start font-semibold text-gray-700 dark:text-gray-300">{t("receiving_bank_name")}</th>
                      <th className="px-3 py-2 text-start font-semibold text-gray-700 dark:text-gray-300">{t("notes")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRecords.map((record, index) => (
                      <tr key={index} className={`border-b border-gray-100 dark:border-gray-700`}>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400 font-mono">{index + 1}</td>

                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{collectedFromLabels[record.collectedFrom] || record.collectedFrom}</td>
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">{record.dateAD}</td>
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap font-medium">{record.totalAmount?.toLocaleString()} {t("sar")}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{record.voucherNumber || "—"}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={record.item}>{record.item || "—"}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{record.collectMethod}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400 max-w-[200px]" title={record.receivingBankName ? `${record.receivingBankName} - ${record.ibanNumberFrom}` : record.bankNameFrom}>
                          <div className="truncate">{record.receivingBankName || "—"}</div>
                          {record.ibanNumberFrom && <div className="truncate text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">{record.ibanNumberFrom}</div>}
                        </td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={record.notes}>{record.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-5 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("total_amount")}: <span className="text-gray-900 dark:text-white font-bold">{parsedRecords.reduce((sum, r) => sum + (r.totalAmount || 0), 0).toLocaleString()} {t("sar")}</span>
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setShowImportPreview(false); setParsedRecords([]); }}
                    disabled={isImporting}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium text-sm cursor-pointer disabled:opacity-50"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white transition font-medium text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        {t("loading")}
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        {t("confirm_import")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
              <>
                {(username === "Saleh" || username === "Nasri") && (
                  <div className="relative group">
                    <button
                      onClick={() => document.getElementById("excel-bulk-import-co").click()}
                      disabled={isImporting}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isImporting ? <RefreshCw className="animate-spin" size={20} /> : <Upload size={20} />}
                    </button>
                    <input
                      type="file"
                      id="excel-bulk-import-co"
                      className="hidden"
                      accept=".xlsx, .xls"
                      onChange={handleExcelImport}
                    />
                    <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
                      {t("import_from_excel")}
                    </div>
                  </div>
                )}
                <div className="relative group">
                <Link
                  to="/dashboard/collectionorders/add"
                  {...prefetchHandlers("/dashboard/collectionorders/add")}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
                >
                  <Plus size={20} />
                </Link>
                <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
                  {t("add_collection_order")}
                </div>
              </div>
            </>
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
          onRefresh={async () => {
            await Promise.all([refetchCO(), refetchPO()]);
          }}
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
