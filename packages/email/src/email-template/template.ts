import { EmailTemplateProps } from "../types.js";

export function getEmailTemplateHtml(props: EmailTemplateProps) {
  const { type, userName, actionUrl, verificationCode, digestContent } = props;

  switch (type) {
    case "emailVerification":
      return `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;">
          <h2 style="color:#4F46E5;">Verify Your Email</h2>
          <p>Hi${userName ? ` ${userName}` : ""},</p>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <a href="${actionUrl || "#"}" style="background:#4F46E5;color:#fff;padding:12px 28px;border-radius:5px;text-decoration:none;display:inline-block;margin-top:18px;font-weight:bold;">
            Verify Email
          </a>
          ${
            verificationCode
              ? `<p style="margin-top:28px;">Or enter the following code in the app:</p>
          <div style="font-size:1.8em;letter-spacing:5px;background:#F1F5F9;display:inline-block;padding:8px 24px;border-radius:4px;margin-top:4px;">
            ${verificationCode}
          </div>`
              : ""
          }
          <p style="color:#64748b;margin-top:28px;font-size:.95em;">If you didn’t request this, please ignore this email.</p>
        </div>
      `;
    case "welcomeOnboard":
      return `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;">
          <h2 style="color:#4F46E5;">Welcome Aboard${userName ? `, ${userName}` : ""}!</h2>
          <p>We're excited to have you join us. Here are a few tips to get started:</p>
          <ul>
            <li>Explore your dashboard to discover helpful features.</li>
            <li>Personalize your settings to fit your preferences.</li>
            <li>Reach out to support if you need any assistance.</li>
          </ul>
          <p style="margin-top:22px;">We hope you have a fantastic experience!</p>
          <p style="color:#64748b;margin-top:20px;">— The Team</p>
        </div>
      `;
    case "weeklyDigest":
      return `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;">
          <h2 style="color:#4F46E5;">Your Weekly Digest</h2>
          <p>Hi${userName ? ` ${userName}` : ""},</p>
          <p>Here's a quick summary of your recent activity:</p>
          <div style="margin:20px 0;padding:16px 20px;background:#F8FAFC;border-radius:6px;border:1px solid #E5E7EB;">
            ${digestContent || "No new updates this week. Stay tuned for more activity!"}
          </div>
          <p style="margin-top:18px;">Keep up the great work, and see you next week!</p>
          <p style="color:#64748b;margin-top:18px;">— The Team</p>
        </div>
      `;
    default:
      return "";
  }
}
