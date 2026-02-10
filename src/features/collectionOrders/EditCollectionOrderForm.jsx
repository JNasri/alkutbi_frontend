import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useGetCollectionOrdersQuery,
  useUpdateCollectionOrderMutation,
  useDeleteCollectionOrderMutation,
} from "./collectionOrdersApiSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import i18n from "../../../i18n";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useDropzone } from "react-dropzone";
import { ExternalLink } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { numberToArabicText } from "../../utils/numberToArabicText";
import moment from "moment-hijri";
import ModernDatePicker from "../../components/ModernDatePicker";

const EditCollectionOrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isFinanceEmployee, isFinanceSubAdmin, isFinanceAdmin, isAdmin, username } = useAuth();

  const {
    data: collectionOrdersData,
    isSuccess: isCollectionOrdersSuccess,
    isLoading: isFetching,
    isError: fetchError,
  } = useGetCollectionOrdersQuery("collectionOrdersList");

  const collectionOrder = collectionOrdersData?.entities[id];

  const [
    updateCollectionOrder,
    { isLoading: isUpdating, isSuccess, isError, error },
  ] = useUpdateCollectionOrderMutation();

  const [
    deleteCollectionOrder,
    {
      isLoading: isDeleting,
      isSuccess: isDelSuccess,
      isError: isDelError,
      error: delError,
    },
  ] = useDeleteCollectionOrderMutation();

  const [status, setStatus] = useState("new");
  const [dayName, setDayName] = useState("");
  const [dateHijri, setDateHijri] = useState("");
  const [dateAD, setDateAD] = useState("");
  const [collectingId, setCollectingId] = useState("");
  const [collectMethod, setCollectMethod] = useState("cash");
  const [voucherNumber, setVoucherNumber] = useState("");
  const [receivingBankName, setReceivingBankName] = useState("");
  const [collectedFrom, setCollectedFrom] = useState("");
  const [customCollectedFrom, setCustomCollectedFrom] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [totalAmountText, setTotalAmountText] = useState("");
  const [deductedFrom, setDeductedFrom] = useState("");
  const [addedTo, setAddedTo] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [orderPrintFile, setOrderPrintFile] = useState(null);
  const [existingReceiptUrl, setExistingReceiptUrl] = useState("");
  const [existingOrderPrintUrl, setExistingOrderPrintUrl] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Status options with roles restriction
  const statusOptions = useMemo(() => {
    const options = [
      { value: "new", label: t("status_new"), color: "blue" },
      { value: "authorized", label: t("status_authorized"), color: "yellow" },
      { value: "finalized", label: t("status_finalized"), color: "green" },
    ];

    // Finance employees and sub-admins cannot set status to finalized
    if ((isFinanceEmployee || isFinanceSubAdmin) && !isFinanceAdmin && !isAdmin) {
      return options.filter(opt => opt.value !== "finalized");
    }
    return options;
  }, [t, isFinanceEmployee, isFinanceAdmin, isAdmin]);

  const collectMethodOptions = [
    { value: "cash", label: t("cash") },
    { value: "bank_transfer", label: t("bank_transfer") },
  ];

  const collectedFromOptions = [
    { value: "umrah", label: t("umrah") },
    { value: "transport", label: t("transport") },
    { value: "hotels", label: t("hotels") },
    { value: "others", label: t("others") },
  ];

  // Dropzone configuration for Receipt
  const { getRootProps: getReceiptRootProps, getInputProps: getReceiptInputProps } = useDropzone({
    onDrop: (acceptedFiles) => setReceiptFile(acceptedFiles[0]),
    multiple: false,
    maxFiles: 1,
  });

  // Dropzone configuration for Order Print
  const { getRootProps: getOrderPrintRootProps, getInputProps: getOrderPrintInputProps } = useDropzone({
    onDrop: (acceptedFiles) => setOrderPrintFile(acceptedFiles[0]),
    multiple: false,
    maxFiles: 1,
  });

  const handleDeleteClick = () => setShowDeleteModal(true);
  const handleCancelDelete = () => setShowDeleteModal(false);

  const handleConfirmDelete = async () => {
    try {
      await deleteCollectionOrder({ id }).unwrap();
    } catch {
      // handled by effect
    }
    setShowDeleteModal(false);
  };

  useEffect(() => {
    if (collectionOrder) {
      // Permission check - only creator or admin can edit
      const orderCreator = collectionOrder.issuer?.username;
      const canEdit = isAdmin || isFinanceAdmin || (isFinanceEmployee && orderCreator === username);
      
      if (!isInitialLoad && !canEdit) {
        toast.error(t("no_permission_to_edit_this_order"));
        navigate("/dashboard/collectionorders");
        return;
      }

      setStatus(collectionOrder.status || "new");
      setDayName(collectionOrder.dayName || "");
      setDateHijri(collectionOrder.dateHijri || "");
      setDateAD(collectionOrder.dateAD ? collectionOrder.dateAD.slice(0, 10) : "");
      setCollectingId(collectionOrder.collectingId || "");
      setCollectMethod(collectionOrder.collectMethod || "cash");
      setVoucherNumber(collectionOrder.voucherNumber || "");
      setReceivingBankName(collectionOrder.receivingBankName || "");
      
      const cfValue = collectionOrder.collectedFrom || "";
      const isKnown = ["umrah", "transport", "hotels"].includes(cfValue);
      if (cfValue && !isKnown) {
        setCollectedFrom("others");
        setCustomCollectedFrom(cfValue);
      } else {
        setCollectedFrom(cfValue);
        setCustomCollectedFrom("");
      }

      setTotalAmount(collectionOrder.totalAmount?.toString() || "");
      setTotalAmountText(collectionOrder.totalAmountText || "");
      setDeductedFrom(collectionOrder.deductedFrom || "");
      setAddedTo(collectionOrder.addedTo || "");
      setNotes(collectionOrder.notes || "");
      setExistingReceiptUrl(collectionOrder.receiptUrl || collectionOrder.fileUrl || "");
      setExistingOrderPrintUrl(collectionOrder.orderPrintUrl || "");
      setIsInitialLoad(false);
    }
  }, [collectionOrder, isAdmin, isFinanceAdmin, isFinanceEmployee, username, navigate, t]);

  // Auto-convert number to Arabic text
  useEffect(() => {
    if (totalAmount && !isNaN(totalAmount)) {
      setTotalAmountText(numberToArabicText(parseFloat(totalAmount)));
    } else {
      setTotalAmountText("");
    }
  }, [totalAmount]);

  // Auto-fill Hijri date and day name when AD date is changed (not on initial load)
  useEffect(() => {
    if (dateAD && !isInitialLoad) {
      const selectedDate = new Date(dateAD);
      
      // Get Arabic day name
      const days = [
        "الأحد",
        "الإثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت",
      ];
      setDayName(days[selectedDate.getDay()]);
      
      // Get Hijri date
      const hijriDate = moment(dateAD).format("iYYYY/iM/iD");
      setDateHijri(hijriDate);
    }
  }, [dateAD, isInitialLoad]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(t("collection_order_updated_successfully"));
      navigate("/dashboard/collectionorders");
    } else if (isError) {
      toast.error(error?.data?.message || t("error_updating_collection_order"));
    }

    if (isDelSuccess) {
      toast.success(t("collection_order_deleted_successfully"));
      navigate("/dashboard/collectionorders");
    } else if (isDelError) {
      toast.error(
        delError?.data?.message || t("error_deleting_collection_order")
      );
    }
  }, [
    isSuccess,
    isError,
    error,
    isDelSuccess,
    isDelError,
    delError,
    navigate,
    t,
  ]);

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#1f2937"
        : "#f9fafb",
      borderColor: document.documentElement.classList.contains("dark")
        ? "#ffffff"
        : "#d1d5db",
      color: document.documentElement.classList.contains("dark")
        ? "#ffffff"
        : "#111827",
      borderRadius: "0.5rem",
      minHeight: "40px",
      boxShadow: state.isFocused ? "0 0 0 1px #60a5fa" : "none",
      "&:hover": {
        borderColor: "#60a5fa",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#1f2937"
        : "#f9fafb",
      borderRadius: "0.5rem",
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? document.documentElement.classList.contains("dark")
          ? "#374151"
          : "#e5e7eb"
        : "transparent",
      color: document.documentElement.classList.contains("dark")
        ? "#ffffff"
        : "#111827",
      "&:active": {
        backgroundColor: document.documentElement.classList.contains("dark")
          ? "#4b5563"
          : "#d1d5db",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: document.documentElement.classList.contains("dark")
        ? "#ffffff"
        : "#111827",
    }),
    input: (provided) => ({
      ...provided,
      color: document.documentElement.classList.contains("dark")
        ? "#ffffff"
        : "#111827",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: document.documentElement.classList.contains("dark")
        ? "#9ca3af"
        : "#6b7280",
    }),
  };

  const useDarkMode = () => {
    const getTheme = () =>
      document.documentElement.classList.contains("dark") ? "dark" : "light";

    const [theme, setTheme] = useState(getTheme());

    useEffect(() => {
      const observer = new MutationObserver(() => {
        const currentTheme = getTheme();
        setTheme(currentTheme);
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => observer.disconnect();
    }, []);

    return theme;
  };

  const theme = useDarkMode();

  const voucherNumberOptions = useMemo(() => {
    if (!isCollectionOrdersSuccess) return [];
    const uniqueVoucherNumbers = new Set(
      collectionOrdersData.ids
        .map((id) => collectionOrdersData.entities[id]?.voucherNumber)
        .filter(Boolean)
    );
    return [...uniqueVoucherNumbers].map((val) => ({ label: val, value: val }));
  }, [collectionOrdersData, isCollectionOrdersSuccess]);

  const receivingBankNameOptions = useMemo(() => {
    if (!isCollectionOrdersSuccess) return [];
    const uniqueBankNames = new Set(
      collectionOrdersData.ids
        .map((id) => collectionOrdersData.entities[id]?.receivingBankName)
        .filter(Boolean)
    );
    return [...uniqueBankNames].map((val) => ({ label: val, value: val }));
  }, [collectionOrdersData, isCollectionOrdersSuccess]);

  const deductedFromOptions = useMemo(() => {
    if (!isCollectionOrdersSuccess) return [];
    const uniqueDeductedFrom = new Set(
      collectionOrdersData.ids
        .map((id) => collectionOrdersData.entities[id]?.deductedFrom)
        .filter(Boolean)
    );
    return [...uniqueDeductedFrom].map((val) => ({ label: val, value: val }));
  }, [collectionOrdersData, isCollectionOrdersSuccess]);

  const addedToOptions = useMemo(() => {
    if (!isCollectionOrdersSuccess) return [];
    const uniqueAddedTo = new Set(
      collectionOrdersData.ids
        .map((id) => collectionOrdersData.entities[id]?.addedTo)
        .filter(Boolean)
    );
    return [...uniqueAddedTo].map((val) => ({ label: val, value: val }));
  }, [collectionOrdersData, isCollectionOrdersSuccess]);

  const onSaveClicked = async (e) => {
    e.preventDefault();

    // Validation - only status, dates, dayName, and collectingId are required
    if (!status || !dayName || !dateHijri || !dateAD || !collectingId) {
      return toast.error(t("required_fields_missing"));
    }

    // Role-based status validation
    if (status === "finalized" && (isFinanceEmployee || isFinanceSubAdmin) && !isFinanceAdmin && !isAdmin) {
      return toast.error(t("no_permission_to_finalize_order"));
    }


    const collectionOrderData = {
      id,
      status,
      dayName,
      dateHijri,
      dateAD,
      collectingId,
      collectMethod: collectMethod || "",
      voucherNumber: voucherNumber || "",
      receivingBankName: receivingBankName || "",
      collectedFrom: collectedFrom === "others" ? customCollectedFrom : collectedFrom || "",
      totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
      totalAmountText: totalAmountText || "",
      deductedFrom: deductedFrom || "",
      addedTo: addedTo || "",
      notes: notes || "",
      receipt: receiptFile,
      orderPrint: orderPrintFile,
    };

    await updateCollectionOrder(collectionOrderData).unwrap();
  };

  const errClass = isError || isDelError ? "errmsg" : "offscreen";
  const errMsg = error?.data?.message || delError?.data?.message || "";

  if (isFetching) return <LoadingSpinner />;
  if (fetchError || !collectionOrder)
    return <p className="p-4">{t("error_loading_collection_order")}</p>;

  const showVoucherNumber = collectMethod === "cash";
  const showReceivingBankName = collectMethod === "bank_transfer";

  return (
    <>
      {(isUpdating || isDeleting) && <LoadingSpinner />}
      <p className={errClass}>{errMsg}</p>

      <div className="flex items-center gap-4 mb-4 p-1">
        <button
          onClick={() => navigate("/dashboard/collectionorders")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
        >
          {i18n.language === "ar" ? (
            <ArrowRight size={20} />
          ) : (
            <ArrowLeft size={20} />
          )}
        </button>
         <label htmlFor="collectingId" className="text-4xl font-bold text-gray-800 dark:text-white">
          {t("edit_collection_order")}
         </label>
         <input
           type="text"
           id="collectingId"
           value={collectingId}
           onChange={(e) => setCollectingId(e.target.value)}
           className="text-xl sm:text-3xl font-bold bg-transparent border-b border-gray-400 dark:border-gray-500 focus:outline-none focus:border-black dark:focus:border-white text-gray-900 dark:text-white"
         />
      </div>
      <div className="bg-white dark:bg-gray-700 border-gray-500 rounded-3xl shadow p-6 space-y-6">
        <form onSubmit={onSaveClicked}>
          <div className="grid grid-cols-6 gap-6">
            {/* Status */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("status")}
              </label>
              <Select
                isSearchable={false}
                options={statusOptions}
                value={statusOptions.find((opt) => opt.value === status)}
                onChange={(selected) => setStatus(selected?.value || "new")}
                styles={customSelectStyles}
                formatOptionLabel={(option) => (
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        option.color === "blue"
                          ? "bg-blue-500"
                          : option.color === "orange"
                          ? "bg-orange-500"
                          : option.color === "yellow"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    ></span>
                    <span>{option.label}</span>
                  </div>
                )}
              />
            </div>

            {/* Collected From */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("collected_from")}
              </label>
              <Select
                isSearchable={false}
                isClearable
                options={collectedFromOptions}
                value={collectedFromOptions.find((opt) => opt.value === collectedFrom)}
                onChange={(selected) => {
                  setCollectedFrom(selected?.value || "");
                  if (selected?.value !== "others") setCustomCollectedFrom("");
                }}
                styles={customSelectStyles}
                placeholder={t("choose")}
              />
            </div>

            {/* Custom Collected From (conditional) */}
            {collectedFrom === "others" && (
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("other_source")}
                </label>
                <input
                  type="text"
                  value={customCollectedFrom}
                  onChange={(e) => setCustomCollectedFrom(e.target.value)}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                  placeholder={t("type_source")}
                />
              </div>
            )}

            {/* Date AD */}
            <div className="col-span-6 sm:col-span-3">
              <ModernDatePicker
                label={t("date_ad")}
                value={dateAD}
                onChange={setDateAD}
              />
            </div>

            {/* Date Hijri (auto-filled, read-only) */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("date_hijri")}
              </label>
              <input
                type="text"
                value={dateHijri}
                readOnly
                disabled
                className="shadow-sm bg-gray-100 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:text-white cursor-not-allowed"
              />
            </div>

            {/* Day Name (auto-filled, read-only) */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("day_name")}
              </label>
              <input
                type="text"
                value={dayName}
                readOnly
                disabled
                className="shadow-sm bg-gray-100 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:text-white cursor-not-allowed"
              />
            </div>

            {/* Collecting ID moved to header */}

            {/* Collect Method */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("collect_method")}
              </label>
              <Select
                isSearchable={false}
                options={collectMethodOptions}
                value={collectMethodOptions.find(
                  (opt) => opt.value === collectMethod
                )}
                onChange={(selected) =>
                  setCollectMethod(selected?.value || "cash")
                }
                styles={customSelectStyles}
              />
            </div>

            {/* Voucher Number (conditional - for cash) */}
            {showVoucherNumber && (
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("voucher_number")}
                </label>
                <CreatableSelect
                  key={theme}
                  placeholder={t("choose")}
                  formatCreateLabel={(inputValue) =>
                    `${t("click2create")} "${inputValue}"`
                  }
                  isClearable
                  options={voucherNumberOptions}
                  onChange={(newValue) => setVoucherNumber(newValue?.value || "")}
                  onCreateOption={(inputValue) => {
                    setVoucherNumber(inputValue);
                  }}
                  value={voucherNumber ? { value: voucherNumber, label: voucherNumber } : null}
                  styles={customSelectStyles}
                />
              </div>
            )}

            {/* Receiving Bank Name (conditional - for bank transfer) */}
            {showReceivingBankName && (
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("receiving_bank_name")}
                </label>
                <CreatableSelect
                  key={theme}
                  placeholder={t("choose")}
                  formatCreateLabel={(inputValue) =>
                    `${t("click2create")} "${inputValue}"`
                  }
                  isClearable
                  options={receivingBankNameOptions}
                  onChange={(newValue) => setReceivingBankName(newValue?.value || "")}
                  onCreateOption={(inputValue) => {
                    setReceivingBankName(inputValue);
                  }}
                  value={receivingBankName ? { value: receivingBankName, label: receivingBankName } : null}
                  styles={customSelectStyles}
                />
              </div>
            )}

            {/* Total Amount */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("total_amount")}
              </label>
              <input
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Total Amount in Text (auto-generated) */}
            <div className="col-span-6">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("total_amount_text")}
              </label>
              <textarea
                value={totalAmountText}
                readOnly
                rows={2}
                className="shadow-sm bg-gray-100 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:text-white cursor-not-allowed"
              />
            </div>

            {/* Deducted From */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("deducted_from")}
              </label>
              <CreatableSelect
                key={theme}
                placeholder={t("choose")}
                formatCreateLabel={(inputValue) =>
                  `${t("click2create")} "${inputValue}"`
                }
                isClearable
                options={deductedFromOptions}
                onChange={(newValue) => setDeductedFrom(newValue?.value || "")}
                onCreateOption={(inputValue) => {
                  setDeductedFrom(inputValue);
                }}
                value={
                  deductedFrom ? { value: deductedFrom, label: deductedFrom } : null
                }
                styles={customSelectStyles}
              />
            </div>

            {/* Added To */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("added_to")}
              </label>
              <CreatableSelect
                key={theme}
                placeholder={t("choose")}
                formatCreateLabel={(inputValue) =>
                  `${t("click2create")} "${inputValue}"`
                }
                isClearable
                options={addedToOptions}
                onChange={(newValue) => setAddedTo(newValue?.value || "")}
                onCreateOption={(inputValue) => {
                  setAddedTo(inputValue);
                }}
                value={addedTo ? { value: addedTo, label: addedTo } : null}
                styles={customSelectStyles}
              />
            </div>

            {/* Notes */}
            <div className="col-span-6">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("notes")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Receipt Upload */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("receipt")} ({t("optional")})
              </label>
              
              {/* Show existing receipt if any */}
              {existingReceiptUrl && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <ExternalLink size={18} />
                    <span className="text-sm font-medium">Existing Receipt:</span>
                  </div>
                  <a 
                    href={existingReceiptUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-bold"
                  >
                    View File 📄
                  </a>
                </div>
              )}

              <div
                {...getReceiptRootProps()}
                className={`flex cursor-pointer appearance-none justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-800 p-6 text-sm transition hover:border-gray-400 dark:hover:border-gray-400 focus:outline-none`}
              >
                <input {...getReceiptInputProps()} />
                {receiptFile ? (
                  <div className="text-center">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">New File Selected:</p>
                    <p className="text-blue-600 dark:text-blue-400 truncate max-w-xs">{receiptFile.name}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReceiptFile(null);
                      }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 font-bold hover:underline"
                    >
                      {t("Delete")} 🗑️
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h10a4 4 0 004-4m-7-3l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400 text-center">
                      {existingReceiptUrl ? "Click or drag to replace the current receipt" : t("receipt")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Print Upload */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("order_print")} ({t("optional")})
              </label>
              
              {/* Show existing order print if any */}
              {existingOrderPrintUrl && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <ExternalLink size={18} />
                    <span className="text-sm font-medium">Existing Order Print:</span>
                  </div>
                  <a 
                    href={existingOrderPrintUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-bold"
                  >
                    View File 📄
                  </a>
                </div>
              )}

              <div
                {...getOrderPrintRootProps()}
                className={`flex cursor-pointer appearance-none justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-800 p-6 text-sm transition hover:border-gray-400 dark:hover:border-gray-400 focus:outline-none`}
              >
                <input {...getOrderPrintInputProps()} />
                {orderPrintFile ? (
                  <div className="text-center">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">New File Selected:</p>
                    <p className="text-blue-600 dark:text-blue-400 truncate max-w-xs">{orderPrintFile.name}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderPrintFile(null);
                      }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 font-bold hover:underline"
                    >
                      {t("Delete")} 🗑️
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h10a4 4 0 004-4m-7-3l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400 text-center">
                      {existingOrderPrintUrl ? "Click or drag to replace the current order print" : t("order_print")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex gap-4">
            <button
              type="submit"
              className="text-black dark:text-white bg-gray-100 dark:bg-gray-800 border dark:border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed focus:ring-4 focus:ring-cyan-200 font-medium rounded-4xl text-sm px-5 py-2.5"
            >
              {t("save")} ✅
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-200 font-medium rounded-4xl text-sm px-5 py-2.5"
            >
              {t("delete")} 🗑️
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold dark:text-white mb-4">
              {t("confirm_delete")}
            </h2>
            <div className="flex justify-between space-x-3">
              <button
                onClick={handleCancelDelete}
                className="cursor-pointer px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-4xl hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-4xl hover:bg-red-700"
              >
                {t("delete")} 🗑️
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditCollectionOrderForm;
