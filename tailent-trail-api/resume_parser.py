import os
import re
import json
from datetime import datetime
from openai import OpenAI
from google import genai
from dotenv import load_dotenv
from pdfminer.high_level import extract_text
import docx2txt
import mammoth

# -------------------------------
# LOAD ENV
# -------------------------------
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

# -------------------------------
# TEXT EXTRACTION
# -------------------------------
def extract_resume_text(file_path):
    if file_path.endswith(".pdf"):
        return extract_text(file_path)
    elif file_path.endswith(".docx"):
        return docx2txt.process(file_path)
    elif file_path.endswith(".doc"):
        with open(file_path, "rb") as doc_file:
            return mammoth.extract_raw_text(doc_file).value
    else:
        raise ValueError("Unsupported file format")

# -------------------------------
# BASIC EXTRACTION
# -------------------------------
def extract_basic_info(text):
    phones = re.findall(r'\+?\d[\d -]{8,12}', text)
    emails = re.findall(r'\S+@\S+', text)

    keywords = [
        "python","java","c","javascript","html","css",
        "aws","azure","gcp","mern","react","node",
        "mongodb","sql","docker","kubernetes","jenkins"
    ]

    skills = [k for k in keywords if k in text.lower()]
    return phones, emails, skills

# -------------------------------
# SKILL NORMALIZATION
# -------------------------------
SKILL_MAP = {
    "html": "HTML",
    "css": "CSS",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "aws": "AWS",
    "mongodb": "MongoDB",
    "sql": "SQL",
    "mern": "MERN Stack",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "react": "React",
    "react.js": "React",
    "express.js": "Express.js",
    "expressjs": "Express.js",
    "tailwindcss": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "mysql": "MySQL",
    "gcp": "GCP",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "jenkins": "Jenkins",
    "openai api": "OpenAI APIs",
    "twilio api": "Twilio",
    "nlp": "Natural Language Processing"
}

def normalize_skills(skills):
    cleaned = set()

    for s in skills:
        if not s:
            continue

        s = s.strip().lower()

        if s in SKILL_MAP:
            cleaned.add(SKILL_MAP[s])
        else:
            cleaned.add(s.title())

    return sorted(cleaned)

# -------------------------------
# EXPERIENCE DURATION
# -------------------------------
def calc_months(start, end):
    if not start:
        return 0

    if not end or end == "Present":
        end = datetime.today().strftime("%Y-%m")

    try:
        s = datetime.strptime(start, "%Y-%m")
        e = datetime.strptime(end, "%Y-%m")
        return max(0, (e.year - s.year) * 12 + (e.month - s.month))
    except:
        return 0

# -------------------------------
# ENRICH EXPERIENCE SKILLS
# -------------------------------
def enrich_experience_skills(data):
    global_skills = set(data.get("skills", []))

    for exp in data.get("experience", []):
        if not exp.get("skills"):
            desc = exp.get("description", "").lower()
            exp["skills"] = [
                s for s in global_skills if s.lower() in desc
            ]

    return data

# -------------------------------
# MAIN FUNCTION
# -------------------------------
def resume_ner_gpt(file_path):
    text = extract_resume_text(file_path)

    phones, emails, detected_skills = extract_basic_info(text)

    current_date = datetime.today().strftime("%Y-%m")

    prompt = f"""
        You are an advanced resume parsing system.

        Your task is to extract structured information from a resume and return ONLY valid JSON.

        --------------------------------------------------
        OUTPUT FORMAT (STRICT — DO NOT CHANGE KEYS)
        --------------------------------------------------

        {{
        "name": "",
        "given_name": "",
        "surname": "",
        "phone": "",
        "email": "",
        "location": {{
            "city": "",
            "state": "",
            "country": ""
        }},
        "skills": [],
        "experience": [
            {{
            "company": "",
            "role": "",
            "start_date": "",
            "end_date": "",
            "skills": [],
            "description": ""
            }}
        ],
        "education": [
            {{
            "degree": "",
            "specialization": "",
            "institution": ""
            }}
        ]
        }}

        --------------------------------------------------
        GLOBAL INSTRUCTIONS
        --------------------------------------------------

        1. Return ONLY valid JSON.
        2. Do NOT include explanations, comments, or text outside JSON.
        3. Do NOT change key names.
        4. If a value is missing, use null instead of guessing.
        5. Do NOT hallucinate or invent any information.

        --------------------------------------------------
        NAME RULES
        --------------------------------------------------

        - Extract full name exactly as written.
        - Do NOT reorder or modify name.
        - Do NOT guess given_name or surname if unclear.

        --------------------------------------------------
        EXPERIENCE RULES (VERY IMPORTANT)
        --------------------------------------------------

        Include ONLY professional work experience:

        ✔ Full-time roles  
        ✔ Part-time roles  
        ✔ Internships  

        DO NOT include:

        ✘ Personal projects  
        ✘ Academic projects  
        ✘ Self-built applications  
        ✘ Freelance projects unless explicitly marked as professional work  

        STRICT VALIDATION:

        - If a company name is NOT clearly mentioned → DO NOT include it in experience.
        - If the entry contains words like "project", "built", "developed", "created" → DO NOT include in experience.
        - If unsure whether it is experience → EXCLUDE it.

        --------------------------------------------------
        DATE RULES (STRICT)
        --------------------------------------------------

        CURRENT DATE: {current_date}

        - Extract dates ONLY if explicitly mentioned in the resume.
        - DO NOT guess or infer missing dates.
        - Convert all dates to format: yyyy-mm

        Examples:
        - "September 2023" → "2023-09"
        - "Jan 2022" → "2022-01"

        - If end date is "Present" or "Current":
        → Keep end_date as "Present" (DO NOT replace)

        - If a date is missing:
        → Use null

        --------------------------------------------------
        SKILL EXTRACTION RULES
        --------------------------------------------------

        - Extract ALL skills mentioned in the resume.
        - Include:
        • Programming languages
        • Frameworks
        • Tools
        • Databases
        • Cloud & DevOps technologies
        • Concepts (e.g., Data Structures, NLP)

        - DO NOT:
        ✘ Merge multiple skills into one
        ✘ Drop skills
        ✘ Convert into sentences

        - Keep skills as clean keywords only.

        --------------------------------------------------
        EDUCATION RULES
        --------------------------------------------------

        - Extract:
        ✔ Degree
        ✔ Specialization (major / field of study)
        ✔ Institution name

        - DO NOT guess missing values.
        - If specialization is not mentioned → return null.

        --------------------------------------------------
        FINAL VALIDATION RULES
        --------------------------------------------------

        Before returning JSON:

        - Ensure experience contains ONLY valid professional roles.
        - Ensure no projects are included in experience.
        - Ensure all dates follow yyyy-mm format.
        - Ensure no guessed or hallucinated values are present.
        - Ensure JSON is valid and properly structured.

        --------------------------------------------------
        RESUME TEXT
        --------------------------------------------------

        {text[:12000]}
    """

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt
    )

    result = response.text

    if not result:
        return {}

    # -------------------------------
    # JSON PARSE
    # -------------------------------
    try:
        data = json.loads(result)
    except:
        match = re.search(r'\{[\s\S]*\}', result)
        if match:
            data = json.loads(match.group())
        else:
            return {}

    # -------------------------------
    # POST PROCESSING (IMPROVED)
    # -------------------------------

    # Merge + deduplicate skills
    all_skills = data.get("skills", []) + detected_skills
    data["skills"] = normalize_skills(list(set(all_skills)))

    # Fix name (Gemini gives surname first sometimes)
    name = data.get("name")
    if name:
        parts = name.split()
        if len(parts) >= 2:
            data["surname"] = parts[0]
            data["given_name"] = " ".join(parts[1:])

    # Experience cleanup
    for exp in data.get("experience", []):
        if not exp.get("start_date"):
            exp["start_date"] = None

        if not exp.get("end_date"):
            exp["end_date"] = "Present"

        exp["skills"] = normalize_skills(exp.get("skills", []))

        exp["duration_months"] = calc_months(
            exp.get("start_date"),
            exp.get("end_date")
        )

    # Enrich missing skills
    data = enrich_experience_skills(data)

    # Final cleanup
    data["skills"] = normalize_skills(data.get("skills", []))

    # -------------------------------
    # SUMMARY
    # -------------------------------
    summary_prompt = f"""
Write a professional 3-line resume summary:

{json.dumps(data)}
"""

    summary_res = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=summary_prompt
    )

    if summary_res.text:
        data["summary"] = summary_res.text.strip()

    return data


# -------------------------------
# RUN
# -------------------------------
if __name__ == "__main__":
    file_path = input("Enter file path: ")
    parsed = resume_ner_gpt(file_path)

    print("\n✅ Parsed Resume:\n")
    print(json.dumps(parsed, indent=2))