export type EmailTemplateType =
  | "emailVerification"
  | "welcomeOnboard"
  | "weeklyDigest";

export type EmailTemplateProps = {
  type: EmailTemplateType;
  userName?: string;
  actionUrl?: string;
  verificationCode?: string;
  digestContent?: string;
};
