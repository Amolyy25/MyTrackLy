import { Resend } from "resend";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options: EmailOptions) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[EMAIL] RESEND_API_KEY not set, skip sending email:", options.subject);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "MyTrackLy <onboarding@resend.dev>", // Or your verified domain
      to: [options.to],
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    if (error) {
      console.error("[EMAIL] Resend error:", error);
      return;
    }

    console.log(`[EMAIL] Sent successfully to ${options.to}, ID: ${data?.id}`);
  } catch (error) {
    console.error("[EMAIL] Unexpected error sending email:", error);
  }
};
