import { redirect } from "next/navigation";
import { getActiveOrganization, getSession } from "@/lib/auth/server";

export async function GET() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const organization = await getActiveOrganization();

  redirect(
    organization ? `/${organization.slug}/all-items` : "/organization/create",
  );
}
