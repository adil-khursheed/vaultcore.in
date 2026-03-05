import * as React from "react";
import { Button, Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";
import { theme } from "./theme";

interface EmailVerificationProps {
  userName?: string;
  actionUrl?: string;
  verificationCode?: string;
}

export const EmailVerification = ({
  userName,
  actionUrl = "#",
  verificationCode,
}: EmailVerificationProps) => {
  return (
    <EmailLayout previewText="Verify your email address for VaultCore">
      <Text style={heading}>Verify Your Email</Text>

      <Text style={paragraph}>Hi{userName ? ` ${userName}` : ""},</Text>

      <Text style={paragraph}>
        Thank you for signing up! Please verify your email address by clicking
        the button below:
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={actionUrl}>
          Verify Email
        </Button>
      </Section>

      {verificationCode && (
        <>
          <Text style={paragraph}>Or enter the following code in the app:</Text>
          <Section style={codeBoxContainer}>
            <Text style={codeBox}>{verificationCode}</Text>
          </Section>
        </>
      )}

      <Text style={disclaimer}>
        If you didn't request this, please ignore this email.
      </Text>
    </EmailLayout>
  );
};

// Styles
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

const codeBoxContainer: React.CSSProperties = {
  margin: "16px 0 24px",
};

const codeBox: React.CSSProperties = {
  backgroundColor: theme.colors.mutedBg,
  borderRadius: theme.radius,
  border: `1px solid ${theme.colors.border}`,
  color: theme.colors.text,
  fontSize: "24px",
  fontWeight: "bold",
  letterSpacing: "8px",
  padding: "16px 24px",
  margin: "0",
  display: "inline-block",
};

const disclaimer: React.CSSProperties = {
  fontSize: "14px",
  color: theme.colors.mutedText,
  margin: "32px 0 0",
};

export default EmailVerification;
