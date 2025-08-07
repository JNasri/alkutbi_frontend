import { useGetLogsQuery } from "./logsApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { parseLogs } from "../../config/parseLogs";

const LogsList = () => {
  const { t } = useTranslation();

  const {
    data: rawLogs,
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

  if (isSuccess && rawLogs) {
    const logs = parseLogs(rawLogs).reverse();

    const columns = [
      { field: "date", header: t("Date") },
      { field: "time", header: t("Time") },
      { field: "requestId", header: t("Request ID") },
      { field: "message", header: t("Message") },
      { field: "method", header: t("Method") },
      { field: "url", header: t("URL") },
      { field: "username", header: t("Username") },
      { field: "origin", header: t("Origin") },
    ];

    return (
      <>
        <div className="flex items-center mb-2 p-1">
          <h1 className="text-4xl text-gray-800 dark:text-white">
            {t("logs")}
          </h1>
        </div>
        <DataTableWrapper
          data={logs}
          columns={columns}
          title={t("System Logs")}
        />
      </>
    );
  }

  return null;
};

export default LogsList;
