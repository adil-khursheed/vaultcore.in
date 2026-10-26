export type EmailTemplateType =
  | "emailVerification"
  | "welcomeOnboard"
  | "weeklyDigest"
  | "invitation";

export type EmailTemplateProps = {
  type: EmailTemplateType;
  userName?: string;
  actionUrl?: string;
  verificationCode?: string;
  digestContent?: string;
  organizationName?: string;
  inviterName?: string;
  role?: string;
  expiresAt?: string;
};
