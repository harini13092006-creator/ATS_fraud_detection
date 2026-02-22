import fitz
from nlp_utils import extract_skills, job_match_score

def analyze_resume(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    hidden_text_hits = 0

    for page in doc:
        blocks = page.get_text("dict")["blocks"]
        for b in blocks:
            if "lines" in b:
                for l in b["lines"]:
                    for s in l["spans"]:
                        text += s["text"] + " "

                        # Hidden white text OR tiny font
                        if s["color"] == 16777215 or s["size"] < 5:
                            hidden_text_hits += 1

    fraud_score = min(hidden_text_hits * 10, 100)

    status = "Clean"
    if fraud_score > 60:
        status = "Fraudulent"
    elif fraud_score > 30:
        status = "Suspicious"

    skills = extract_skills(text)

    # Example job description (can be dynamic later)
    job_description = "python machine learning data science sql nlp flask"
    match = job_match_score(text, job_description)

    # Return fields expected by the frontend
    return {
        "fraud_status": status,
        "fraud_score": fraud_score,
        "hidden_text": hidden_text_hits > 0,
        "skill_match_percent": int(match * 100),
        "skills": skills,
        "summary": generate_summary(status, fraud_score)
    }

def generate_summary(status, score):
    if status == "Fraudulent":
        return "Resume contains hidden or manipulated text intended to bypass ATS."
    if status == "Suspicious":
        return "Resume shows abnormal keyword usage. Manual review recommended."
    return "Resume appears clean with no ATS manipulation detected."