import { useTranslation } from "react-i18next";
import { useState } from "react";
import toast from "react-hot-toast";
import { useGetDeathcasesQuery, useDeleteDeathcaseMutation } from "./deathCasesApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";

const DeathcasesList = () => {
  const { t } = useTranslation();
  const { canEditSpecialPapers, canAddSpecialPapers, canDelete } = useAuth();
  const [deleteDeathcase] = useDeleteDeathcaseMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const {
    data: deathcases,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetDeathcasesQuery("deathcasesList", {
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
    const list = deathcases.ids.map((id) => deathcases.entities[id]);
    const sortedList = [...list].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    if (!list || list.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 p-6">
          {t("no_deathcases_found")}
        </div>
      );
    }

    const columns = [
      { field: "identifier", header: t("identifier") },
      { field: "name", header: t("name") },
      { field: "sex", header: t("sex") },
      { field: "nationality", header: t("nationality") },
      { field: "passportNumber", header: t("passportNumber") },
      { field: "borderNumber", header: t("borderNumber") },
      { field: "visaNumber", header: t("visaNumber") },
      { field: "dateOfDeath", header: t("dateOfDeath") },
      { field: "cityOfDeath", header: t("cityOfDeath") },
      { field: "hospital", header: t("hospital") },
      { field: "attachments", header: t("attachments") },
      { field: "comment", header: t("comment") },
      { field: "createdAt", header: t("createdAt") },
      { field: "status", header: t("status") },
      { field: "actions", header: t("actions") },
    ];

    const labelMap = {
      entryStamp: t("entryStamp"),
      deathCertificate: t("deathCertificate"),
      passportAttachment: t("passport"),
      visaAttachment: t("visa"),
      consulateCertificate: t("consulateCertificate"),
      deathReport: t("deathReport"),
      hospitalLetter: t("hospitalLetter"),
      corpseBurialPermit: t("corpseBurialPermit"),
      policeLetter: t("policeLetter"),
      otherAttachment: t("others"),
    };

    const transformedData = sortedList.map((d) => {
      const attachmentItems = Object.keys(labelMap)
        .filter((k) => d[k])
        .map((k) => (
          <div key={k}>
            <a
              href={d[k]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
              title={labelMap[k]}
            >
              {labelMap[k]}
            </a>
          </div>
        ));

      return {
        ...d,
        sex: d.sex === "M" ? t("Male") : t("Female"),
        createdAt: new Date(d.createdAt).toLocaleDateString(),
        updatedAt: new Date(d.updatedAt).toLocaleDateString(),
        attachments: attachmentItems.length ? attachmentItems : "—",
        status: t(d.status),
        actions: (
          <div className="flex flex-col items-center gap-3 py-2">
            <div
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm
              ${
                d.status === "new"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  : d.status === "in_progress"
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                  : d.status === "complete"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }
            `}
            >
              {t(d.status)}
            </div>
            <div className="flex items-center gap-2">
              {canEditSpecialPapers && (
                <Link
                  to={`/dashboard/deathcases/edit/${d.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:shadow-sm group font-medium text-xs"
                >
                  <Pencil size={14} className="group-hover:rotate-12 transition-transform" />
                </Link>
              )}
              {canDelete && (
                <button
                  onClick={() => {
                    setItemToDelete(d.id);
                    setShowDeleteModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 transition-all hover:bg-red-100 dark:hover:bg-red-900/50 hover:shadow-sm group font-medium text-xs cursor-pointer"
                >
                  <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          </div>
        ),
      };
    });

    return (
      <>
        <div className="flex items-center mb-2 p-1">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            ⚰️ {t("deathcases")}
          </h1>
          {canAddSpecialPapers && (
            <div className="relative group ms-auto">
              <Link
                to="/dashboard/deathcases/add"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
              >
                <Plus size={20} />
              </Link>
              <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
                {t("add_deathcase")}
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("total_deathcases")}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {list.length}
            </h3>
          </div>

          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("last_deathcase_date")}
            </p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {sortedList.length > 0
                ? new Date(sortedList[0].dateOfDeath).toLocaleDateString()
                : "—"}
            </h3>
          </div>

          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("last_added_deathcase")}
            </p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {sortedList.length > 0 ? sortedList[0].identifier : "—"}
            </h3>
          </div>

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
          title={t("deathcases_list")}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            if (itemToDelete) {
              await deleteDeathcase({ id: itemToDelete });
              toast.success(t("deathcase_deleted_successfully"));
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
      {t("no_deathcases_found")}
    </div>
  );
};

export default DeathcasesList;
