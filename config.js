import "dotenv/config";

function normalizeEnv(value = "") {
	return String(value || "").trim().replace(/^['"]|['"]$/g, "");
}

function normalizeOrigin(value = "") {
	return normalizeEnv(value).replace(/\/+$/, "");
}

export const JWT_SECRET = process.env.JWT_SECRET || "lecturehallmanagement";
export const PORT = Number(process.env.PORT || 3000);
export const CORS_ALLOWED_ORIGINS = String(
	process.env.CORS_ALLOWED_ORIGINS || "https://timely-x-frontend.vercel.app,http://localhost:5173,http://localhost:5174"
)
	.split(",")
	.map((v) => normalizeOrigin(v))
	.filter(Boolean);
export const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "https://timely-x-frontend.vercel.app";

const primaryUri = process.env.MONGODB_URI;
const fallbackUri = process.env.MONGODB_URI_FALLBACK || "mongodb://127.0.0.1:27017/timelyx";

if (!primaryUri && !fallbackUri) {
	throw new Error("Neither MONGODB_URI nor MONGODB_URI_FALLBACK is set. Add one to backend/.env");
}

export const MONGODB_URI = primaryUri || fallbackUri;
export const MONGODB_URI_FALLBACK = fallbackUri;

export const RESET_PASSWORD_EXPIRES_MINUTES = Number(process.env.RESET_PASSWORD_EXPIRES_MINUTES || 15);

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/users/oauth/google/callback";

// Email Configuration
export const GMAIL_USER = normalizeEnv(
	process.env.GMAIL_USER || process.env.EMAIL_USER || process.env.SMTP_USER || ""
);

// Gmail app passwords are often copied with spaces in groups; strip all whitespace.
const rawGmailPassword = normalizeEnv(
	process.env.GMAIL_PASSWORD ||
	process.env.GMAIL_PASS ||
	process.env.EMAIL_PASSWORD ||
	process.env.SMTP_PASSWORD ||
	""
);
export const GMAIL_PASSWORD = rawGmailPassword.replace(/\s+/g, "");

export const CONTACT_RECEIVER_EMAIL = normalizeEnv(
	process.env.CONTACT_RECEIVER_EMAIL || GMAIL_USER || "supporttimelyx@gmail.com"
);

export const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || "";
export const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || "";
export const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID || "common";
export const MICROSOFT_REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || "http://localhost:3000/users/oauth/microsoft/callback";
