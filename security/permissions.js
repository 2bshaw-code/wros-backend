const roles = new Map();

const defaultRoles = {
  admin: ['read', 'write', 'delete', 'manage_users', 'manage_security', 'manage_tenants'],
  owner: ['read', 'manage_users', 'manage_tenants'],
  founder_admin: ['read', 'write', 'delete', 'manage_users', 'manage_security', 'manage_tenants'],
  founder: ['read', 'write', 'delete', 'manage_users', 'manage_security', 'manage_tenants'],
  merchant: ['read', 'write', 'manage_tenant', 'manage_catalog'],
  operator: ['read', 'write', 'manage_own_session'],
  tenant_admin: ['read', 'write', 'manage_tenant', 'manage_catalog'],
  analyst: ['read', 'view_reports'],
  customer: ['read', 'submit_support_request']
};

Object.keys(defaultRoles).forEach((role) => {
  roles.set(role, defaultRoles[role]);
});

function setRolePermissions(roleName, permissions) {
  const name = String(roleName || '').trim();
  const list = Array.isArray(permissions) ? permissions : [];
  roles.set(name, list);
  return list;
}

function getRolePermissions(roleName) {
  const name = String(roleName || '').trim();
  return roles.get(name) || [];
}

function hasPermission(roleName, permission) {
  const permissions = getRolePermissions(roleName);
  return permissions.includes(String(permission || ''));
}

function canAccess(roleName, requiredPermission) {
  return hasPermission(roleName, requiredPermission);
}

function assignRole(username, roleName) {
  const name = String(username || '').trim();
  const role = String(roleName || '').trim();
  if (!name || !role) {
    return false;
  }

  if (!roles.has(role)) {
    roles.set(role, []);
  }

  return { username: name, role };
}

module.exports = {
  setRolePermissions,
  getRolePermissions,
  hasPermission,
  canAccess,
  assignRole,
  __roles: roles
};
