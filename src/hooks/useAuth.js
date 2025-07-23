import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const token = useSelector(selectCurrentToken);
  let isAdmin = false;
  let isOperationManager = false;
  let isOperationEmployee = false;
  let isSpecialPapersManager = false;
  let isSpecialPapersEmployee = false;
  let isAgent = false;
  let status = "Spectator";

  if (token) {
    const decoded = jwtDecode(token);
    const username = decoded.UserInfo.username;
    const ar_name = decoded.UserInfo.ar_name;
    const en_name = decoded.UserInfo.en_name;
    const roles = decoded.UserInfo.roles;

    isOperationManager = roles.includes("Operation Manager");
    isOperationEmployee = roles.includes("Operation Employee");
    isSpecialPapersManager = roles.includes("Special Papers Manager");
    isSpecialPapersEmployee = roles.includes("Special Papers Employee");
    isAgent = roles.includes("Agent");
    isAdmin = roles.includes("Admin");

    if (isOperationManager) status = "Operation Manager";
    if (isOperationEmployee) status = "Operation Employee";
    if (isAgent) status = "Agent";
    if (isAdmin) status = "Admin";
    if (isSpecialPapersManager) status = "Special Papers Manager";
    if (isSpecialPapersEmployee) status = "Special Papers Employee";

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
