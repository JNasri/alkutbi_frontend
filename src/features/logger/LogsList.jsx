import { useGetLogsQuery } from "./logsApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

const LogsList = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const {
    data: audits,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetLogsQuery(undefined, {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
        <span className="font-medium">Error:</span> {error?.data?.message}
      </div>
    );
  }

  if (isSuccess && audits) {
    const formattedLogs = audits.map((audit) => ({
      ...audit,
      id: audit._id || audit.id,
      displayName: (currentLang.startsWith("ar") ? audit.ar_name : audit.en_name) || audit.user,
      translatedAction: t(audit.action),
      translatedResource: t(audit.resource),
      date: format(new Date(audit.createdAt), "dd-MM-yyyy"),
      time: format(new Date(audit.createdAt), "HH:mm:ss"),
    }));

    const columns = [
      { field: "date", header: t("date") },
      { field: "time", header: t("time") },
      { field: "displayName", header: t("User") },
      { field: "translatedAction", header: t("Action") },
      { field: "translatedResource", header: t("Resource") },
      { field: "details", header: t("Details") },
      { field: "url", header: t("URL") },
    ];

    return (
      <>
        <div className="flex items-center mb-4 p-1">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            📄 {t("logs")}
          </h1>
        </div>
        <DataTableWrapper
          data={formattedLogs}
          columns={columns}
          title={t("SystemAudits")}
        />
      </>
    );
  }

  return null;
};

export default LogsList;
