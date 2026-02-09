import { useState, useEffect } from "react";
import {
  useAddNewPurchaseOrderMutation,
  useGetPurchaseOrdersQuery,
} from "./purchaseOrdersApiSlice";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { Paperclip, ExternalLink } from "lucide-react";

const AddPurchaseOrderForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [addNewPurchaseOrder, { isLoading, isSuccess, isError, error }] =
    useAddNewPurchaseOrderMutation();

  const { data: purchaseOrdersData, isSuccess: isPurchaseOrdersSuccess } =
    useGetPurchaseOrdersQuery("purchaseOrdersList");

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

  // Get Arabic day name
  const getArabicDayName = () => {
    const days = [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
    return days[new Date().getDay()];
  };

  // Get today's date in Hijri
  const getTodayHijri = () => {
    return moment().format("iYYYY/iM/iD");
  };

  // Get today's date in AD
  const getTodayAD = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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

  // Form State - dates with today as default
  const [status, setStatus] = useState("new");
  const [dayName, setDayName] = useState("");
  const [dateHijri, setDateHijri] = useState("");
  const [dateAD, setDateAD] = useState(getTodayAD());
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
  const [file, setFile] = useState(null);

  // Status options with colors
  const statusOptions = [
    { value: "new", label: t("status_new"), color: "blue" },
    { value: "authorized", label: t("status_authorized"), color: "yellow" },
  ];

  // Payment method options
  const paymentMethodOptions = [
    { value: "cash", label: t("cash") },
    { value: "visa", label: t("visa") },
    { value: "bank_transfer", label: t("bank_transfer") },
    { value: "sadad", label: t("sadad") },
  ];

  // Transaction type options
  const transactionTypeOptions = [
    { value: "expenses", label: t("expenses") },
    { value: "receivables", label: t("receivables") },
    { value: "custody", label: t("custody") },
    { value: "advance", label: t("advance") },
  ];

  // Dropzone configuration
  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxFiles: 1,
  });


  // Auto-convert number to Arabic text
  useEffect(() => {
    if (totalAmount && !isNaN(totalAmount)) {
      setTotalAmountText(numberToArabicText(parseFloat(totalAmount)));
    } else {
      setTotalAmountText("");
    }
  }, [totalAmount]);

  // Auto-fill Hijri date and day name when AD date is selected
  useEffect(() => {
    if (dateAD) {
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
  }, [dateAD]);



  // Create options from existing data
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

  useEffect(() => {
    if (isSuccess) {
      setStatus("new");
      setDayName("");
      setDateHijri("");
      setDateAD("");
      setPurchasingId("");
      setPaymentMethod("cash");
      setBankName("");
      setIbanNumber("");
      setBankNameFrom("");
      setIbanNumberFrom("");
      setBankNameTo("");
      setIbanNumberTo("");
      setTransactionType("");
      setManagementName("");
      setSupplier("");
      setItem("");
      setTotalAmount("");
      setTotalAmountText("");
      setDeductedFrom("");
      setAddedTo("");
      toast.success(t("purchase_order_added_successfully"));
      navigate("/dashboard/purchaseorders");
    }
  }, [isSuccess, navigate, t]);

  const onSavePurchaseOrderClicked = async (e) => {
    e.preventDefault();

    // Validation - only status, dates, and dayName are required
    if (!status || !dayName || !dateHijri || !dateAD) {
      toast.error(t("required_fields_missing"));
      return;
    }



    const purchaseOrderData = {
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
      file,
    };

    try {
      await addNewPurchaseOrder(purchaseOrderData).unwrap();
    } catch (err) {
      toast.error(
        t("error_adding_purchase_order") +
          (err?.data?.message ? `: ${err.data.message}` : "")
      );
    }
  };

  const errClass = isError ? "errmsg" : "offscreen";

  const showBankFields = paymentMethod === "bank_transfer" || paymentMethod === "sadad";

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <p className={errClass}>{error?.data?.message}</p>
      <div className="flex items-center gap-4 mb-4 p-1">
        {/* Back Button */}
        <div className="relative group">
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
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          {t("add_purchase_order")} :
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-700 border-gray-500 rounded-3xl shadow">
        <div className="p-6 space-y-6">
          <form onSubmit={onSavePurchaseOrderClicked}>
            <div className="grid grid-cols-6 gap-6">
              {/* Transaction Type - Full width at the top */}
              <div className="col-span-6">
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

              {/* Date AD (prefilled) */}
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

              {/* Purchasing ID auto-generated */}

              {/* Payment Method */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("payment_method")}
                </label>
                <Select
                  isSearchable={false}
                  options={paymentMethodOptions}
                  value={paymentMethodOptions.find((opt) => opt.value === paymentMethod)}
                  onChange={(selected) => setPaymentMethod(selected?.value || "cash")}
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
                  onChange={(newValue) => setManagementName(newValue?.value || "")}
                  onCreateOption={(inputValue) => {
                    setManagementName(inputValue);
                  }}
                  value={
                    managementName ? { value: managementName, label: managementName } : null
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

              {/* Document Upload - Optional */}
              <div className="col-span-6">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("Voucher.file")} ({t("optional")})
                </label>
                
                <div
                  {...getRootProps()}
                  className={`flex cursor-pointer appearance-none justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-800 p-6 text-sm transition hover:border-gray-400 dark:hover:border-gray-400 focus:outline-none`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="text-center">
                      <p className="text-gray-700 dark:text-gray-300 font-medium">File Selected:</p>
                      <p className="text-blue-600 dark:text-blue-400">{file.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="mt-2 text-sm text-red-600 dark:text-red-400 font-bold hover:underline"
                      >
                        {t("Delete")} 🗑️
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Paperclip className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400 text-center">
                        {i18n.language === "ar" ? "اضغط هنا لاختيار ملف" : "Click or drag file to upload"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="text-black dark:text-white bg-gray-100 dark:bg-gray-800 border dark:border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed focus:ring-4 focus:ring-cyan-200 font-medium rounded-4xl text-sm px-5 py-2.5"
              >
                {t("add_purchase_order")} ✅
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddPurchaseOrderForm;
