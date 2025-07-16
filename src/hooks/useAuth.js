import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const token = useSelector(selectCurrentToken);
  let isAdmin = false;
  let isOperationManager = false;
  let isOperationEmployee = false;
  let status = "Spectator";

  if (token) {
    const decoded = jwtDecode(token);
    // console.log(decoded);
    const username = decoded.UserInfo.username;
    const ar_name = decoded.UserInfo.ar_name;
    // console.log(ar_name);
    const en_name = decoded.UserInfo.en_name;
    // console.log(en_name);
    const roles = decoded.UserInfo.roles;

    isOperationManager = roles.includes("Operation Manager");
    isOperationEmployee = roles.includes("Operation Employee");
    isAdmin = roles.includes("Admin");

    if (isOperationManager) status = "Operation Manager";
    if (isAdmin) status = "Admin";

    return {
      username,
      ar_name,
      en_name,
      roles,
      isAdmin,
      isOperationManager,
      isOperationEmployee,
      status,
    };
  }

  return {
    username: "",
    ar_name: "",
    en_name: "",
    roles: [],
    isOperationManager,
    isAdmin,
    status,
  };
};

export default useAuth;
