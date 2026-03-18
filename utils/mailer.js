import nodemailer from "nodemailer";
import {
    GMAIL_PASSWORD,
    GMAIL_USER,
    MAIL_SEND_TIMEOUT_MS,
    SMTP_FROM,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_TLS_REJECT_UNAUTHORIZED,
} from "../config.js";

let cachedTransporter;

function createTransporter() {
    const authUser = GMAIL_USER;
    const authPass = GMAIL_PASSWORD;

    if (!authUser || !authPass || authPass === "your-app-specific-password-here") {
        throw new Error("Email service is not configured. Set GMAIL_USER and GMAIL_PASSWORD.");
    }

    const commonOptions = {
        auth: {
            user: authUser,
            pass: authPass,
        },
        connectionTimeout: MAIL_SEND_TIMEOUT_MS,
        greetingTimeout: MAIL_SEND_TIMEOUT_MS,
        socketTimeout: MAIL_SEND_TIMEOUT_MS,
        tls: {
            rejectUnauthorized: SMTP_TLS_REJECT_UNAUTHORIZED,
        },
    };

    if (SMTP_HOST) {
        return nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_SECURE,
            ...commonOptions,
        });
    }

    return nodemailer.createTransport({
        service: "gmail",
        ...commonOptions,
    });
}

export function getMailFromAddress() {
    return SMTP_FROM || GMAIL_USER;
}

export function getTransporter() {
    if (!cachedTransporter) {
        cachedTransporter = createTransporter();
    }
    return cachedTransporter;
}

export async function sendMail(mailOptions) {
    const transporter = getTransporter();
    return transporter.sendMail(mailOptions);
}
