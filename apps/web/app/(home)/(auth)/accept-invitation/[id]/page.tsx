import type { Metadata } from "next";
import React from "react";
import BGPattern from "@/components/shared/bg-pattern";
import SectionContainer from "@/components/shared/section-container";
import { getSession } from "@/lib/auth/server";

import { eq } from "@repo/db";
import { db } from "@repo/db/client";
import { invitation, organization, user } from "@repo/db/schema";

import AcceptInvitationCard from "./_components/accept-invitation-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accept invitation - VaultCore",
  description:
    "Review and accept your invitation to join a VaultCore organization.",
  robots: {
    index: false,
    follow: false,
  },
};

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const [session, invitationRow] = await Promise.all([
    getSession(),
    db.query.invitation.findFirst({
      where: eq(invitation.id, id),
      with: {
        organization: true,
        user: true,
      },
    }),
  ]);

  const isAvailable =
    !!invitationRow &&
    invitationRow.status === "pending" &&
    invitationRow.expiresAt > new Date();

  const [existingUser, personalOrganization] = await Promise.all([
    invitationRow
      ? db.query.user.findFirst({
          where: eq(user.email, invitationRow.email.toLowerCase()),
        })
      : null,
    session
      ? db.query.organization.findFirst({
          where: eq(organization.slug, session.user.id),
        })
      : null,
  ]);

  return (
    <SectionContainer>
      <div className="relative flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center px-4 py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0">
          <BGPattern />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <BGPattern />
        </div>

        <AcceptInvitationCard
          invitation={
            isAvailable && invitationRow
              ? {
                  id: invitationRow.id,
                  organizationName: invitationRow.organization.name,
                  inviterName: invitationRow.user.name,
                  invitedEmail: invitationRow.email,
                  role: invitationRow.role ?? "member",
                  expiresAt: invitationRow.expiresAt.toISOString(),
                  hasAccount: !!existingUser,
                  isAuthenticated: !!session,
                  isRecipient:
                    session?.user.email.toLowerCase() ===
                    invitationRow.email.toLowerCase(),
                  currentUserEmail: session?.user.email ?? null,
                  personalOrganizationId: personalOrganization?.id ?? null,
                  personalOrganizationSlug: personalOrganization?.slug ?? null,
                }
              : null
          }
          personalOrganizationSlug={personalOrganization?.slug ?? null}
        />
      </div>
    </SectionContainer>
  );
};

export default Page;
