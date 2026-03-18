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
let cachedFallbackTransporter;

function getAuth() {
    const authUser = GMAIL_USER;
    const authPass = GMAIL_PASSWORD;

    if (!authUser || !authPass || authPass === "your-app-specific-password-here") {
        throw new Error("Email service is not configured. Set GMAIL_USER and GMAIL_PASSWORD.");
    }

    return { user: authUser, pass: authPass };
}

function createTransporter() {
    const auth = getAuth();

    const commonOptions = {
        auth,
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

function createFallbackTransporter() {
    const auth = getAuth();

    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth,
        connectionTimeout: Math.max(MAIL_SEND_TIMEOUT_MS, 30000),
        greetingTimeout: Math.max(MAIL_SEND_TIMEOUT_MS, 30000),
        socketTimeout: Math.max(MAIL_SEND_TIMEOUT_MS, 30000),
        tls: {
            rejectUnauthorized: SMTP_TLS_REJECT_UNAUTHORIZED,
        },
    });
}

function createServiceFallbackTransporter() {
    const auth = getAuth();

    return nodemailer.createTransport({
        service: "gmail",
        auth,
        connectionTimeout: Math.max(MAIL_SEND_TIMEOUT_MS, 30000),
        greetingTimeout: Math.max(MAIL_SEND_TIMEOUT_MS, 30000),
        socketTimeout: Math.max(MAIL_SEND_TIMEOUT_MS, 30000),
        tls: {
            rejectUnauthorized: SMTP_TLS_REJECT_UNAUTHORIZED,
        },
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

function getFallbackTransporter() {
    if (!cachedFallbackTransporter) {
        cachedFallbackTransporter = createFallbackTransporter();
    }
    return cachedFallbackTransporter;
}

export async function sendMail(mailOptions) {
    const transporter = getTransporter();

    try {
        return await transporter.sendMail(mailOptions);
    } catch (error) {
        const code = error?.code || "";
        const isNetworkOrTimeout = ["ETIMEDOUT", "ESOCKET", "ECONNECTION", "EHOSTUNREACH", "ENOTFOUND"].includes(code);

        if (!isNetworkOrTimeout) {
            throw error;
        }

        try {
            const fallbackTransporter = getFallbackTransporter();
            return await fallbackTransporter.sendMail(mailOptions);
        } catch (fallbackError) {
            // Last attempt through nodemailer Gmail service abstraction.
            const serviceTransporter = createServiceFallbackTransporter();
            return serviceTransporter.sendMail(mailOptions);
        }
    }
}
