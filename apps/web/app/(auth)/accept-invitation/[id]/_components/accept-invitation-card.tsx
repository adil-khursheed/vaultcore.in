"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import {
  CheckCircle2Icon,
  Loader2Icon,
  LogOutIcon,
  MailIcon,
  MailXIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { toast } from "sonner";

import { useVaultStore } from "@repo/store";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@repo/ui/components/card";

export type AcceptInvitationDetails = {
  id: string;
  organizationName: string;
  inviterName: string;
  invitedEmail: string;
  role: string;
  expiresAt: string;
  hasAccount: boolean;
  isAuthenticated: boolean;
  isRecipient: boolean;
  currentUserEmail: string | null;
  personalOrganizationId: string | null;
  personalOrganizationSlug: string | null;
};

type AcceptInvitationCardProps = {
  invitation: AcceptInvitationDetails | null;
  personalOrganizationSlug: string | null;
};

const formatRole = (role: string) =>
  role
    .split(",")
    .map((part) => {
      const value = part.trim();
      return value.charAt(0).toUpperCase() + value.slice(1);
    })
    .join(", ");

const formatExpiry = (expiresAt: string) => {
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const AcceptInvitationCard = ({
  invitation,
  personalOrganizationSlug,
}: AcceptInvitationCardProps) => {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const { clearKeys } = useVaultStore();

  const personalVaultHref = personalOrganizationSlug
    ? `/${personalOrganizationSlug}/all-items`
    : "/";

  if (!invitation) {
    return (
      <Card className="bg-card border-border relative mx-auto w-full shadow-sm md:max-w-md">
        <CardHeader className="gap-3">
          <div className="border-border bg-muted/50 flex size-10 items-center justify-center rounded-lg border">
            <MailXIcon
              className="text-muted-foreground size-5"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-foreground text-xl font-semibold md:text-2xl">
            This invitation isn&apos;t available
          </h1>
          <CardDescription className="text-base leading-relaxed">
            It may have expired, been canceled, or already been accepted.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button asChild className="h-11 w-full">
            <Link href={personalVaultHref}>
              {personalOrganizationSlug ? "Go to my vault" : "Go to VaultCore"}
            </Link>
          </Button>
        </CardContent>

        <CardFooter>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Ask an organization admin to send a new invitation if you still need
            access.
          </p>
        </CardFooter>
      </Card>
    );
  }

  const {
    organizationName,
    inviterName,
    invitedEmail,
    role,
    expiresAt,
    hasAccount,
    isAuthenticated,
    isRecipient,
    currentUserEmail,
    personalOrganizationId,
    id,
  } = invitation;

  const expiry = formatExpiry(expiresAt);
  const loginHref = `/login?next=${encodeURIComponent(`/accept-invitation/${id}`)}`;
  const signupHref = `/signup/personal?invitationId=${encodeURIComponent(id)}`;

  const handleAccept = async () => {
    setIsAccepting(true);

    try {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId: id,
      });

      if (error) {
        toast.error(error.message || "Couldn't accept the invitation.");
        return;
      }

      if (personalOrganizationId) {
        const { error: activeError } = await authClient.organization.setActive({
          organizationId: personalOrganizationId,
          organizationSlug: personalOrganizationSlug ?? undefined,
        });

        if (activeError) {
          console.error(
            "Failed to switch back to personal organization",
            activeError,
          );
        }
      }

      setAccepted(true);
      toast.success(`You've joined ${organizationName}`);
    } catch (error) {
      console.error("Failed to accept invitation", error);
      toast.error("Couldn't accept the invitation. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSwitchAccount = async () => {
    setIsSwitching(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message || "Couldn't log out. Please try again.");
        return;
      }

      clearKeys();
      router.replace(loginHref);
    } catch (error) {
      console.error("Failed to switch account", error);
      toast.error("Couldn't log out. Please try again.");
    } finally {
      setIsSwitching(false);
    }
  };

  if (accepted) {
    return (
      <Card className="bg-card border-border relative mx-auto w-full shadow-sm md:max-w-md">
        <CardHeader className="gap-3">
          <div className="border-border bg-muted/50 flex size-10 items-center justify-center rounded-lg border">
            <CheckCircle2Icon
              className="text-foreground size-5"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-foreground text-xl font-semibold md:text-2xl">
            You&apos;ve joined {organizationName}
          </h1>
          <CardDescription className="text-base leading-relaxed">
            An organization admin can now grant vault access. Until then, you
            can keep using your personal vault.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button asChild className="h-11 w-full">
            <Link href={personalVaultHref}>Go to my vault</Link>
          </Button>
        </CardContent>

        <CardFooter>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Your master password and vault keys stay on this device.
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border relative mx-auto w-full shadow-sm md:max-w-md">
      <CardHeader className="gap-2">
        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.1em] uppercase">
          Organization invitation
        </p>
        <h1 className="text-foreground text-xl font-semibold md:text-2xl">
          Join {organizationName}
        </h1>
        <CardDescription className="text-base leading-relaxed">
          {inviterName} invited you to collaborate in the {organizationName}{" "}
          vault.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="border-border divide-border divide-y rounded-lg border">
          <div className="flex items-start justify-between gap-4 px-4 py-3">
            <span className="text-muted-foreground text-sm">Invited email</span>
            <span className="text-right text-sm font-medium break-all">
              {invitedEmail}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-muted-foreground text-sm">Role</span>
            <Badge variant="secondary">{formatRole(role)}</Badge>
          </div>
          {expiry ? (
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-muted-foreground text-sm">Expires</span>
              <span className="text-right text-sm font-medium">{expiry}</span>
            </div>
          ) : null}
        </div>

        <div className="border-border bg-muted/40 rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon
              className="text-muted-foreground mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium">
                Vault access is granted after you join
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                An organization admin wraps the vault key for your account. Your
                master password never leaves this device.
              </p>
            </div>
          </div>
        </div>

        {isAuthenticated && isRecipient ? (
          <div className="flex flex-col gap-3">
            <Button
              className="h-11 w-full"
              onClick={() => void handleAccept()}
              disabled={isAccepting}
              aria-busy={isAccepting}
            >
              {isAccepting ? (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              ) : null}
              Accept invitation
            </Button>
            <p className="text-muted-foreground text-center text-xs">
              Signed in as {currentUserEmail}
            </p>
          </div>
        ) : null}

        {isAuthenticated && !isRecipient ? (
          <div className="flex flex-col gap-3">
            <div className="border-border bg-muted/40 rounded-lg border p-4">
              <p className="text-sm font-medium">
                Signed in as {currentUserEmail}
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                This invitation is for {invitedEmail}. Log out and sign in with
                the invited address to accept it.
              </p>
            </div>
            <Button
              variant="outline"
              className="h-11 w-full"
              onClick={() => void handleSwitchAccount()}
              disabled={isSwitching}
              aria-busy={isSwitching}
            >
              {isSwitching ? (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              ) : (
                <LogOutIcon aria-hidden="true" />
              )}
              Log out and switch account
            </Button>
          </div>
        ) : null}

        {!isAuthenticated && hasAccount ? (
          <div className="flex flex-col gap-3">
            <Button asChild className="h-11 w-full">
              <Link href={loginHref}>Log in to accept</Link>
            </Button>
            <p className="text-muted-foreground text-center text-xs">
              Use the account for {invitedEmail}.
            </p>
          </div>
        ) : null}

        {!isAuthenticated && !hasAccount ? (
          <div className="flex flex-col gap-3">
            <Button asChild className="h-11 w-full">
              <Link href={signupHref}>Create your account</Link>
            </Button>
            <p className="text-muted-foreground text-center text-xs leading-relaxed">
              You&apos;ll create a personal vault first, then join{" "}
              {organizationName}.
            </p>
          </div>
        ) : null}
      </CardContent>

      <CardFooter>
        <p className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
          <MailIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          This invitation is unique to {invitedEmail}
          {expiry ? ` and expires on ${expiry}` : ""}.
        </p>
      </CardFooter>
    </Card>
  );
};

export default AcceptInvitationCard;
