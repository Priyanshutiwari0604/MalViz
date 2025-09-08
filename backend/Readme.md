# MalViz Backend

This is the **backend** portion of **MalViz**, a full-stack malware analysis platform.  
It provides APIs to handle file uploads, generate file hashes, and store metadata in a MongoDB database, forming the foundation for malware detection and analysis.

## Features Implemented

- **File Upload Handling**: Supports uploading files for analysis with validation.
- **Hash Generation**: Automatically generates hashes (MD5, SHA-256) for uploaded files.
- **Database Integration**: Stores file metadata and hashes in MongoDB.
- **RESTful API**: Routes ready for connecting with frontend for full-stack functionality.
- **Modular Structure**: Organized controllers, routes, models, and middleware for easy extension.

## How Data stored in database for phase 1
<img width="826" height="226" alt="image" src="https://github.com/user-attachments/assets/ac4df26d-2c15-4b9a-8d19-f89d2039bc56" />
<img width="1443" height="952" alt="image" src="https://github.com/user-attachments/assets/0f577944-83c7-47c3-a727-c5b0ae839a3b" />

## How Data stored in database for phase 2 
<img width="1056" height="442" alt="image" src="https://github.com/user-attachments/assets/e914d386-6979-4177-8794-504b59352982" />

## Folder Structure for phase 1
```bash
backend/
├── controllers/
│ └── filecontroller.controllers.js
├── db/
│ └── database.js
├── middleware/
│ └── fileupload.middleware.js
├── models/
│ └── filemodel.model.js
├── routes/
│ └── fileRoutes.js
├── utils/
│ └── hash.js
└── script.js
```
## Folder Structure for phase 2
```bash
backend/
├── analysis/
│   └── static/
│       ├── strings.js
│       ├── entropy.js
│       ├── yara.js
│       └── peparser.js
├── controllers/
│   └── filecontroller.controllers.js
├── db/
│   └── database.js
├── middleware/
│   └── fileupload.middleware.js
├── models/
│   └── filemodel.model.js
├── routes/
│   └── fileRoutes.js
├── utils/
│   └── hash.js
└── script.js

```

### Static Analysis
1. **Hashes**
   - SHA256, MD5, and SHA1 generation for unique file identification.

2. **Entropy Analysis**
   - Shannon entropy is calculated to measure the randomness of file data.
   - High entropy often indicates packed or encrypted malware samples.

3. **Strings Extraction**
   - Extracts readable ASCII and Unicode strings from binaries.
   - Uses regular expressions to detect sequences of printable characters.
   - Handles multiple encodings: ASCII, UTF-8, UTF-16, ISO-8859-1.
   - Minimum length threshold is applied to avoid very short or meaningless strings.

4. **YARA Scanning**
   - YARA rules identify malware patterns in files.
   - Rules consist of:
     - **Strings definition**: text, hex, or regex patterns.
     - **Condition**: Boolean expression to match patterns.
   - YARA is widely used for malware classification, threat hunting, and IOC detection.

5. **PE Parsing**
   - Analyzes Portable Executable (PE) files used in Windows systems (`.exe`, `.dll`).
   - Extracts:
     - DOS and NT headers, optional headers.
     - Section information (`.text`, `.data`, `.rsrc`, `.idata`).
     - Import and export functions.
     - Embedded resources (icons, menus, strings).
     - Relocation information and security features (digital signatures, DEP).
   - Helps identify malicious behavior and extract embedded payloads.

---
## Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/Priyanshutiwari0604/MalViz.git
cd MalViz/backend
```
2.**Install Dependencies**
```bash
npm install
```
3.Set environment variables
*Create a .env file with your MongoDB connection string:*
```bash
MONGO_URI=your_mongodb_connection_string
```
4.Run the server
```bash
npm run dev
```
