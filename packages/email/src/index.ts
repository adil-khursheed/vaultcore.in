import { Resend } from "resend";

import type { EmailTemplateProps } from "./types";
import { getEmailTemplateHtml } from "./template";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  props,
  subject,
  to,
}: {
  to: string;
  subject: string;
  props: EmailTemplateProps;
}) {
  return await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: [to],
    subject,
    html: await getEmailTemplateHtml({ ...props }),
  });
}
