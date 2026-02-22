from  flask import Flask, request, jsonify
from flask_cors import CORS
import os

from ats_analyzer import analyze_resume

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/", methods=["GET"])
def index():
    return "ATS Fraud Detection API is running. Use POST /analyze (field 'file') or POST /upload (field 'resume' or 'file')."

@app.route("/status", methods=["GET"])
def status():
    return jsonify({"status": "ok", "routes": [str(r) for r in app.url_map.iter_rules()]})

@app.route("/analyze", methods=["POST"])
def analyze():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF allowed"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    result = analyze_resume(file_path)

    return jsonify(result)


# Compatibility endpoint for frontend (accepts "resume" or "file")
@app.route("/upload", methods=["POST"])
def upload():
    # Accept both 'resume' (from frontend) and 'file' (from other clients)
    uploaded = request.files.get("resume") or request.files.get("file")
    if not uploaded:
        return jsonify({"error": "No file uploaded"}), 400

    file = uploaded
    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF allowed"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    result = analyze_resume(file_path)
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)