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
from Test import mock_data

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
You are an expert resume parser.

Your task is to extract structured data from a resume and return ONLY valid JSON.
Do NOT include any explanation, notes, or extra text.

----------------------------------
STRICT OUTPUT FORMAT (DO NOT MODIFY KEYS)
----------------------------------

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
    "github_link": null,
    "live_link": null,
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

----------------------------------
GLOBAL RULES (MANDATORY)
----------------------------------

- Return ONLY valid JSON
- DO NOT omit any key
- Use:
- null → missing values
- [] → empty arrays
- DO NOT guess or infer missing data
- DO NOT hallucinate
- Trim all strings
- Remove duplicate entries (skills, projects, etc.)
- Keep values concise (no long sentences unless description)

----------------------------------
DATE NORMALIZATION RULES
----------------------------------

- Format all dates as: yyyy-mm
- If only year available → yyyy
- If "Present" / "Current" → "Present"
- If unclear → null

----------------------------------
ADDRESS RULES
----------------------------------

- current_address = "city, state, country" (only if available)
- Do NOT invent missing parts
- permanent_address only if explicitly present

----------------------------------
SECTION DETECTION LOGIC
----------------------------------

Identify sections even if headings vary:
- "Work Experience", "Internship", "Employment" → experience
- "Projects", "Personal Work", "Academic Work" → projects
- "Education", "Academics" → education
- "Skills", "Tech Stack" → skills

----------------------------------
EXTRACTION LOGIC
----------------------------------

1. EXPERIENCE:
- Include ONLY:
✔ Jobs
✔ Internships
- MUST contain a company name
- MUST NOT include personal or academic projects
- If unclear → exclude

2. PROJECTS (CRITICAL):
- Include:
✔ Personal projects
✔ Academic projects
✔ Freelance/self-built work
- Detect using keywords:
"project", "built", "developed", "created", "designed"
- If an entry is not a company job → classify as project
- Extract:
- github_link (if present)
- live_link (if present)
- technologies inside description

3. EDUCATION:
- Most recent → current_education
- Older → previous_education
- Extract degree, major, institution, dates if available

4. SKILLS (STRICT EXTRACTION MODE - FINAL)

- PRIMARY SOURCE:
  Extract skills ONLY from:
  ✔ Skills section
  ✔ Tech stack section

- FALLBACK:
  If no skills section exists:
  → Then extract from other sections

----------------------------------
STRICT EXTRACTION RULES
----------------------------------

- Extract skills EXACTLY as written in the resume

DO NOT:
✘ Modify spelling  
✘ Change casing  
✘ Normalize names  
✘ Expand abbreviations  
✘ Merge skills  
✘ Infer missing skills  
✘ Generate new skills  

- Preserve original format:
✔ "React.js" stays "React.js"  
✔ "Node.js" stays "Node.js"  
✔ "C++" stays "C++"  

----------------------------------
SPLITTING RULE
----------------------------------

- If skills appear in grouped format:
  Example: "HTML, CSS, JavaScript"

→ Split into individual entries:
["HTML", "CSS", "JavaScript"]

- DO NOT alter individual skill text

----------------------------------
SOURCE RESTRICTION (VERY IMPORTANT)
----------------------------------

- DO NOT extract skills from:
✘ Project descriptions  
✘ Experience descriptions  

(ONLY use them if no skills section exists)

----------------------------------
DEDUPLICATION RULE
----------------------------------

- Remove ONLY exact duplicates
- "React" and "React.js" are DIFFERENT → keep both if present

----------------------------------
ORDER PRESERVATION
----------------------------------

- Maintain the same order as in the resume

----------------------------------
OUTPUT RULE
----------------------------------

- Output skills as a flat array of strings
- No grouping
- No categorization
- No transformation

----------------------------------

5. CERTIFICATIONS:
- Extract ONLY if clearly mentioned
- Include certification name and organization

----------------------------------
CONFLICT RESOLUTION RULES
----------------------------------

If an item could be both experience and project:

- If company name exists → EXPERIENCE
- Otherwise → PROJECT

----------------------------------
NOISE HANDLING (IMPORTANT)
----------------------------------

- Ignore:
✔ Decorative text
✔ Icons/symbols
✔ Repeated headers
✔ Broken OCR text
- Focus only on meaningful structured data

----------------------------------
FINAL VALIDATION (STRICT)
----------------------------------

Before returning JSON, ensure:

✔ All keys exist  
✔ Valid JSON format  
✔ No extra keys  
✔ No hallucinated data  
✔ experience contains ONLY company roles  
✔ projects contains ONLY non-company work  
✔ skills strictly follow extraction rules  

----------------------------------
RESUME TEXT:
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

