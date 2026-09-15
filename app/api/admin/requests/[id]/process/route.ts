export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ id: "demo" }];
}

export { POST } from "@/app/api/admin/requests/[id]/create-job/route";


