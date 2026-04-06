import os
import re
import json
from google import genai
from dotenv import load_dotenv
from pdfminer.high_level import extract_text
import json

with open("Test/mock_test_jd.json", "r") as f:
    MOCK_DATA = json.load(f)
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
# STRICT SCHEMA (FINAL)
# -------------------------------
ALLOWED_KEYS = [
    "jobTitle","companyName","jobDescription",
    "location","workType","employmentType",
    "experienceRequired","numberOfOpenings",
    "salaryRange",
    "role","responsibilities","skills",
    "eligibleBatch",
    "jobCategory","department"
]

# -------------------------------
# CLEAN PLACEHOLDER VALUES
# -------------------------------
def clean_placeholders(data):
    for key, value in data.items():
        if isinstance(value, str) and value.strip().lower() == key.lower():
            data[key] = None
    return data


# -------------------------------
# ENFORCE STRICT SCHEMA
# -------------------------------
def enforce_schema(data):
    final = {}

    for key in ALLOWED_KEYS:
        if key == "skills":
            final[key] = data.get(key) or []
        elif key == "numberOfOpenings":
            final[key] = data.get(key) if data.get(key) is not None else None
        else:
            final[key] = data.get(key, None)

    return final


# -------------------------------
# MAIN FUNCTION
# -------------------------------
def parse_job_description(file_path):

    text = extract_job_text(file_path)

    prompt = f"""
        You are a job description parser.

        Your task is to extract structured job information from the given job description.

        -----------------------------------
        🚨 CRITICAL OUTPUT RULES (STRICT)
        -----------------------------------

        - Return ONLY a raw JSON object
        - DO NOT wrap output inside any key (e.g., "job_data", "data", "response")
        - DO NOT include "success" or any metadata
        - DO NOT include explanations
        - DO NOT include markdown (no ```json)
        - DO NOT include text before or after JSON

        If you violate ANY of the above, the output is INVALID.

        -----------------------------------
        GENERAL RULES
        -----------------------------------

        - Use EXACT keys provided below
        - DO NOT add extra fields
        - DO NOT remove any fields
        - DO NOT rename keys
        - DO NOT repeat key names as values
        - Extract REAL values from text only

        If value is missing:
        - string → null
        - array → []
        - number → null

        -----------------------------------
        SPECIAL HANDLING
        -----------------------------------

        The job description may be unstructured.

        Example:
        Job Title:
        Software Engineer

        → Extract value even if it appears on the next line

        -----------------------------------
        OUTPUT FORMAT (STRICT — FOLLOW EXACTLY)
        -----------------------------------

        {{
        "jobTitle": "",
        "companyName": "",
        "jobDescription": "",

        "location": "",
        "workType": "",

        "employmentType": "",
        "experienceRequired": "",
        "numberOfOpenings": null,

        "salaryRange": "",

        "role": "",
        "responsibilities": "",
        "skills": [],

        "eligibleBatch": "",
        
        "jobCategory": "",
        "department": ""
        }}

        -----------------------------------
        FIELD GUIDELINES
        -----------------------------------

        - jobTitle → exact role name
        - companyName → organization name
        - jobDescription → short summary (2–4 lines max)

        - location → city/state/country
        - workType → ONLY "Onsite", "Remote", or "Hybrid" (if not mentioned → null)

        - employmentType → ONLY "Full-time", "Part-time", "Internship", "Contract"
        (infer ONLY if very clear, else null)

        - experienceRequired → e.g., "0-1 years", "2+", "3-5 years"
        - numberOfOpenings → numeric only

        - salaryRange → keep as text (e.g., "6-10 LPA")

        - role → short description of what the candidate will do (1–2 lines)

        - responsibilities → convert all responsibilities into ONE clean paragraph (no bullets, no lists)

        -----------------------------------
        SKILLS EXTRACTION (STRICT)
        -----------------------------------

        - skills → MUST be a JSON array of strings

        STRICT RULES:
        - Each skill must be a separate array item
        - DO NOT return a comma-separated string
        - DO NOT return a single sentence
        - DO NOT include phrases like "the skills", "skills include", etc.
        - DO NOT include explanations

        EXTRACTION RULES:
        - Extract ALL relevant technical and soft skills

        - Split combined phrases:
        "JavaScript, TypeScript, HTML5" →
        ["JavaScript", "TypeScript", "HTML5"]

        - Handle parentheses:
        "React (Hooks, Context, Router)" →
        ["React", "Hooks", "Context", "Router"]

        "Node.js (Express/Fastify)" →
        ["Node.js", "Express", "Fastify"]

        - Normalize:
        - Preserve proper casing from the job description
        - Keep standard industry naming (JavaScript, React, Node.js, HTML5, CSS3)
        - Trim spaces
        - Remove duplicates (case-insensitive)

        - Keep skills concise (1–3 words max)

        VALID EXAMPLE:
        ["JavaScript", "React", "Node.js", "Docker"]

        -----------------------------------
        OTHER FIELDS
        -----------------------------------

        - eligibleBatch → e.g., "2023, 2024", "2025 only" (if not mentioned → null)

        - jobCategory → e.g., Engineering, Marketing, Sales
        - department → team or division name

        -----------------------------------
        FINAL VALIDATION (STRICT)
        -----------------------------------

        Before returning:
        - Ensure NO extra fields exist
        - Ensure ALL fields are present
        - Ensure responsibilities is a STRING (not array)
        - Ensure skills is an ARRAY
        - Ensure JSON is valid
        - Ensure output is NOT wrapped in any object

        -----------------------------------
        JOB DESCRIPTION
        -----------------------------------
        {text[:6000]}
    """

    # response = client.models.generate_content(
    #     model="gemini-3-flash-preview",
    #     contents=prompt
    # )

    # result = response.text

    result = json.dumps(MOCK_DATA)

    if not result:
        return {}

    # -------------------------------
    # SAFE JSON PARSE
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
    # CLEAN + ENFORCE
    # -------------------------------

    data = clean_placeholders(data)
    data = enforce_schema(data)

    return data