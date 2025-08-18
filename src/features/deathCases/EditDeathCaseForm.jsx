import { useState, useEffect } from "react";
import {
  useGetDeathcaseQuery,
  useUpdateDeathcaseMutation,
  useDeleteDeathcaseMutation,
} from "./deathCasesApiSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import i18n from "../../../i18n";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import LoadingSpinner from "../../components/LoadingSpinner";

const attachmentFields = [
  { key: "entryStamp", labelKey: "entryStamp" },
  { key: "deathCertificate", labelKey: "deathCertificate" },
  { key: "passportAttachment", labelKey: "passport" },
  { key: "visaAttachment", labelKey: "visa" },
  { key: "consulateCertificate", labelKey: "consulateCertificate" },
  { key: "deathReport", labelKey: "deathReport" },
  { key: "hospitalLetter", labelKey: "hospitalLetter" },
  { key: "corpseBurialPermit", labelKey: "corpseBurialPermit" },
  { key: "policeLetter", labelKey: "policeLetter" },
  { key: "otherAttachment", labelKey: "others" },
];

const NATIONALITIES = [
  "Saudi Arabia",
  "India",
  "Pakistan",
  "Bangladesh",
  "Philippines",
  "Nepal",
  "Sri Lanka",
  "Egypt",
  "Sudan",
  "Yemen",
  "Indonesia",
  "Jordan",
];

const EditDeathcaseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    data: deathcase,
    isLoading: isFetching,
    isError: fetchError,
  } = useGetDeathcaseQuery(id);

  const [updateDeathcase, { isLoading: isUpdating, isSuccess, isError, error }] =
    useUpdateDeathcaseMutation();

  const [
    deleteDeathcase,
    { isLoading: isDeleting, isSuccess: isDelSuccess, isError: isDelError, error: delError },
  ] = useDeleteDeathcaseMutation();

  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [sex, setSex] = useState("M");
  const [nationality, setNationality] = useState("");

  const [passportNumber, setPassportNumber] = useState("");
  const [borderNumber, setBorderNumber] = useState("");
  const [visaNumber, setVisaNumber] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [cityOfDeath, setCityOfDeath] = useState("");
  const [hospital, setHospital] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");

  const [newFiles, setNewFiles] = useState(
    attachmentFields.reduce((acc, f) => ({ ...acc, [f.key]: null }), {})
  );
  const [existingUrls, setExistingUrls] = useState(
    attachmentFields.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {})
  );
  const [fileSizeError, setFileSizeError] = useState({});

  const handleDeleteClick = () => setShowDeleteModal(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleCancelDelete = () => setShowDeleteModal(false);
  const handleConfirmDelete = async () => {
    try {
      await deleteDeathcase({ id }).unwrap();
    } catch {}
    setShowDeleteModal(false);
  };

  useEffect(() => {
    if (deathcase) {
      setIdentifier(deathcase.identifier);
      setName(deathcase.name || "");
      setSex(deathcase.sex || "M");
      setNationality(deathcase.nationality || "");
      setPassportNumber(deathcase.passportNumber || "");
      setBorderNumber(deathcase.borderNumber || "");
      setVisaNumber(deathcase.visaNumber || "");
      setDateOfDeath(deathcase.dateOfDeath ? deathcase.dateOfDeath.slice(0, 10) : "");
      setCityOfDeath(deathcase.cityOfDeath || "");
      setHospital(deathcase.hospital || "");
      setComment(deathcase.comment || "");
      setStatus(deathcase.status || "");

      // existing attachments
      setExistingUrls((prev) => {
        const u = { ...prev };
        attachmentFields.forEach(({ key }) => {
          u[key] = deathcase[key] || "";
        });
        return u;
      });
      setNewFiles(attachmentFields.reduce((acc, f) => ({ ...acc, [f.key]: null }), {}));
    }
  }, [deathcase]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(t("deathcase_updated_successfully"));
      navigate("/dashboard/deathcases");
    } else if (isError) {
      toast.error(error?.data?.message || t("error_updating_deathcase"));
    }

    if (isDelSuccess) {
      toast.success(t("deathcase_deleted_successfully"));
      navigate("/dashboard/deathcases");
    } else if (isDelError) {
      toast.error(delError?.data?.message || t("error_deleting_deathcase"));
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

  const makeDrop = (fieldKey) => (accepted) => {
    const file = accepted[0];
    const tooBig = file && file.size > 10 * 1024 * 1024;
    setNewFiles((prev) => ({ ...prev, [fieldKey]: tooBig ? null : file || null }));
    setFileSizeError((prev) => ({ ...prev, [fieldKey]: !!tooBig }));
    if (!tooBig && file) {
      // we're replacing; clear shown existing name
      setExistingUrls((prev) => ({ ...prev, [fieldKey]: "" }));
    }
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

  const onSaveClicked = async (e) => {
    e.preventDefault();

    if (!name || !sex || !nationality) {
      return toast.error(t("required_fields_missing"));
    }

    const hasErr = Object.values(fileSizeError).some(Boolean);
    if (hasErr) return toast.error(t("file_too_large", { size: "10MB" }));

    const formData = new FormData();
    formData.append("id", id);
    // Optional: identifier editing — if backend ignores, no harm
    if (identifier) formData.append("identifier", identifier);

    formData.append("name", name);
    formData.append("sex", sex);
    formData.append("nationality", nationality);
    formData.append("passportNumber", passportNumber);
    formData.append("borderNumber", borderNumber);
    formData.append("visaNumber", visaNumber);
    formData.append("dateOfDeath", dateOfDeath);
    formData.append("cityOfDeath", cityOfDeath);
    formData.append("hospital", hospital);
    formData.append("comment", comment);
    formData.append("status", status);

    attachmentFields.forEach(({ key }) => {
      if (newFiles[key]) {
        formData.append(key, newFiles[key]);
      }
      // NOTE: no explicit "remove" flags supported by backend for individual attachments
    });

    await updateDeathcase(formData).unwrap();
  };

  const errClass = isError || isDelError ? "errmsg" : "offscreen";
  const errMsg = error?.data?.message || delError?.data?.message || "";

  if (isFetching) return <LoadingSpinner />;
  if (fetchError) return <p className="p-4">{t("error_loading_deathcase")}</p>;

  return (
    <>
      {(isUpdating || isDeleting) && <LoadingSpinner />}
      <p className={errClass}>{errMsg}</p>

      <div className="flex items-center gap-4 mb-4 p-1">
        <button
          onClick={() => navigate("/dashboard/deathcases")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
        >
          {i18n.language === "ar" ? (
            <ArrowRight size={20} />
          ) : (
            <ArrowLeft size={20} />
          )}
        </button>

        <label htmlFor="identifier" className="text-4xl text-gray-800 dark:text-white">
          {t("edit_deathcase")}
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
            {/* Name */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium dark:text-white block mb-2">
                {t("name")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="shadow-sm bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
              />
            </div>

            {/* Sex */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium dark:text-white block mb-2">
                {t("sex")}
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="cursor-pointer shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
              >
                <option value="M">{t("male") || "Male"}</option>
                <option value="F">{t("female") || "Female"}</option>
              </select>
            </div>

            {/* Nationality */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium dark:text-white block mb-2">
                {t("nationality")}
              </label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="cursor-pointer shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
              >
                <option value="">{t("select_nationality")}</option>
                {NATIONALITIES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Passport */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium dark:text-white block mb-2">
                {t("passport")}
              </label>
              <input
                type="text"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                className="shadow-sm bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
              />
            </div>

            {/* Border Number */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium dark:text-white block mb-2">
                {t("borderNumber")}
              </label>
              <input
                type="text"
                value={borderNumber}
                onChange={(e) => setBorderNumber(e.target.value)}
                className="shadow-sm bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
              />
            </div>

            {/* Visa Number */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium dark:text-white block mb-2">
                {t("visaNumber")}
              </label>
              <input
                type="text"
                value={visaNumber}
                onChange={(e) => setVisaNumber(e.target.value)}
                className="shadow-sm bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
              />
            </div>

            {/* Date of Death */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium dark:text-white block mb-2">
                {t("dateOfDeath")}
              </label>
              <input
                type="date"
                value={dateOfDeath}
                onChange={(e) => setDateOfDeath(e.target.value)}
                className="cursor-pointer shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* City of Death */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium dark:text-white block mb-2">
                {t("cityOfDeath")}
              </label>
              <input
                type="text"
                value={cityOfDeath}
                onChange={(e) => setCityOfDeath(e.target.value)}
                className="shadow-sm bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
              />
            </div>

            {/* Hospital */}
            <div className="col-span-6 sm:col-span-3">
              <label className="text-sm font-medium dark:text-white block mb-2">
                {t("hospital")}
              </label>
              <input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="shadow-sm bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
              />
            </div>

            {/* Comment */}
            <div className="col-span-6">
              <label className="text-sm font-medium dark:text-white block mb-2">
                {t("comment")}
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="shadow-sm bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
              />
            </div>

            {/* Attachments (replaceable) */}
            {attachmentFields.map(({ key, labelKey }) => {
              const { getRootProps, getInputProps, isDragActive } = dropzones[key];
              const chosen = newFiles[key];
              const existing = existingUrls[key];
              return (
                <div key={key} className="col-span-6 sm:col-span-3">
                  <label className="text-sm font-medium dark:text-white block mb-2">
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
                    className="flex items-center justify-between px-4 py-2 border-2 border-dashed bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition rounded-lg"
                  >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <p className="text-sm">{t("drop_here")}</p>
                    ) : chosen ? (
                      <div className="flex items-center justify-between w-full">
                        <p className="truncate text-sm">{chosen.name}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewFiles((prev) => ({ ...prev, [key]: null }));
                            // don't restore previous URL name; it's still in existingUrls (may be blank)
                          }}
                          className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                        >
                          ❌
                        </button>
                      </div>
                    ) : existing ? (
                      <div className="flex items-center justify-between w-full">
                        <a
                          href={existing}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {existing.split("/").pop()}
                        </a>
                        {/* No server-side remove flag — we only allow replacement */}
                      </div>
                    ) : (
                      <p className="text-center text-sm w-full">
                        {t("drag_drop_or_click")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center pt-6">
            <button
              type="submit"
              disabled={isUpdating}
              className="text-black dark:text-white bg-gray-100  dark:bg-gray-800 border dark:border-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:ring-4 font-medium rounded-4xl text-sm px-5 py-2.5 cursor-pointer"
            >
              {t("save")} 💾
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="text-black dark:text-white bg-gray-100  dark:bg-gray-800 border dark:border-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium rounded-4xl text-sm px-5 py-2.5 mx-2 cursor-pointer"
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

export default EditDeathcaseForm;
