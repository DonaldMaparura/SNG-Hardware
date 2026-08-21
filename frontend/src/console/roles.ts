export type NavItem = { to: string; label: string };

const STORE_OPS = new Set(["STORE_OPERATOR", "CASHIER", "BRANCH_MANAGER"]);
const COMPANY = new Set([
  "OPERATIONS_MANAGER",
  "DIRECTOR",
  "GENERAL_MANAGER",
  "ADMIN",
  "AUDITOR",
  "FINANCE_CONTROLLER",
  "FINANCE",
]);

export function isStoreScoped(role: string) {
  return STORE_OPS.has(role) || role === "CASHIER";
}

export function isCompanyWide(role: string) {
  return COMPANY.has(role);
}

export function isDirector(role: string) {
  return role === "DIRECTOR";
}

export function isStoreOperator(role: string) {
  return role === "STORE_OPERATOR" || role === "CASHIER";
}

export function isOpsManager(role: string) {
  return role === "OPERATIONS_MANAGER" || role === "GENERAL_MANAGER";
}

export function roleLabel(role: string) {
  return (role || "").replace(/_/g, " ");
}

export function homeTitle(role: string): "My Store" | "All Stores" | "Business Overview" {
  if (isDirector(role)) return "Business Overview";
  if (isCompanyWide(role)) return "All Stores";
  return "My Store";
}

export function navItems(role: string): NavItem[] {
  if (isStoreOperator(role) || role === "BRANCH_MANAGER") {
    return [
      { to: "/app", label: "Overview" },
      { to: "/app/pos", label: "Sell" },
      { to: "/app/inventory", label: "Stock" },
      { to: "/app/enquiries", label: "Requests" },
      { to: "/app/transfers", label: "Transfers" },
      { to: "/app/purchasing", label: "Receiving" },
      { to: "/app/till", label: "Till" },
      { to: "/app/reports", label: "Reports" },
      { to: "/app/more", label: "More" },
    ];
  }
  if (isOpsManager(role) || role === "ADMIN") {
    return [
      { to: "/app", label: "Overview" },
      { to: "/app/stores", label: "Stores" },
      { to: "/app/inventory", label: "Stock" },
      { to: "/app/enquiries", label: "Requests" },
      { to: "/app/transfers", label: "Transfers" },
      { to: "/app/trips", label: "Deliveries" },
      { to: "/app/reports", label: "Reports" },
      { to: "/app/more", label: "More" },
    ];
  }
  if (isDirector(role)) {
    return [
      { to: "/app", label: "Overview" },
      { to: "/app/stores", label: "Branches" },
      { to: "/app/inventory", label: "Stock" },
      { to: "/app/orders", label: "Sales" },
      { to: "/app/accounting", label: "Finance" },
      { to: "/app/fleet", label: "Operations" },
      { to: "/app/reports", label: "Reports" },
    ];
  }
  if (role === "DRIVER") {
    return [
      { to: "/app/trips", label: "Deliveries" },
      { to: "/app/fleet", label: "Fleet" },
      { to: "/app/more", label: "More" },
    ];
  }
  if (role === "FINANCE_CONTROLLER" || role === "FINANCE") {
    return [
      { to: "/app", label: "Overview" },
      { to: "/app/accounting", label: "Finance" },
      { to: "/app/reports", label: "Reports" },
      { to: "/app/customers", label: "Customers" },
      { to: "/app/purchasing", label: "Receiving" },
      { to: "/app/more", label: "More" },
    ];
  }
  if (role === "AUDITOR") {
    return [
      { to: "/app", label: "Overview" },
      { to: "/app/inventory", label: "Stock" },
      { to: "/app/accounting", label: "Finance" },
      { to: "/app/audit", label: "Audit" },
      { to: "/app/reports", label: "Reports" },
      { to: "/app/more", label: "More" },
    ];
  }
  if (role === "WAREHOUSE_MANAGER" || role === "WAREHOUSE_OPERATOR") {
    return [
      { to: "/app/warehouse", label: "Warehouse" },
      { to: "/app/inventory", label: "Stock" },
      { to: "/app/transfers", label: "Transfers" },
      { to: "/app/timber", label: "Timber" },
      { to: "/app/purchasing", label: "Receiving" },
      { to: "/app/more", label: "More" },
    ];
  }
  return [
    { to: "/app", label: "Overview" },
    { to: "/app/more", label: "More" },
  ];
}

export function moreLinks(role: string): NavItem[] {
  const links: NavItem[] = [];
  const add = (to: string, label: string, roles?: string[]) => {
    if (!roles || roles.includes(role) || role === "ADMIN" || isOpsManager(role)) {
      links.push({ to, label });
    }
  };
  if (isStoreOperator(role) || role === "BRANCH_MANAGER") {
    return [
      { to: "/app/customers", label: "Customers" },
      { to: "/app/timber", label: "Timber requests" },
    ];
  }
  if (isDirector(role)) {
    return [
      { to: "/app/enquiries", label: "Requests" },
      { to: "/app/transfers", label: "Transfers" },
      { to: "/app/customers", label: "Customers" },
      { to: "/app/audit", label: "Audit trail" },
      { to: "/app/trips", label: "Deliveries" },
    ];
  }
  add("/app/timber", "Timber cutting", [
    "OPERATIONS_MANAGER", "GENERAL_MANAGER", "WAREHOUSE_MANAGER", "WAREHOUSE_OPERATOR", "ADMIN",
  ]);
  add("/app/fleet", "Fleet", [
    "OPERATIONS_MANAGER", "GENERAL_MANAGER", "WAREHOUSE_MANAGER", "DRIVER", "ADMIN", "DIRECTOR",
  ]);
  add("/app/customers", "Customers", [
    "OPERATIONS_MANAGER", "GENERAL_MANAGER", "BRANCH_MANAGER", "FINANCE_CONTROLLER", "ADMIN", "DIRECTOR",
  ]);
  add("/app/audit", "Audit trail", [
    "AUDITOR", "ADMIN", "GENERAL_MANAGER", "OPERATIONS_MANAGER", "FINANCE_CONTROLLER", "DIRECTOR",
  ]);
  add("/app/warehouse", "Warehouse", [
    "WAREHOUSE_MANAGER", "WAREHOUSE_OPERATOR", "ADMIN", "OPERATIONS_MANAGER", "GENERAL_MANAGER",
  ]);
  add("/app/pos", "Sell / POS", [
    "STORE_OPERATOR", "CASHIER", "BRANCH_MANAGER", "OPERATIONS_MANAGER", "ADMIN", "GENERAL_MANAGER",
  ]);
  add("/app/accounting", "Accounting", [
    "FINANCE_CONTROLLER", "AUDITOR", "ADMIN", "GENERAL_MANAGER", "OPERATIONS_MANAGER", "DIRECTOR",
  ]);
  add("/app/orders", "Quotes & orders", [
    "OPERATIONS_MANAGER", "GENERAL_MANAGER", "BRANCH_MANAGER", "ADMIN", "DIRECTOR",
  ]);
  add("/app/purchasing", "Purchasing", [
    "OPERATIONS_MANAGER", "GENERAL_MANAGER", "WAREHOUSE_MANAGER", "FINANCE_CONTROLLER", "ADMIN",
  ]);
  return links;
}
