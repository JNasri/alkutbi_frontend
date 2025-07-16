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
    // console.log("error");
    content = (
      <>
        <p className="text-center text-5xl my-5">
          {error.data?.message}
          {"!"}
        </p>
        <hr className="my-5 w-1/2 mx-auto" />
        <Link
          to="/login"
          className="flex text-center justify-center text-5xl underline text-blue-800"
        >
          "Go to Login"
        </Link>
      </>
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
