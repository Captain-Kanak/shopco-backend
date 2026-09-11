import nodemailer from "nodemailer";
import status from "http-status";
import path from "path";
import ejs from "ejs";
import { env } from "../config/env.js";
import AppError from "../errors/app-error.js";

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

const transporter = nodemailer.createTransport({
  host: env.EMAIL_SENDER_SMTP_HOST,
  port: Number(env.EMAIL_SENDER_SMTP_PORT),
  secure: true,
  auth: {
    user: env.EMAIL_SENDER_SMTP_USER,
    pass: env.EMAIL_SENDER_SMTP_PASS,
  },
});

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.resolve(
      process.cwd(),
      `src/templates/${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: env.EMAIL_SENDER_SMTP_USER,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    console.log(`email send to ${to} : ${info.messageId}`);
  } catch (error) {
    console.log("Email Sending Error:", error);

    throw new AppError("Failed to send email", status.INTERNAL_SERVER_ERROR);
  }
};
