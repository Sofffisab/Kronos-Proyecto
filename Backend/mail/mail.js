import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const getFromAddress = () => {
  const configuredFrom = process.env.MAIL_FROM?.trim();

  if (configuredFrom && /<[^<>]+@[^<>]+>/.test(configuredFrom)) {
    return configuredFrom;
  }

  if (configuredFrom && /^[^<>@]+@[^<>]+$/.test(configuredFrom)) {
    return `Kronos Proyecto <${configuredFrom}>`;
  }

  return "Kronos Proyecto <proyectokronos25@gmail.com>";
};

const setupmail = () => {
  const sendinvitationmail = async (tomail, codigo, projectname) => {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY not configured");
        return { success: false, error: "Mail service not configured" };
      };

      const { data, error } = await resend.emails.send({
        from: "Kronos Proyecto <noreply@kronos-proyecto.me>",
        to: tomail,
        subject: `Invitation to join project: ${projectname}`,
        html: `
                    <h2>You have been invited to join a project</h2>
                    <p>You have been invited to join project <strong>${projectname}</strong></p>
                    <p>Your invitation code is: <strong>${codigo}</strong></p>
                    <p>This code will expire in 7 days</p>
                    <p>Please use this code if you want to contribute to the project.</p>
                `,
      });

      if (error) {
        console.error("Error sending mail:", error);
        return { success: false, error: error };
      };

      return { success: true, data: data };
    } catch (error) {
      console.error("Error sending invitation mail:", error);
      return { success: false, error: error };
    };
  };

  return { sendinvitationmail };
};

export default setupmail;