import { Link, Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useRefreshMutation } from "./authApiSlice";
import usePresist from "../../hooks/usePresist";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "./authSlice";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../../components/LoadingSpinner";

const PresistLogin = () => {
  const [persist] = usePresist();
  const effectRan = useRef(false);
  const token = useSelector(selectCurrentToken);

  const { t } = useTranslation();

  const [trueSuccess, setTrueSuccess] = useState(false);

  const [refresh, { isUninitialized, isLoading, isSuccess, isError, error }] =
    useRefreshMutation();

  useEffect(() => {
    if (effectRan.current === true || process.env.NODE_ENV !== "development") {
      // React 18 Strict Mode

      const verifyRefreshToken = async () => {
        // console.log("verifying refresh token");
        try {
          //const response =
          await refresh();
          // const { accessToken } = response.data
          setTrueSuccess(true);
        } catch (err) {
          console.error(err);
        }
      };

      if (!token && persist) verifyRefreshToken();
    }

    return () => (effectRan.current = true);

    // eslint-disable-next-line
  }, []);

  let content;
  if (!persist) {
    // persist: no
    // console.log("no persist");
    content = <Outlet />;
  } else if (isError) {
    //persist: yes, token: no
    content = (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {error.data?.message || t("login_expired")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("please_login_again")}
          </p>
          <hr className="border-gray-200 dark:border-gray-700" />
          <Link
            to="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg"
          >
            {t("go_to_login")}
          </Link>
        </div>
      </div>
    );
  } else if (isSuccess && trueSuccess) {
    //persist: yes, token: yes
    // console.log("success");
    content = <Outlet />;
  } else if (token && isUninitialized) {
    //persist: yes, token: yes
    // console.log("token and uninit");
    // console.log(isUninitialized);
    content = <Outlet />;
  }

  return content;
};

export default PresistLogin;
