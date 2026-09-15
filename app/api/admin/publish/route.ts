export const dynamic = "force-dynamic";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidationRoutes } from "@/lib/content-studio";
import { requireAdmin } from "@/lib/server/admin-auth";

const publishSchema = z.object({
  entityType: z.enum(["content_page", "product", "segment", "faq", "menu", "cta", "seo", "media", "settings"]),
  entityId: z.string().min(1),
  version: z.number().or(z.string()),
  routes: z.array(z.string().startsWith("/")).max(20).optional(),
});

function hasLocalUrl(value: string) {
  return /localhost|127\.0\.0\.1|:3000|:3001/i.test(value);
}

export async function POST(request: Request) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  const parsed = publishSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Payload de publicação invalido.", issues: parsed.error.issues }, { status: 400 });
  }

  const routes = [...new Set([...(parsed.data.routes || []), ...revalidationRoutes])];
  const invalidRoute = routes.find((route) => hasLocalUrl(route) || !route.startsWith("/"));
  if (invalidRoute) {
    return NextResponse.json({ ok: false, message: `Rota invalida para revalidação: ${invalidRoute}` }, { status: 400 });
  }

  for (const route of routes) {
    revalidatePath(route);
  }

  return NextResponse.json({
    ok: true,
    status: "published",
    entityType: parsed.data.entityType,
    entityId: parsed.data.entityId,
    version: String(parsed.data.version),
    revalidated: routes,
    audited: true,
  });
}


