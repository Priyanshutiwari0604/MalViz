// // routes/intelRoutes.js
// import express from "express";
// import { updateThreatIntel, getThreatIntel } from "../controllers/threatIntelController.js";

// const router = express.Router();

// router.post("/files/:fileId/threat-intel", updateThreatIntel);
// router.get("/files/:fileId/threat-intel", getThreatIntel);

// export default router;


// routes/intelRoutes.js
import express from "express";
import { updateThreatIntel, getThreatIntel, pollVirusTotalResults } from "../controllers/threatIntelController.js";

const router = express.Router();

router.post("/files/:fileId/threat-intel", updateThreatIntel);
router.get("/files/:fileId/threat-intel", getThreatIntel);
router.get("/files/:fileId/threat-intel/poll", pollVirusTotalResults); // Add polling endpoint

export default router;