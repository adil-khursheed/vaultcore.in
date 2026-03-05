import * as React from "react";
import { Html, Section, Text } from "@react-email/components";

import { EmailLayout } from "./email-layout.js";
import { theme } from "./theme.js";

interface WeeklyDigestProps {
  userName?: string;
  digestContent?: string;
}

export const WeeklyDigest = ({
  userName,
  digestContent,
}: WeeklyDigestProps) => {
  return (
    <EmailLayout previewText="Your Weekly VaultCore Digest">
      <Text style={heading}>Your Weekly Digest 📊</Text>

      <Text style={paragraph}>Hi{userName ? ` ${userName}` : ""},</Text>

      <Text style={paragraph}>
        Here's a quick summary of your recent activity and security insights:
      </Text>

      <Section style={digestBox}>
        {digestContent ? (
          <div
            style={digestContentStyle}
            dangerouslySetInnerHTML={{ __html: digestContent }}
          />
        ) : (
          <Text style={emptyDigest}>
            No new updates this week. Stay tuned for more activity!
          </Text>
        )}
      </Section>

      <Text style={paragraph}>
        Keep up the great work securing your digital life, and see you next
        week!
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

const digestBox: React.CSSProperties = {
  backgroundColor: theme.colors.mutedBg,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius,
  padding: "24px",
  margin: "24px 0",
};

const digestContentStyle: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "24px",
  color: theme.colors.text,
  margin: "0",
};

const emptyDigest: React.CSSProperties = {
  fontSize: "16px",
  fontStyle: "italic",
  color: theme.colors.mutedText,
  margin: "0",
  textAlign: "center" as const,
};

const signoff: React.CSSProperties = {
  fontSize: "16px",
  color: theme.colors.mutedText,
  marginTop: "32px",
  marginBottom: "0",
};

export default WeeklyDigest;
