import { useTranslation } from "react-i18next";
import { useState } from "react";
import toast from "react-hot-toast";
import { useGetIncomingsQuery, useDeleteIncomingMutation } from "./incomingsApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";

const IncomingsList = () => {
  const { t } = useTranslation();
  const { roles, isAdmin, canEditSpecialPapers, canAddSpecialPapers, canDelete } = useAuth(); // 👈 get roles
  const [deleteIncoming] = useDeleteIncomingMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const canViewAttachment =
    isAdmin || roles.includes("Special Papers Manager");

  const {
    data: incomings,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetIncomingsQuery("incomingsList", {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <div
        className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
        role="alert"
      >
        <span className="font-medium">Alert! :</span> {error?.data?.message}
      </div>
    );
  }

  if (isSuccess) {
    const incomingList = incomings.ids.map((id) => incomings.entities[id]);

    const sortedList = [...incomingList].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    if (!incomingList || incomingList.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 p-6">
          {t("no_incomings_found")}
        </div>
      );
    }

    const columns = [
      { field: "identifier", header: t("identifier") },
      { field: "incomingType", header: t("paperType") },
      { field: "from", header: t("from") },
      { field: "to", header: t("to") },
      { field: "letterNumber", header: t("letterNumber") },
      { field: "date", header: t("date") },
      { field: "purpose", header: t("purpose") },
      { field: "passportNumber", header: t("passportNumber") },
      { field: "borderNumber", header: t("borderNumber") },
      { field: "attachment", header: t("attachment") },
      { field: "createdAt", header: t("createdAt") },
      { field: "updatedAt", header: t("updatedAt") },
      { field: "sticker", header: t("sticker") },
      { field: "actions", header: t("actions") },
    ];

    const transformedData = sortedList.map((item) => ({
      ...item,
      incomingType: t(item.incomingType),
      createdAt: new Date(item.createdAt).toLocaleDateString(),
      updatedAt: new Date(item.updatedAt).toLocaleDateString(),
      attachment:
        canViewAttachment && item.attachment ? (
          <a
            href={item.attachment}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
            title="Open Attachment"
          >
            {t("view_attachment")}
          </a>
        ) : (
          "—"
        ),
      sticker: (
        <a
          href={`/sticker?identifier=${encodeURIComponent(
            item.identifier
          )}&date=${encodeURIComponent(item.date)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
          title={t("print_sticker")}
        >
          {t("print_sticker")}
        </a>
      ),
      actions: (
        <div className="flex items-center gap-2">
          {canEditSpecialPapers && (
            <Link
              to={`/dashboard/incomings/edit/${item.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:shadow-sm group font-medium"
            >
              <Pencil size={14} className="group-hover:rotate-12 transition-transform" />
            </Link>
          )}
          {canDelete && (
            <button
              onClick={() => {
                setItemToDelete(item.id);
                setShowDeleteModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 transition-all hover:bg-red-100 dark:hover:bg-red-900/50 hover:shadow-sm group font-medium cursor-pointer"
            >
              <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
      ),
    }));

    return (
      <>
        <div className="flex items-center mb-2 p-1">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            📩 {t("incomings")}
          </h1>
          {canAddSpecialPapers && (
            <div className="relative group ms-auto">
              <Link
                to="/dashboard/incomings/add"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
              >
                <Plus size={20} />
              </Link>
              <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
                {t("add_incoming")}
              </div>
            </div>
          )}
        </div>

        {/* New Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Incomings */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("total_incomings")}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {incomingList.length}
            </h3>
          </div>

          {/* Last Added Date */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("last_incoming_date")}
            </p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {sortedList.length > 0
                ? new Date(sortedList[0].date).toLocaleDateString()
                : "—"}
            </h3>
          </div>

          {/* Last Added Identifier */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("last_added_incoming")}
            </p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {sortedList.length > 0 ? sortedList[0].identifier : "—"}
            </h3>
          </div>

          {/* Placeholder 2 */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("placeholder")}
            </p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              —
            </h3>
          </div>
        </div>

        <DataTableWrapper
          data={transformedData}
          columns={columns}
          title={t("incomings_list")}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            if (itemToDelete) {
              await deleteIncoming({ id: itemToDelete });
              toast.success(t("incoming_deleted_successfully"));
              setShowDeleteModal(false);
              setItemToDelete(null);
            }
          }}
        />
      </>
    );
  }

  return (
    <div className="text-center text-gray-500 dark:text-gray-400 p-6">
      {t("no_incomings_found")}
    </div>
  );
};

export default IncomingsList;
