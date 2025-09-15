// makeIOCFile.js
import fs from "fs";

const testContent = `
This is a harmless test file for malware analysis benchmarking.

Some IOCs inside:
- URL: http://malicious-test-site.com/login
- IP: 123.45.67.89
- Email: attacker@evilmail.com

Random filler text to simulate binary noise:
\x01\x02\x03\x04\x05HELLO-WORLD\x06\x07\x08

End of file.
`;

fs.writeFileSync("ioc_test.txt", testContent, "utf8");
console.log("✅ Test file created: ioc_test.txt");
