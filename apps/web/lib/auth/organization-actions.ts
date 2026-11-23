/**
 * Small wrappers for the two Better Auth organization endpoints that are not
 * exposed by the generated client types in this version. They use the same
 * cookie session as the rest of the web app.
 */

async function callOrganizationEndpoint<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`/api/auth${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(data?.message || "The request failed. Please try again.");
  }

  return data as T;
}

export function leaveOrganization(organizationId: string) {
  return callOrganizationEndpoint("/organization/leave", { organizationId });
}

export function deleteOrganization(organizationId: string) {
  return callOrganizationEndpoint("/organization/delete", { organizationId });
}
