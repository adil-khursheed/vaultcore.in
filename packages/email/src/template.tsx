import * as React from "react";
import { render } from "@react-email/render";

import type { EmailTemplateProps } from "./types.ts";
import { EmailVerification } from "./email-template/email-verification.tsx";
import { Invitation } from "./email-template/invitation.tsx";
import { WeeklyDigest } from "./email-template/weekly-digest.tsx";
import { WelcomeOnboard } from "./email-template/welcome-onboard.tsx";

export async function getEmailTemplateHtml(
  props: EmailTemplateProps,
): Promise<string> {
  const {
    type,
    userName,
    actionUrl,
    verificationCode,
    digestContent,
    organizationName,
    inviterName,
    role,
    expiresAt,
  } = props;

  switch (type) {
    case "emailVerification":
      return await render(
        <EmailVerification
          userName={userName}
          actionUrl={actionUrl}
          verificationCode={verificationCode}
        />,
      );
    case "welcomeOnboard":
      return await render(<WelcomeOnboard userName={userName} />);
    case "weeklyDigest":
      return await render(
        <WeeklyDigest userName={userName} digestContent={digestContent} />,
      );
    case "invitation":
      return await render(
        <Invitation
          organizationName={organizationName}
          inviterName={inviterName}
          role={role}
          expiresAt={expiresAt}
          actionUrl={actionUrl}
        />,
      );
    default:
      return "";
  }
}
