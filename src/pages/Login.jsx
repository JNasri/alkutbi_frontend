import { useState, useRef, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../features/auth/authApiSlice";
import usePresist from "../hooks/usePresist";
import LoadingSpinner from "../components/LoadingSpinner";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Login = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword((prev) => !prev);

  const userRef = useRef();
  const errRef = useRef();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [presist, setPresist] = usePresist(true);
  //
  const navigate = useNavigate();
  const dispatch = useDispatch();
  //
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [username, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ username, password }).unwrap();
      setUsername("");
      setPassword("");
      setPresist(true);
      navigate("/dashboard");
    } catch (err) {
      if (!err.status) {
        setErrMsg("No Server Response");
      } else if (err.status === 400) {
        setErrMsg("Missing Username or Password");
      } else if (err.status === 401) {
        setErrMsg("Wrong Username or Password");
      } else {
        setErrMsg(err.data?.message);
      }
    }
  };

  const errClass = errMsg ? "errmsg" : "offscreen";

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
  <div className="min-h-screen flex flex-col lg:flex-row">
    {/* Content Section */}
    <div className="relative w-full lg:w-1/2 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
      {/* Language Switcher (top-right corner) */}
      <div className="absolute top-6 z-20">
        <LanguageSwitcher />
      </div>

      {/* Login Card Container */}
      <div className="relative z-10 max-w-lg w-full mx-8">
        <div className="bg-gray-200 dark:bg-gray-700 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          {/* Logo and Headings */}
          <div className="text-center my-8">
            <div className="mb-6 flex justify-center">
              <div className="p-3 rounded-xl shadow-lg bg-white dark:bg-gray-800">
                <img
                  src="LOGO_ONLY.png"
                  alt="ALKUTBI LOGO"
                  className="w-16 h-16 object-cover"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">
              {t("login_welcome")}
            </h2>
            <p className="text-gray-600 dark:text-gray-200">{t("login_info")}</p>
            <p
              ref={errRef}
              className="text-red-500 font-extrabold mt-2"
              aria-live="assertive"
            >
              {errMsg}
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium pb-1 dark:text-white"
              >
                {t("username")}
              </label>
              <input
                required
                id="username"
                type="text"
                placeholder="username"
                ref={userRef}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white border rounded-md focus:outline-none focus:ring-2 text-black"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium pb-1 dark:text-white"
              >
                {t("password")}
              </label>
              <div className="relative">
                <input
                  required
                  id="password"
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 pr-10 bg-gray-100 dark:bg-gray-700 dark:text-white border rounded-md focus:outline-none focus:ring-2 text-black"
                />
                <div
                  onClick={togglePassword}
                  className="absolute inset-y-0 right-3 top-[30%] cursor-pointer text-gray-400 hover:text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 px-6 rounded-full text-2xl font-semibold transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg border cursor-pointer dark:text-white"
            >
              {t("login")}
            </button>
          </form>
        </div>
      </div>
    </div>
    {/* Image Section - Hidden on mobile */}
    <div className=" lg:flex lg:w-1/2 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 z-10"></div>
      <img
        src="alkutbi_bg.jpg"
        alt="Modern business office"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/10 z-20"></div>
    </div>
  </div>
    </>

  );
};

export default Login;
