"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2Icon,
  MailIcon,
  MoreHorizontalIcon,
  SendIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { wrapVaultKeyForMember } from "@repo/crypto";
import { useVaultStore } from "@repo/store";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Skeleton } from "@repo/ui/components/skeleton";

import ConfirmDialog from "../../../_components/confirm-dialog";
import InviteMemberDialog from "./invite-member-dialog";

type PendingMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  publicKey?: string | null;
  publicKeyFingerprint?: string | null;
};

type InvitationRow = {
  id: string;
  email: string;
  role: "member" | "admin" | null;
  status: string;
  expiresAt: Date | string;
  inviterId: string;
};

type InvitationToCancel = {
  id: string;
  email: string;
};

const formatRole = (role: string | null | undefined) => {
  if (!role) return "Member";

  return role
    .split(",")
    .map((part) => {
      const value = part.trim();
      return value.charAt(0).toUpperCase() + value.slice(1);
    })
    .join(", ");
};

const formatDate = (value: Date | string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "soon";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getInitials = (name: string, email: string) => {
  const source = name.trim() || email.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
};

const isPendingInvitation = (invitation: InvitationRow) =>
  invitation.status === "pending" &&
  new Date(invitation.expiresAt).getTime() > Date.now();

export default function MembersList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const {
    data: activeOrg,
    isPending: isOrgPending,
    error: orgError,
    refetch: refetchOrg,
  } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const { getVaultKey } = useVaultStore();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [grantingId, setGrantingId] = useState<string | null>(null);
  const [memberToConfirm, setMemberToConfirm] = useState<PendingMember | null>(
    null,
  );
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [invitationToCancel, setInvitationToCancel] =
    useState<InvitationToCancel | null>(null);

  const currentMember = activeOrg?.members.find(
    (member) => member.userId === session?.user.id,
  );
  const isAdmin = (currentMember?.role ?? "")
    .split(",")
    .map((role) => role.trim())
    .some((role) => role === "owner" || role === "admin");

  const members = activeOrg?.members ?? [];
  const pendingInvitations = ((activeOrg?.invitations ?? []) as InvitationRow[])
    .filter(isPendingInvitation)
    .sort(
      (a, b) =>
        new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
    );

  const pendingMembersQuery = useQuery(
    trpc.vault.getPendingMembers.queryOptions(
      { organizationId: activeOrg?.id ?? "" },
      { enabled: !!activeOrg?.id && isAdmin },
    ),
  );

  const activeMembersQuery = useQuery(
    trpc.vault.getActiveMembers.queryOptions(
      { organizationId: activeOrg?.id ?? "" },
      { enabled: !!activeOrg?.id && isAdmin },
    ),
  );

  const pendingMembers = pendingMembersQuery.data?.pendingMembers ?? [];
  const pendingMemberIds = new Set(
    pendingMembers.map((member) => member.userId),
  );
  const activeMemberIds = new Set(
    (activeMembersQuery.data?.items ?? []).map((member) => member.userId),
  );

  const grantAccess = useMutation(
    trpc.vault.grantVaultAccess.mutationOptions({
      onSuccess: () => {
        toast.success("Vault access granted to member");
        queryClient.invalidateQueries(
          trpc.vault.getPendingMembers.queryFilter({
            organizationId: activeOrg?.id ?? "",
          }),
        );
        queryClient.invalidateQueries(
          trpc.vault.getActiveMembers.queryFilter({
            organizationId: activeOrg?.id ?? "",
          }),
        );
      },
      onSettled: () => setGrantingId(null),
    }),
  );

  const grantVaultAccess = async (member: PendingMember) => {
    try {
      if (!activeOrg?.id) return false;

      setGrantingId(member.id);

      const vaultKey = getVaultKey();
      if (!vaultKey) {
        toast.error("Your vault must be unlocked to grant access.");
        return false;
      }

      if (!member.publicKey) {
        toast.error("This member has not set up a public key yet.");
        return false;
      }

      const publicKeyJwk = JSON.parse(atob(member.publicKey));
      const wrappedKeyBase64 = await wrapVaultKeyForMember(
        vaultKey,
        publicKeyJwk,
      );

      await grantAccess.mutateAsync({
        organizationId: activeOrg.id,
        userId: member.userId,
        encryptedKey: wrappedKeyBase64,
      });

      return true;
    } catch (error) {
      console.error("Access grant failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't grant vault access. Check your connection and try again.",
      );
      return false;
    } finally {
      setGrantingId(null);
    }
  };

  const handleGrantAccess = (member: PendingMember) => {
    if (!activeOrg?.id) return;

    if (member.publicKeyFingerprint) {
      setMemberToConfirm(member);
      return;
    }

    void grantVaultAccess(member);
  };

  const handleResendInvitation = async (invitation: InvitationRow) => {
    if (!activeOrg?.id) return;

    setResendingId(invitation.id);

    try {
      const { error } = await authClient.organization.inviteMember({
        email: invitation.email,
        role: invitation.role ?? "member",
        organizationId: activeOrg.id,
        resend: true,
      });

      if (error) {
        toast.error(error.message || "Couldn't resend the invitation.");
        return;
      }

      toast.success(`Invitation resent to ${invitation.email}`);
      void refetchOrg();
    } catch (error) {
      console.error("Failed to resend invitation", error);
      toast.error("Couldn't resend the invitation. Please try again.");
    } finally {
      setResendingId(null);
    }
  };

  const handleCancelInvitation = async () => {
    if (!invitationToCancel) return;

    setCancelingId(invitationToCancel.id);

    try {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId: invitationToCancel.id,
      });

      if (error) {
        toast.error(error.message || "Couldn't cancel the invitation.");
        return;
      }

      toast.success(`Invitation for ${invitationToCancel.email} canceled`);
      setInvitationToCancel(null);
      void refetchOrg();
    } catch (error) {
      console.error("Failed to cancel invitation", error);
      toast.error("Couldn't cancel the invitation. Please try again.");
    } finally {
      setCancelingId(null);
    }
  };

  if (isOrgPending) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>

        <Card className="gap-0 overflow-hidden py-0">
          <div className="border-b px-5 py-5 sm:px-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <div className="divide-y">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="flex items-center gap-3 px-5 py-4 sm:px-6"
              >
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (orgError) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <ShieldAlertIcon
          className="text-muted-foreground size-8"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium">Couldn&apos;t load members</p>
          <p className="text-muted-foreground text-sm">
            Check your connection and try again.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetchOrg()}>
          Try again
        </Button>
      </Card>
    );
  }

  if (!activeOrg) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <UsersIcon
          className="text-muted-foreground size-8"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium">No organization selected</p>
          <p className="text-muted-foreground text-sm">
            Choose an organization from the sidebar to manage its members.
          </p>
        </div>
      </Card>
    );
  }

  const hasVaultStatusError =
    pendingMembersQuery.isError || activeMembersQuery.isError;

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
            <p className="text-muted-foreground text-sm">
              Manage your team, pending invitations, and vault access.
            </p>
          </div>

          {isAdmin ? (
            <Button
              className="w-full sm:w-auto"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlusIcon aria-hidden="true" />
              Invite member
            </Button>
          ) : null}
        </div>

        <Card className="gap-0 overflow-hidden py-0">
          <div className="border-b px-5 py-5 sm:px-6">
            <h2 className="text-base font-semibold">
              Members{" "}
              <span className="text-muted-foreground font-normal">
                ({members.length})
              </span>
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              People who belong to {activeOrg.name}.
            </p>
          </div>

          <div className="divide-y">
            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <UsersIcon
                  className="text-muted-foreground size-8"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium">No members yet</p>
                <p className="text-muted-foreground max-w-sm text-sm">
                  Invite someone to start collaborating in this organization.
                </p>
              </div>
            ) : (
              members.map((member) => {
                const isSelf = member.userId === session?.user.id;
                const hasActiveKey = activeMemberIds.has(member.userId);
                const hasPendingKey = pendingMemberIds.has(member.userId);

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-5 py-4 sm:px-6"
                  >
                    <Avatar className="size-9">
                      <AvatarImage
                        src={member.user.image || undefined}
                        alt=""
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(member.user.name, member.user.email)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {member.user.name}
                        </span>
                        {isSelf ? (
                          <span className="text-muted-foreground shrink-0 text-xs">
                            You
                          </span>
                        ) : null}
                      </div>
                      <span className="text-muted-foreground block truncate text-sm">
                        {member.user.email}
                      </span>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                      {isAdmin && hasActiveKey ? (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground gap-1"
                        >
                          <ShieldCheckIcon aria-hidden="true" />
                          Vault access
                        </Badge>
                      ) : null}

                      {isAdmin && !hasActiveKey && hasPendingKey ? (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground gap-1"
                        >
                          <ShieldAlertIcon aria-hidden="true" />
                          Needs access
                        </Badge>
                      ) : null}

                      {isAdmin && !hasActiveKey && !hasPendingKey ? (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground gap-1"
                        >
                          <ShieldAlertIcon aria-hidden="true" />
                          No access
                        </Badge>
                      ) : null}

                      <Badge variant="secondary">
                        {formatRole(member.role)}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {isAdmin && pendingInvitations.length > 0 ? (
          <Card className="gap-0 overflow-hidden py-0">
            <div className="border-b px-5 py-5 sm:px-6">
              <h2 className="text-base font-semibold">
                Pending invitations{" "}
                <span className="text-muted-foreground font-normal">
                  ({pendingInvitations.length})
                </span>
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Invitations that haven&apos;t been accepted yet.
              </p>
            </div>

            <div className="divide-y">
              {pendingInvitations.map((invitation) => {
                const inviter = members.find(
                  (member) => member.userId === invitation.inviterId,
                );

                return (
                  <div
                    key={invitation.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="border-border bg-muted/40 flex size-9 shrink-0 items-center justify-center rounded-full border">
                        <MailIcon
                          className="text-muted-foreground size-4"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {invitation.email}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                          Invited by {inviter?.user.name ?? "an admin"} ·
                          Expires {formatDate(invitation.expiresAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Badge variant="secondary">
                        {formatRole(invitation.role)}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Manage invitation for ${invitation.email}`}
                          >
                            <MoreHorizontalIcon aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() =>
                              void handleResendInvitation(invitation)
                            }
                            disabled={resendingId === invitation.id}
                          >
                            {resendingId === invitation.id ? (
                              <Loader2Icon
                                className="animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <SendIcon aria-hidden="true" />
                            )}
                            Resend invitation
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() =>
                              setInvitationToCancel({
                                id: invitation.id,
                                email: invitation.email,
                              })
                            }
                            disabled={cancelingId === invitation.id}
                          >
                            <XIcon aria-hidden="true" />
                            Cancel invitation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : null}

        {isAdmin && pendingMembers.length > 0 ? (
          <Card className="gap-0 overflow-hidden py-0">
            <div className="border-b px-5 py-5 sm:px-6">
              <h2 className="text-base font-semibold">
                Vault access{" "}
                <span className="text-muted-foreground font-normal">
                  ({pendingMembers.length})
                </span>
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                These members have joined but don&apos;t have the organization
                vault key yet. Grant access to wrap it for them.
              </p>
            </div>

            <div className="divide-y">
              {pendingMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-muted-foreground truncate text-sm">
                      {member.email}
                    </span>
                    {member.publicKeyFingerprint ? (
                      <Badge
                        variant="secondary"
                        className="border-border bg-muted text-muted-foreground mt-2 w-fit font-mono text-xs tracking-wider"
                      >
                        {member.publicKeyFingerprint}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground mt-2 flex items-center text-xs">
                        <ShieldAlertIcon
                          className="mr-1 size-3"
                          aria-hidden="true"
                        />
                        Legacy key, no fingerprint
                      </span>
                    )}
                  </div>

                  <Button
                    className="w-full shrink-0 sm:w-auto"
                    onClick={() => handleGrantAccess(member)}
                    disabled={grantingId === member.id || !member.publicKey}
                  >
                    {grantingId === member.id ? (
                      <Loader2Icon
                        className="animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <ShieldCheckIcon aria-hidden="true" />
                    )}
                    Grant access
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {isAdmin && hasVaultStatusError ? (
          <Card className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <ShieldAlertIcon
              className="text-muted-foreground size-8"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Couldn&apos;t load vault access statuses
              </p>
              <p className="text-muted-foreground max-w-sm text-sm">
                Members and invitations are still available. Try again to see
                who needs access.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void pendingMembersQuery.refetch();
                void activeMembersQuery.refetch();
              }}
            >
              Try again
            </Button>
          </Card>
        ) : null}
      </div>

      <InviteMemberDialog
        organizationId={activeOrg.id}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={() => void refetchOrg()}
      />

      <ConfirmDialog
        open={!!memberToConfirm}
        onOpenChange={(open) => {
          if (!open) setMemberToConfirm(null);
        }}
        title="Verify member identity"
        description="Confirm this fingerprint out-of-band with the member before granting vault access."
        details={
          memberToConfirm?.publicKeyFingerprint ? (
            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground text-xs font-medium">
                Fingerprint
              </p>
              <code className="text-foreground mt-1 block font-mono text-xs tracking-wider break-all">
                {memberToConfirm.publicKeyFingerprint}
              </code>
            </div>
          ) : null
        }
        confirmLabel="Grant access"
        isPending={grantingId === memberToConfirm?.id}
        onConfirm={async () => {
          if (!memberToConfirm) return;

          const granted = await grantVaultAccess(memberToConfirm);
          if (granted) setMemberToConfirm(null);
        }}
      />

      <ConfirmDialog
        open={!!invitationToCancel}
        onOpenChange={(open) => {
          if (!open) setInvitationToCancel(null);
        }}
        title="Cancel invitation?"
        description={
          invitationToCancel
            ? `This will revoke the invitation for ${invitationToCancel.email}. You can send a new one later.`
            : ""
        }
        confirmLabel="Cancel invitation"
        destructive
        isPending={cancelingId === invitationToCancel?.id}
        onConfirm={handleCancelInvitation}
      />
    </>
  );
}
