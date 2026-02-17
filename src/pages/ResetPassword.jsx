import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useResetPasswordMutation } from "../features/auth/authApiSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import PageLangSwitch from "../components/PageLangSwitch";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";

const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    setErrMsg("");
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrMsg(t("passwords_do_not_match"));
      return;
    }
    try {
      await resetPassword({ resetToken, password }).unwrap();
      toast.success(t("password_updated"), {
        duration: 4000,
        position: 'top-center',
      });
      navigate("/");
    } catch (err) {
      if (!err.status) {
        setErrMsg("No Server Response");
      } else {
        setErrMsg(err.data?.message || "Error resetting password");
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {isLoading && <LoadingSpinner />}

      <div className="absolute inset-0">
        <img
          src="/alkutbi_bg.jpg"
          alt="Modern business office"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs"></div>
      </div>

      <div className={`absolute top-6 z-30 ${isRTL ? "right-6" : "left-6"}`}>
        <PageLangSwitch />
      </div>

      <div className="backdrop-blur-lg rounded-xl py-10 relative z-20 w-full max-w-md px-6">
        <div className="text-center mb-10 relative">
          <Link
            to="/"
            className="absolute left-0 text-white hover:text-yellow-300 transition"
          >
            <ChevronLeft className="w-7 h-7" />
          </Link>
          <h2 className="text-3xl font-extrabold text-white mb-2">
            {t("reset_password_title")}
          </h2>
          <p className="text-gray-300 font-semibold">{t("reset_password_desc")}</p>


          {errMsg && (
            <p className="text-red-400 font-bold mt-3" aria-live="assertive">
              {errMsg}
            </p>
          )}
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-gray-300 font-bold">
              {t("new_password")}
            </label>
            <div className="relative">
              <div
                onClick={() => setShowPassword((prev) => !prev)}
                className={`absolute inset-y-0 top-[30%] cursor-pointer text-gray-400 hover:text-yellow-300 ${
                  isRTL ? "left-0" : "right-0"
                }`}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b-2 border-gray-500 text-white py-2 focus:outline-none focus:border-yellow-400 placeholder-gray-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 font-bold">
              {t("confirm_password")}
            </label>
            <div className="relative">
              <div
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className={`absolute inset-y-0 top-[30%] cursor-pointer text-gray-400 hover:text-yellow-300 ${
                  isRTL ? "left-0" : "right-0"
                }`}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent border-b-2 border-gray-500 text-white py-2 focus:outline-none focus:border-yellow-400 placeholder-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="cursor-pointer w-full relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xl font-bold text-gray-900 rounded-lg group bg-gradient-to-br from-green-600 to-yellow-300 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200"
          >
            <span className="w-full relative px-5 py-2.5 transition-all ease-in duration-50 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              {t("reset_password_btn")}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
