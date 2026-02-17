import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForgotPasswordMutation } from "../features/auth/authApiSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import PageLangSwitch from "../components/PageLangSwitch";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  useEffect(() => {
    setErrMsg("");
    setMsg("");
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword({ email }).unwrap();
      setMsg(t("email_sent"));
      setErrMsg("");
    } catch (err) {
      if (!err.status) {
        setErrMsg("No Server Response");
      } else {
        setErrMsg(err.data?.message || "Error sending email");
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

      {/* Section */}
      <div className="backdrop-blur-lg rounded-xl py-10 relative z-20 w-full max-w-md px-6">
        {/* Header */}
        <div className="text-center mb-10 relative">
          <Link
            to="/"
            className="absolute left-0 text-white hover:text-yellow-300 transition"
            aria-label="Back to Login"
          >
            <ChevronLeft className="w-7 h-7" />
          </Link>
          <h2 className="text-3xl font-extrabold text-white mb-2">
            {t("forgot_password_title")}
          </h2>
          <p className="text-gray-300 font-semibold">{t("forgot_password_desc")}</p>
          
          {msg && (
            <p className="text-green-400 font-bold mt-3" aria-live="assertive">
              {msg}
            </p>
          )}

          {errMsg && (
            <p className="text-red-400 font-bold mt-3" aria-live="assertive">
              {errMsg}
            </p>
          )}
        </div>

        {/* Form */}
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm text-gray-300 font-bold"
            >
              {t("email")}
            </label>
            <input
              required
              id="email"
              type="email"
              placeholder={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-transparent border-b-2 border-gray-500 text-white py-2 focus:outline-none focus:border-yellow-400 placeholder-gray-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="cursor-pointer w-full relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xl font-bold text-gray-900 rounded-lg group bg-gradient-to-br from-green-600 to-yellow-300 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200"
          >
            <span className="w-full relative px-5 py-2.5 transition-all ease-in duration-50 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              {t("send_reset_link")}
            </span>
          </button>
        </form>
        
        <div className="text-center mt-4">
            <Link to="/" className="text-yellow-300 hover:text-yellow-400 font-semibold">
                {t("back_to_login")}
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
