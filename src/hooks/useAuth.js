import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const token = useSelector(selectCurrentToken);

  if (token) {
    const decoded = jwtDecode(token);
    const { username, ar_name, en_name, roles } = decoded.UserInfo;

    const isAdmin = roles.includes("Admin");
    const isOperationManager = roles.includes("Operation Manager");
    const isOperationEmployee = roles.includes("Operation Employee");
    const isSpecialPapersManager = roles.includes("Special Papers Manager");
    const isSpecialPapersEmployee = roles.includes("Special Papers Employee");
    const isFinanceAdmin = roles.includes("Finance Admin");
    const isFinanceEmployee = roles.includes("Finance Employee");
    const isAgent = roles.includes("Agent");

    let status = "Spectator";
    if (isAdmin) status = "Admin";
    else if (isOperationManager) status = "Operation Manager";
    else if (isOperationEmployee) status = "Operation Employee";
    else if (isSpecialPapersManager) status = "Special Papers Manager";
    else if (isSpecialPapersEmployee) status = "Special Papers Employee";
    else if (isFinanceAdmin) status = "Finance Admin";
    else if (isFinanceEmployee) status = "Finance Employee";
    else if (isAgent) status = "Agent";

    const canEditSpecialPapers = isAdmin || isSpecialPapersManager;
    const canAddSpecialPapers = isAdmin || isSpecialPapersManager || isSpecialPapersEmployee;
    const canEditFinance = isAdmin || isFinanceAdmin;
    const canAddFinance = isAdmin || isFinanceAdmin || isFinanceEmployee;
    const isFinanceRole = isFinanceAdmin || isFinanceEmployee;
    const canEditAssets = isAdmin || isSpecialPapersManager || isOperationManager;
    const canAddAssets = isAdmin || isSpecialPapersManager || isSpecialPapersEmployee || isOperationManager || isOperationEmployee;
    const canDelete = isAdmin;

    return {
      username,
      ar_name,
      en_name,
      roles,
      status,
      isAdmin,
      isOperationManager,
      isOperationEmployee,
      isSpecialPapersManager,
      isSpecialPapersEmployee,
      isFinanceAdmin,
      isFinanceEmployee,
      isAgent,
      canEditSpecialPapers,
      canAddSpecialPapers,
      canEditFinance,
      canAddFinance,
      isFinanceRole,
      canEditAssets,
      canAddAssets,
      canDelete
    };
  }

  return {
    username: "",
    ar_name: "",
    en_name: "",
    roles: [],
    status: "Spectator",
    isAdmin: false,
    isOperationManager: false,
    isOperationEmployee: false,
    isSpecialPapersManager: false,
    isSpecialPapersEmployee: false,
    isFinanceAdmin: false,
    isFinanceEmployee: false,
    isAgent: false,
    canEditSpecialPapers: false,
    canAddSpecialPapers: false,
    canEditFinance: false,
    canAddFinance: false,
    isFinanceRole: false,
    canEditAssets: false,
    canAddAssets: false,
    canDelete: false
  };
};

export default useAuth;
