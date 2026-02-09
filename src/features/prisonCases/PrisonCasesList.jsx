import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGetPrisoncasesQuery, useDeletePrisoncaseMutation } from "./prisonCasesApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Chrono } from "react-chrono";
import useAuth from "../../hooks/useAuth";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";

const PrisoncasesList = () => {
  const { i18n, t } = useTranslation();
  const { canEditSpecialPapers, canAddSpecialPapers, canDelete } = useAuth();
  const [deletePrisoncase] = useDeletePrisoncaseMutation();
  const isRTL = i18n.dir() === "rtl"; 
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isInitialSync, setIsInitialSync] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: prisoncases, isLoading, isSuccess, isError, refetch, isFetching } = useGetPrisoncasesQuery("prisoncasesList", {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    const syncData = async () => {
      await refetch();
      setIsInitialSync(false);
    };
    syncData();
  }, [refetch]);

  if (isInitialSync || (isLoading && !prisoncases)) return <LoadingSpinner />;

  if (isError) {
    return (
      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
        <span className="font-medium">Alert! :</span> {error?.data?.message}
      </div>
    );
  }

  if (isSuccess) {
    const list = prisoncases.ids.map((id) => prisoncases.entities[id]);
    const sortedList = [...list].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    if (!list || list.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 p-6">
          {t("no_prisoncases_found")}
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
      { field: "agent", header: t("agent") },
      { field: "dateOfArrest", header: t("dateOfArrest") },
      { field: "prisonOrStation", header: t("prisonOrStation") },
      { field: "attachments", header: t("attachments") },
      { field: "comment", header: t("comment") },
      { field: "status", header: t("status") },
      { field: "createdAt", header: t("createdAt") },
      { field: "updatedAt", header: t("updatedAt") },
      { field: "actions", header: t("actions") },
    ];

    const transformedData = sortedList.map((p) => ({
      ...p,
      sex: p.sex === "M" ? t("Male") : t("Female"),
      attachments:
        p.passportAttachment && p.visaAttachment ? (
          <div>
            <a
              href={p.passportAttachment}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t("passport")}
            </a>
            <br />
            <br />
            <a
              href={p.visaAttachment}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t("visa")}
            </a>
          </div>
        ) : (
          "—"
        ),
      createdAt: new Date(p.createdAt).toLocaleDateString(),
      updatedAt: new Date(p.updatedAt).toLocaleDateString(),
      status: t(p.status || "—"),
      actions: (
        <div className="flex flex-col items-center gap-3 py-4">
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm
              ${
                p.status === "new"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  : p.status === "in_progress"
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                  : p.status === "complete"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }
            `}
          >
            {t(p.status || "new")}
          </div>
          <div className="flex items-center gap-2 w-full">
            {canEditSpecialPapers && (
              <Link
                to={`/dashboard/prisoncases/edit/${p.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:shadow-sm group font-medium text-xs w-full justify-center"
              >
                <Pencil size={14} className="group-hover:rotate-12 transition-transform" />
              </Link>
            )}
            {canDelete && (
              <button
                  onClick={() => {
                    setItemToDelete(p.id);
                    setShowDeleteModal(true);
                  }}
                className="inline-flex items-center gap-1.5 px-3 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 transition-all hover:bg-red-100 dark:hover:bg-red-900/50 hover:shadow-sm group font-medium text-xs w-full justify-center cursor-pointer"
              >
                <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
          <button
            onClick={() => setSelectedTimeline(p.timeline || [])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 transition-all hover:bg-gray-100 dark:hover:bg-gray-900/50 hover:shadow-sm font-medium text-xs cursor-pointer w-full justify-center"
          >
            {t("show_timeline")}
          </button>
        </div>
      ),
    }));

    return (
      <>
        <div className="flex items-center mb-2 p-1">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            ⛓️ {t("prisoncases")}
          </h1>
          <div className="flex items-center gap-2 ms-auto">
            <div className="relative group">
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  await refetch();
                  setIsRefreshing(false);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw size={20} className={`${isFetching ? "animate-spin" : ""}`} />
              </button>
              <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
                {t("refresh")}
              </div>
            </div>

            {canAddSpecialPapers && (
              <div className="relative group">
                <Link
                  to="/dashboard/prisoncases/add"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
                >
                  <Plus size={20} />
                </Link>
                <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
                  {t("add_prisoncase")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total PrisonCases */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("total_prison_cases")}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {list.length}
            </h3>
          </div>

          {/* Last Added Date */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("last_prison_date")}
            </p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {sortedList.length > 0 ? sortedList[0].dateOfArrest : "—"}
            </h3>
          </div>

          {/* Last Added Identifier */}
          <div className="p-4 bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md transition hover:shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("last_added_prison")}
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

        {/* Data Table */}
        <DataTableWrapper
          data={transformedData}
          columns={columns}
          title={t("prisoncases_list")}
        />

        {/* Timeline Modal */}
        {selectedTimeline !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 dark:bg-gray-900/30 backdrop-blur-xs">
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xl p-10 mx-16 w-full overflow-y-auto relative">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                {t("timeline")}
              </h2>

              {selectedTimeline.length ? (
                <Chrono
                  items={selectedTimeline
                    .map((entry, i) => ({
                      title: entry.date || `Step ${i + 1}`,
                      cardTitle: entry.note || "",
                    }))
                    .reverse()}
                  mode="VERTICAL"
                  disableToolbar
                  scrollable
                  mediaSettings={{ align: "center" }}
                  cardHeight={1}
                  theme={{
                    cardBgColor: document.documentElement.classList.contains(
                      "dark"
                    )
                      ? "#11171fff"
                      : "#dbdcdfff",
                    toolbarBgColor: document.documentElement.classList.contains(
                      "dark"
                    )
                      ? "#11171fff"
                      : "#dbdcdfff",
                    cardForeColor: document.documentElement.classList.contains(
                      "dark"
                    )
                      ? "#ffffffff"
                      : "#6b7280",
                    secondary: document.documentElement.classList.contains(
                      "dark"
                    )
                      ? "#11171fff"
                      : "#dbdcdfff",
                  }}
                />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  {t("no_timeline_entries")}
                </p>
              )}

              <button
                onClick={() => setSelectedTimeline(null)}
                className="absolute top-3 right-4 text-gray-600 dark:text-gray-300 hover:text-red-500 text-xl cursor-pointer"
                title={t("close")}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            if (itemToDelete) {
              await deletePrisoncase({ id: itemToDelete });
              toast.success(t("prisoncase_deleted_successfully"));
              setShowDeleteModal(false);
              setItemToDelete(null);
            }
          }}
        />
        {isRefreshing && <LoadingSpinner />}
      </>
    );
  }

  return (
    <div className="text-center text-gray-500 dark:text-gray-400 p-6">
      {t("no_prisoncases_found")}
    </div>
  );
};

export default PrisoncasesList;
