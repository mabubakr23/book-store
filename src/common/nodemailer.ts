import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVICE_SMTP,
  port: parseInt(process.env.EMAIL_SERVICE_PORT || "587", 10),
  auth: {
    user: process.env.EMAIL_SERVICE_USER,
    pass: process.env.EMAIL_SERVICE_PASSWORD,
  },
} as nodemailer.TransportOptions);

export async function sendMail(to: string, subject: string, text: string) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_SERVICE_SENDER_EMAIL,
    to,
    subject,
    text,
  });
}
