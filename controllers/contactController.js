import nodemailer from "nodemailer";
import { CONTACT_RECEIVER_EMAIL, GMAIL_USER, GMAIL_PASSWORD } from "../config.js";

function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const isProduction = String(process.env.NODE_ENV || "development") === "production";
  const tlsRejectUnauthorized = String(
    process.env.SMTP_TLS_REJECT_UNAUTHORIZED || (isProduction ? "true" : "false")
  ).toLowerCase() === "true";

  // If custom SMTP details are provided, prefer them. Otherwise fallback to Gmail service.
  if (smtpHost) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: tlsRejectUnauthorized,
      },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: tlsRejectUnauthorized,
    },
  });
}

// Send contact message email
async function sendMessage(req, res) {
  try {
    // Validate that email credentials are configured
    if (!GMAIL_USER || !GMAIL_PASSWORD || GMAIL_PASSWORD === "your-app-specific-password-here") {
      console.error("Email credentials not configured properly");
      return res.status(500).json({
        message: "Email service is not properly configured. Please contact the administrator.",
      });
    }

    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email content
    const mailOptions = {
      from: GMAIL_USER,
      to: CONTACT_RECEIVER_EMAIL,
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
            ${message}
          </p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            This is an automated message from Timelyx Contact Form
          </p>
        </div>
      `,
      replyTo: email,
    };

    // Send email
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Message sent successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error sending contact message:", error);

    if (error?.code === "EAUTH") {
      return res.status(500).json({
        message: "Email authentication failed. Check your mail app password in backend/.env.",
      });
    }

    return res.status(500).json({
      message: "Failed to send message. Please try again later.",
      error: error.message,
    });
  }
}

export { sendMessage };
