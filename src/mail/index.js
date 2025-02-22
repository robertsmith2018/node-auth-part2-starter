import nodemailer from "nodemailer";

let mail;

export async function mailInit() {
  let testAccount = await nodemailer.createTestAccount();
  mail = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return mail
}

export async function sendEmail({
  from = "johndoe@test.com",
  to = "johndoet@test.com",
  subject,
  html,
}) {
  try {
    // Ensure the email transporter is initialized
    if (!mail) {
      throw new Error("Email transporter not initialized");
    }

    // Add debug statement to check values being passed
    console.log("sendEmail called with:", { from, to, subject, html });

    const info = await mail.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    console.log("info", info);
  } catch (e) {
    console.error("Failed to send email:", e);
  }
}
