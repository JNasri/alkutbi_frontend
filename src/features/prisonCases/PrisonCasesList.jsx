import { useTranslation } from "react-i18next";
import { useGetPrisoncasesQuery } from "./prisonCasesApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Chrono } from "react-chrono";

const PrisoncasesList = () => {
  const { i18n, t } = useTranslation();
  const isRTL = i18n.dir() === "rtl"; // Detect if language is RTL (like Arabic)
  const [selectedTimeline, setSelectedTimeline] = useState(null);

  const {
    data: prisoncases,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetPrisoncasesQuery("prisoncasesList", {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) return <LoadingSpinner />;

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
        <div className="flex flex-col items-center text-center space-y-3 my-4">
          <div
            className={`flex items-center justify-center  p-2 rounded-full text-white text-xs font-bold
              ${
                p.status === "new"
                  ? "bg-blue-300"
                  : p.status === "in_progress"
                  ? "bg-orange-400"
                  : p.status === "complete"
                  ? "bg-green-500"
                  : "bg-gray-300"
              }
            `}
          >
            {t(p.status)}
          </div>
          <Link
            to={`/dashboard/prisoncases/edit/${p.id}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
          >
            {t("edit")}
          </Link>
          <button
            onClick={() => setSelectedTimeline(p.timeline || [])}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
          >
            {t("show_timeline")}
          </button>
        </div>
      ),
    }));

    return (
      <>
        <div className="flex items-center mb-2 p-1">
          <h1 className="text-4xl text-gray-800 dark:text-white">
            {t("prisoncases")}
          </h1>
          <div className="relative group ms-auto">
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
