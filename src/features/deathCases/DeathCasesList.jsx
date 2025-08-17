import { useTranslation } from "react-i18next";
import { useGetDeathcasesQuery } from "./deathCasesApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const DeathcasesList = () => {
  const { t } = useTranslation();

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
      { field: "createdAt", header: t("createdAt") },
      { field: "updatedAt", header: t("updatedAt") },
      { field: "edit", header: t("edit") },
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
        createdAt: new Date(d.createdAt).toLocaleDateString(),
        updatedAt: new Date(d.updatedAt).toLocaleDateString(),
        attachments: attachmentItems.length ? attachmentItems : "—",
        edit: (
          <Link
            to={`/dashboard/deathcases/edit/${d.id}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t("edit")}
          </Link>
        ),
      };
    });

    return (
      <>
        <div className="flex items-center mb-2 p-1">
          <h1 className="text-4xl text-gray-800 dark:text-white">
            {t("deathcases")}
          </h1>
          <div className="relative group ms-auto">
            <Link
              to="/dashboard/deathcases/add"
              className="mr-auto w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
            >
              <Plus size={20} />
            </Link>
            <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
              {t("add_deathcase")}
            </div>
          </div>
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
                ? new Date(sortedList[0].createdAt).toLocaleDateString()
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
