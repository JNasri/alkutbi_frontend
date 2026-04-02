import { useState, useEffect } from "react";
import { useAddNewBankMutation } from "./banksApiSlice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import i18n from "../../../i18n";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";

const AddBankForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [addNewBank, { isLoading, isSuccess, isError, error }] = useAddNewBankMutation();

  const [name, setName] = useState("");
  const [ibanNumber, setIbanNumber] = useState("");

  useEffect(() => {
    if (isSuccess) {
      setName("");
      setIbanNumber("");
      toast.success(t("bank_added_successfully"));
      navigate("/dashboard/banks");
    }
  }, [isSuccess, navigate, t]);

  const onSaveClicked = async (e) => {
    e.preventDefault();

    if (!name || !ibanNumber) {
      toast.error(t("required_fields_missing"));
      return;
    }

    try {
      await addNewBank({ name, ibanNumber }).unwrap();
    } catch (err) {
      toast.error(
        t("error_adding_bank") + (err?.data?.message ? `: ${err.data.message}` : "")
      );
    }
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}

      <div className="flex items-center gap-4 mb-4 p-1">
        <div className="relative group">
          <button
            onClick={() => navigate("/dashboard/banks")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
          >
            {i18n.language === "ar" ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          </button>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          {t("add_bank")} :
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-700 border-gray-500 rounded-3xl shadow">
        <div className="p-6 space-y-6">
          <form onSubmit={onSaveClicked}>
            <div className="grid grid-cols-6 gap-6">
              {/* Bank Name */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("bank_name")} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                  placeholder={t("bank_name")}
                />
              </div>

              {/* IBAN Number */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("iban_number")} *
                </label>
                <input
                  type="text"
                  value={ibanNumber}
                  onChange={(e) => setIbanNumber(e.target.value)}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-800 dark:text-white"
                  placeholder="SA..."
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="text-black dark:text-white bg-gray-100 dark:bg-gray-800 border dark:border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed focus:ring-4 focus:ring-cyan-200 font-medium rounded-4xl text-sm px-5 py-2.5"
              >
                {t("add_bank")} ✅
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddBankForm;
