import assert from "node:assert/strict";
import test from "node:test";

import { normalizeAdminRole, roleHasPermission } from "../lib/admin-permissions.ts";

test("normaliza aliases legados de roles administrativos", () => {
  assert.equal(normalizeAdminRole("operador"), "operator");
  assert.equal(normalizeAdminRole("leitura"), "read");
  assert.equal(normalizeAdminRole("admin"), "admin");
  assert.equal(normalizeAdminRole("desconhecido"), "");
});

test("limita permissoes por perfil administrativo", () => {
  assert.equal(roleHasPermission("read", "request:read"), true);
  assert.equal(roleHasPermission("read", "request:update"), false);
  assert.equal(roleHasPermission("operator", "job:create"), true);
  assert.equal(roleHasPermission("operator", "settings:write"), false);
  assert.equal(roleHasPermission("editor", "content:write"), true);
  assert.equal(roleHasPermission("editor", "enrichment:run"), false);
  assert.equal(roleHasPermission("admin", "enrichment:run"), true);
});
