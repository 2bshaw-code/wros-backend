const ROLE_PERMISSIONS = {
  admin: [
    "manage_tenants",
    "manage_users",
    "manage_products",
    "manage_orders",
    "manage_customers",
    "manage_billing",
    "view_reports",
    "manage_settings",
    "manage_delivery",
    "manage_crm",
    "manage_messaging",
    "manage_ai",
  ],
  tenant_admin: [
    "manage_users",
    "manage_products",
    "manage_orders",
    "manage_customers",
    "view_reports",
    "manage_settings",
    "manage_delivery",
    "manage_crm",
    "manage_messaging",
    "manage_ai",
  ],
  operator: [
    "manage_products",
    "manage_orders",
    "manage_customers",
    "view_reports",
    "manage_messaging",
    "manage_ai",
  ],
};

const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

const hasPermission = (role, permission) => {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
};

module.exports = { getRolePermissions, hasPermission, ROLE_PERMISSIONS };
