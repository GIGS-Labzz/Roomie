export interface EmailValidationResult {
  isValid: boolean;
  error: string | null;
}

const ALLOWED_EMAIL_PROVIDERS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "rocketmail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "zoho.com",
  "zohomail.com",
  "fastmail.com",
  "hey.com",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "yandex.com",
  "tutanota.com",
  "tutamail.com",
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): EmailValidationResult {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    return {
      isValid: false,
      error: "Email is required.",
    };
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    return {
      isValid: false,
      error: "Invalid mail.",
    };
  }

  const domain = normalized.split("@").pop();
  if (!domain || !ALLOWED_EMAIL_PROVIDERS.has(domain)) {
    return {
      isValid: false,
      error: "Invalid mail. Use a real email provider.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}
