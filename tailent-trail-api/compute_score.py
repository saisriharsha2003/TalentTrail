import json
import re
from flask import Flask, request, jsonify
from google import genai
from dotenv import load_dotenv
import os

app = Flask(__name__)

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def calculate_score(resume, job):
    prompt = f"""
You are a senior technical recruiter.

Evaluate how well the candidate matches the job.

----------------------------------
INPUT
----------------------------------

RESUME:
{json.dumps(resume)}

JOB DESCRIPTION:
{json.dumps(job)}

----------------------------------
SCORING CRITERIA (STRICT)
----------------------------------

1. Skills Match (30%)
- Required backend skills (Node.js, Python, APIs, DBs)
- Depth of knowledge

2. Projects Relevance (20%)
- Backend-heavy projects
- Real-world complexity

3. Experience Relevance (15%)
- Backend or related roles
- Practical exposure

4. Education (10%)
- Relevant degree (CSE, IT)
- CGPA quality

5. Certifications (5%)
- Relevant technical certifications

6. Overall Fit (20%)
- Problem-solving
- System understanding
- Alignment with job

----------------------------------
IMPORTANT RULES
----------------------------------

- Be realistic (not generous)
- Do NOT give 90+ unless truly exceptional
- Freshers should typically be 50–75 range
- Penalize missing required skills
- Reward real backend work

----------------------------------
OUTPUT FORMAT (STRICT JSON)
----------------------------------

{{
  "final_score": number (0-100),
  "breakdown": {{
    "skills": number,
    "projects": number,
    "experience": number,
    "education": number,
    "certifications": number,
    "overall_fit": number
  }},
  "strengths": [],
  "weaknesses": [],
  "missing_skills": [],
  "summary": ""
}}

----------------------------------
DO NOT RETURN ANYTHING ELSE
----------------------------------
"""

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt
    )

    res = response.text

    try:
        return json.loads(res)
    except:
        match = re.search(r'\{[\s\S]*\}', res)  
        return json.loads(match.group()) if match else {
            "final_score": 0,
            "error": "AI parsing failed"
        }
