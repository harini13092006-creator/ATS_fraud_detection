import React, { useState, useRef } from "react";

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please choose a PDF resume to analyze");
      return;
    }

    const formData = new FormData();
    // Backend expects field name "file" for /analyze
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const message = errJson?.error || `Server returned ${res.status}`;
        alert(`Upload failed: ${message}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error uploading resume. Ensure backend is running at http://127.0.0.1:5000");
    }
    setLoading(false);
  };

  return (
    <div className="app-root">
      {/* Header */}
      <header className="app-header">
        <div className="container">
          <div className="logo">
            <div className="logo-badge">AI</div>
            <div>
              <h1>ATS Fraud Detection</h1>
              <p>Trusted resume analysis</p>
            </div>
          </div>
          <nav className="nav">
            <a href="#">Home</a>
            <a href="#examples">Examples</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="container">
        <div className="main-grid">
          {/* Upload Card */}
          <section className="card p-6">
            <h2>Upload PDF Resume</h2>
            <p className="upload-hint">Drag & drop or click to browse. We analyze for hidden fraud, falsified skills, and job-fit.</p>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current.click()}
              className="upload-drop"
            >
              <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden>
                <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 44V28a8 8 0 0116 0v16" />
                  <path d="M12 36h40" />
                </g>
              </svg>
              <p className="upload-hint">Drop PDF here or <strong style={{color:'var(--accent-start)'}}>click to browse</strong></p>
              <p className="upload-small">Accepted: .pdf • Max 5MB</p>
              <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                onChange={(e) => handleFile(e.target.files[0])}
                style={{display:'none'}}
              />
            </div>

            {file && (
              <div className="file-info" style={{marginTop:'1rem'}}>
                <div className="meta">
                  <div>{file.name}</div>
                  <div style={{fontSize:'0.85rem', color:'var(--muted)'}}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <button onClick={() => setFile(null)} className="remove-btn">Remove</button>
              </div>
            )}

            <div className="actions">
              <button onClick={handleUpload} disabled={loading} className="btn btn-primary">
                {loading ? "Analyzing..." : "Analyze Resume"}
              </button>
              <button onClick={() => { setFile(null); setResult(null); }} className="btn btn-ghost">Reset</button>
            </div>
          </section>

          {/* Results Card */}
          <aside className="card p-6 results">
            <h3>Analysis Results</h3>

            {!result && (
              <div style={{color:'var(--muted)'}}>No analysis yet. Upload a resume to see results and an actionable summary.</div>
            )}

            {result && (
              <div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:'0.9rem', color:'var(--muted)'}}>Status</div>
                    <div className={`status ${result.fraud_score>60? 'red':'green'}`}>{result.fraud_status}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'0.9rem', color:'var(--muted)'}}>Fraud Score</div>
                    <div style={{fontSize:'1.25rem', fontWeight:700}}>{result.fraud_score}/100</div>
                  </div>
                </div>

                <div className="progress" style={{marginTop:'0.75rem'}}>
                  <span style={{ width: `${Math.min(100, result.fraud_score)}%` }} />
                </div>

                <div style={{marginTop:'0.75rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between', color:'#374151'}}><span>Hidden White Text</span><span>{result.hidden_text ? 'Detected' : 'Not Detected'}</span></div>
                  <div style={{display:'flex',justifyContent:'space-between', color:'#374151'}}><span>Job Match</span><span>{result.skill_match_percent}%</span></div>
                  <div style={{marginTop:'0.5rem'}}>
                    <div style={{fontWeight:600}}>Top Skills</div>
                    <div style={{color:'#4b5563'}}>{(result.skills || []).slice(0,5).join(', ') || '—'}</div>
                  </div>
                </div>

                <div style={{marginTop:'0.75rem'}}>
                  <h4 style={{fontWeight:600}}>Actionable Tips</h4>
                  <ul style={{margin:'0.5rem 0 0 1rem', color:'#4b5563'}}>
                    <li>Verify inconsistent dates and employers.</li>
                    <li>Check for repeated or generic skill claims.</li>
                    <li>Request source projects for high-risk candidates.</li>
                  </ul>
                </div>

                {/* badge row */}
                <div style={{display:'flex', gap:'0.5rem', marginTop:'1rem', flexWrap:'wrap'}}>
                  <div style={{padding:'0.4rem 0.6rem', background:'linear-gradient(90deg,var(--accent-start),var(--accent-end))', color:'#fff', borderRadius:8, fontWeight:700, fontSize:'0.85rem'}}>Quick Check</div>
                  <div style={{padding:'0.4rem 0.6rem', background:'#f3f4f6', borderRadius:8, color:'var(--muted)', fontSize:'0.85rem'}}>Manual Review Recommended</div>
                </div>
              </div>
            )}

          </aside>

          {/* Full-width examples / info */}
          <section id="examples" style={{gridColumn:'1 / -1'}} className="card p-6">
            <h4>Why this helps</h4>
            <p style={{color:'var(--muted)'}}>Our automated checks look for hidden white text, copied job descriptions, inflated skill claims, and other heuristics that often indicate ATS fraud. Use the report to prioritize manual review efficiently.</p>
          </section>
        </div>
      </main>

      <footer id="contact" className="footer">
        <div className="container">
          <p>Built with ❤️ • <a href="#">Docs</a> • <a href="#">Privacy</a></p>
        </div>
      </footer>
    </div>
  );
}