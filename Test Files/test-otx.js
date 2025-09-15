import dotenv from "dotenv";
dotenv.config();
import OTXAnalyzer from "../backend/analysis/threatIntels/Otx.threat.js";

async function testOTX() {
  const otx = new OTXAnalyzer();
  
  // Test with known indicators
  const testHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // Empty file SHA256
  const testIP = "8.8.8.8"; // Google DNS
  const testDomain = "google.com";
  
  console.log("Testing OTX Analyzer...");
  
  try {
    console.log("\n1. Testing hash analysis:");
    const hashResult = await otx.analyzeHash(testHash);
    console.log("Hash result:", JSON.stringify(hashResult, null, 2));
    
    console.log("\n2. Testing IP analysis:");
    const ipResult = await otx.analyzeIP(testIP);
    console.log("IP result:", JSON.stringify(ipResult, null, 2));
    
    console.log("\n3. Testing domain analysis:");
    const domainResult = await otx.analyzeDomain(testDomain);
    console.log("Domain result:", JSON.stringify(domainResult, null, 2));
    
    console.log("\nAll tests completed successfully!");
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}
// Test with known malicious indicators (find recent examples from OTX pulses)
async function testMaliciousIndicators() {
  const otx = new OTXAnalyzer();
  
  // These should return "found: true" if they're still active threats
  const maliciousIP = "185.183.98.141"; // Example malicious IP
  const maliciousDomain = "example-malicious-domain.com"; // Find a current one
  const maliciousHash = "a908..."; // Find a current malware hash
  
  console.log("Testing with known malicious indicators...");
  
  try {
    const result = await otx.analyzeIP(maliciousIP);
    console.log("Malicious IP result:", result.found ? "THREAT DETECTED" : "CLEAN");
  } catch (error) {
    console.log("Error testing malicious IP:", error.message);
  }
}

testMaliciousIndicators();
testOTX();