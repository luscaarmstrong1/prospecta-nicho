export type AdminRole = "admin" | "editor" | "operator" | "read";

export type AdminPermission =
  | "admin:read"
  | "request:read"
  | "request:update"
  | "job:read"
  | "job:create"
  | "job:update"
  | "export:read"
  | "export:sign"
  | "content:write"
  | "settings:read"
  | "settings:write"
  | "internal:read"
  | "internal:write"
  | "enrichment:offer"
  | "enrichment:run";

const roleAliases: Record<string, AdminRole> = {
  admin: "admin",
  editor: "editor",
  operador: "operator",
  operator: "operator",
  leitura: "read",
  read: "read",
};

const rolePermissions: Record<AdminRole, readonly AdminPermission[]> = {
  admin: [
    "admin:read",
    "request:read",
    "request:update",
    "job:read",
    "job:create",
    "job:update",
    "export:read",
    "export:sign",
    "content:write",
    "settings:read",
    "settings:write",
    "internal:read",
    "internal:write",
    "enrichment:offer",
    "enrichment:run",
  ],
  editor: [
    "admin:read",
    "content:write",
    "settings:read",
  ],
  operator: [
    "admin:read",
    "request:read",
    "request:update",
    "job:read",
    "job:create",
    "job:update",
    "export:read",
  ],
  read: ["admin:read", "request:read", "job:read", "export:read", "settings:read"],
};

export function normalizeAdminRole(role: unknown): AdminRole | "" {
  const normalized = String(role || "").trim().toLowerCase();
  return roleAliases[normalized] || "";
}

export function roleHasPermission(role: unknown, permission: AdminPermission): boolean {
  const normalized = normalizeAdminRole(role);
  return normalized ? rolePermissions[normalized].includes(permission) : false;
}
