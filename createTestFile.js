// createTestFile.js
import fs from "fs";

const testData = `
This is a test file for malware analyzer
Visit http://malicious-test.com for testing
Contact: test@example.com
HelloWorld1234
`;

fs.writeFileSync("test_file.bin", testData, "ascii");
console.log("✅ Test file created: test_file.bin");
