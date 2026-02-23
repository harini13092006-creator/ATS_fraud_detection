from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from pathlib import Path
from uuid import uuid4
from werkzeug.utils import secure_filename

from ats_analyzer import analyze_resume

app = Flask(__name__)
CORS(app, origins=os.getenv("CORS_ORIGINS", "*").split(","))

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_UPLOAD_MB", "10")) * 1024 * 1024


def _save_upload(uploaded_file):
    safe_name = secure_filename(uploaded_file.filename or "resume.pdf")
    unique_name = f"{uuid4().hex}_{safe_name}"
    file_path = UPLOAD_FOLDER / unique_name
    uploaded_file.save(file_path)
    return str(file_path)

@app.route("/", methods=["GET"])
def index():
    return "ATS Fraud Detection API is running. Use POST /analyze (field 'file') or POST /upload (field 'resume' or 'file')."

@app.route("/status", methods=["GET"])
@app.route("/api/status", methods=["GET"])
def status():
    return jsonify({"status": "ok", "routes": [str(r) for r in app.url_map.iter_rules()]})

@app.route("/analyze", methods=["POST"])
@app.route("/api/analyze", methods=["POST"])
def analyze():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF allowed"}), 400

    file_path = _save_upload(file)

    result = analyze_resume(file_path)

    return jsonify(result)


# Compatibility endpoint for frontend (accepts "resume" or "file")
@app.route("/upload", methods=["POST"])
@app.route("/api/upload", methods=["POST"])
def upload():
    # Accept both 'resume' (from frontend) and 'file' (from other clients)
    uploaded = request.files.get("resume") or request.files.get("file")
    if not uploaded:
        return jsonify({"error": "No file uploaded"}), 400

    file = uploaded
    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF allowed"}), 400

    file_path = _save_upload(file)

    result = analyze_resume(file_path)
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
