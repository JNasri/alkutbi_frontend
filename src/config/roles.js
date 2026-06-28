import managerRoles from "./managerRoles.json";

export const ROLES = {
  Admin: "Admin",
  Operation_Manager: "Operation Manager",
  Operation_Employee: "Operation Employee",
  Special_Papers_Manager: "Special Papers Manager",
  Special_Papers_Employee: "Special Papers Employee",
  Finance_Manager: "Finance Manager",
  Finance_Sub_Manager: "Finance Sub Manager",
  Finance_Employee: "Finance Employee",
  Finance_Outsider: "Finance Outsider",
  Marketing_Manager: "Marketing Manager",
  Marketing_Employee: "Marketing Employee",
  Quality_Manager: "Quality Manager",
  Quality_Employee: "Quality Employee",
  Transport_Manager: "Transport Manager",
  Transport_Employee: "Transport Employee",
  Chairman: "Chairman",
  Chairman_Helper: "Chairman Helpers",
  Makkah_Manager: "Makkah Manager",
  Makkah_Employee: "Makkah Employee",
  Airport_Manager: "Airport Manager",
  Airport_Employee: "Airport Employee",
  Madinah_Manager: "Madinah Manager",
  Madinah_Employee: "Madinah Employee",
  Hotel_Manager: "Hotel Manager",
  Hotel_Employee: "Hotel Employee",
  Agent: "Agent",
  Spectator: "Spectator",

  // Legacy finance role names kept for old records/tokens only.
  Finance_Admin: "Finance Admin",
  Finance_Sub_Admin: "Finance Sub-Admin",
};

export const ROLE_ALIASES = {
  [ROLES.Finance_Admin]: ROLES.Finance_Manager,
  [ROLES.Finance_Sub_Admin]: ROLES.Finance_Sub_Manager,
};

export const normalizeRole = (role) => ROLE_ALIASES[role] || role;

export const normalizeRoles = (roles = []) => {
  const list = Array.isArray(roles) ? roles : [roles];
  return [...new Set(list.map(normalizeRole).filter(Boolean))];
};

export const ROLE_TRANSLATION_KEYS = {
  [ROLES.Admin]: "role_admin",
  [ROLES.Operation_Manager]: "role_operation_manager",
  [ROLES.Operation_Employee]: "role_operation_employee",
  [ROLES.Special_Papers_Manager]: "role_special_papers_manager",
  [ROLES.Special_Papers_Employee]: "role_special_papers_employee",
  [ROLES.Finance_Manager]: "role_finance_manager",
  [ROLES.Finance_Sub_Manager]: "role_finance_sub_manager",
  [ROLES.Finance_Employee]: "role_finance_employee",
  [ROLES.Finance_Outsider]: "role_finance_outsider",
  [ROLES.Marketing_Manager]: "role_marketing_manager",
  [ROLES.Marketing_Employee]: "role_marketing_employee",
  [ROLES.Quality_Manager]: "role_quality_manager",
  [ROLES.Quality_Employee]: "role_quality_employee",
  [ROLES.Transport_Manager]: "role_transport_manager",
  [ROLES.Transport_Employee]: "role_transport_employee",
  [ROLES.Chairman]: "role_chairman",
  [ROLES.Chairman_Helper]: "role_chairman_helpers",
  [ROLES.Makkah_Manager]: "role_makkah_manager",
  [ROLES.Makkah_Employee]: "role_makkah_employee",
  [ROLES.Airport_Manager]: "role_airport_manager",
  [ROLES.Airport_Employee]: "role_airport_employee",
  [ROLES.Madinah_Manager]: "role_madinah_manager",
  [ROLES.Madinah_Employee]: "role_madinah_employee",
  [ROLES.Hotel_Manager]: "role_hotel_manager",
  [ROLES.Hotel_Employee]: "role_hotel_employee",
  [ROLES.Agent]: "role_agent",
  [ROLES.Spectator]: "role_spectator",
};

export const getRoleLabel = (t, role) => {
  const normalizedRole = normalizeRole(role);
  return t(ROLE_TRANSLATION_KEYS[normalizedRole] || normalizedRole);
};

export const ROLE_GROUPS = [
  {
    labelKey: "role_group_admin",
    roles: [ROLES.Admin],
  },
  {
    labelKey: "role_group_chairman",
    roles: [ROLES.Chairman, ROLES.Chairman_Helper],
  },
  {
    labelKey: "role_group_finance",
    roles: [
      ROLES.Finance_Manager,
      ROLES.Finance_Sub_Manager,
      ROLES.Finance_Employee,
    ],
  },
  {
    labelKey: "role_group_operation",
    roles: [ROLES.Operation_Manager, ROLES.Operation_Employee],
  },
  {
    labelKey: "role_group_special_papers",
    roles: [ROLES.Special_Papers_Manager, ROLES.Special_Papers_Employee],
  },
  {
    labelKey: "role_group_marketing",
    roles: [ROLES.Marketing_Manager, ROLES.Marketing_Employee],
  },
  {
    labelKey: "role_group_quality",
    roles: [ROLES.Quality_Manager, ROLES.Quality_Employee],
  },
  {
    labelKey: "role_group_transport",
    roles: [ROLES.Transport_Manager, ROLES.Transport_Employee],
  },
  {
    labelKey: "role_group_makkah",
    roles: [ROLES.Makkah_Manager, ROLES.Makkah_Employee],
  },
  {
    labelKey: "role_group_airport",
    roles: [ROLES.Airport_Manager, ROLES.Airport_Employee],
  },
  {
    labelKey: "role_group_madinah",
    roles: [ROLES.Madinah_Manager, ROLES.Madinah_Employee],
  },
  {
    labelKey: "role_group_hotel",
    roles: [ROLES.Hotel_Manager, ROLES.Hotel_Employee],
  },
  {
    labelKey: "role_group_other",
    roles: [ROLES.Finance_Outsider, ROLES.Agent, ROLES.Spectator],
  },
];

export const ROLE_DISPLAY_ORDER = ROLE_GROUPS.flatMap((group) => group.roles);

const ROLE_ORDER_INDEX = new Map(
  ROLE_DISPLAY_ORDER.map((role, index) => [role, index]),
);

export const sortRoles = (roles = []) =>
  normalizeRoles(roles).sort(
    (firstRole, secondRole) =>
      (ROLE_ORDER_INDEX.get(firstRole) ?? Number.MAX_SAFE_INTEGER) -
      (ROLE_ORDER_INDEX.get(secondRole) ?? Number.MAX_SAFE_INTEGER),
  );

export const ROLE_OPTIONS = ROLE_DISPLAY_ORDER.map((role) => ({
  value: role,
  labelKey: ROLE_TRANSLATION_KEYS[role],
}));

export const MONTHLY_REVIEW_ROLES = normalizeRoles(managerRoles);
