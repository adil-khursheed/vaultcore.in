import * as React from "react";
import { Column, Row, Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";
import { theme } from "./theme";

interface WelcomeOnboardProps {
  userName?: string;
}

export const WelcomeOnboard = ({ userName }: WelcomeOnboardProps) => {
  return (
    <EmailLayout previewText="Welcome to VaultCore!">
      <Text style={heading}>
        Welcome Aboard{userName ? `, ${userName}` : ""}! 🎉
      </Text>

      <Text style={paragraph}>
        We're excited to have you join us. Here are a few tips to get started
        and make the most out of {theme.appName}:
      </Text>

      <Section style={listSection}>
        <Row style={listItemRow}>
          <Column style={bulletColumn}>
            <Text style={bullet}>👉</Text>
          </Column>
          <Column>
            <Text style={listItemText}>
              <strong style={strong}>Explore your dashboard</strong> to discover
              helpful features and secure your credentials.
            </Text>
          </Column>
        </Row>

        <Row style={listItemRow}>
          <Column style={bulletColumn}>
            <Text style={bullet}>⚙️</Text>
          </Column>
          <Column>
            <Text style={listItemText}>
              <strong style={strong}>Personalize your settings</strong> to fit
              your security preferences exactly.
            </Text>
          </Column>
        </Row>

        <Row style={listItemRow}>
          <Column style={bulletColumn}>
            <Text style={bullet}>💬</Text>
          </Column>
          <Column>
            <Text style={listItemText}>
              <strong style={strong}>Reach out to support</strong> anytime if
              you need assistance along the way.
            </Text>
          </Column>
        </Row>
      </Section>

      <Text style={paragraph}>
        We hope you have a fantastic and secure experience!
      </Text>

      <Text style={signoff}>— The {theme.appName} Team</Text>
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

const listSection: React.CSSProperties = {
  margin: "24px 0",
};

const listItemRow: React.CSSProperties = {
  marginBottom: "16px",
};

const bulletColumn: React.CSSProperties = {
  width: "32px",
  verticalAlign: "top",
};

const bullet: React.CSSProperties = {
  fontSize: "18px",
  margin: "0",
  lineHeight: "24px",
};

const listItemText: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "24px",
  color: theme.colors.text,
  margin: "0",
};

const strong: React.CSSProperties = {
  color: theme.colors.primary,
};

const signoff: React.CSSProperties = {
  fontSize: "16px",
  color: theme.colors.mutedText,
  marginTop: "32px",
  marginBottom: "0",
};

export default WelcomeOnboard;
