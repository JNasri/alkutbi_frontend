import { useState, useEffect, useMemo } from "react";
import {
  useAddNewOutgoingMutation,
  useGetOutgoingsQuery,
} from "./outgoingsApiSlice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import i18n from "../../../i18n";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import LoadingSpinner from "../../components/LoadingSpinner";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";

const AddOutgoingForm = () => {
  const [fileSizeError, setFileSizeError] = useState(false);
  const [attachment, setAttachment] = useState("");

  // Dropzone configuration
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setAttachment(file);
      setFileSizeError(false);
    } else {
      setAttachment("");
      setFileSizeError(true);
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc", ".docx"],
      "image/*": [".jpg", ".jpeg", ".png"],
    },
  });

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [addNewOutgoing, { isLoading, isSuccess, isError, error }] =
    useAddNewOutgoingMutation();

  const { data: outgoingsData, isSuccess: isOutgoingSuccess } =
    useGetOutgoingsQuery("outgoingsList");

  // Custom styles for react-select, like your incoming form
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
      "&:hover": { borderColor: "#60a5fa" },
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

  // Memoized derived dropdown options
  const fromOptions = useMemo(() => {
    if (!isOutgoingSuccess) return [];
    const unique = Array.from(
      new Set(
        outgoingsData.ids
          .map((id) => outgoingsData.entities[id]?.from)
          .filter(Boolean)
      )
    );
    return unique.map((val) => ({ label: val, value: val }));
  }, [outgoingsData, isOutgoingSuccess]);

  const toOptions = useMemo(() => {
    if (!isOutgoingSuccess) return [];
    const unique = Array.from(
      new Set(
        outgoingsData.ids
          .map((id) => outgoingsData.entities[id]?.to)
          .filter(Boolean)
      )
    );
    return unique.map((val) => ({ label: val, value: val }));
  }, [outgoingsData, isOutgoingSuccess]);

  // Dark-mode re-render trigger
  const useDarkMode = () => {
    const getTheme = () =>
      document.documentElement.classList.contains("dark") ? "dark" : "light";
    const [theme, setTheme] = useState(getTheme());

    useEffect(() => {
      const observer = new MutationObserver(() => {
        setTheme(getTheme());
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

  // Form state variables
  const [toField, setToField] = useState("");
  const [fromField, setFromField] = useState("");
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [outgoingType, setOutgoingType] = useState("external");
  const [borderNumber, setBorderNumber] = useState("");

  useEffect(() => {
    if (isSuccess) {
      setToField("");
      setFromField("");
      setDate("");
      setPurpose("");
      setPassportNumber("");
      setOutgoingType("external");
      setBorderNumber("");
      setAttachment("");
      toast.success(t("outgoing_added_successfully"));
      navigate("/dashboard/outgoings");
    }
  }, [isSuccess, navigate, t]);

  const onSaveOutgoingClicked = async (e) => {
    e.preventDefault();
    if (!attachment) {
      toast.error(t("attachment_required"));
      return;
    }

    const formData = new FormData();
    formData.append("to", toField);
    formData.append("from", fromField);
    formData.append("date", date);
    formData.append("purpose", purpose);
    formData.append("passportNumber", passportNumber);
    formData.append("outgoingType", outgoingType);
    formData.append("borderNumber", borderNumber);
    formData.append("attachment", attachment);

    try {
      await addNewOutgoing(formData).unwrap();
    } catch (err) {
      toast.error(
        t("error_adding_outgoing") +
          (err?.data?.message ? `: ${err.data.message}` : "")
      );
    }
  };

  const errClass = isError ? "errmsg" : "offscreen";

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <p className={errClass}>{error?.data?.message}</p>
      <div className="flex items-center gap-4 mb-4 p-1">
        <div className="relative group">
          <button
            onClick={() => navigate("/dashboard/outgoings")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
          >
            {i18n.language === "ar" ? (
              <ArrowRight size={20} />
            ) : (
              <ArrowLeft size={20} />
            )}
          </button>
        </div>
        <h1 className="text-4xl text-gray-800 dark:text-white">
          {t("add_outgoing")} :
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-700 border-gray-500 rounded-3xl shadow">
        <div className="p-6 space-y-6">
          <form onSubmit={onSaveOutgoingClicked}>
            <div className="grid grid-cols-6 gap-6">
              {/* Paper Type */}
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="outgoingType" className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("paperType")}
                </label>
                <Select
                  isSearchable={false}
                  options={[
                    { value: "internal", label: t("internal") },
                    { value: "external", label: t("external") },
                  ]}
                  value={{ value: outgoingType, label: t(outgoingType) }}
                  onChange={(opt) => setOutgoingType(opt?.value ?? "")}
                  styles={customSelectStyles}
                />
              </div>

              {/* From Field */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("from")}
                </label>
                <CreatableSelect
                  key={`${theme}-from`}
                  placeholder={t("choose")}
                  formatCreateLabel={(input) => `${t("click2create")} "${input}"`}
                  isClearable
                  options={fromOptions}
                  onChange={(opt) => setFromField(opt?.value ?? "")}
                  onCreateOption={(input) => setFromField(input)}
                  value={fromField ? { label: fromField, value: fromField } : null}
                  styles={customSelectStyles}
                />
              </div>

              {/* To Field */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("to")}
                </label>
                <CreatableSelect
                  key={`${theme}-to`}
                  placeholder={t("choose")}
                  formatCreateLabel={(input) => `${t("click2create")} "${input}"`}
                  isClearable
                  options={toOptions}
                  onChange={(opt) => setToField(opt?.value ?? "")}
                  onCreateOption={(input) => setToField(input)}
                  value={toField ? { label: toField, value: toField } : null}
                  styles={customSelectStyles}
                />
              </div>

              {/* Date */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("date")}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="cursor-pointer shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Purpose */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("purpose")}
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Passport Number */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("passportNumber")}
                </label>
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Border Number */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("borderNumber")}
                </label>
                <input
                  type="text"
                  value={borderNumber}
                  onChange={(e) => setBorderNumber(e.target.value)}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Attachment Upload */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t("attachment")}
                  {fileSizeError && (
                    <span className="text-sm text-red-600 mx-2">
                      {t("file_too_large", { size: "10MB" })}
                    </span>
                  )}
                </label>
                <div
                  {...getRootProps()}
                  className="flex items-center justify-between px-4 py-2.5 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <span className="text-sm text-center mx-auto">{t("drop_here")}</span>
                  ) : attachment ? (
                    <div className="flex items-center justify-between w-full">
                      <p className="text-sm truncate">{attachment.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttachment("");
                        }}
                        className="ml-3 text-red-500 hover:text-red-700 text-sm cursor-pointer"
                      >
                        ❌
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-center w-full">{t("drag_drop_or_click")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                className="text-black dark:text-white bg-gray-100 dark:bg-gray-800 border dark:border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed focus:ring-4 focus:ring-cyan-200 font-medium rounded-4xl text-sm px-5 py-2.5"
              >
                {t("add_outgoing")} ✅
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddOutgoingForm;
