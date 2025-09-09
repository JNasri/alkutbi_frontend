import { useState, useRef, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../features/auth/authApiSlice";
import usePresist from "../hooks/usePresist";
import LoadingSpinner from "../components/LoadingSpinner";
import PageLangSwitch from "../components/PageLangSwitch";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";

const Login = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword((prev) => !prev);

  const userRef = useRef();
  const errRef = useRef();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [presist, setPresist] = usePresist(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
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

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Show Spinner on top of page */}
      {isLoading && <LoadingSpinner />}

      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="alkutbi_bg.jpg"
          alt="Modern business office"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs"></div>
      </div>

      {/* Language Switcher */}
      <div className={`absolute top-6 z-30 ${isRTL ? "right-6" : "left-6"}`}>
        <PageLangSwitch />
      </div>

      {/* Login Section */}
      <div className="backdrop-blur-lg rounded-xl py-10 relative z-20 w-full max-w-md px-6">
        {/* Back */}
        <div className="text-center mb-10 relative">
          <Link
            to="/"
            className="absolute left-0 text-white hover:text-yellow-300 transition"
            aria-label="Back to Home"
          >
            <ChevronLeft className="w-7 h-7" />
          </Link>
          <h2 className="text-3xl font-extrabold text-white mb-2">
            {t("login_welcome")}
          </h2>
          <p className="text-gray-300 font-semibold">{t("login_info")}</p>
          {errMsg && (
            <p
              ref={errRef}
              className="text-red-400 font-bold mt-3"
              aria-live="assertive"
            >
              {errMsg}
            </p>
          )}
        </div>

        {/* Form */}
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm text-gray-300 font-bold"
            >
              {t("username")}
            </label>
            <input
              required
              id="username"
              type="text"
              placeholder={t("username")}
              ref={userRef}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              className="w-full bg-transparent border-b-2 border-gray-500 text-white py-2 focus:outline-none focus:border-yellow-400 placeholder-gray-400"
            />
          </div>
          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-gray-300"
            >
              {t("password")}
            </label>
            <div className="relative">
              <div
                onClick={togglePassword}
                className={`absolute inset-y-0 top-[30%] cursor-pointer text-gray-400 hover:text-yellow-300 ${
                  isRTL ? "left-0" : "right-0"
                }`}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
              <input
                required
                id="password"
                type={showPassword ? "text" : "password"}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder="••••••••"
                className="w-full bg-transparent border-b-2 border-gray-500 text-white py-2 focus:outline-none focus:border-yellow-400 placeholder-gray-400"
              />
            </div>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="cursor-pointer w-full relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xl font-bold text-gray-900 rounded-lg group bg-gradient-to-br from-green-600 to-yellow-300 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200"
          >
            <span className="w-full relative px-5 py-2.5 transition-all ease-in duration-50 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              {t("login")}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
