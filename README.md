# MalViz Backend

This is the **backend** portion of **MalViz**, a full-stack malware analysis platform.  
It provides APIs to handle file uploads, generate file hashes, and store metadata in a MongoDB database, forming the foundation for malware detection and analysis.

## Features Implemented

- **File Upload Handling**: Supports uploading files for analysis with validation.
- **Hash Generation**: Automatically generates hashes (MD5, SHA-256) for uploaded files.
- **Database Integration**: Stores file metadata and hashes in MongoDB.
- **RESTful API**: Routes ready for connecting with frontend for full-stack functionality.
- **Modular Structure**: Organized controllers, routes, models, and middleware for easy extension.

## Folder Structure
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
