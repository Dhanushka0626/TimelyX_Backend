import "dotenv/config";

function normalizeEnv(value = "") {
	return String(value || "").trim().replace(/^['"]|['"]$/g, "");
}

function getEnv(name, fallback = "") {
	if (Object.prototype.hasOwnProperty.call(process.env, name)) {
		return process.env[name];
	}

	const matchedKey = Object.keys(process.env).find((key) => key.trim() === name);
	return matchedKey ? process.env[matchedKey] : fallback;
}

function parseBool(value, fallback = false) {
	if (value === undefined || value === null || value === "") return fallback;
	const normalized = String(value).trim().toLowerCase();
	return ["1", "true", "yes", "on"].includes(normalized);
}

function parseNumber(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const JWT_SECRET = process.env.JWT_SECRET || "lecturehallmanagement";

const primaryUri = getEnv("MONGODB_URI", "");
const fallbackUri = getEnv("MONGODB_URI_FALLBACK", "mongodb://127.0.0.1:27017/timelyx");

if (!primaryUri && !fallbackUri) {
	throw new Error("Neither MONGODB_URI nor MONGODB_URI_FALLBACK is set. Add one to backend/.env");
}

export const MONGODB_URI = primaryUri || fallbackUri;
export const MONGODB_URI_FALLBACK = fallbackUri;

export const RESET_PASSWORD_EXPIRES_MINUTES = parseNumber(getEnv("RESET_PASSWORD_EXPIRES_MINUTES", 15), 15);
export const FRONTEND_BASE_URL = getEnv("FRONTEND_BASE_URL", "http://localhost:5173");

export const GOOGLE_CLIENT_ID = getEnv("GOOGLE_CLIENT_ID", "");
export const GOOGLE_CLIENT_SECRET = getEnv("GOOGLE_CLIENT_SECRET", "");
export const GOOGLE_REDIRECT_URI = getEnv("GOOGLE_REDIRECT_URI", "http://localhost:3000/users/oauth/google/callback");

// Email Configuration
export const GMAIL_USER = normalizeEnv(
	getEnv("GMAIL_USER", "") ||
	getEnv("EMAIL_USER", "") ||
	getEnv("SMTP_USER", "") ||
	""
);

// Gmail app passwords are often copied with spaces in groups; strip all whitespace.
const rawGmailPassword = normalizeEnv(
	getEnv("GMAIL_PASSWORD", "") ||
	getEnv("GMAIL_PASS", "") ||
	getEnv("EMAIL_PASSWORD", "") ||
	getEnv("SMTP_PASSWORD", "") ||
	""
);
export const GMAIL_PASSWORD = rawGmailPassword.replace(/\s+/g, "");

export const SMTP_HOST = normalizeEnv(getEnv("SMTP_HOST", ""));
export const SMTP_PORT = parseNumber(getEnv("SMTP_PORT", 587), 587);
export const SMTP_SECURE = parseBool(getEnv("SMTP_SECURE", ""), SMTP_PORT === 465);
export const SMTP_TLS_REJECT_UNAUTHORIZED = parseBool(
	getEnv("SMTP_TLS_REJECT_UNAUTHORIZED", ""),
	String(process.env.NODE_ENV || "development") === "production"
);
export const MAIL_SEND_TIMEOUT_MS = parseNumber(getEnv("MAIL_SEND_TIMEOUT_MS", 20000), 20000);
export const SMTP_FROM = normalizeEnv(getEnv("SMTP_FROM", "")) || GMAIL_USER;

export const CONTACT_RECEIVER_EMAIL = normalizeEnv(
	getEnv("CONTACT_RECEIVER_EMAIL", "") || GMAIL_USER || "supporttimelyx@gmail.com"
);

export const MICROSOFT_CLIENT_ID = getEnv("MICROSOFT_CLIENT_ID", "");
export const MICROSOFT_CLIENT_SECRET = getEnv("MICROSOFT_CLIENT_SECRET", "");
export const MICROSOFT_TENANT_ID = getEnv("MICROSOFT_TENANT_ID", "common");
export const MICROSOFT_REDIRECT_URI = getEnv("MICROSOFT_REDIRECT_URI", "http://localhost:3000/users/oauth/microsoft/callback");
