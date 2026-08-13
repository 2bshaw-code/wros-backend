const ROLE_PERMISSIONS = {
  admin: [
    "manage_tenants",
    "manage_users",
    "manage_products",
    "manage_orders",
    "manage_customers",
    "manage_invoices",
    "manage_delivery",
    "manage_crm",
    "manage_reports",
    "manage_settings",
    "manage_billing",
    "manage_whatsapp",
    "view_products",
    "view_orders",
    "view_customers",
    "view_invoices",
    "view_reports",
    "view_delivery",
    "view_crm",
  ],
  tenant_admin: [
    "manage_users",
    "manage_products",
    "manage_orders",
    "manage_customers",
    "manage_invoices",
    "manage_delivery",
    "manage_crm",
    "manage_reports",
    "manage_settings",
    "manage_whatsapp",
    "view_products",
    "view_orders",
    "view_customers",
    "view_invoices",
    "view_reports",
    "view_delivery",
    "view_crm",
  ],
  operator: [
    "view_products",
    "view_orders",
    "view_customers",
    "view_invoices",
    "view_reports",
    "view_delivery",
    "view_crm",
    "manage_orders",
    "manage_customers",
  ],
};

const getRolePermissions = (role) => ROLE_PERMISSIONS[role] || [];

const hasPermission = (role, permission) => {
  const perms = getRolePermissions(role);
  return perms.includes(permission);
};

module.exports = { getRolePermissions, hasPermission };
