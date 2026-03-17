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