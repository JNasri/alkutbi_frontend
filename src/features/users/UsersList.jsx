import { useGetUsersQuery } from "./usersApiSlice";
import DataTableWrapper from "../../components/DataTableWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import { Tooltip } from "primereact/tooltip";

const UsersList = () => {
  // translate
  const { t } = useTranslation();

  const {
    data: users,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetUsersQuery("usersList", {
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

  if (isSuccess && users?.ids?.length > 0) {
    // Map normalized state to array of user objects
    const userList = users.ids.map((id) => users.entities[id]);

    // check if userList is not empty
    if (!userList || userList.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 p-6">
          No users found.
        </div>
      );
    }

    const columns = [
      { field: "username", header: t("username") + " ㅤ" },
      { field: "roles", header: t("roles") + " ㅤ" },
      { field: "email", header: t("email") + " ㅤ" },
      { field: "en_name", header: t("en_name") + " ㅤ" },
      { field: "ar_name", header: t("ar_name") + " ㅤ" },
      { field: "createdAt", header: t("createdAt") + " ㅤ" },
      { field: "updatedAt", header: t("updatedAt") + " ㅤ" },
      { field: "edit", header: t("edit") + " ㅤ" },
    ];

    // Convert arrays or dates if needed
    const transformedData = userList.map((user) => ({
      ...user,
      roles: user.roles.join(", "),
      createdAt: new Date(user.createdAt).toLocaleDateString(),
      updatedAt: new Date(user.updatedAt).toLocaleDateString(),
      edit: (
        <Link
          to={`/dashboard/users/edit/${user.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:shadow-sm group font-medium"
        >
          <Pencil size={14} className="group-hover:rotate-12 transition-transform" />
          {t("edit")}
        </Link>
      ),
    }));

    return (
      <>
        <div className="flex items-center mb-2 p-1">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            🙍🏻‍♂️ {t("users")}
          </h1>
          <div className="relative group ms-auto">
            <Link
              to="/dashboard/users/add"
              className="mr-auto w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:text-dark-900 hover:bg-gray-100 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
              data-tooltip-target="tooltip-right"
            >
              <Plus size={20} />
            </Link>
            {/* Tooltip */}
            <div className="absolute end-full top-1/2 me-2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-800 bg-gray-300 dark:bg-gray-200 dark:text-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-md font-medium">
              {t("add_user")}
            </div>
          </div>
        </div>

        <DataTableWrapper
          data={transformedData}
          columns={columns}
          title={t("users_list")}
        />
      </>
    );
  }

  return (
    <div className="text-center text-gray-500 dark:text-gray-400 p-6">
      No users found.
    </div>
  );
};

export default UsersList;
