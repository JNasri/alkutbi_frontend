import { useTranslation } from "react-i18next";

const DeleteConfirmModal = ({ isOpen, onCancel, onConfirm, title }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 dark:border-gray-700 transform transition-all animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {title || t("confirm_delete")}
          </h2>
        </div>
        
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 cursor-pointer px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 cursor-pointer px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
          >
            {t("delete")} 🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
