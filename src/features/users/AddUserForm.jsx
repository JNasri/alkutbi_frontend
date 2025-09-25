import { useState, useEffect } from "react";
import { useAddNewUserMutation } from "./usersApiSlice";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../../config/roles";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import i18n from "../../../i18n.js";
import toast from "react-hot-toast";

const USERNAME_REGEX = /^[A-z][A-z0-9-_]{3,20}$/;
const PASSWORD_REGEX = /^[A-z0-9!@#$%^&*]{4,16}$/;

const AddUserForm = () => {
  const { t } = useTranslation();
  const [addNewUser, { isLoading, isSuccess, isError, error }] =
    useAddNewUserMutation();

  const navigate = useNavigate();

  // create usestate for username, password, roles, active
  const [en_name, setEn_name] = useState("");
  const [ar_name, setAr_name] = useState("");
  const [username, setUsername] = useState("");
  const [validUsername, setValidUsername] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    setValidUsername(USERNAME_REGEX.test(username));
  }, [username]);
  useEffect(() => {
    setValidPassword(PASSWORD_REGEX.test(password));
  }, [password]);

  useEffect(() => {
    if (isSuccess) {
      setEn_name("");
      setAr_name("");
      setUsername("");
      setEmail("");
      setPassword("");
      setRoles([]);
      navigate("/dashboard/users");
    }
  }, [isSuccess, navigate]);

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

  const canSave =
    [roles.length, validUsername, validPassword].every(Boolean) && !isLoading;

  const onSaveUserClicked = async (e) => {
    e.preventDefault();
    if (canSave) {
      await addNewUser({ en_name, ar_name, username, email, password, roles });
      if (isError) {
        toast.error(t("error_adding_user"));
      } else {
        toast.success(t("user_added_successfully"));
        navigate("/dashboard/users");
      }
    }
  };

  const options = Object.values(ROLES).map((role) => {
    return (
      <option key={role} value={role}>
        {role}
      </option>
    );
  });

  const errClass = isError ? "errmsg" : "offscreen";
  const validUsernameClass = !validUsername ? "border-red-500" : "";
  const validPasswordClass = !validPassword ? "border-red-500" : "";
  const validRolesClass = !roles.length ? "border-red-500" : "";
  const validenNameClass = !en_name ? "border-red-500" : "";
  const validarNameClass = !ar_name ? "border-red-500" : "";
  const validEmailClass = !email ? "border-red-500" : "";
  const content = (
    <>
      <p className={errClass}>{error?.data?.message}</p>
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
          {t("add_user")} :{" "}
        </h1>
      </div>
      <div className="bg-white dark:bg-gray-700 border-gray-500 rounded-3xl shadow">
        {/* Form */}
        <div className="p-6 space-y-6">
          <form onSubmit={onSaveUserClicked}>
            <div className="grid grid-cols-6 gap-6">
              {/* English Name */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("English Name")}:
                </label>
                <input
                  type="text"
                  id="en_name"
                  name="en_name"
                  value={en_name}
                  onChange={onEn_nameChanged}
                  autoComplete="off"
                  className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 ${validenNameClass} dark:bg-gray-800 dark:text-white`}
                  required
                />
              </div>

              {/* Arabic Name */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("Arabic Name")}:
                </label>
                <input
                  type="text"
                  id="ar_name"
                  name="ar_name"
                  value={ar_name}
                  onChange={onAr_nameChanged}
                  autoComplete="off"
                  className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 ${validarNameClass} dark:bg-gray-800 dark:text-white`}
                  required
                />
              </div>

              {/* Username */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  className={`text-sm font-medium text-gray-900 dark:text-white block mb-2`}
                >
                  {t("username")}
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={onUsernameChanged}
                  autoComplete="off"
                  className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5  ${validUsernameClass} dark:bg-gray-800 dark:text-white`}
                  placeholder="johndoe123"
                  required
                />
              </div>

              {/* Email */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("email")}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={onEmailChanged}
                  className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 ${validEmailClass} dark:bg-gray-800 dark:text-white`}
                  placeholder="john@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("password")}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={onPasswordChanged}
                  className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5  ${validPasswordClass} dark:bg-gray-800 dark:text-white`}
                  placeholder="********"
                  required
                />
              </div>

              {/* Roles */}
              <div className="col-span-6 sm:col-span-3">
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  {t("roles")}
                </label>
                <select
                  name="roles"
                  id="roles"
                  value={roles[0]}
                  onChange={onRolesChanged}
                  className={`shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 ${validRolesClass} dark:bg-gray-800 dark:text-white`}
                  required
                >
                  <option value="">Select Role</option>
                  {options}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6  rounded-b">
              <button
                type="submit"
                className="text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed focus:ring-4 focus:ring-cyan-200 font-medium rounded-lg text-sm px-5 py-2.5"
                title="Save"
                disabled={!canSave}
              >
                {t("save")} 💾
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  return content;
};

export default AddUserForm;
