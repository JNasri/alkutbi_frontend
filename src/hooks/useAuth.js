import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";
import { jwtDecode } from "jwt-decode";
import { ROLES, normalizeRoles } from "../config/roles";

const useAuth = () => {
  const token = useSelector(selectCurrentToken);

  if (token) {
    const decoded = jwtDecode(token);
    const { username, ar_name, en_name } = decoded.UserInfo;
    const roles = normalizeRoles(decoded.UserInfo.roles);

    const isAdmin = roles.includes(ROLES.Admin);
    const isOperationManager = roles.includes(ROLES.Operation_Manager);
    const isOperationEmployee = roles.includes(ROLES.Operation_Employee);
    const isSpecialPapersManager = roles.includes(ROLES.Special_Papers_Manager);
    const isSpecialPapersEmployee = roles.includes(ROLES.Special_Papers_Employee);
    const isFinanceAdmin = roles.includes(ROLES.Finance_Manager);
    const isFinanceSubAdmin = roles.includes(ROLES.Finance_Sub_Manager);
    const isFinanceOutsider = roles.includes(ROLES.Finance_Outsider);
    const isFinanceEmployee =
      roles.includes(ROLES.Finance_Employee) || isFinanceOutsider;
    const isAgent = roles.includes(ROLES.Agent);

    let status = roles[0] || ROLES.Spectator;
    if (isAdmin) status = ROLES.Admin;
    else if (isOperationManager) status = ROLES.Operation_Manager;
    else if (isOperationEmployee) status = ROLES.Operation_Employee;
    else if (isSpecialPapersManager) status = ROLES.Special_Papers_Manager;
    else if (isSpecialPapersEmployee) status = ROLES.Special_Papers_Employee;
    else if (isFinanceAdmin) status = ROLES.Finance_Manager;
    else if (isFinanceSubAdmin) status = ROLES.Finance_Sub_Manager;
    else if (isFinanceOutsider) status = ROLES.Finance_Outsider;
    else if (isFinanceEmployee) status = ROLES.Finance_Employee;
    else if (isAgent) status = ROLES.Agent;

    const canEditSpecialPapers = isAdmin || isSpecialPapersManager;
    const canAddSpecialPapers = isAdmin || isSpecialPapersManager || isSpecialPapersEmployee;
    const canEditFinance = isAdmin || isFinanceAdmin || isFinanceSubAdmin || isSpecialPapersManager;
    const canAddFinance = isAdmin || isFinanceAdmin || isFinanceSubAdmin || isFinanceEmployee || isSpecialPapersManager;
    const isFinanceRole = isFinanceAdmin || isFinanceSubAdmin || isFinanceEmployee || isSpecialPapersManager;
    const canEditAssets = isAdmin || isSpecialPapersManager || isOperationManager;
    const canAddAssets = isAdmin || isSpecialPapersManager || isSpecialPapersEmployee || isOperationManager || isOperationEmployee;
    const canDeleteFinance = isAdmin || isFinanceAdmin;
    const canDeleteSpecialPapers = isAdmin || isSpecialPapersManager;
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
      isFinanceSubAdmin,
      isFinanceEmployee,
      isFinanceOutsider,
      isAgent,
      canEditSpecialPapers,
      canAddSpecialPapers,
      canEditFinance,
      canAddFinance,
      isFinanceRole,
      canEditAssets,
      canAddAssets,
      canDeleteFinance,
      canDeleteSpecialPapers,
      canDelete
    };
  }

  return {
    username: "",
    ar_name: "",
    en_name: "",
    roles: [],
    status: ROLES.Spectator,
    isAdmin: false,
    isOperationManager: false,
    isOperationEmployee: false,
    isSpecialPapersManager: false,
    isSpecialPapersEmployee: false,
    isFinanceAdmin: false,
    isFinanceSubAdmin: false,
    isFinanceEmployee: false,
    isFinanceOutsider: false,
    isAgent: false,
    canEditSpecialPapers: false,
    canAddSpecialPapers: false,
    canEditFinance: false,
    canAddFinance: false,
    canDeleteFinance: false,
    isFinanceRole: false,
    canEditAssets: false,
    canAddAssets: false,
    canDeleteSpecialPapers: false,
    canDelete: false
  };
};

export default useAuth;
