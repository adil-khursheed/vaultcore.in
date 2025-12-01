import { Resend } from "resend";

import { env } from "../env.ts";
import { getEmailTemplateHtml } from "./email-template/template.ts";

export const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  props: EmailTemplateProps,
) {
  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to: [to],
    subject,
    html: getEmailTemplateHtml({ ...props }),
  });
}
