import * as React from "react";
import { Button, Column, Row, Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout.tsx";
import { theme } from "./theme.ts";

interface InvitationProps {
  organizationName?: string;
  inviterName?: string;
  role?: string;
  expiresAt?: string;
  actionUrl?: string;
}

const formatRole = (role?: string) => {
  if (!role) return "Member";

  return role
    .split(",")
    .map((part) => {
      const value = part.trim();
      return value.charAt(0).toUpperCase() + value.slice(1);
    })
    .join(", ");
};

const formatExpiry = (expiresAt?: string) => {
  if (!expiresAt) return null;

  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const Invitation = ({
  organizationName = "an organization",
  inviterName,
  role,
  expiresAt,
  actionUrl = "#",
}: InvitationProps) => {
  const expiry = formatExpiry(expiresAt);

  return (
    <EmailLayout previewText={`Join ${organizationName} on VaultCore`}>
      <Text style={heading}>
        You&apos;re invited to join {organizationName}
      </Text>

      <Text style={paragraph}>
        {inviterName
          ? `${inviterName} invited you to collaborate in the ${organizationName} vault on ${theme.appName}.`
          : `You were invited to collaborate in the ${organizationName} vault on ${theme.appName}.`}
      </Text>

      <Section style={details}>
        <Row>
          <Column style={detailLabel}>Organization</Column>
          <Column style={detailValue}>{organizationName}</Column>
        </Row>
        <Row>
          <Column style={detailLabel}>Role</Column>
          <Column style={detailValue}>{formatRole(role)}</Column>
        </Row>
        {expiry ? (
          <Row>
            <Column style={detailLabel}>Expires</Column>
            <Column style={detailValue}>{expiry}</Column>
          </Row>
        ) : null}
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={actionUrl}>
          Review invitation
        </Button>
      </Section>

      <Text style={note}>
        After you join, an organization admin will grant vault access. Your
        master password and vault keys stay on your device.
      </Text>

      <Text style={disclaimer}>
        If you weren&apos;t expecting this invitation, you can ignore this
        email.
      </Text>
    </EmailLayout>
  );
};

const heading: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
  color: theme.colors.text,
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "24px",
  color: theme.colors.text,
  margin: "0 0 16px",
};

const details: React.CSSProperties = {
  backgroundColor: theme.colors.mutedBg,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius,
  margin: "24px 0",
  padding: "8px 16px",
};

const detailLabel: React.CSSProperties = {
  color: theme.colors.mutedText,
  fontSize: "13px",
  lineHeight: "24px",
  padding: "4px 0",
  width: "40%",
};

const detailValue: React.CSSProperties = {
  color: theme.colors.text,
  fontSize: "14px",
  fontWeight: "bold",
  lineHeight: "24px",
  padding: "4px 0",
  textAlign: "right",
};

const buttonContainer: React.CSSProperties = {
  margin: "24px 0",
};

const button: React.CSSProperties = {
  backgroundColor: theme.colors.primary,
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const note: React.CSSProperties = {
  color: theme.colors.mutedText,
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 16px",
};

const disclaimer: React.CSSProperties = {
  fontSize: "14px",
  color: theme.colors.mutedText,
  margin: "32px 0 0",
};

export default Invitation;
