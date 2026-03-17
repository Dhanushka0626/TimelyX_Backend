import nodemailer from "nodemailer";
import { GMAIL_PASSWORD, GMAIL_USER } from "../config.js";

function parseBoolean(value, fallback = false) {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    return String(value).toLowerCase() === "true";
}

export function buildMailTransportOptions() {
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpSecure = parseBoolean(process.env.SMTP_SECURE, false);
    const smtpPort = Number(process.env.SMTP_PORT || (smtpSecure ? 465 : 587));
    const isProduction = String(process.env.NODE_ENV || "development") === "production";
    const tlsRejectUnauthorized = parseBoolean(
        process.env.SMTP_TLS_REJECT_UNAUTHORIZED,
        isProduction
    );

    return {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        requireTLS: !smtpSecure,
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_PASSWORD,
        },
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
        dnsTimeout: Number(process.env.SMTP_DNS_TIMEOUT || 10000),
        tls: {
            rejectUnauthorized: tlsRejectUnauthorized,
        },
    };
}

export async function sendMailWithTimeout(transporter, mailOptions) {
    const timeoutMs = Number(process.env.MAIL_SEND_TIMEOUT_MS || 20000);

    return await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Mail send timed out after ${timeoutMs}ms`)), timeoutMs);
        }),
    ]);
}

function buildTransportCandidates() {
    const candidates = [];
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = GMAIL_USER;
    const smtpPass = GMAIL_PASSWORD;

    if (!smtpUser || !smtpPass) {
        return candidates;
    }

    if (smtpHost) {
        candidates.push(buildMailTransportOptions());
    }

    // Gmail service strategy (often works even when direct host/port has issues).
    candidates.push({
        service: "gmail",
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
        dnsTimeout: Number(process.env.SMTP_DNS_TIMEOUT || 10000),
    });

    // Explicit SSL strategy.
    candidates.push({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
        dnsTimeout: Number(process.env.SMTP_DNS_TIMEOUT || 10000),
    });

    // Explicit STARTTLS strategy.
    candidates.push({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
        dnsTimeout: Number(process.env.SMTP_DNS_TIMEOUT || 10000),
    });

    return candidates;
}

export async function sendMailWithFallback(mailOptions) {
    const candidates = buildTransportCandidates();
    if (candidates.length === 0) {
        throw new Error("Email service is not configured");
    }

    let lastError = null;

    for (const candidate of candidates) {
        try {
            const transporter = nodemailer.createTransport(candidate);
            const result = await sendMailWithTimeout(transporter, mailOptions);
            return result;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error("Mail delivery failed");
}