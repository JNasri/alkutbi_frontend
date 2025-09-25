import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  useAddNewPrisoncaseMutation,
  useGetPrisoncasesQuery,
} from "./prisonCasesApiSlice";
import { nationalities } from "../../config/nationalities";

const AddPrisonCaseForm = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

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
      cursor:"pointer",
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

  const attachmentFields = [
  { key: "passportAttachment", labelKey: "passport" },
  { key: "visaAttachment", labelKey: "visa" },
];

 // Attachments state
  const [files, setFiles] = useState(
    attachmentFields.reduce((acc, f) => ({ ...acc, [f.key]: null }), {})
  );
  const [fileSizeError, setFileSizeError] = useState({});

   const makeDrop = (fieldKey) => (accepted) => {
      const file = accepted[0];
      setFiles((prev) => ({
        ...prev,
        [fieldKey]:
          file && file.size <= 10 * 1024 * 1024 ? file : null,
      }));
      setFileSizeError((prev) => ({
        ...prev,
        [fieldKey]: file && file.size > 10 * 1024 * 1024,
      }));
    };
  
    const dropzones = attachmentFields.reduce((acc, { key }) => {
      acc[key] = useDropzone({
        onDrop: makeDrop(key),
        multiple: false,
        accept: {
          "application/pdf": [".pdf"],
          "application/msword": [".doc", ".docx"],
          "image/*": [".jpg", ".jpeg", ".png"],
        },
      });
      return acc;
    }, {});

  const [addNewPrisoncase, { isLoading, isSuccess, isError, error }] =
    useAddNewPrisoncaseMutation();
  const { data: prisoncasesData, isSuccess: isPrisoncasesSuccess } =
    useGetPrisoncasesQuery("prisoncasesList");

  const [passportAttachment, setPassportAttachment] = useState("");
  const [visaAttachment, setVisaAttachment] = useState("");
  const [fileError, setFileError] = useState(false);

  const [timeline, setTimeline] = useState([]);
  const [newTimelineEntry, setNewTimelineEntry] = useState({
    date: "",
    note: "",
  });

  const onDropPassport = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setPassportAttachment(file);
    } else {
      setPassportAttachment("");
      setFileError(true);
    }
  };

  const onDropVisa = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setVisaAttachment(file);
    } else {
      setVisaAttachment("");
      setFileError(true);
    }
  };

  const {
    getRootProps: getPassportRootProps,
    getInputProps: getPassportInputProps,
  } = useDropzone({
    onDrop: onDropPassport,
    multiple: false,
  });

  const {
    getRootProps: getVisaRootProps,
    getInputProps: getVisaInputProps,
  } = useDropzone({
    onDrop: onDropVisa,
    multiple: false,
  });

  // Form state
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [sex, setSex] = useState("M");
  const [nationality, setNationality] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [borderNumber, setBorderNumber] = useState("");
  const [visaNumber, setVisaNumber] = useState("");
  const [agent, setAgent] = useState("");
  const [dateOfArrest, setDateOfArrest] = useState("");
  const [prisonOrStation, setPrisonOrStation] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("new");

  const sexOptions = [
    { value: "M", label: t("Male") },
    { value: "F", label: t("Female") },
  ];


  const handleAddTimelineEntry = () => {
    if (!newTimelineEntry.date || !newTimelineEntry.note) return;
    setTimeline((prev) => [...prev, newTimelineEntry]);
    setNewTimelineEntry({ date: "", note: "" });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(t("prisoncase_added_successfully"));
      navigate("/dashboard/prisoncases");
    }
  }, [isSuccess, navigate, t]);

  const onSavePrisoncaseClicked = async (e) => {
    e.preventDefault();

     if (!name || !sex || !nationality) {
          return toast.error(t("required_fields_missing"));
        }
        // block if any size errors
        const hasErr = Object.values(fileSizeError).some(Boolean);
        if (hasErr) {
          return toast.error(t("file_too_large", { size: "10MB" }));
        }
    const formData = new FormData();
    formData.append("identifier", identifier);
    formData.append("name", name);
    formData.append("sex", sex);
    formData.append("nationality", nationality);
    formData.append("passportNumber", passportNumber);
    formData.append("borderNumber", borderNumber);
    formData.append("visaNumber", visaNumber);
    formData.append("agent", agent);
    formData.append("dateOfArrest", dateOfArrest);
    formData.append("prisonOrStation", prisonOrStation);
    formData.append("comment", comment);
    formData.append("status", status);
    formData.append("timeline", JSON.stringify(timeline));
    if (files.passportAttachment) {
  formData.append("passportAttachment", files.passportAttachment);
}
if (files.visaAttachment) {
  formData.append("visaAttachment", files.visaAttachment);
}

    try {
      await addNewPrisoncase(formData).unwrap();
    } catch (err) {
      toast.error(t("error_adding_prisoncase") + `: ${err?.data?.message || ""}`);
    }
  };

  const customInputClass =
    "shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white";

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className="flex items-center gap-4 mb-4 p-1">
        <button
          onClick={() => navigate("/dashboard/prisoncases")}
          className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:bg-gray-200 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {i18n.language === "ar" ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          {t("add_prisoncase")}
        </h1>
      </div>
      <div className="bg-white dark:bg-gray-700 border-gray-500 rounded-3xl shadow">
      <form onSubmit={onSavePrisoncaseClicked} className="space-y-6 p-6">
        <div className="grid grid-cols-6 gap-6">
            {/* Status Toggle */}
                <div className="col-span-6 sm:col-span-6">
                  <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                    {t("status")}
                  </label>
                  <div className="flex space-x-4">
                  {["new", "in_progress", "complete"].map((value) => {
                    let activeClasses = "";
                    if (status === value) {
                      if (value === "new") activeClasses = "bg-blue-400 text-white border-blue-400";
                      else if (value === "in_progress") activeClasses = "bg-orange-400 text-white border-orange-500";
                      else if (value === "complete") activeClasses = "bg-green-500 text-white border-green-600";
                    } else {
                      activeClasses = "bg-gray-100 text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-white";
                    }

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setStatus(value)}
                        className={`px-4 py-2 text-sm rounded-lg border transition-colors cursor-pointer ${activeClasses}`}
                      >
                        {t(value)}
                      </button>
                    );
                  })}
                </div>
                </div>
          {/* Name (required) */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("name")}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("sex")}
                </label>
          <Select
            isSearchable={false}
            options={sexOptions}
            value={sexOptions.find((opt) => opt.value === sex)}
            onChange={(selected) => setSex(selected?.value)}
            styles={customSelectStyles}
          />
              </div>
        {/* Nationality (required, dropdown) */}
                      <div className="col-span-6 sm:col-span-3">
                        <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                          {t("nationality")}
                        </label>
                        <Select
                           isSearchable={false}
                            options={nationalities}
                            value={nationalities.find((opt) => opt.value === nationality)}
                          styles={customSelectStyles}
                          onChange={(selected) => setNationality(selected?.value)}
                        />
                      </div>
              {/* Passport */}
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

              {/* Visa Number */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("visaNumber")}
                </label>
                <input
                  type="text"
                  value={visaNumber}
                  onChange={(e) => setVisaNumber(e.target.value)}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>
              {/* Agent */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("agent")}
                </label>
                <input
                  type="text"
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
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
                  value={dateOfArrest}
                  onChange={(e) => setDateOfArrest(e.target.value)}
                  className="cursor-pointer shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>
              {/* prison or police station */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("prisonOrStation")}
                </label>
                <input
                  type="text"
                  value={prisonOrStation}
                  onChange={(e) => setPrisonOrStation(e.target.value)}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>
          {/* Comment */}
              <div className="col-span-6">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("comment")}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>
               {/* Attachments */}
              {attachmentFields.map(({ key, labelKey }) => {
                const { getRootProps, getInputProps, isDragActive } = dropzones[key];
                const chosen = files[key];
                return (
                  <div key={key} className="col-span-6 sm:col-span-3 cursor-pointer">
                    <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                      {t(labelKey)}
                      {fileSizeError[key] && (
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
                      ) : chosen ? (
                        <div className="flex items-center justify-between w-full">
                          <p className="text-sm truncate">{chosen.name}</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFiles((prev) => ({ ...prev, [key]: null }));
                              setFileSizeError((prev) => ({ ...prev, [key]: false }));
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
                );
              })}
        </div>

        {/* Timeline */}
        <div className="space-y-2 mt-6">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            {t("timeline")}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <input
              type="date"
              value={newTimelineEntry.date}
              onChange={(e) =>
                setNewTimelineEntry({ ...newTimelineEntry, date: e.target.value })
              }
              className={customInputClass}
            />
            
            <input
              type="text"
              placeholder={t("message")}
              value={newTimelineEntry.note}
              onChange={(e) =>
                setNewTimelineEntry({ ...newTimelineEntry, note: e.target.value })
              }
              className={customInputClass}
            />
            <button
              type="button"
              onClick={handleAddTimelineEntry}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 cursor-pointer"
            >
              <Plus size={16} />
              {t("add")}
            </button>
          </div>

          {timeline.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {timeline.map((item, idx) => (
                {idx},
                <li
                  key={idx}
                  className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md"
                >
                  <span>
                    {item.date} - {item.note}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setTimeline((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Submit */}
        <button
                type="submit"
                className="text-black dark:text-white bg-gray-100  dark:bg-gray-800 border dark:border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed focus:ring-4 focus:ring-cyan-2 00 font-medium rounded-4xl text-sm px-5 py-2.5"
              >
                {t("add_prisoncase")} ✅
              </button>
      </form>
      </div>
    </>
  );
};

export default AddPrisonCaseForm;
