export type PasswordStrength = "weak" | "medium" | "strong";

export interface PasswordCriteria {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  noConsecutiveRepeats: boolean;
  enoughUniqueCharacters: boolean;
  noSequentialCharacters: boolean;
  noCommonWords: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  error: string | null;
  strength: PasswordStrength;
  score: number;
  criteria: PasswordCriteria;
}

const COMMON_WEAK_WORDS = [
  "password",
  "passcode",
  "roomie",
  "roommate",
  "welcome",
  "admin",
  "student",
  "qwerty",
];

const SEQUENCE_PATTERNS = [
  "abcdefghijklmnopqrstuvwxyz",
  "0123456789",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
];

function hasSequence(password: string, minimumLength = 4) {
  const normalized = password.toLowerCase();

  return SEQUENCE_PATTERNS.some((pattern) => {
    for (let index = 0; index <= pattern.length - minimumLength; index++) {
      const sequence = pattern.slice(index, index + minimumLength);
      const reversed = sequence.split("").reverse().join("");

      if (normalized.includes(sequence) || normalized.includes(reversed)) {
        return true;
      }
    }

    return false;
  });
}

function getFirstValidationError(criteria: PasswordCriteria, password: string) {
  if (!password) {
    return "Password is required.";
  }

  if (!criteria.length) {
    return "Password must be at least 8 characters long.";
  }

  if (!criteria.uppercase || !criteria.lowercase) {
    return "Password must contain both uppercase and lowercase letters.";
  }

  if (!criteria.number) {
    return "Password must contain at least one number.";
  }

  if (!criteria.special) {
    return "Password must contain at least one special character.";
  }

  if (!criteria.noConsecutiveRepeats) {
    return "Password cannot contain 3 or more repeated characters in a row.";
  }

  if (!criteria.enoughUniqueCharacters) {
    return "Password must use at least 4 unique characters.";
  }

  if (!criteria.noSequentialCharacters) {
    return "Password cannot contain alphabetical, numerical, or keyboard sequences of 4 or more characters.";
  }

  if (!criteria.noCommonWords) {
    return "Password cannot contain common guessable words like password, roomie, or roommate.";
  }

  return null;
}

export function validatePassword(password: string): PasswordValidationResult {
  const normalized = password.toLowerCase();
  const criteria: PasswordCriteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    noConsecutiveRepeats: !/(.)\1{2,}/.test(password),
    enoughUniqueCharacters: password.length < 8 || new Set(password).size >= 4,
    noSequentialCharacters: !hasSequence(password),
    noCommonWords: !COMMON_WEAK_WORDS.some((word) => normalized.includes(word)),
  };

  const score = [
    criteria.length,
    criteria.uppercase && criteria.lowercase,
    criteria.number,
    criteria.special,
    criteria.noConsecutiveRepeats &&
      criteria.enoughUniqueCharacters &&
      criteria.noSequentialCharacters &&
      criteria.noCommonWords,
  ].filter(Boolean).length;

  const error = getFirstValidationError(criteria, password);
  const isValid = error === null;

  let strength: PasswordStrength = "weak";
  if (isValid && score >= 5) {
    strength = "strong";
  } else if (
    criteria.length &&
    score >= 3 &&
    criteria.noConsecutiveRepeats &&
    criteria.enoughUniqueCharacters &&
    criteria.noSequentialCharacters &&
    criteria.noCommonWords
  ) {
    strength = "medium";
  }

  return {
    isValid,
    error,
    strength,
    score,
    criteria,
  };
}
