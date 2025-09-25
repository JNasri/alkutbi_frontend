import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import i18n from "../../../i18n";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAddNewAssetMutation, useGetAssetsQuery } from "./assetsApiSlice";

const AddAssetForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [addNewAsset, { isLoading, isSuccess, isError, error }] =
    useAddNewAssetMutation();
  const { data: assetsData, isSuccess: isAssetsSuccess } =
    useGetAssetsQuery("assetsList");

  const [identifier, setIdentifier] = useState("");
  const [description, setDescription] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [addedinJisr, setAddedinJisr] = useState(false);
  const [handoverDate, setHandoverDate] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (isSuccess) {
      toast.success(t("asset_added_successfully"));
      navigate("/dashboard/assets");
    }
  }, [isSuccess, navigate, t]);

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
    const uniqueEmployees = new Set(
      assetsData.ids
        .map((id) => assetsData.entities[id]?.employeeName)
        .filter(Boolean)
    );
    return [...uniqueEmployees].map((val) => ({ label: val, value: val }));
  }, [assetsData, isAssetsSuccess]);

  const departmentOptions = useMemo(() => {
    if (!isAssetsSuccess) return [];
    const uniqueDepartments = new Set(
      assetsData.ids
        .map((id) => assetsData.entities[id]?.department)
        .filter(Boolean)
    );
    return [...uniqueDepartments].map((val) => ({ label: val, value: val }));
  }, [assetsData, isAssetsSuccess]);

  const handleSaveAsset = async (e) => {
    e.preventDefault();

    if (!identifier) {
      toast.error(t("identifier_required"));
      return;
    }

    try {
      await addNewAsset({
        identifier,
        description,
        employeeName,
        department,
        addedinJisr,
        handoverDate,
        comment,
      }).unwrap();
    } catch (err) {
      toast.error(
        t("error_adding_asset") +
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
          {t("add_asset")} :
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-700 border-gray-500 rounded-3xl shadow">
        <div className="p-6 space-y-6">
          <form onSubmit={handleSaveAsset}>
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
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
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
              <div className="col-span-6 sm:col-span-3 flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={addedinJisr}
                  onChange={() => setAddedinJisr((prev) => !prev)}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  {t("added_in_jisr")}
                </label>
              </div>

              {/* Comment */}
              <div className="col-span-6">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("comment")}
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                className="text-black dark:text-white bg-gray-100 dark:bg-gray-800 border dark:border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed focus:ring-4 focus:ring-cyan-200 font-medium rounded-4xl text-sm px-5 py-2.5"
              >
                {t("add_asset")} ✅
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddAssetForm;
