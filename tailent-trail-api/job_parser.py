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
    "salaryRange","requiredSkills","preferredSkills",
    "educationRequired","minimumCGPA",
    "applicationDeadline","responsibilities","requirements",
    "companyWebsite","companyDescription",
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
    return {key: data.get(key, None) for key in ALLOWED_KEYS}


# -------------------------------
# MAIN FUNCTION
# -------------------------------
def parse_job_description(file_path):

    text = extract_job_text(file_path)

    prompt = f"""
        You are a job description parser.

        Extract structured job information from the given job description.

        -----------------------------------
        STRICT RULES (VERY IMPORTANT)
        -----------------------------------

        - Return ONLY valid JSON
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

        → Extract value even if it appears on next line

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

        "requiredSkills": [],
        "preferredSkills": [],

        "educationRequired": [],
        "minimumCGPA": null,

        "applicationDeadline": "",

        "responsibilities": "",
        "requirements": "",

        "companyWebsite": "",
        "companyDescription": "",

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

        - experienceRequired → e.g., "2+", "3-5 years"
        - numberOfOpenings → numeric only

        - salaryRange → keep as text (e.g., "6-10 LPA")

        - requiredSkills → must-have skills only
        - preferredSkills → optional / good-to-have skills

        - educationRequired → degrees (e.g., ["B.Tech", "MCA"])
        - minimumCGPA → numeric only if clearly mentioned

        - applicationDeadline → extract date if clearly mentioned

        - responsibilities → convert all responsibilities into ONE clean paragraph (no list, no bullets)

        - requirements → convert all qualifications/conditions into ONE clean paragraph (no list, no bullets)

        - companyWebsite → extract URL if present
        - companyDescription → short summary if available

        - jobCategory → e.g., Engineering, Marketing
        - department → team or division name

        -----------------------------------
        FINAL VALIDATION
        -----------------------------------

        Before returning:
        - Ensure NO extra fields exist
        - Ensure ALL fields are present
        - Ensure responsibilities and requirements are STRINGS (not arrays)
        - Ensure JSON is valid

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