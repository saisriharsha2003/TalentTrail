import os
import re
import json
from datetime import datetime
from google import genai
from dotenv import load_dotenv
from pdfminer.high_level import extract_text

# -------------------------------
# LOAD ENV
# -------------------------------
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# -------------------------------
# TEXT EXTRACTION
# -------------------------------
def extract_job_text(file_path):
    return extract_text(file_path)

# -------------------------------
# SKILL NORMALIZATION (REUSE)
# -------------------------------
SKILL_MAP = {
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "react.js": "React",
    "expressjs": "Express.js",
    "express.js": "Express.js",
    "mongodb": "MongoDB",
    "mysql": "MySQL",
    "aws": "AWS",
    "azure": "Azure",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "nlp": "Natural Language Processing",
    "javascript": "JavaScript",
    "html": "HTML",
    "css": "CSS"
}

def normalize_skills(skills):
    cleaned = set()
    for s in skills:
        if not s:
            continue
        s = s.strip().lower()
        cleaned.add(SKILL_MAP.get(s, s.title()))
    return sorted(cleaned)

# -------------------------------
# DATE NORMALIZATION
# -------------------------------
def normalize_date(date_str):
    if not date_str:
        return None

    date_str = date_str.strip()

    if date_str.lower() in ["present", "current"]:
        return "Present"

    if re.match(r"\d{4}-\d{2}", date_str):
        return date_str

    for fmt in ["%B %Y", "%b %Y"]:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m")
        except:
            continue

    return None

# -------------------------------
# MAIN FUNCTION
# -------------------------------
def job_parser(file_path):
    text = extract_job_text(file_path)

    current_date = datetime.today().strftime("%Y-%m")

    # -------------------------------
    # PROMPT
    # -------------------------------
    current_date = datetime.today().strftime("%Y-%m")

    prompt = f"""
        You are an advanced job description parsing system.

        Your task is to extract structured information from a job description and return ONLY valid JSON.

        --------------------------------------------------
        OUTPUT FORMAT (STRICT — DO NOT CHANGE KEYS)
        --------------------------------------------------

        {{
        "job_title": "",
        "company": "",
        "industry": "",
        "company_location": "",
        "number_of_positions": "",
        "start_date": "",
        "end_date": "",
        "bill_rate_per_hour": "",
        "is_remote": "",
        "overall_experience_required_years": "",
        "it_skills": [],
        "software_tools_and_programming_languages": [],
        "organizational_skills": [],
        "soft_skills": [],
        "experience_required_by_skill": {{}},
        "educational_qualifications": [],
        "certifications": [],
        "other_requirements": []
        }}

        --------------------------------------------------
        GLOBAL INSTRUCTIONS
        --------------------------------------------------

        1. Return ONLY valid JSON.
        2. Do NOT include explanations, comments, markdown, or extra text.
        3. Do NOT change any key names.
        4. If a scalar value is missing → return null.
        5. If a list value is missing → return [].
        6. If a dictionary/map value is missing → return {{}}.
        7. Do NOT hallucinate or invent any information.

        --------------------------------------------------
        JOB TITLE RULES
        --------------------------------------------------

        - Extract the exact job title mentioned.
        - Do NOT modify or rephrase.
        - If multiple titles exist, choose the primary role.

        --------------------------------------------------
        COMPANY & INDUSTRY RULES
        --------------------------------------------------

        - Extract company name exactly as written.
        - Extract industry if explicitly mentioned.
        - If company contains:
        "State of", "Department of", "City of", "County"
        → set industry = "Government"

        - If industry not mentioned → return null.

        --------------------------------------------------
        LOCATION RULES
        --------------------------------------------------

        - Extract full company location (city/state/country if available).
        - Do NOT guess missing parts.

        --------------------------------------------------
        POSITIONS RULES
        --------------------------------------------------

        - Extract number_of_positions ONLY if clearly mentioned.
        - Example: "3 openings" → "3"
        - If not mentioned → null.

        --------------------------------------------------
        DATE RULES (STRICT)
        --------------------------------------------------

        CURRENT DATE: {current_date}

        - Extract ONLY explicitly mentioned dates.
        - DO NOT guess or infer.

        - Convert all dates to format: yyyy-mm

        Examples:
        - "March 2025" → "2025-03"
        - "Jan 2024" → "2024-01"

        - If end_date is "Present", "Current", or "Ongoing":
        → keep as "Present"

        - If date is missing:
        → return null

        --------------------------------------------------
        REMOTE / WORK TYPE RULES
        --------------------------------------------------

        - Extract is_remote as:
        ✔ "Yes" → Fully remote
        ✔ "No" → Onsite
        ✔ "Hybrid" → Hybrid work

        - If not mentioned → null

        --------------------------------------------------
        EXPERIENCE RULES
        --------------------------------------------------

        - Extract overall_experience_required_years ONLY if explicitly mentioned.
        - Example:
        "3+ years experience" → "3"
        "Minimum 5 years" → "5"

        - Do NOT guess.

        --------------------------------------------------
        SKILL EXTRACTION RULES (VERY IMPORTANT)
        --------------------------------------------------

        Extract ALL skills mentioned in the job description.

        Include:

        ✔ Programming languages  
        ✔ Frameworks  
        ✔ Libraries  
        ✔ Tools  
        ✔ Databases  
        ✔ Cloud & DevOps technologies  
        ✔ Platforms  
        ✔ Technical concepts  

        DO NOT:

        ✘ Merge multiple skills into one  
        ✘ Convert into sentences  
        ✘ Drop skills  

        Keep skills as clean keywords only.

        --------------------------------------------------
        SKILL CATEGORIZATION RULES
        --------------------------------------------------

        1. it_skills:
        - Core technical/domain skills
        - Example: Python, Java, NLP, Machine Learning

        2. software_tools_and_programming_languages:
        - Tools, IDEs, frameworks, programming languages
        - Example: VS Code, Git, React, Docker

        3. organizational_skills:
        - Work-related functional skills
        - Example: Project Management, Documentation

        4. soft_skills:
        - Behavioral skills
        - Example: Communication, Leadership

        --------------------------------------------------
        EXPERIENCE BY SKILL RULES
        --------------------------------------------------

        - Extract experience_required_by_skill as a dictionary:

        Example:
        {{
        "Python": "3",
        "AWS": "2"
        }}

        - Only include if clearly mentioned.
        - Do NOT guess.

        --------------------------------------------------
        EDUCATION RULES
        --------------------------------------------------

        - Extract educational qualifications exactly.
        - Example:
        "Bachelor’s Degree in Computer Science"

        - If not mentioned → []

        --------------------------------------------------
        CERTIFICATION RULES
        --------------------------------------------------

        - Extract certifications if explicitly mentioned.
        - Example:
        "AWS Certified Developer"

        - If none → []

        --------------------------------------------------
        OTHER REQUIREMENTS RULES
        --------------------------------------------------

        Include:

        ✔ Shift requirements  
        ✔ Visa requirements  
        ✔ Travel requirements  
        ✔ Notice period  
        ✔ Any constraints  

        If none → []

        --------------------------------------------------
        FINAL VALIDATION RULES
        --------------------------------------------------

        Before returning JSON:

        - Ensure no duplicate entries in lists.
        - Ensure all dates follow yyyy-mm format.
        - Ensure no hallucinated values.
        - Ensure clean keyword-based skills.
        - Ensure JSON is valid and properly structured.

        --------------------------------------------------
        JOB DESCRIPTION TEXT
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
    # POST PROCESSING
    # -------------------------------

    # Normalize skills
    data["skills"] = normalize_skills(data.get("skills", []))
    data["tools"] = normalize_skills(data.get("tools", []))

    # Normalize dates
    data["start_date"] = normalize_date(data.get("start_date"))
    data["end_date"] = normalize_date(data.get("end_date"))

    return data

