// makeFullTestPE.js
import fs from "fs";

function createTestPE() {
  // Minimal PE header (MZ + PE signatures, fake values)
  const mzHeader = Buffer.from("4D5A90000300000004000000FFFF0000B8000000", "hex"); // MZ header
  const peHeader = Buffer.from("5045000064860100", "hex"); // "PE\0\0" + machine type
  const sectionStub = Buffer.alloc(512, 0x90); // NOP padding like section data

  // Suspicious APIs & IOCs as ASCII text
  const suspiciousContent = `
CreateProcess VirtualAlloc WriteProcessMemory
LoadLibrary GetProcAddress WinExec ShellExecute

http://evil-site.com
https://phishy-login.net
attacker@badmail.com
123.45.67.89
malicious-domain.org
`;

  const fileBuffer = Buffer.concat([
    mzHeader,
    peHeader,
    sectionStub,
    Buffer.from(suspiciousContent, "utf8"),
  ]);

  fs.writeFileSync("test_sample.exe", fileBuffer);
  console.log("✅ Created test PE file: test_sample.exe");
}

createTestPE();
