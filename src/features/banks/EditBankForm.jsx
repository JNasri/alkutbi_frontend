import { useState, useEffect } from "react";
import { useGetBanksQuery, useUpdateBankMutation, useDeleteBankMutation } from "./banksApiSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import i18n from "../../../i18n";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";

const EditBankForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: banksData, isSuccess } = useGetBanksQuery("banksList");
  const bank = banksData?.entities[id];

  const [updateBank, { isLoading: isUpdating, isSuccess: isUpdated, isError, error }] = useUpdateBankMutation();
  const [deleteBank, { isLoading: isDeleting, isSuccess: isDeleted }] = useDeleteBankMutation();

  const [name, setName] = useState("");
  const [ibanNumber, setIbanNumber] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (bank) {
      setName(bank.name || "");
      setIbanNumber(bank.ibanNumber || "");
    }
  }, [bank]);

  useEffect(() => {
    if (isUpdated) {
      toast.success(t("bank_updated_successfully"));
      navigate("/dashboard/banks");
    } else if (isError) {
      toast.error(error?.data?.message || t("error_updating_bank"));
    }
  }, [isUpdated, isError, error, navigate, t]);

  useEffect(() => {
    if (isDeleted) {
      toast.success(t("bank_deleted_successfully"));
      navigate("/dashboard/banks");
    }
  }, [isDeleted, navigate, t]);

  const onSaveClicked = async (e) => {
    e.preventDefault();

    if (!name || !ibanNumber) {
      toast.error(t("required_fields_missing"));
      return;
    }

    try {
      await updateBank({ id, name, ibanNumber }).unwrap();
    } catch (err) {
      toast.error(
        t("error_updating_bank") + (err?.data?.message ? `: ${err.data.message}` : "")
      );
    }
  };

  if (!isSuccess || !bank) return <LoadingSpinner />;

  return (
    <>
      {(isUpdating || isDeleting) && <LoadingSpinner />}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          await deleteBank({ id });
          setShowDeleteModal(false);
        }}
      />

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
          {t("edit_bank")} :
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
                />
              </div>
            </div>

            <div className="pt-6 flex gap-3">
              <button
                type="submit"
                className="text-black dark:text-white bg-gray-100 dark:bg-gray-800 border dark:border-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer focus:ring-4 focus:ring-cyan-200 font-medium rounded-4xl text-sm px-5 py-2.5"
              >
                {t("save")} ✅
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 cursor-pointer focus:ring-4 focus:ring-red-200 font-medium rounded-4xl text-sm px-5 py-2.5"
              >
                {t("delete")} 🗑️
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditBankForm;
