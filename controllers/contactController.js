import { CONTACT_RECEIVER_EMAIL } from "../config.js";
import { getMailFromAddress, sendMail } from "../utils/mailer.js";

// Send contact message email
async function sendMessage(req, res) {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email content
    const mailOptions = {
      from: getMailFromAddress(),
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

    await sendMail(mailOptions);

    return res.status(200).json({
      message: "Message sent successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error sending contact message:", error);

    if (error?.code === "EAUTH") {
      return res.status(500).json({
        message: "Email authentication failed. Verify GMAIL_USER and GMAIL_PASSWORD in Render environment variables.",
      });
    }

    if (error?.code === "ETIMEDOUT" || error?.code === "ESOCKET") {
      return res.status(500).json({
        message: "Email server timed out. Verify SMTP_HOST/SMTP_PORT/SMTP_SECURE and try again.",
      });
    }

    return res.status(500).json({
      message: "Failed to send message. Please try again later.",
      error: error.message,
    });
  }
}

export { sendMessage };
