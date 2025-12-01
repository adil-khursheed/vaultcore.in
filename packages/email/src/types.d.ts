type EmailTemplateType =
  | "emailVerification"
  | "welcomeOnboard"
  | "weeklyDigest";

type EmailTemplateProps = {
  type: EmailTemplateType;
  userName?: string;
  actionUrl?: string;
  verificationCode?: string;
  digestContent?: string;
};
