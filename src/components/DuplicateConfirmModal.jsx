import { useTranslation } from "react-i18next";

const DuplicateConfirmModal = ({ isOpen, onCancel, onConfirm, duplicates, type }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl border border-gray-100 dark:border-gray-700 transform transition-all animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("duplicate_check_title")}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("duplicate_check_message")}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto mb-6 px-1">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
            {t("duplicate_records")}:
          </h3>
          <div className="space-y-3">
            {duplicates.map((record) => (
              <div
                key={record._id}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 text-sm"
              >
                <div className="grid grid-cols-2 gap-2 text-gray-700 dark:text-gray-300">
                  <div>
                    <span className="font-bold">{type === "purchase" ? t("purchasing_id") : t("collecting_id")}:</span>{" "}
                    {type === "purchase" ? record.purchasingId : record.collectingId}
                  </div>
                  <div>
                    <span className="font-bold">{t("total_amount")}:</span>{" "}
                    {record.totalAmount} {t("sar")}
                  </div>
                  {type === "purchase" ? (
                    <>
                      <div>
                        <span className="font-bold">{t("supplier")}:</span> {record.supplier}
                      </div>
                      <div>
                        <span className="font-bold">{t("item")}:</span> {record.item}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="font-bold">{t("collected_from")}:</span> {record.collectedFrom}
                      </div>
                      <div>
                        <span className="font-bold">{t("collect_method")}:</span> {t(record.collectMethod)}
                      </div>
                    </>
                  )}
                  <div className="col-span-2 italic text-gray-500">
                    <span className="font-bold">{t("notes")}:</span> {record.notes}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            className="flex-1 cursor-pointer px-4 py-2.5 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 font-semibold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all flex items-center justify-center gap-2"
          >
            {t("add_anyway")} ✅
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateConfirmModal;
