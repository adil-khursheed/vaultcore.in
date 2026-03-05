import * as React from "react";
import { render } from "@react-email/render";

import type { EmailTemplateProps } from "./types";
import { EmailVerification } from "./email-template/email-verification";
import { WeeklyDigest } from "./email-template/weekly-digest";
import { WelcomeOnboard } from "./email-template/welcome-onboard";

export async function getEmailTemplateHtml(
  props: EmailTemplateProps,
): Promise<string> {
  const { type, userName, actionUrl, verificationCode, digestContent } = props;

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
    default:
      return "";
  }
}
