import { useState, useEffect } from "react";
import {
  useAddNewIncomingMutation,
  useGetIncomingsQuery,
} from "./incomingsApiSlice";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import i18n from "../../../i18n";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import LoadingSpinner from "../../components/LoadingSpinner";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";

const AddIncomingForm = () => {
  const [fileSizeError, setFileSizeError] = useState(false);
  // dropzone setup
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

  // lang
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [addNewIncoming, { isLoading, isSuccess, isError, error }] =
    useAddNewIncomingMutation();

  const { data: incomingsData, isSuccess: isIncomingSuccess } =
    useGetIncomingsQuery("incomingsList");

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#1f2937" // bg-gray-800
        : "#f9fafb", // bg-gray-50
      borderColor: document.documentElement.classList.contains("dark")
        ? "#ffffff" // border-white
        : "#d1d5db", // border-gray-300
      color: document.documentElement.classList.contains("dark")
        ? "#ffffff"
        : "#111827", // text-gray-900
      borderRadius: "0.5rem", // rounded-lg
      minHeight: "40px",
      boxShadow: state.isFocused ? "0 0 0 1px #60a5fa" : "none", // focus ring
      "&:hover": {
        borderColor: "#60a5fa", // blue-400
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#1f2937" // bg-gray-800
        : "#f9fafb", // bg-gray-50
      borderRadius: "0.5rem",
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? document.documentElement.classList.contains("dark")
          ? "#374151" // bg-gray-700
          : "#e5e7eb" // bg-gray-200
        : "transparent",
      color: document.documentElement.classList.contains("dark")
        ? "#ffffff"
        : "#111827", // text-white or text-gray-900
      "&:active": {
        backgroundColor: document.documentElement.classList.contains("dark")
          ? "#4b5563" // darker gray
          : "#d1d5db", // gray-300
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
        ? "#9ca3af" // text-gray-400
        : "#6b7280", // text-gray-500
    }),
  };

  const fromOptions = useMemo(() => {
    if (!isIncomingSuccess) return [];
    const uniqueFroms = new Set(
      incomingsData.ids
        .map((id) => incomingsData.entities[id]?.from)
        .filter(Boolean)
    );
    return [...uniqueFroms].map((val) => ({ label: val, value: val }));
  }, [incomingsData, isIncomingSuccess]);

  const toOptions = useMemo(() => {
    if (!isIncomingSuccess) return [];
    const uniqueTos = new Set(
      incomingsData.ids
        .map((id) => incomingsData.entities[id]?.to)
        .filter(Boolean)
    );
    return [...uniqueTos].map((val) => ({ label: val, value: val }));
  }, [incomingsData, isIncomingSuccess]);

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

  // Form State
  const [toField, setToField] = useState("");
  const [fromField, setFromField] = useState("");
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [incomingType, setIncomingType] = useState("external");
  const typeOptions = [
    { value: "internal", label: t("internal") },
    { value: "external", label: t("external") },
  ];
  const [borderNumber, setBorderNumber] = useState("");
  const [letterNumber, setLetterNumber] = useState("");
  const [attachment, setAttachment] = useState("");

  useEffect(() => {
    if (isSuccess) {
      setToField("");
      setFromField("");
      setDate("");
      setPurpose("");
      setPassportNumber("");
      setIncomingType("internal");
      setBorderNumber("");
      setLetterNumber("");
      setAttachment("");
      toast.success(t("incoming_added_successfully"));
      navigate("/dashboard/incomings");
    }
  }, [isSuccess, navigate, t]);

  const onSaveIncomingClicked = async (e) => {
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
    formData.append("incomingType", incomingType);
    formData.append("borderNumber", borderNumber);
    formData.append("letterNumber", letterNumber);
    formData.append("attachment", attachment); // ✅ Must be a File object

    try {
      await addNewIncoming(formData).unwrap();
    } catch (err) {
      toast.error(
        t("error_adding_incoming") +
          (err?.data?.message ? `: ${err.data.message}` : "")
      );
    }
  };

  // validate all fields
  // const validateTo = Boolean(toField);
  // const validateFrom = Boolean(fromField);
  // const validateDate = Boolean(date);
  // const validatePurpose = Boolean(purpose);
  // const validatePassportNumber = Boolean(passportNumber);
  // const validateAttachment = Boolean(attachment);

  // const canSave =
  //   [
  //     validateTo,
  //     validateFrom,
  //     validateDate,
  //     validatePurpose,
  //     validatePassportNumber,
  //     validateAttachment,
  //   ].every(Boolean) && !isLoading;

  // Classes
  const errClass = isError ? "errmsg" : "offscreen";

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <p className={errClass}>{error?.data?.message}</p>
      <div className="flex items-center gap-4 mb-4 p-1">
        {/* Back Button */}
        <div className="relative group">
          <button
            onClick={() => navigate("/dashboard/incomings")}
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
        <h1 className="text-4xl text-gray-800 dark:text-white">
          {t("add_incoming")} :
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-700 border-gray-500 rounded-3xl shadow">
        <div className="p-6 space-y-6">
          <form onSubmit={onSaveIncomingClicked}>
            <div className="grid grid-cols-6 gap-6">
              {/* Type */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  className="text-sm font-medium text-gray-900 dark:text-white block mb-2"
                  htmlFor="incomingType"
                >
                  {t("paperType")}
                </label>
                <Select
                  isSearchable={false}
                  options={typeOptions}
                  value={typeOptions.find((opt) => opt.value === incomingType)}
                  onChange={(selected) =>
                    setIncomingType(selected?.value || "")
                  }
                  styles={customSelectStyles}
                />
              </div>
              {/* From */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("from")}
                </label>
                <CreatableSelect
                  key={theme}
                  placeholder={t("choose")}
                  formatCreateLabel={(inputValue) =>
                    `${t("click2create")} "${inputValue}"`
                  }
                  isClearable
                  options={fromOptions}
                  onChange={(newValue) => setFromField(newValue?.value || "")}
                  onCreateOption={(inputValue) => {
                    setFromField(inputValue);
                  }}
                  value={
                    fromField ? { value: fromField, label: fromField } : null
                  }
                  styles={customSelectStyles}
                />
              </div>
              {/* To */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("to")}
                </label>
                <CreatableSelect
                  key={theme}
                  placeholder={t("choose")}
                  formatCreateLabel={(inputValue) =>
                    `${t("click2create")} "${inputValue}"`
                  }
                  isClearable
                  options={toOptions}
                  onChange={(newValue) => setToField(newValue?.value || "")}
                  onCreateOption={(inputValue) => {
                    setToField(inputValue);
                  }}
                  value={toField ? { value: toField, label: toField } : null}
                  styles={customSelectStyles}
                />
              </div>
              {/* letterNumber */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("letterNumber")}
                </label>
                <input
                  type="text"
                  id="letterNumber"
                  name="letterNumber"
                  value={letterNumber}
                  onChange={(e) => setLetterNumber(e.target.value)}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>
              {/* Date */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("date")}
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
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
                  id="purpose"
                  name="purpose"
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
                  id="passportNumber"
                  name="passportNumber"
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
                  id="borderNumber"
                  name="borderNumber"
                  value={borderNumber}
                  onChange={(e) => setBorderNumber(e.target.value)}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>
              {/* Attachment */}
              <div className="col-span-6 sm:col-span-6">
                <label className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t("attachment")}
                  {fileSizeError && (
                    <span className="text-sm text-red-600 mx-2">
                      {t("file_too_large", { size: "10MB" }) ||
                        "File size must be 10MB or less."}
                    </span>
                  )}
                </label>
                <div
                  {...getRootProps()}
                  className="flex items-center justify-between px-4 py-2.5 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <span className="text-sm text-center mx-auto">
                      {t("drop_here")}
                    </span>
                  ) : attachment ? (
                    <div className="flex items-center justify-between w-full">
                      <p className="text-sm truncate">{attachment.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent triggering file dialog
                          setAttachment("");
                        }}
                        className="ml-3 text-red-500 hover:text-red-700 text-sm cursor-pointer"
                      >
                        ❌
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-center w-full">
                      {t("drag_drop_or_click")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="text-black dark:text-white bg-gray-100  dark:bg-gray-800 border dark:border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed focus:ring-4 focus:ring-cyan-200 font-medium rounded-4xl text-sm px-5 py-2.5"
                // disabled={!canSave}
              >
                {t("add_incoming")} ✅
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddIncomingForm;
