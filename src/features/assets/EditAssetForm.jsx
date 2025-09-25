import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import i18n from "../../../i18n";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  useUpdateAssetMutation,
  useGetAssetsQuery,
  useDeleteAssetMutation,
} from "./assetsApiSlice";

const EditAssetForm = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    data: assetsData,
    isSuccess: isAssetsSuccess,
    isLoading: isAssetsLoading,
  } = useGetAssetsQuery("assetsList");

  const [updateAsset, { isLoading, isSuccess, isError, error }] =
    useUpdateAssetMutation();

  const [
    deleteAsset,
    {
      isLoading: isDeleting,
      isSuccess: isDelSuccess,
      isError: isDelError,
      error: delError,
    },
  ] = useDeleteAssetMutation();

  const asset = isAssetsSuccess ? assetsData?.entities?.[id] : null;

  const [identifier, setIdentifier] = useState("");
  const [description, setDescription] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [addedinJisr, setAddedinJisr] = useState(false);
  const [handoverDate, setHandoverDate] = useState("");
  const [comment, setComment] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => setShowDeleteModal(true);
  const handleCancelDelete = () => setShowDeleteModal(false);
  const handleConfirmDelete = async () => {
    try {
      await deleteAsset({ id }).unwrap();
    } catch {
      /** handled by effect */
    }
    setShowDeleteModal(false);
  };

  useEffect(() => {
    if (asset) {
      setIdentifier(asset.identifier || "");
      setDescription(asset.description || "");
      setEmployeeName(asset.employeeName || "");
      setDepartment(asset.department || "");
      setAddedinJisr(asset.addedinJisr || false);
      setHandoverDate(asset.handoverDate || "");
      setComment(asset.comment || "");
    }
  }, [asset]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(t("asset_updated_successfully"));
      navigate("/dashboard/assets");
    } else if (isError) {
      toast.error(error?.data?.message || t("error_updating_asset"));
    }
    if (isDelSuccess) {
      toast.success(t("asset_deleted_successfully"));
      navigate("/dashboard/assets");
    } else if (isDelError) {
      toast.error(delError?.data?.message || t("error_deleting_asset"));
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

  const employeeOptions = useMemo(() => {
    if (!isAssetsSuccess) return [];
    const unique = new Set(
      assetsData.ids
        .map((id) => assetsData.entities[id]?.employeeName)
        .filter(Boolean)
    );
    return [...unique].map((val) => ({ label: val, value: val }));
  }, [assetsData, isAssetsSuccess]);

  const departmentOptions = useMemo(() => {
    if (!isAssetsSuccess) return [];
    const unique = new Set(
      assetsData.ids
        .map((id) => assetsData.entities[id]?.department)
        .filter(Boolean)
    );
    return [...unique].map((val) => ({ label: val, value: val }));
  }, [assetsData, isAssetsSuccess]);

  const handleUpdateAsset = async (e) => {
    e.preventDefault();

    if (!identifier || !id) {
      toast.error(t("identifier_required"));
      return;
    }

    try {
      await updateAsset({
        id,
        identifier,
        description,
        employeeName,
        department,
        addedinJisr,
        handoverDate,
        comment,
      }).unwrap();
    } catch (err) {
      console.error("Update asset error:", err);
      toast.error(
        t("error_updating_asset") +
          (err?.data?.message ? `: ${err.data.message}` : "")
      );
    }
  };

  const errClass = isError || isDelError ? "errmsg" : "offscreen";
  const errMsg = error?.data?.message || delError?.data?.message || "";

  if (isAssetsLoading) return <LoadingSpinner />;
  if (!asset) return <p>{t("asset_not_found")}</p>;

  return (
    <>
      {(isLoading || isDeleting) && <LoadingSpinner />}
      <p className={errClass}>{errMsg}</p>

      <div className="flex items-center gap-4 mb-4 p-1">
        <button
          onClick={() => navigate("/dashboard/assets")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
        >
          {i18n.language === "ar" ? (
            <ArrowRight size={20} />
          ) : (
            <ArrowLeft size={20} />
          )}
        </button>

        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          {t("edit_asset")} :
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-700 border-gray-500 rounded-3xl shadow">
        <div className="p-6 space-y-6">
          <form onSubmit={handleUpdateAsset}>
            <div className="grid grid-cols-6 gap-6">
              {/* Identifier */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("identifier")} *
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Description */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("description")}
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Employee Name */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("employee_name")}
                </label>
                <CreatableSelect
                  key={theme}
                  isClearable
                  options={employeeOptions}
                  onChange={(newValue) =>
                    setEmployeeName(newValue?.value || "")
                  }
                  onCreateOption={(inputValue) => {
                    setEmployeeName(inputValue);
                  }}
                  value={
                    employeeName
                      ? { value: employeeName, label: employeeName }
                      : null
                  }
                  styles={customSelectStyles}
                />
              </div>

              {/* Department */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("department")}
                </label>
                <CreatableSelect
                  key={theme}
                  isClearable
                  options={departmentOptions}
                  onChange={(newValue) => setDepartment(newValue?.value || "")}
                  onCreateOption={(inputValue) => {
                    setDepartment(inputValue);
                  }}
                  value={
                    department ? { value: department, label: department } : null
                  }
                  styles={customSelectStyles}
                />
              </div>

              {/* Handover Date */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium dark:text-white block mb-2">
                  {t("handover_date")}
                </label>
                <input
                  type="date"
                  value={handoverDate}
                  onChange={(e) => setHandoverDate(e.target.value)}
                  className="cursor-pointer shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Added in Jisr */}
              <div className="col-span-6 sm:col-span-3 flex items-center gap-2 mt-6">
                <input
                  id="addedinJisr"
                  type="checkbox"
                  checked={addedinJisr}
                  onChange={(e) => setAddedinJisr(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="addedinJisr"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  {t("added_in_jisr")}
                </label>
              </div>

              {/* Comment */}
              <div className="col-span-6">
                <label className="text-sm font-medium dark:text-white block mb-2">
                  {t("comment")}
                </label>
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="resize-y shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="text-black dark:text-white bg-gray-100 dark:bg-gray-800 border dark:border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed focus:ring-4 focus:ring-cyan-200 font-medium rounded-4xl text-sm px-5 py-2.5"
              >
                {t("save")} ✅
              </button>

              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="text-black dark:text-white bg-gray-100 dark:bg-gray-800 border dark:border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium rounded-4xl text-sm px-5 py-2.5 mx-2 cursor-pointer"
              >
                {t("delete")} 🗑️
              </button>
            </div>
          </form>
        </div>
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

export default EditAssetForm;
