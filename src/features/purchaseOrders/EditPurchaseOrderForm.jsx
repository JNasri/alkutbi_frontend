import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useGetPurchaseOrdersQuery,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} from "./purchaseOrdersApiSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import i18n from "../../../i18n";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { numberToArabicText } from "../../utils/numberToArabicText";
import moment from "moment-hijri";
import ModernDatePicker from "../../components/ModernDatePicker";
import { useDropzone } from "react-dropzone";
import { ExternalLink } from "lucide-react";
import useAuth from "../../hooks/useAuth";
const EditPurchaseOrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isFinanceEmployee, isFinanceSubAdmin, isFinanceAdmin, isAdmin, username } = useAuth();

  const {
    data: purchaseOrdersData,
    isSuccess: isPurchaseOrdersSuccess,
    isLoading: isFetching,
    isError: fetchError,
  } = useGetPurchaseOrdersQuery("purchaseOrdersList");

  const purchaseOrder = purchaseOrdersData?.entities[id];

  const [
    updatePurchaseOrder,
    { isLoading: isUpdating, isSuccess, isError, error },
  ] = useUpdatePurchaseOrderMutation();

  const [
    deletePurchaseOrder,
    {
      isLoading: isDeleting,
      isSuccess: isDelSuccess,
      isError: isDelError,
      error: delError,
    },
  ] = useDeletePurchaseOrderMutation();

  const [status, setStatus] = useState("new");
  const [dayName, setDayName] = useState("");
  const [dateHijri, setDateHijri] = useState("");
  const [dateAD, setDateAD] = useState("");
  const [purchasingId, setPurchasingId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [bankName, setBankName] = useState("");
  const [ibanNumber, setIbanNumber] = useState("");
  const [bankNameFrom, setBankNameFrom] = useState("");
  const [ibanNumberFrom, setIbanNumberFrom] = useState("");
  const [bankNameTo, setBankNameTo] = useState("");
  const [ibanNumberTo, setIbanNumberTo] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [managementName, setManagementName] = useState("");
  const [supplier, setSupplier] = useState("");
  const [item, setItem] = useState("");
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

  const paymentMethodOptions = [
    { value: "cash", label: t("cash") },
    { value: "visa", label: t("visa") },
    { value: "bank_transfer", label: t("bank_transfer") },
    { value: "sadad", label: t("sadad") },
  ];

  const handleDeleteClick = () => setShowDeleteModal(true);
  const handleCancelDelete = () => setShowDeleteModal(false);

  const handleConfirmDelete = async () => {
    try {
      await deletePurchaseOrder({ id }).unwrap();
    } catch {
      // handled by effect
    }
    setShowDeleteModal(false);
  };

  useEffect(() => {
    if (purchaseOrder) {
      // Permission check - only creator or admin can edit
      const orderCreator = purchaseOrder.issuer?.username;
      const canEdit = isAdmin || isFinanceAdmin || (isFinanceEmployee && orderCreator === username);
      
      if (!isInitialLoad && !canEdit) {
        toast.error(t("no_permission_to_edit_this_order"));
        navigate("/dashboard/purchaseorders");
        return;
      }

      setStatus(purchaseOrder.status || "new");
      setDayName(purchaseOrder.dayName || "");
      setDateHijri(purchaseOrder.dateHijri || "");
      setDateAD(purchaseOrder.dateAD ? purchaseOrder.dateAD.slice(0, 10) : "");
      setPurchasingId(purchaseOrder.purchasingId || "");
      setPaymentMethod(purchaseOrder.paymentMethod || "cash");
      setBankName(purchaseOrder.bankName || "");
      setIbanNumber(purchaseOrder.ibanNumber || "");
      setBankNameFrom(purchaseOrder.bankNameFrom || "");
      setIbanNumberFrom(purchaseOrder.ibanNumberFrom || "");
      setBankNameTo(purchaseOrder.bankNameTo || "");
      setIbanNumberTo(purchaseOrder.ibanNumberTo || "");
      setTransactionType(purchaseOrder.transactionType || "");
      setManagementName(purchaseOrder.managementName || "");
      setSupplier(purchaseOrder.supplier || "");
      setItem(purchaseOrder.item || "");
      setTotalAmount(purchaseOrder.totalAmount?.toString() || "");
      setTotalAmountText(purchaseOrder.totalAmountText || "");
      setDeductedFrom(purchaseOrder.deductedFrom || "");
      setAddedTo(purchaseOrder.addedTo || "");
      setNotes(purchaseOrder.notes || "");
      setExistingReceiptUrl(purchaseOrder.receiptUrl || purchaseOrder.fileUrl || "");
      setExistingOrderPrintUrl(purchaseOrder.orderPrintUrl || "");
      setIsInitialLoad(false);
    }
  }, [purchaseOrder, isAdmin, isFinanceAdmin, isFinanceEmployee, username, navigate, t]);

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
      toast.success(t("purchase_order_updated_successfully"));
      navigate("/dashboard/purchaseorders");
    } else if (isError) {
      toast.error(error?.data?.message || t("error_updating_purchase_order"));
    }

    if (isDelSuccess) {
      toast.success(t("purchase_order_deleted_successfully"));
      navigate("/dashboard/purchaseorders");
    } else if (isDelError) {
      toast.error(
        delError?.data?.message || t("error_deleting_purchase_order")
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

  // Transaction type options
  const transactionTypeOptions = [
    { value: "expenses", label: t("expenses") },
    { value: "receivables", label: t("receivables") },
    { value: "custody", label: t("custody") },
    { value: "advance", label: t("advance") },
    { value: "payments", label: t("payments") },
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

  const managementOptions = useMemo(() => {
    if (!isPurchaseOrdersSuccess) return [];
    const uniqueManagements = new Set(
      purchaseOrdersData.ids
        .map((id) => purchaseOrdersData.entities[id]?.managementName)
        .filter(Boolean)
    );
    return [...uniqueManagements].map((val) => ({ label: val, value: val }));
  }, [purchaseOrdersData, isPurchaseOrdersSuccess]);

  const supplierOptions = useMemo(() => {
    if (!isPurchaseOrdersSuccess) return [];
    const uniqueSuppliers = new Set(
      purchaseOrdersData.ids
        .map((id) => purchaseOrdersData.entities[id]?.supplier)
        .filter(Boolean)
    );
    return [...uniqueSuppliers].map((val) => ({ label: val, value: val }));
  }, [purchaseOrdersData, isPurchaseOrdersSuccess]);

  const itemOptions = useMemo(() => {
    if (!isPurchaseOrdersSuccess) return [];
    const uniqueItems = new Set(
      purchaseOrdersData.ids
        .map((id) => purchaseOrdersData.entities[id]?.item)
        .filter(Boolean)
    );
    return [...uniqueItems].map((val) => ({ label: val, value: val }));
  }, [purchaseOrdersData, isPurchaseOrdersSuccess]);

  const deductedFromOptions = useMemo(() => {
    if (!isPurchaseOrdersSuccess) return [];
    const uniqueDeductedFrom = new Set(
      purchaseOrdersData.ids
        .map((id) => purchaseOrdersData.entities[id]?.deductedFrom)
        .filter(Boolean)
    );
    return [...uniqueDeductedFrom].map((val) => ({ label: val, value: val }));
  }, [purchaseOrdersData, isPurchaseOrdersSuccess]);

  const addedToOptions = useMemo(() => {
    if (!isPurchaseOrdersSuccess) return [];
    const uniqueAddedTo = new Set(
      purchaseOrdersData.ids
        .map((id) => purchaseOrdersData.entities[id]?.addedTo)
        .filter(Boolean)
    );
    return [...uniqueAddedTo].map((val) => ({ label: val, value: val }));
  }, [purchaseOrdersData, isPurchaseOrdersSuccess]);

  const bankNameFromOptions = useMemo(() => {
    if (!isPurchaseOrdersSuccess) return [];
    const uniqueBankNames = new Set(
      purchaseOrdersData.ids
        .map((id) => purchaseOrdersData.entities[id]?.bankNameFrom)
        .filter(Boolean)
    );
    return [...uniqueBankNames].map((val) => ({ label: val, value: val }));
  }, [purchaseOrdersData, isPurchaseOrdersSuccess]);

  const ibanNumberFromOptions = useMemo(() => {
    if (!isPurchaseOrdersSuccess) return [];
    const uniqueIbans = new Set(
      purchaseOrdersData.ids
        .map((id) => purchaseOrdersData.entities[id]?.ibanNumberFrom)
        .filter(Boolean)
    );
    return [...uniqueIbans].map((val) => ({ label: val, value: val }));
  }, [purchaseOrdersData, isPurchaseOrdersSuccess]);

  const bankNameToOptions = useMemo(() => {
    if (!isPurchaseOrdersSuccess) return [];
    const uniqueBankNames = new Set(
      purchaseOrdersData.ids
        .map((id) => purchaseOrdersData.entities[id]?.bankNameTo)
        .filter(Boolean)
    );
    return [...uniqueBankNames].map((val) => ({ label: val, value: val }));
  }, [purchaseOrdersData, isPurchaseOrdersSuccess]);

  const ibanNumberToOptions = useMemo(() => {
    if (!isPurchaseOrdersSuccess) return [];
    const uniqueIbans = new Set(
      purchaseOrdersData.ids
        .map((id) => purchaseOrdersData.entities[id]?.ibanNumberTo)
        .filter(Boolean)
    );
    return [...uniqueIbans].map((val) => ({ label: val, value: val }));
  }, [purchaseOrdersData, isPurchaseOrdersSuccess]);

  const onSaveClicked = async (e) => {
    e.preventDefault();

    // Validation - only status, dates, dayName, and purchasingId are required
    if (!status || !dayName || !dateHijri || !dateAD || !purchasingId) {
      return toast.error(t("required_fields_missing"));
    }

    // Role-based status validation
    if (status === "finalized" && (isFinanceEmployee || isFinanceSubAdmin) && !isFinanceAdmin && !isAdmin) {
      return toast.error(t("no_permission_to_finalize_order"));
    }



    const purchaseOrderData = {
      id,
      status,
      dayName,
      dateHijri,
      dateAD,
      purchasingId,
      paymentMethod: paymentMethod || "",
      bankName: bankName || "",
      ibanNumber: ibanNumber || "",
      bankNameFrom: bankNameFrom || "",
      ibanNumberFrom: ibanNumberFrom || "",
      bankNameTo: bankNameTo || "",
      ibanNumberTo: ibanNumberTo || "",
      transactionType: transactionType || "",
      managementName: managementName || "",
      supplier: supplier || "",
      item: item || "",
      totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
      totalAmountText: totalAmountText || "",
      deductedFrom: deductedFrom || "",
      addedTo: addedTo || "",
      notes: notes || "",
      receipt: receiptFile,
      orderPrint: orderPrintFile,
    };

    await updatePurchaseOrder(purchaseOrderData).unwrap();
  };

  const errClass = isError || isDelError ? "errmsg" : "offscreen";
  const errMsg = error?.data?.message || delError?.data?.message || "";

  if (isFetching) return <LoadingSpinner />;
  if (fetchError || !purchaseOrder)
    return <p className="p-4">{t("error_loading_purchase_order")}</p>;

  const showBankFields =
    paymentMethod === "bank_transfer" || paymentMethod === "sadad";

  return (
    <>
      {(isUpdating || isDeleting) && <LoadingSpinner />}
      <p className={errClass}>{errMsg}</p>

      <div className="flex items-center gap-4 mb-4 p-1">
        <button
          onClick={() => navigate("/dashboard/purchaseorders")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
        >
          {i18n.language === "ar" ? (
            <ArrowRight size={20} />
          ) : (
            <ArrowLeft size={20} />
          )}
        </button>
         <label htmlFor="purchasingId" className="text-4xl font-bold text-gray-800 dark:text-white">
          {t("edit_purchase_order")}
         </label>
         <input
           type="text"
           id="purchasingId"
           value={purchasingId}
           onChange={(e) => setPurchasingId(e.target.value)}
           className="text-xl sm:text-3xl font-bold bg-transparent border-b border-gray-400 dark:border-gray-500 focus:outline-none focus:border-black dark:focus:border-white text-gray-900 dark:text-white"
         />
      </div>
      <div className="bg-white dark:bg-gray-700 border-gray-500 rounded-3xl shadow p-6 space-y-6">
        <form onSubmit={onSaveClicked}>
          <div className="grid grid-cols-6 gap-6">
            {/* Status - First field at the top */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("po_status")}
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

            {/* Transaction Type - Next to Status */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("transaction_type")}
              </label>
              <Select
                isSearchable={false}
                isClearable
                options={transactionTypeOptions}
                value={transactionTypeOptions.find((opt) => opt.value === transactionType)}
                onChange={(selected) => setTransactionType(selected?.value || "")}
                styles={customSelectStyles}
                placeholder={t("choose")}
              />
            </div>

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

            {/* Purchasing ID moved to header */}

            {/* Payment Method */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("payment_method")}
              </label>
              <Select
                isSearchable={false}
                options={paymentMethodOptions}
                value={paymentMethodOptions.find(
                  (opt) => opt.value === paymentMethod
                )}
                onChange={(selected) =>
                  setPaymentMethod(selected?.value || "cash")
                }
                styles={customSelectStyles}
              />
            </div>

            {/* Bank Name From (conditional) */}
            {showBankFields && (
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("bank_name_from")}
                </label>
                <CreatableSelect
                  key={theme}
                  placeholder={t("choose")}
                  formatCreateLabel={(inputValue) =>
                    `${t("click2create")} "${inputValue}"`
                  }
                  isClearable
                  options={bankNameFromOptions}
                  onChange={(newValue) => setBankNameFrom(newValue?.value || "")}
                  onCreateOption={(inputValue) => {
                    setBankNameFrom(inputValue);
                  }}
                  value={bankNameFrom ? { value: bankNameFrom, label: bankNameFrom } : null}
                  styles={customSelectStyles}
                />
              </div>
            )}

            {/* IBAN Number From (conditional) */}
            {showBankFields && (
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("iban_number_from")}
                </label>
                <CreatableSelect
                  key={theme}
                  placeholder={t("choose")}
                  formatCreateLabel={(inputValue) =>
                    `${t("click2create")} "${inputValue}"`
                  }
                  isClearable
                  options={ibanNumberFromOptions}
                  onChange={(newValue) => setIbanNumberFrom(newValue?.value || "")}
                  onCreateOption={(inputValue) => {
                    setIbanNumberFrom(inputValue);
                  }}
                  value={ibanNumberFrom ? { value: ibanNumberFrom, label: ibanNumberFrom } : null}
                  styles={customSelectStyles}
                />
              </div>
            )}

            {/* Bank Name To (conditional) */}
            {showBankFields && (
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("bank_name_to")}
                </label>
                <CreatableSelect
                  key={theme}
                  placeholder={t("choose")}
                  formatCreateLabel={(inputValue) =>
                    `${t("click2create")} "${inputValue}"`
                  }
                  isClearable
                  options={bankNameToOptions}
                  onChange={(newValue) => setBankNameTo(newValue?.value || "")}
                  onCreateOption={(inputValue) => {
                    setBankNameTo(inputValue);
                  }}
                  value={bankNameTo ? { value: bankNameTo, label: bankNameTo } : null}
                  styles={customSelectStyles}
                />
              </div>
            )}

            {/* IBAN Number To (conditional) */}
            {showBankFields && (
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("iban_number_to")}
                </label>
                <CreatableSelect
                  key={theme}
                  placeholder={t("choose")}
                  formatCreateLabel={(inputValue) =>
                    `${t("click2create")} "${inputValue}"`
                  }
                  isClearable
                  options={ibanNumberToOptions}
                  onChange={(newValue) => setIbanNumberTo(newValue?.value || "")}
                  onCreateOption={(inputValue) => {
                    setIbanNumberTo(inputValue);
                  }}
                  value={ibanNumberTo ? { value: ibanNumberTo, label: ibanNumberTo } : null}
                  styles={customSelectStyles}
                />
              </div>
            )}

            {/* Management Name */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("management_name")}
              </label>
              <CreatableSelect
                key={theme}
                placeholder={t("choose")}
                formatCreateLabel={(inputValue) =>
                  `${t("click2create")} "${inputValue}"`
                }
                isClearable
                options={managementOptions}
                onChange={(newValue) =>
                  setManagementName(newValue?.value || "")
                }
                onCreateOption={(inputValue) => {
                  setManagementName(inputValue);
                }}
                value={
                  managementName
                    ? { value: managementName, label: managementName }
                    : null
                }
                styles={customSelectStyles}
              />
            </div>

            {/* Supplier */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("supplier")}
              </label>
              <CreatableSelect
                key={theme}
                placeholder={t("choose")}
                formatCreateLabel={(inputValue) =>
                  `${t("click2create")} "${inputValue}"`
                }
                isClearable
                options={supplierOptions}
                onChange={(newValue) => setSupplier(newValue?.value || "")}
                onCreateOption={(inputValue) => {
                  setSupplier(inputValue);
                }}
                value={supplier ? { value: supplier, label: supplier } : null}
                styles={customSelectStyles}
              />
            </div>

            {/* Item */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                {t("item")}
              </label>
              <CreatableSelect
                key={theme}
                placeholder={t("choose")}
                formatCreateLabel={(inputValue) =>
                  `${t("click2create")} "${inputValue}"`
                }
                isClearable
                options={itemOptions}
                onChange={(newValue) => setItem(newValue?.value || "")}
                onCreateOption={(inputValue) => {
                  setItem(inputValue);
                }}
                value={item ? { value: item, label: item } : null}
                styles={customSelectStyles}
              />
            </div>

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
                  deductedFrom
                    ? { value: deductedFrom, label: deductedFrom }
                    : null
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

          <div className="flex items-center pt-6">
            <button
              type="submit"
              disabled={isUpdating}
              className="text-black dark:text-white bg-gray-100 dark:bg-gray-800 border dark:border-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:ring-4 font-medium rounded-4xl text-sm px-5 py-2.5 cursor-pointer"
            >
              {t("save")} 💾
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="text-black dark:text-white bg-gray-100 dark:bg-gray-800 border dark:border-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium rounded-4xl text-sm px-5 py-2.5 mx-2 cursor-pointer"
            >
              {t("delete")} 🗑️
            </button>
          </div>
        </form>
      </div>

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

export default EditPurchaseOrderForm;
