import { useState, useEffect } from "react";
import { useAddNewDeathcaseMutation } from "./deathCasesApiSlice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import i18n from "../../../i18n";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import LoadingSpinner from "../../components/LoadingSpinner";
import { nationalities } from "../../config/nationalities";

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

const AddDeathcaseForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [addNewDeathcase, { isLoading, isSuccess, isError, error }] =
    useAddNewDeathcaseMutation();

  // Required
  const [name, setName] = useState("");
  const [sex, setSex] = useState("M");
  const [nationality, setNationality] = useState("");

  // Optional
  const [passportNumber, setPassportNumber] = useState("");
  const [borderNumber, setBorderNumber] = useState("");
  const [visaNumber, setVisaNumber] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [cityOfDeath, setCityOfDeath] = useState("");
  const [hospital, setHospital] = useState("");
  const [comment, setComment] = useState("");

  // Attachments state
  const [files, setFiles] = useState(
    attachmentFields.reduce((acc, f) => ({ ...acc, [f.key]: null }), {})
  );
  const [fileSizeError, setFileSizeError] = useState({});

  useEffect(() => {
    if (isSuccess) {
      setName("");
      setSex("M");
      setNationality("");
      setPassportNumber("");
      setBorderNumber("");
      setVisaNumber("");
      setDateOfDeath("");
      setCityOfDeath("");
      setHospital("");
      setComment("");
      setFiles(attachmentFields.reduce((acc, f) => ({ ...acc, [f.key]: null }), {}));
      toast.success(t("deathcase_added_successfully"));
      navigate("/dashboard/deathcases");
    }
  }, [isSuccess, navigate, t]);

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

  const onSaveClicked = async (e) => {
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
    formData.append("name", name);
    formData.append("sex", sex);
    formData.append("nationality", nationality);
    if (passportNumber) formData.append("passportNumber", passportNumber);
    if (borderNumber) formData.append("borderNumber", borderNumber);
    if (visaNumber) formData.append("visaNumber", visaNumber);
    if (dateOfDeath) formData.append("dateOfDeath", dateOfDeath);
    if (cityOfDeath) formData.append("cityOfDeath", cityOfDeath);
    if (hospital) formData.append("hospital", hospital);
    if (comment) formData.append("comment", comment);

    attachmentFields.forEach(({ key }) => {
      if (files[key]) formData.append(key, files[key]);
    });

    try {
      await addNewDeathcase(formData).unwrap();
    } catch (err) {
      toast.error(
        t("error_adding_deathcase") +
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
            onClick={() => navigate("/dashboard/deathcases")}
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
          {t("add_deathcase")} :
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-700 border-gray-500 rounded-3xl shadow">
        <div className="p-6 space-y-6">
          <form onSubmit={onSaveClicked}>
            <div className="grid grid-cols-6 gap-6">
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

              {/* Sex (required) */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
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

              {/* Nationality (required, dropdown) */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("nationality")}
                </label>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="cursor-pointer shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">{t("select_nationality")}</option>
                    {nationalities.map((n) => (
                    <option key={n.value} value={n.value}>
                      {n.label}
                    </option>
                  ))}
                </select>
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

              {/* Date of Death */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
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
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("cityOfDeath")}
                </label>
                <input
                  type="text"
                  value={cityOfDeath}
                  onChange={(e) => setCityOfDeath(e.target.value)}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Hospital */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("hospital")}
                </label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
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

              {/* Attachments (10) */}
              {attachmentFields.map(({ key, labelKey }) => {
                const { getRootProps, getInputProps, isDragActive } = dropzones[key];
                const chosen = files[key];
                return (
                  <div key={key} className="col-span-6 sm:col-span-3">
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

            <div className="pt-6">
              <button
                type="submit"
                className="text-black dark:text-white bg-gray-100  dark:bg-gray-800 border dark:border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed focus:ring-4 focus:ring-cyan-2 00 font-medium rounded-4xl text-sm px-5 py-2.5"
              >
                {t("add_deathcase")} ✅
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddDeathcaseForm;
