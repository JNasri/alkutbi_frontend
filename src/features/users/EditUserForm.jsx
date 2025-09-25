import { useState, useEffect } from "react";
import {
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserQuery,
} from "./usersApiSlice";
import { useNavigate, useParams } from "react-router-dom";
import { ROLES } from "../../config/roles";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { ArrowLeft, ArrowRight } from "lucide-react";
import i18n from "../../../i18n.js";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";

const USERNAME_REGEX = /^[A-z][A-z0-9-_]{3,20}$/;
const PASSWORD_REGEX = /^[A-z0-9!@#$%^&*]{4,16}$/;

const EditUserForm = () => {
  const { id } = useParams();
  // Inside EditUserForm component
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => setShowDeleteModal(true);
  const handleCancelDelete = () => setShowDeleteModal(false);
  const handleConfirmDelete = async () => {
    await deleteUser({ id });
    setShowDeleteModal(false);
  };

  const {
    data: user,
    isLoading: isFetching,
    isError: fetchError,
  } = useGetUserQuery(id);

  const [updateUser, { isLoading: isUpdating, isSuccess, isError, error }] =
    useUpdateUserMutation();
  const [
    deleteUser,
    {
      isSuccess: isDelSuccess,
      isError: isDelError,
      error: delerror,
      isLoading: isDeleting,
    },
  ] = useDeleteUserMutation();

  const navigate = useNavigate();
  const { t } = useTranslation();

  // Default initial state (empty or safe values)
  const [en_name, setEn_name] = useState("");
  const [ar_name, setAr_name] = useState("");
  const [username, setUsername] = useState("");
  const [validUsername, setValidUsername] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [active, setActive] = useState("");

  // Load user data into state when available
  useEffect(() => {
    if (user) {
      setEn_name(user.en_name);
      setAr_name(user.ar_name);
      setUsername(user.username);
      setEmail(user.email);
      setRoles(user.roles);
      setActive(user.isActive);
    }
  }, [user]);

  useEffect(() => {
    setValidUsername(USERNAME_REGEX.test(username));
  }, [username]);

  useEffect(() => {
    setValidPassword(PASSWORD_REGEX.test(password));
  }, [password]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(t("success_update"));
      navigate("/dashboard/users");
    }

    if (isDelSuccess) {
      toast.success(t("success_delete"));
      navigate("/dashboard/users");
    }

    if (isError || isDelError) {
      toast.error(
        error?.data?.message ||
          delerror?.data?.message ||
          "Something went wrong"
      );
    }
  }, [isSuccess, isDelSuccess, isError, isDelError, error, delerror, navigate]);

  const onEn_nameChanged = (e) => setEn_name(e.target.value);
  const onAr_nameChanged = (e) => setAr_name(e.target.value);
  const onUsernameChanged = (e) => setUsername(e.target.value);
  const onEmailChanged = (e) => setEmail(e.target.value);
  const onPasswordChanged = (e) => setPassword(e.target.value);
  const onRolesChanged = (e) => {
    const values = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setRoles(values);
  };

  const onSaveUserClicked = async (e) => {
    e.preventDefault();
    const updatedUser = {
      id,
      en_name,
      ar_name,
      username,
      email,
      roles,
      isActive: active,
    };
    if (password) updatedUser.password = password;
    await updateUser(updatedUser);
  };

  const options = Object.values(ROLES).map((role) => (
    <option key={role} value={role}>
      {role}
    </option>
  ));

  const canSave = password
    ? [en_name, ar_name, username, validUsername, validPassword].every(Boolean)
    : [en_name, ar_name, username, validUsername].every(Boolean);

  const errClass = isError ? "errmsg" : "offscreen";
  const validUsernameClass = !validUsername ? "border-red-500" : "";
  const validPasswordClass = password && !validPassword ? "border-red-500" : "";
  const validRolesClass = !roles.length ? "border-red-500" : "";

  const errContent = (error?.data?.message || delerror?.data?.message) ?? "";

  if (!user) return <LoadingSpinner />;
  if (isFetching) return <LoadingSpinner />;
  if (fetchError) return <p className="p-4">{t("error_loading_user")}</p>;

  return (
    <>
      {(isUpdating || isDeleting) && <LoadingSpinner />}
      <div className="mb-2 p-1">
        <p className={errClass}>{errContent}</p>
        <div className="flex items-center gap-4 mb-4 p-1">
          {/* Back Button */}
          <div className="relative group">
            <button
              onClick={() => navigate("/dashboard/users")}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 border border-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:border-white dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
            >
              {i18n.language === "ar" ? (
                <ArrowRight size={20} />
              ) : (
                <ArrowLeft size={20} />
              )}
            </button>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            {t("edit_user")} :{" "}
            {i18n.language === "ar" ? user.ar_name : user.en_name}
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-700 border-gray-500 rounded-3xl shadow">
          <div className="p-6 space-y-6">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-6 gap-6">
                {/* English Name */}
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                    {t("English Name")}:
                  </label>
                  <input
                    type="text"
                    id="en_name"
                    value={en_name}
                    onChange={onEn_nameChanged}
                    autoComplete="off"
                    required
                    className="shadow-sm bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                  />
                </div>

                {/* Arabic Name */}
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-sm font-medium dark:text-white text-gray-900 block mb-2">
                    {t("Arabic Name")}:
                  </label>
                  <input
                    type="text"
                    id="ar_name"
                    value={ar_name}
                    onChange={onAr_nameChanged}
                    autoComplete="off"
                    required
                    className="shadow-sm dark:bg-gray-800 dark:text-white bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                  />
                </div>

                {/* Username */}
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-sm font-medium dark:text-white text-gray-900 block mb-2">
                    {t("username")}:
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={onUsernameChanged}
                    autoComplete="off"
                    required
                    placeholder="johndoe123"
                    className={`shadow-sm dark:bg-gray-800 dark:text-white bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 ${validUsernameClass}`}
                  />
                </div>

                {/* Email */}
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-sm font-medium dark:text-white text-gray-900 block mb-2">
                    {t("email")}:
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={onEmailChanged}
                    placeholder="john@example.com"
                    required
                    className="shadow-sm dark:bg-gray-800 dark:text-white bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                  />
                </div>

                {/* Password */}
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-sm dark:text-white font-medium text-gray-900 block mb-2">
                    {t("password")}:
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={onPasswordChanged}
                    placeholder="********"
                    className={`shadow-sm dark:bg-gray-800 dark:text-white bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 ${validPasswordClass}`}
                  />
                </div>

                {/* Roles */}
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-sm font-medium dark:text-white text-gray-900 block mb-2">
                    {t("roles")}:
                  </label>
                  <select
                    id="roles"
                    value={roles[0]}
                    onChange={onRolesChanged}
                    required
                    className={`shadow-sm dark:bg-gray-800 dark:text-white bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 ${validRolesClass} cursor-pointer`}
                  >
                    {options}
                  </select>
                </div>
              </div>

              {/* Active Status - Radio Buttons */}
              <div className="col-span-6 sm:col-span-3 mb-4 mt-2">
                <label className="text-sm font-medium dark:text-white text-gray-900 mb-2">
                  {t("status")}:
                </label>
                <div className="items-center gap-4">
                  <label className="flex items-center text-sm text-gray-900 dark:text-white">
                    <input
                      type="radio"
                      name="active-status"
                      value="true"
                      checked={active === true}
                      onChange={() => setActive(true)}
                      className="my-2 w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-cyan-500 dark:focus:ring-cyan-600"
                    />
                    <span className="ml-2">{t("active")}</span>
                  </label>
                  <label className="flex items-center text-sm text-gray-900 dark:text-white">
                    <input
                      type="radio"
                      name="active-status"
                      value="false"
                      checked={active === false}
                      onChange={() => setActive(false)}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-red-500 dark:focus:ring-red-600"
                    />
                    <span className="ml-2">{t("inactive")}</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <button
                type="submit"
                onClick={onSaveUserClicked}
                disabled={!canSave}
                className="text-white bg-cyan-700 hover:bg-cyan-800 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer font-medium rounded-lg text-sm px-3 py-2.5 mr-2"
              >
                {t("save")} 💾
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                className="mx-3 text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-2 py-2.5 cursor-pointer"
              >
                {t("delete")} 🗑️
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* confrim deletion modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("confirm_delete")}
            </h2>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="cursor-pointer px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditUserForm;
