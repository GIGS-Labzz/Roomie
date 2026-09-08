/**
 * Nigerian Higher Institution Matriculation / Registration Number Pattern Registry
 */

export interface UniversityPattern {
  name: string;
  aliases: string[];
  pattern: RegExp;
  hint: string;
  example: string;
}

export const NIGERIAN_UNIVERSITY_PATTERNS: UniversityPattern[] = [
  {
    name: "University of Lagos",
    aliases: ["UNILAG", "University of Lagos, Akoka"],
    pattern: /^[0-9]{9}$/,
    hint: "UNILAG matric numbers consist of 9 digits (e.g. 190401001)",
    example: "190401001",
  },
  {
    name: "University of Nigeria, Nsukka",
    aliases: ["UNN", "University of Nigeria"],
    pattern: /^(19|20)[0-9]{2}\/[0-9]{5,6}$/i,
    hint: "UNN format: YYYY/XXXXXX (e.g. 2019/245678)",
    example: "2019/245678",
  },
  {
    name: "Obafemi Awolowo University",
    aliases: ["OAU", "Obafemi Awolowo University, Ile-Ife"],
    pattern: /^[A-Z]{3}\/[0-9]{4}\/[0-9]{3,4}$/i,
    hint: "OAU format: DEPT/YEAR/NUM (e.g. ENG/2019/001)",
    example: "ENG/2019/001",
  },
  {
    name: "University of Ibadan",
    aliases: ["UI", "University of Ibadan"],
    pattern: /^[0-9]{2}\/[0-9]{2,4}[A-Z]{2}[0-9]{3,4}$/i,
    hint: "UI format: YY/DEPTNUM (e.g. 19/25EE011)",
    example: "19/25EE011",
  },
  {
    name: "University of Ilorin",
    aliases: ["UNILORIN", "University of Ilorin"],
    pattern: /^[0-9]{2}\/[0-9]{2}[A-Z]{2}[0-9]{3,4}$/i,
    hint: "UNILORIN format: YY/XXDEPTNUM (e.g. 18/56EF011)",
    example: "18/56EF011",
  },
  {
    name: "Ahmadu Bello University",
    aliases: ["ABU", "ABU Zaria", "Ahmadu Bello University Zaria"],
    pattern: /^(U|U\/|)[0-9]{2}\/[A-Z]{3,4}\/[0-9]{4}$/i,
    hint: "ABU format: U19/SCI/3456 or 19/SCI/3456",
    example: "U19/SCI/3456",
  },
  {
    name: "Federal University of Technology, Akure",
    aliases: ["FUTA", "Federal University of Technology Akure"],
    pattern: /^F?\/?(HD|UG)?\/?[0-9]{2}\/[A-Z]{2,4}\/[0-9]{4}$/i,
    hint: "FUTA format: F/HD/19/EE/3421 or 19/EE/3421",
    example: "19/EE/3421",
  },
  {
    name: "Federal University, Oye-Ekiti",
    aliases: ["FUOYE", "Federal University Oye Ekiti"],
    pattern: /^[0-9]{4}-[A-Z]{3,4}-[0-9]{4}$/i,
    hint: "FUOYE format: YYYY-DEPT-XXXX (e.g. 2019-CSC-0031)",
    example: "2019-CSC-0031",
  },
  {
    name: "Lagos State University",
    aliases: ["LASU", "Lagos State University, Ojo"],
    pattern: /^[0-9]{9}$/,
    hint: "LASU matric numbers consist of 9 digits (e.g. 180211234)",
    example: "180211234",
  },
  {
    name: "Covenant University",
    aliases: ["Covenant", "Covenant University, Ota"],
    pattern: /^[A-Z]{3}\/[A-Z]{3}\/[0-9]{2}\/[0-9]{3,4}$/i,
    hint: "Covenant format: COL/DEPT/YY/NUM (e.g. CST/CIS/19/001)",
    example: "CST/CIS/19/001",
  },
  {
    name: "Federal University of Technology, Owerri",
    aliases: ["FUTO"],
    pattern: /^[0-9]{11}$/,
    hint: "FUTO format: 11-digit matric number (e.g. 20191145678)",
    example: "20191145678",
  },
  {
    name: "Babcock University",
    aliases: ["Babcock"],
    pattern: /^[0-9]{2}\/[0-9]{4}$/i,
    hint: "Babcock format: YY/XXXX (e.g. 19/1234)",
    example: "19/1234",
  },
  {
    name: "Bayero University Kano",
    aliases: ["BUK"],
    pattern: /^[A-Z]{3}\/[0-9]{2}\/[A-Z]{3}\/[0-9]{5}$/i,
    hint: "BUK format: CST/19/COM/00123",
    example: "CST/19/COM/00123",
  },
  {
    name: "Olabisi Onabanjo University",
    aliases: ["OOU"],
    pattern: /^[A-Z]{3}\/[0-9]{2}\/[0-9]{4}$/i,
    hint: "OOU format: DEPT/YY/XXXX (e.g. SMS/19/1004)",
    example: "SMS/19/1004",
  },
];

/**
 * Searches for pattern matching specified institution and validates reg number format
 */
export function validateRegNumber(
  institutionName: string,
  regNumber: string
): { valid: boolean; matchedPattern?: UniversityPattern; hint?: string } {
  if (!institutionName || !regNumber) {
    return { valid: false };
  }

  const cleanInst = institutionName.trim().toLowerCase();
  const cleanReg = regNumber.trim();

  // Find pattern
  const matched = NIGERIAN_UNIVERSITY_PATTERNS.find((p) => {
    if (p.name.toLowerCase() === cleanInst) return true;
    return p.aliases.some((alias) => alias.toLowerCase() === cleanInst || cleanInst.includes(alias.toLowerCase()));
  });

  if (!matched) {
    // Unlisted institution — generic check (at least 4 alphanumeric chars)
    return {
      valid: cleanReg.length >= 4,
      hint: "Registration number stored as provided",
    };
  }

  const isValid = matched.pattern.test(cleanReg);
  return {
    valid: isValid,
    matchedPattern: matched,
    hint: matched.hint,
  };
}
