import { useState, useEffect, useMemo } from "react";
import {
  useGetOutgoingQuery,
  useUpdateOutgoingMutation,
  useDeleteOutgoingMutation,
  useGetOutgoingsQuery
} from "./outgoingsApiSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import i18n from "../../../i18n";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import LoadingSpinner from "../../components/LoadingSpinner";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";

const EditOutgoingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    data: outgoing,
    isLoading: isFetching,
    isError: fetchError,
  } = useGetOutgoingQuery(id);

  const {
      data: outgoingsData,
      isSuccess: isOutgoingSuccess,
    } = useGetOutgoingsQuery();

  const [updateOutgoing, { isLoading: isUpdating, isSuccess, isError, error }] =
    useUpdateOutgoingMutation();

  const [
    deleteOutgoing,
    {
      isLoading: isDeleting,
      isSuccess: isDelSuccess,
      isError: isDelError,
      error: delError,
    },
  ] = useDeleteOutgoingMutation();

  const [identifier, setIdentifier] = useState("");
  const [toField, setToField] = useState("");
  const [fromField, setFromField] = useState("");
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [outgoingType, setOutgoingType] = useState("external");
  const typeOptions = [
    { value: "internal", label: t("internal") },
    { value: "external", label: t("external") },
  ];
  const [borderNumber, setBorderNumber] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [existingAttachmentUrl, setExistingAttachmentUrl] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleDeleteClick = () => setShowDeleteModal(true);
  const handleCancelDelete = () => setShowDeleteModal(false);
  const handleConfirmDelete = async () => {
    try {
      await deleteOutgoing({ id }).unwrap();
    } catch {
      /** handled by effect */
    }
    setShowDeleteModal(false);
  };

  useEffect(() => {
    if (outgoing) {
      setIdentifier(outgoing.identifier)
      setToField(outgoing.to || "");
      setFromField(outgoing.from || "");
      setDate(outgoing.date ? outgoing.date.slice(0, 10) : "");
      setPurpose(outgoing.purpose || "");
      setPassportNumber(outgoing.passportNumber || "");
      setOutgoingType(outgoing.outgoingType || "external");
      setBorderNumber(outgoing.borderNumber || "");
      setExistingAttachmentUrl(outgoing.attachment || "");
      setAttachment(null);
    }
  }, [outgoing]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(t("outgoing_updated_successfully"));
      navigate("/dashboard/outgoings");
    } else if (isError) {
      toast.error(error?.data?.message || t("error_updating_outgoing"));
    }
    if (isDelSuccess) {
      toast.success(t("outgoing_deleted_successfully"));
      navigate("/dashboard/outgoings");
    } else if (isDelError) {
      toast.error(delError?.data?.message || t("error_deleting_outgoing"));
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
  
    const fromOptions = useMemo(() => {
      if (!isOutgoingSuccess || !outgoingsData?.ids) return [];
      const uniqueFroms = new Set(
        outgoingsData.ids
          .map((id) => outgoingsData.entities[id]?.from)
          .filter(Boolean)
      );
      return [...uniqueFroms].map((val) => ({ label: val, value: val }));
    }, [outgoingsData, isOutgoingSuccess]);
  
    const toOptions = useMemo(() => {
      if (!isOutgoingSuccess || !outgoingsData?.ids) return [];
      const uniqueTos = new Set(
        outgoingsData.ids
          .map((id) => outgoingsData.entities[id]?.to)
          .filter(Boolean)
      );
      return [...uniqueTos].map((val) => ({ label: val, value: val }));
    }, [outgoingsData, isOutgoingSuccess]);




  const [fileSizeError, setFileSizeError] = useState(false);
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setAttachment(file);
      setExistingAttachmentUrl("");
      setFileSizeError(false);
    } else {
      setAttachment(null);
      setExistingAttachmentUrl("");
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

  const onSaveClicked = async (e) => {
    e.preventDefault();
    if (!attachment && !existingAttachmentUrl) {
      return toast.error(t("attachment_required"));
    }
    if (fileSizeError) {
      return toast.error(t("file_too_large", { size: "10MB" }));
    }
    const formData = new FormData();
    formData.append("identifier", identifier);
    formData.append("id", id);
    formData.append("to", toField);
    formData.append("from", fromField);
    formData.append("date", date);
    formData.append("purpose", purpose);
    formData.append("outgoingType", outgoingType);
    formData.append("borderNumber", borderNumber);
    formData.append("passportNumber", passportNumber);
    if (attachment) formData.append("attachment", attachment);
    if (!attachment && !existingAttachmentUrl) {
      formData.append("removeAttachment", "true");
    }
    await updateOutgoing(formData).unwrap();
  };

  const errClass = isError || isDelError ? "errmsg" : "offscreen";
  const errMsg = error?.data?.message || delError?.data?.message || "";

  if (isFetching) return <LoadingSpinner />;
  if (fetchError) return <p className="p-4">{t("error_loading_outgoing")}</p>;

  return (
    <>
      {(isUpdating || isDeleting) && <LoadingSpinner />}
      <p className={errClass}>{errMsg}</p>

      <div className="flex items-center gap-4 mb-4 p-1">
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
        {/* <h1 className="text-4xl text-gray-800 dark:text-white">
          {t("edit_outgoing")} : {outgoing.identifier}
        </h1> */}
        <label htmlFor="identifier" className="text-4xl text-gray-800 dark:text-white">
          {t("edit_outgoing")}
         </label>
         <input
           type="text"
          id="identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="text-xl sm:text-3xl font-bold bg-transparent border-b border-gray-400 dark:border-gray-500 focus:outline-none focus:border-black dark:focus:border-white text-gray-900 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-gray-700 border-gray-500 rounded-3xl shadow p-6 space-y-6">
        <form onSubmit={onSaveClicked}>
          <div className="grid grid-cols-6 gap-6">
            {/* Type */}
                            <div className="col-span-6 sm:col-span-3">
                <label
                  className="text-sm font-medium text-gray-900 dark:text-white block mb-2"
                  htmlFor="outgoingType"
                >
                  {t("paperType")}
                </label>
                <Select
                  isSearchable={false}
                  options={typeOptions}
                  value={typeOptions.find((opt) => opt.value === outgoingType)}
                  onChange={(selected) =>
                    setOutgoingType(selected?.value || "")
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
            {["date", "purpose", "passportNumber", "borderNumber"].map(
              (field) => (
                <div key={field} className="col-span-6 sm:col-span-3">
                  <label className="text-sm font-medium dark:text-white block mb-2">
                    {t(field)}
                  </label>
                  <input
                    type={field === "date" ? "date" : "text"}
                    id={field}
                    name={field}
                    value={
                        field === "date"
                        ? date
                        : field === "purpose"
                        ? purpose
                        : field === "borderNumber"
                        ? borderNumber
                        : passportNumber
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (field === "date") setDate(v);
                      else if (field === "purpose") setPurpose(v);
                      else if (field === "borderNumber") setBorderNumber(v);
                      else setPassportNumber(v);
                    }}
                    className="shadow-sm bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                  />
                </div>
              )
            )}

            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium dark:text-white block mb-2">
                {t("attachment")}
                {fileSizeError && (
                  <span className="text-sm text-red-600 mx-2">
                    {t("file_too_large", { size: "10MB" })}
                  </span>
                )}
              </label>
              <div
                {...getRootProps()}
                className="flex items-center justify-between px-4 py-2 border-2 border-dashed bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition rounded-lg"
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className="text-sm">{t("drop_here")}</p>
                ) : attachment ? (
                  <div className="flex items-center justify-between w-full">
                    <p className="truncate text-sm">{attachment.name}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttachment(null);
                        setExistingAttachmentUrl("");
                      }}
                      className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                    >
                      ❌
                    </button>
                  </div>
                ) : existingAttachmentUrl ? (
                  <div className="flex items-center justify-between w-full">
                    <p className="truncate text-sm">
                      {existingAttachmentUrl.split("/").pop()}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttachment(null);
                        setExistingAttachmentUrl("");
                      }}
                      className="ml-3 text-red-500 hover:text-red-700 text-sm cursor-pointer"
                    >
                      ❌
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-sm w-full">
                    {t("drag_drop_or_click")}
                  </p>
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

export default EditOutgoingForm;
