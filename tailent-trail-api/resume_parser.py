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
import mock_data

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
    Extract structured resume data and return ONLY valid JSON.

    FORMAT (DO NOT CHANGE KEYS):

    {{
    "personal": {{
        "full_name": "",
        "date_of_birth": null,
        "father_name": null,
        "mother_name": null,
        "gender": null
    }},
    "contact": {{
        "email": "",
        "mobile": "",
        "college_email": null,
        "current_address": "",
        "permanent_address": null
    }},
    "current_education": {{
        "college_name": "",
        "study_year": null,
        "major": "",
        "course": "",
        "join_date": null,
        "roll_no": null,
        "graduating_year": null,
        "skills": [],
        "city": "",
        "state": null,
        "interests": [],
        "cgpa": null
    }},
    "previous_education": {{
        "college": null,
        "major": null,
        "state": null,
        "percentage": null,
        "city": null
    }},
    "experience": [
        {{
        "company": "",
        "role": "",
        "start_date": null,
        "end_date": null,
        "description": ""
        }}
    ],
    "projects": [
        {{
        "name": "",
        "description": "",
        "start_date": null,
        "end_date": null,
        "associated": null,
        "currently_working": false
        }}
    ],
    "certifications": [
        {{
        "name": "",
        "organization": null
        }}
    ]
    }}

    RULES:

    - Return ONLY JSON (no text, no explanation)
    - NEVER omit any key from FORMAT
    - Use:
    - [] for empty arrays
    - null for missing values
    - DO NOT guess missing data

    DATE RULES:
    - Format: yyyy-mm
    - "Present" → keep as "Present"
    - If missing → null

    ADDRESS RULE:
    - current_address = combine city + state + country

    ----------------------------------
    EXTRACTION LOGIC
    ----------------------------------

    1. EXPERIENCE:
    - Include ONLY real jobs, internships
    - MUST have company name
    - Exclude anything that looks like personal work

    2. PROJECTS (CRITICAL):
    - Include personal, academic, or self-built work
    - Detect:
    - "project", "built", "developed", "created"
    - OR descriptions of apps/platforms/tools
    - If something is excluded from experience → move it here
    - Extract tech/tools if possible

    3. EDUCATION:
    - First → current_education
    - Second → previous_education

    4. SKILLS:
    - Extract ALL skills (languages, tools, frameworks, cloud, concepts)
    - Keep as clean keywords

    5. CERTIFICATIONS:
    - Extract only if explicitly mentioned
    - Otherwise return []
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

    ----------------------------------
    FINAL VALIDATION (MANDATORY)
    ----------------------------------

    Before returning JSON:
    - Ensure ALL keys exist
    - Ensure experience contains ONLY jobs
    - Ensure projects contains non-company work
    - Ensure no hallucinated values
    - Ensure valid JSON

    ----------------------------------
    RESUME:
    {text[:12000]}
    """

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt
    )

    result = response.text

    # result = mock_data.resume_data_mock

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

