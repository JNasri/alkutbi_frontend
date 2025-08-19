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
  const isRTL = i18n.dir() === "rtl"; // Detect if language is RTL (like Arabic)
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
        <div className="w-full h-screen lg:h-auto lg:w-1/2 flex flex-col items-center justify-center bg-yellow-50">
          {/* Language Switcher positioned based on language direction */}
          <div
            className={`absolute top-6 z-20 ${isRTL ? "right-6" : "left-6"}`}
          >
            <PageLangSwitch />
          </div>

          {/* Login Card Container */}
          <div className="relative z-10 max-w-lg w-full mx-8">
            <div className=" backdrop-blur-sm rounded-2xl shadow-2xl p-8">
              {/* Logo and Headings */}
              <div className="text-center my-8">
                <div className="mb-6 flex justify-center">
                  <Link
                    to="/"
                    className="absolute left-4 top-4 text-black hover:text-gray-800  bg-white p-0.5 rounded-lg shadow-md transition-colors duration-300  group bg-gradient-to-br from-green-600 to-yellow-300 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 "
                    aria-label="Back to Home"
                  >
                    <ChevronLeft className="w-8 h-8 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent" />
                  </Link>
                  <div className="p-3 rounded-xl shadow-lg bg-yellow-50">
                    <img
                      src="LOGO_ONLY.png"
                      alt="ALKUTBI LOGO"
                      className="w-16 h-16 object-cover"
                    />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {t("login_welcome")}
                </h2>
                <p className="text-gray-600 font-medium">{t("login_info")}</p>
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
                    className="block text-sm font-bold pb-1"
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
                    className="w-full px-4 py-2 bg-yellow-50 border rounded-md focus:outline-none focus:ring-2 text-black"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold pb-1"
                  >
                    {t("password")}
                  </label>
                  <div className="relative">
                    <div
                      onClick={togglePassword}
                      className={`absolute inset-y-0 top-[30%] cursor-pointer text-gray-400 hover:text-gray-500 ${
                        isRTL ? "left-3" : "right-3"
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
                      className="w-full px-4 py-2 bg-yellow-50 border rounded-md focus:outline-none focus:ring-2 text-black"
                    />
                  </div>
                </div>
                {/* Submit Button */}
                <button
                  type="submit"
                  className="cursor-pointer w-full relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xl font-bold text-gray-900 rounded-lg group bg-gradient-to-br from-green-600 to-yellow-300 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 "
                >
                  <span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                    {t("login")}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
        {/* Image Section - Hidden on mobile */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
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
