// University data for Nigerian institutions
// Structure: city → universities → faculties → courses

export const UNIVERSITIES_BY_CITY: Record<string, string[]> = {
  Lagos: [
    "University of Lagos (UNILAG)",
    "Lagos State University (LASU)",
    "Pan-Atlantic University",
    "Covenant University",
    "Babcock University",
    "Lagos State University of Science and Technology (LASUSTECH)",
    "Christopher University",
  ],
  Abuja: [
    "University of Abuja (UNIABUJA)",
    "BAZE University",
    "Veritas University",
    "NILE University of Nigeria",
    "Nasarawa State University",
    "Federal University of Technology, Minna",
  ],
  Ibadan: [
    "University of Ibadan (UI)",
    "Lead City University",
    "Ladoke Akintola University of Technology (LAUTECH)",
  ],
  "Ile-Ife": [
    "Obafemi Awolowo University (OAU)",
  ],
  Kano: [
    "Bayero University Kano (BUK)",
    "Kano University of Science and Technology (KUST)",
    "Northwest University Kano",
    "Federal University Dutse",
  ],
  Zaria: [
    "Ahmadu Bello University (ABU)",
  ],
  "Benin City": [
    "University of Benin (UNIBEN)",
    "Benson Idahosa University",
    "Igbinedion University",
  ],
  "Port Harcourt": [
    "University of Port Harcourt (UNIPORT)",
    "Rivers State University (RSU)",
    "Ignatius Ajuru University of Education",
  ],
  Enugu: [
    "Enugu State University of Technology (ESUT)",
    "Caritas University",
    "Coal City University",
  ],
  Nsukka: [
    "University of Nigeria, Nsukka (UNN)",
  ],
  Owerri: [
    "Federal University of Technology, Owerri (FUTO)",
    "Imo State University (IMSU)",
    "Eastern Palm University",
    "Achievers University",
  ],
  Jos: [
    "University of Jos (UNIJOS)",
    "Plateau State University",
  ],
  Ilorin: [
    "University of Ilorin (UNILORIN)",
    "Al-Hikmah University",
  ],
  Akure: [
    "Federal University of Technology, Akure (FUTA)",
  ],
  Yola: [
    "Modibbo Adama University",
    "American University of Nigeria",
  ],
};

export const ALL_UNIVERSITIES = [
  ...new Set(Object.values(UNIVERSITIES_BY_CITY).flat()),
  "Redeemer's University",
  "Landmark University",
  "Bowen University",
  "Gregory University",
  "Crawford University",
  "Mountain Top University",
  "Salem University",
  "Caleb University",
].sort();

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara", "Federal Capital Territory (FCT)"
];


// ─── Faculty & Course data per university ────────────────────────────────────

type FacultyData = {
  faculties: string[];
  coursesByFaculty: Record<string, string[]>;
};

const ARTS_COURSES = [
  "English Language & Literature", "History & International Studies",
  "Philosophy", "Linguistics", "Theatre Arts", "Music", "French",
  "Yoruba", "Igbo", "Hausa", "Arabic", "Christian Religious Studies",
  "Islamic Studies", "Fine & Applied Arts", "Religious Studies",
];

const SCIENCE_COURSES = [
  "Biochemistry", "Chemistry", "Computer Science", "Mathematics",
  "Microbiology", "Physics", "Statistics", "Geology",
  "Botany", "Zoology", "Marine Biology", "Industrial Chemistry",
  "Applied Mathematics", "Information Technology",
];

const SOCIAL_SCIENCE_COURSES = [
  "Economics", "Political Science", "Sociology", "Psychology",
  "Mass Communication", "Geography", "Social Work", "Criminology",
  "Public Administration", "Demography & Social Statistics",
  "International Relations", "Development Studies",
];

const LAW_COURSES = [
  "Law (LLB)", "International Law", "Business Law",
];

const MEDICINE_COURSES = [
  "Medicine & Surgery (MBBS)", "Dentistry (BDS)", "Nursing Science",
  "Medical Laboratory Science", "Physiotherapy", "Radiography",
  "Optometry", "Pharmacy", "Public Health", "Human Anatomy",
  "Human Physiology", "Medical Biochemistry",
];

const ENGINEERING_COURSES = [
  "Civil Engineering", "Electrical & Electronics Engineering",
  "Mechanical Engineering", "Chemical Engineering",
  "Computer Engineering", "Agricultural Engineering",
  "Petroleum Engineering", "Metallurgical & Materials Engineering",
  "Systems Engineering", "Biomedical Engineering",
  "Environmental Engineering", "Structural Engineering",
  "Aerospace Engineering", "Marine Engineering",
];

const EDUCATION_COURSES = [
  "Education & English", "Education & Mathematics", "Education & Science",
  "Education & Economics", "Early Childhood Education",
  "Adult Education", "Educational Technology",
  "Guidance & Counselling", "Library & Information Science",
  "Physical & Health Education",
];

const BUSINESS_COURSES = [
  "Accounting", "Business Administration", "Marketing",
  "Banking & Finance", "Insurance", "Actuarial Science",
  "Entrepreneurship", "Human Resource Management",
  "Supply Chain Management", "Finance", "Tourism & Hospitality Management",
];

const AGRICULTURE_COURSES = [
  "Agriculture", "Animal Science", "Crop Science",
  "Soil Science & Land Management", "Agricultural Economics",
  "Food Science & Technology", "Fisheries & Aquaculture",
  "Forestry & Environment", "Agronomy", "Horticulture",
];

const ENVIRONMENTAL_COURSES = [
  "Architecture", "Urban & Regional Planning", "Estate Management",
  "Building Technology", "Quantity Surveying", "Surveying & Geoinformatics",
  "Environmental Management", "Landscape Architecture",
];

const PHARMACY_COURSES = [
  "Pharmacy (B.Pharm)", "Pharmaceutical Chemistry",
  "Pharmacology & Toxicology", "Clinical Pharmacy",
];

const COMPUTING_COURSES = [
  "Computer Science", "Information Technology",
  "Software Engineering", "Cybersecurity",
  "Artificial Intelligence", "Data Science",
  "Information Systems", "Computer & Information Science",
];

// Default faculty/course structure (used for unlisted universities)
const DEFAULT_FACULTY_DATA: FacultyData = {
  faculties: [
    "Faculty of Arts & Humanities",
    "Faculty of Science",
    "Faculty of Social Sciences",
    "Faculty of Law",
    "Faculty of Medicine & Health Sciences",
    "Faculty of Engineering & Technology",
    "Faculty of Education",
    "Faculty of Management Sciences",
    "Faculty of Agriculture",
    "Faculty of Environmental Sciences",
    "Faculty of Pharmacy",
    "Faculty of Computing",
  ],
  coursesByFaculty: {
    "Faculty of Arts & Humanities": ARTS_COURSES,
    "Faculty of Science": SCIENCE_COURSES,
    "Faculty of Social Sciences": SOCIAL_SCIENCE_COURSES,
    "Faculty of Law": LAW_COURSES,
    "Faculty of Medicine & Health Sciences": MEDICINE_COURSES,
    "Faculty of Engineering & Technology": ENGINEERING_COURSES,
    "Faculty of Education": EDUCATION_COURSES,
    "Faculty of Management Sciences": BUSINESS_COURSES,
    "Faculty of Agriculture": AGRICULTURE_COURSES,
    "Faculty of Environmental Sciences": ENVIRONMENTAL_COURSES,
    "Faculty of Pharmacy": PHARMACY_COURSES,
    "Faculty of Computing": COMPUTING_COURSES,
  },
};

// University-specific overrides for institutions with unique faculty names
const UNIVERSITY_FACULTY_DATA: Record<string, FacultyData> = {
  "University of Lagos (UNILAG)": {
    faculties: [
      "Faculty of Arts",
      "Faculty of Basic Medical Sciences",
      "Faculty of Business Administration",
      "Faculty of Clinical Sciences",
      "Faculty of Dental Sciences",
      "Faculty of Education",
      "Faculty of Engineering",
      "Faculty of Environmental Sciences",
      "Faculty of Law",
      "Faculty of Pharmacy",
      "Faculty of Science",
      "Faculty of Social Sciences",
    ],
    coursesByFaculty: {
      "Faculty of Arts": ARTS_COURSES,
      "Faculty of Basic Medical Sciences": ["Human Anatomy", "Human Physiology", "Medical Biochemistry"],
      "Faculty of Business Administration": BUSINESS_COURSES,
      "Faculty of Clinical Sciences": ["Medicine & Surgery (MBBS)"],
      "Faculty of Dental Sciences": ["Dentistry (BDS)"],
      "Faculty of Education": EDUCATION_COURSES,
      "Faculty of Engineering": ENGINEERING_COURSES,
      "Faculty of Environmental Sciences": ENVIRONMENTAL_COURSES,
      "Faculty of Law": LAW_COURSES,
      "Faculty of Pharmacy": PHARMACY_COURSES,
      "Faculty of Science": SCIENCE_COURSES,
      "Faculty of Social Sciences": SOCIAL_SCIENCE_COURSES,
    },
  },

  "University of Ibadan (UI)": {
    faculties: [
      "Faculty of Agriculture & Forestry",
      "Faculty of Arts",
      "Faculty of Basic Medical Sciences",
      "Faculty of Clinical Sciences",
      "Faculty of Dentistry",
      "Faculty of Education",
      "Faculty of Law",
      "Faculty of Pharmacy",
      "Faculty of Public Health",
      "Faculty of Science",
      "Faculty of Social Sciences",
      "Faculty of Technology",
      "Faculty of Veterinary Medicine",
      "College of Medicine",
    ],
    coursesByFaculty: {
      "Faculty of Agriculture & Forestry": AGRICULTURE_COURSES,
      "Faculty of Arts": ARTS_COURSES,
      "Faculty of Basic Medical Sciences": ["Human Anatomy", "Human Physiology", "Medical Biochemistry", "Nursing Science"],
      "Faculty of Clinical Sciences": ["Medicine & Surgery (MBBS)"],
      "Faculty of Dentistry": ["Dentistry (BDS)"],
      "Faculty of Education": EDUCATION_COURSES,
      "Faculty of Law": LAW_COURSES,
      "Faculty of Pharmacy": PHARMACY_COURSES,
      "Faculty of Public Health": ["Public Health", "Environmental Health", "Health Promotion & Education"],
      "Faculty of Science": SCIENCE_COURSES,
      "Faculty of Social Sciences": SOCIAL_SCIENCE_COURSES,
      "Faculty of Technology": ENGINEERING_COURSES,
      "Faculty of Veterinary Medicine": ["Veterinary Medicine (DVM)"],
      "College of Medicine": MEDICINE_COURSES,
    },
  },

  "Obafemi Awolowo University (OAU)": {
    faculties: [
      "Faculty of Administration",
      "Faculty of Agriculture",
      "Faculty of Arts",
      "Faculty of Basic Medical Sciences",
      "Faculty of Clinical Sciences",
      "Faculty of Dentistry",
      "Faculty of Education",
      "Faculty of Environmental Design & Management",
      "Faculty of Law",
      "Faculty of Pharmacy",
      "Faculty of Science",
      "Faculty of Social Sciences",
      "Faculty of Technology",
    ],
    coursesByFaculty: {
      "Faculty of Administration": BUSINESS_COURSES,
      "Faculty of Agriculture": AGRICULTURE_COURSES,
      "Faculty of Arts": ARTS_COURSES,
      "Faculty of Basic Medical Sciences": ["Human Anatomy", "Human Physiology", "Medical Biochemistry"],
      "Faculty of Clinical Sciences": ["Medicine & Surgery (MBBS)"],
      "Faculty of Dentistry": ["Dentistry (BDS)"],
      "Faculty of Education": EDUCATION_COURSES,
      "Faculty of Environmental Design & Management": ENVIRONMENTAL_COURSES,
      "Faculty of Law": LAW_COURSES,
      "Faculty of Pharmacy": PHARMACY_COURSES,
      "Faculty of Science": SCIENCE_COURSES,
      "Faculty of Social Sciences": SOCIAL_SCIENCE_COURSES,
      "Faculty of Technology": ENGINEERING_COURSES,
    },
  },

  "Bayero University Kano (BUK)": {
    faculties: [
      "Faculty of Agriculture",
      "Faculty of Allied Health Sciences",
      "Faculty of Arts & Islamic Studies",
      "Faculty of Clinical Sciences",
      "Faculty of Computing & IT",
      "Faculty of Education",
      "Faculty of Engineering",
      "Faculty of Law",
      "Faculty of Life Sciences",
      "Faculty of Management Sciences",
      "Faculty of Medicine",
      "Faculty of Physical Sciences",
      "Faculty of Social Sciences",
    ],
    coursesByFaculty: {
      "Faculty of Agriculture": AGRICULTURE_COURSES,
      "Faculty of Allied Health Sciences": ["Nursing Science", "Medical Laboratory Science", "Physiotherapy", "Radiography"],
      "Faculty of Arts & Islamic Studies": [...ARTS_COURSES, "Islamic Studies", "Arabic Language", "Hausa Language"],
      "Faculty of Clinical Sciences": ["Medicine & Surgery (MBBS)"],
      "Faculty of Computing & IT": COMPUTING_COURSES,
      "Faculty of Education": EDUCATION_COURSES,
      "Faculty of Engineering": ENGINEERING_COURSES,
      "Faculty of Law": LAW_COURSES,
      "Faculty of Life Sciences": ["Biochemistry", "Microbiology", "Botany", "Zoology", "Anatomy"],
      "Faculty of Management Sciences": BUSINESS_COURSES,
      "Faculty of Medicine": MEDICINE_COURSES,
      "Faculty of Physical Sciences": ["Physics", "Chemistry", "Mathematics", "Statistics", "Geology"],
      "Faculty of Social Sciences": SOCIAL_SCIENCE_COURSES,
    },
  },

  "Ahmadu Bello University (ABU)": {
    faculties: [
      "Faculty of Administration",
      "Faculty of Agriculture",
      "Faculty of Arts & Social Sciences",
      "Faculty of Education",
      "Faculty of Engineering",
      "Faculty of Environmental Design",
      "Faculty of Law",
      "Faculty of Medicine",
      "Faculty of Pharmaceutical Sciences",
      "Faculty of Science",
      "Faculty of Veterinary Medicine",
    ],
    coursesByFaculty: {
      "Faculty of Administration": BUSINESS_COURSES,
      "Faculty of Agriculture": AGRICULTURE_COURSES,
      "Faculty of Arts & Social Sciences": [...ARTS_COURSES, ...SOCIAL_SCIENCE_COURSES],
      "Faculty of Education": EDUCATION_COURSES,
      "Faculty of Engineering": ENGINEERING_COURSES,
      "Faculty of Environmental Design": ENVIRONMENTAL_COURSES,
      "Faculty of Law": LAW_COURSES,
      "Faculty of Medicine": MEDICINE_COURSES,
      "Faculty of Pharmaceutical Sciences": PHARMACY_COURSES,
      "Faculty of Science": SCIENCE_COURSES,
      "Faculty of Veterinary Medicine": ["Veterinary Medicine (DVM)"],
    },
  },

  "University of Nigeria, Nsukka (UNN)": {
    faculties: [
      "Faculty of Agriculture",
      "Faculty of Arts",
      "Faculty of Biological Sciences",
      "Faculty of Business Administration",
      "Faculty of Education",
      "Faculty of Engineering & Technology",
      "Faculty of Environmental Studies",
      "Faculty of Law",
      "Faculty of Medical Sciences",
      "Faculty of Pharmaceutical Sciences",
      "Faculty of Physical Sciences",
      "Faculty of Social Sciences",
      "Faculty of Veterinary Medicine",
    ],
    coursesByFaculty: {
      "Faculty of Agriculture": AGRICULTURE_COURSES,
      "Faculty of Arts": ARTS_COURSES,
      "Faculty of Biological Sciences": ["Botany", "Microbiology", "Zoology", "Biochemistry"],
      "Faculty of Business Administration": BUSINESS_COURSES,
      "Faculty of Education": EDUCATION_COURSES,
      "Faculty of Engineering & Technology": ENGINEERING_COURSES,
      "Faculty of Environmental Studies": ENVIRONMENTAL_COURSES,
      "Faculty of Law": LAW_COURSES,
      "Faculty of Medical Sciences": MEDICINE_COURSES,
      "Faculty of Pharmaceutical Sciences": PHARMACY_COURSES,
      "Faculty of Physical Sciences": ["Physics", "Chemistry", "Mathematics", "Statistics", "Computer Science"],
      "Faculty of Social Sciences": SOCIAL_SCIENCE_COURSES,
      "Faculty of Veterinary Medicine": ["Veterinary Medicine (DVM)"],
    },
  },

  "University of Benin (UNIBEN)": {
    faculties: [
      "Faculty of Agriculture",
      "Faculty of Arts",
      "Faculty of Basic Medical Sciences",
      "Faculty of Clinical Sciences",
      "Faculty of Education",
      "Faculty of Engineering",
      "Faculty of Environmental Sciences",
      "Faculty of Law",
      "Faculty of Life Sciences",
      "Faculty of Management Sciences",
      "Faculty of Pharmacy",
      "Faculty of Physical Sciences",
      "Faculty of Social Sciences",
    ],
    coursesByFaculty: {
      "Faculty of Agriculture": AGRICULTURE_COURSES,
      "Faculty of Arts": ARTS_COURSES,
      "Faculty of Basic Medical Sciences": ["Human Anatomy", "Human Physiology", "Medical Biochemistry"],
      "Faculty of Clinical Sciences": ["Medicine & Surgery (MBBS)", "Dentistry (BDS)"],
      "Faculty of Education": EDUCATION_COURSES,
      "Faculty of Engineering": ENGINEERING_COURSES,
      "Faculty of Environmental Sciences": ENVIRONMENTAL_COURSES,
      "Faculty of Law": LAW_COURSES,
      "Faculty of Life Sciences": ["Biochemistry", "Microbiology", "Botany", "Zoology"],
      "Faculty of Management Sciences": BUSINESS_COURSES,
      "Faculty of Pharmacy": PHARMACY_COURSES,
      "Faculty of Physical Sciences": SCIENCE_COURSES,
      "Faculty of Social Sciences": SOCIAL_SCIENCE_COURSES,
    },
  },

  "University of Port Harcourt (UNIPORT)": {
    faculties: [
      "Faculty of Agriculture",
      "Faculty of Basic Medical Sciences",
      "Faculty of Clinical Sciences",
      "Faculty of Education",
      "Faculty of Engineering",
      "Faculty of Humanities",
      "Faculty of Law",
      "Faculty of Management Sciences",
      "Faculty of Pharmacy",
      "Faculty of Science",
      "Faculty of Social Sciences",
      "Faculty of Technical & Science Education",
    ],
    coursesByFaculty: {
      "Faculty of Agriculture": AGRICULTURE_COURSES,
      "Faculty of Basic Medical Sciences": ["Human Anatomy", "Human Physiology", "Medical Biochemistry"],
      "Faculty of Clinical Sciences": ["Medicine & Surgery (MBBS)"],
      "Faculty of Education": EDUCATION_COURSES,
      "Faculty of Engineering": ENGINEERING_COURSES,
      "Faculty of Humanities": ARTS_COURSES,
      "Faculty of Law": LAW_COURSES,
      "Faculty of Management Sciences": BUSINESS_COURSES,
      "Faculty of Pharmacy": PHARMACY_COURSES,
      "Faculty of Science": SCIENCE_COURSES,
      "Faculty of Social Sciences": SOCIAL_SCIENCE_COURSES,
      "Faculty of Technical & Science Education": [...EDUCATION_COURSES, "Technical Education"],
    },
  },

  "Federal University of Technology, Owerri (FUTO)": {
    faculties: [
      "School of Agriculture & Agricultural Technology",
      "School of Biological Sciences",
      "School of Computing & Information Technology",
      "School of Education",
      "School of Engineering & Engineering Technology",
      "School of Environmental Sciences",
      "School of Health Technology",
      "School of Management Technology",
      "School of Physical Sciences",
      "School of Postgraduate Studies",
    ],
    coursesByFaculty: {
      "School of Agriculture & Agricultural Technology": AGRICULTURE_COURSES,
      "School of Biological Sciences": ["Biochemistry", "Microbiology", "Biotechnology", "Industrial Chemistry"],
      "School of Computing & Information Technology": COMPUTING_COURSES,
      "School of Education": EDUCATION_COURSES,
      "School of Engineering & Engineering Technology": ENGINEERING_COURSES,
      "School of Environmental Sciences": ENVIRONMENTAL_COURSES,
      "School of Health Technology": ["Medical Laboratory Science", "Nutrition & Dietetics", "Environmental Health", "Occupational Safety"],
      "School of Management Technology": [...BUSINESS_COURSES, "Procurement & Supply Chain Management"],
      "School of Physical Sciences": ["Physics", "Chemistry", "Mathematics", "Statistics", "Geosciences"],
    },
  },

  "Lagos State University (LASU)": {
    faculties: [
      "Faculty of Arts",
      "Faculty of Education",
      "Faculty of Engineering",
      "Faculty of Environmental Sciences",
      "Faculty of Law",
      "Faculty of Management Sciences",
      "Faculty of Science",
      "Faculty of Social Sciences",
      "College of Medicine",
    ],
    coursesByFaculty: {
      "Faculty of Arts": ARTS_COURSES,
      "Faculty of Education": EDUCATION_COURSES,
      "Faculty of Engineering": ENGINEERING_COURSES,
      "Faculty of Environmental Sciences": ENVIRONMENTAL_COURSES,
      "Faculty of Law": LAW_COURSES,
      "Faculty of Management Sciences": BUSINESS_COURSES,
      "Faculty of Science": SCIENCE_COURSES,
      "Faculty of Social Sciences": SOCIAL_SCIENCE_COURSES,
      "College of Medicine": MEDICINE_COURSES,
    },
  },

  "University of Abuja (UNIABUJA)": {
    faculties: [
      "Faculty of Agriculture",
      "Faculty of Arts",
      "Faculty of Education",
      "Faculty of Engineering",
      "Faculty of Environmental Sciences",
      "Faculty of Law",
      "Faculty of Medicine & Pharmaceutical Sciences",
      "Faculty of Science",
      "Faculty of Social Sciences",
    ],
    coursesByFaculty: {
      "Faculty of Agriculture": AGRICULTURE_COURSES,
      "Faculty of Arts": ARTS_COURSES,
      "Faculty of Education": EDUCATION_COURSES,
      "Faculty of Engineering": ENGINEERING_COURSES,
      "Faculty of Environmental Sciences": ENVIRONMENTAL_COURSES,
      "Faculty of Law": LAW_COURSES,
      "Faculty of Medicine & Pharmaceutical Sciences": [...MEDICINE_COURSES, ...PHARMACY_COURSES],
      "Faculty of Science": SCIENCE_COURSES,
      "Faculty of Social Sciences": SOCIAL_SCIENCE_COURSES,
    },
  },
};

// Resolve faculty/course data for a given university
export function getUniversityData(university: string): FacultyData {
  return UNIVERSITY_FACULTY_DATA[university] ?? DEFAULT_FACULTY_DATA;
}
