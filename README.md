
# MalViz

**MalViz** is a full-stack malware analysis platform built using the MERN stack. It allows users to upload files, perform static and dynamic analysis, integrate threat intelligence, and generate professional malware reports. The project demonstrates practical skills in cybersecurity, reverse engineering, full-stack development, and threat hunting.

---

## Features

### Phase 1 – MVP (File Upload and Hash Analysis)

* Full-stack setup: React frontend + Express backend.
* File upload system with metadata storage in MongoDB.
* SHA256 hash generation.
* Dashboard displays uploaded files and their hashes.

### Phase 2 – Static Analysis

* Compute Shannon entropy for files.
* Extract readable ASCII strings and detect IPs/domains.
* Run YARA rules for malware patterns.
* Parse Windows PE headers.
* Dashboard displays detailed static analysis per file.

### Phase 3 – Threat Intelligence Integration

* Fetch VirusTotal reports using file hash.
* Pull threat feeds from Abuse.ch.
* Lookup indicators in AlienVault OTX.
* Dashboard displays threat scores and matches.

### Phase 4 – Dynamic Analysis (Optional)

* Integrate with Cuckoo Sandbox or similar sandbox environment.
* Record malware behavior including processes, network activity, and dropped files.
* Dashboard provides a timeline view of dynamic behavior.

### Phase 5 – Reporting

* Automatically generate SOC-style PDF reports using Puppeteer or PDFKit.
* Reports include file metadata, static analysis results, threat intelligence, dynamic sandbox results, and final verdict.
* Downloadable directly from the dashboard.

---

## Folder Structure

```
MalViz/
├── frontend/              
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── public/
├── backend/               
│   ├── routes/
│   │   ├── upload.js
│   │   ├── files.js
│   │   ├── analyze.js
│   │   ├── intel.js
│   │   ├── dynamic.js
│   │   └── report.js
│   ├── models/
│   │   └── fileModel.js
│   ├── analysis/
│   │   ├── static/
│   │   │   ├── entropy.js
│   │   │   ├── strings.js
│   │   │   ├── yaraScan.js
│   │   │   └── peParser.js
│   │   ├── threatIntel/
│   │   │   ├── virusTotal.js
│   │   │   ├── abuseCh.js
│   │   │   └── otx.js
│   │   └── dynamic/
│   │       └── cuckoo.js
│   └── reports/
│       └── reportGenerator.js
└── storage/               
```

---

## Technology Stack

* **Frontend:** React, Clerk, Chakra UI
* **Backend:** Node.js, Express, MongoDB
* **Static Analysis:** Shannon entropy, strings extraction, YARA scanning, PE parsing
* **Threat Intelligence:** VirusTotal API, Abuse.ch, AlienVault OTX
* **Dynamic Analysis:** Cuckoo Sandbox
* **Reporting:** Puppeteer or PDFKit

---

## Project Roadmap

| Phase | Purpose                         | Key Deliverables                   |
| ----- | ------------------------------- | ---------------------------------- |
| 1     | Full-stack basics               | File upload + hash analyzer        |
| 2     | Malware reverse engineering     | Entropy, strings, YARA, PE parsing |
| 3     | Threat intelligence integration | VirusTotal, Abuse.ch, OTX lookups  |
| 4     | Advanced malware analysis       | Sandbox + behavior logging         |
| 5     | Reporting                       | Auto PDF reports                   |



---

## Phase-wise Usage and Workflow Guide

### Phase 1 – MVP

1. Run the backend: `npm run dev`
2. Start frontend: `npm start`
3. Register/login using Clerk.
4. Upload a file via the dashboard.
5. Dashboard displays file metadata and SHA256 hash.

### Phase 2 – Static Analysis

1. Ensure Phase 1 is complete.
2. Click "Analyze" on any uploaded file.
3. Backend runs:

   * Entropy calculation
   * String extraction and IOC detection
   * YARA scanning
   * PE header parsing
4. Results are saved in MongoDB and displayed on the dashboard.

### Phase 3 – Threat Intelligence

1. Upload and analyze a file using Phases 1-2.
2. Click "Threat Intel" for the file.
3. Backend queries:

   * VirusTotal by hash
   * Abuse.ch threat feeds
   * AlienVault OTX indicators
4. Dashboard shows global threat intelligence, threat score, and matches.

### Phase 4 – Dynamic Analysis

1. Setup sandbox environment (Cuckoo or alternative).
2. Submit file for dynamic analysis.
3. Backend polls sandbox for results (process tree, network IOCs, dropped files).
4. Timeline view on dashboard visualizes malware behavior.

### Phase 5 – Reporting

1. Click "Download Report" for any analyzed file.
2. Backend generates a PDF report with:

   * File metadata
   * Static analysis results
   * Threat intelligence results
   * Dynamic analysis (if available)
   * Final verdict (benign/malicious)
3. Download and share SOC-style report.

---

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/Priyanshutiwari0604/MalViz.git
```

2. **Install dependencies**

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Run the project**

```bash
# Backend
npm run dev

# Frontend
cd frontend
npm start
```

---

## Summary

MalViz is a professional malware analysis platform that combines full-stack development with cybersecurity practices. Users can conduct static and dynamic analysis, integrate global threat intelligence, and generate SOC-style reports. The platform is suitable for building a strong resume, demonstrating practical security skills, and creating interview-ready portfolio work.
