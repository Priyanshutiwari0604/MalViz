import fs from "fs";
import path from "path";

/**
 * Generate a minimal but valid PE file for testing
 * This creates a basic .exe file that will trigger all PE parsing sections
 */
export function generateTestPE(outputPath = "./test_sample.exe") {
  // Minimal PE file structure (DOS header + PE header + sections)
  const dosHeader = Buffer.alloc(64);
  
  // DOS header signature "MZ"
  dosHeader.writeUInt16LE(0x5A4D, 0);
  // PE header offset (at byte 60)
  dosHeader.writeUInt32LE(64, 60);

  // PE signature "PE\0\0"
  const peSignature = Buffer.from([0x50, 0x45, 0x00, 0x00]);
  
  // COFF header (20 bytes)
  const coffHeader = Buffer.alloc(20);
  coffHeader.writeUInt16LE(0x014c, 0);    // Machine type (i386)
  coffHeader.writeUInt16LE(2, 2);         // Number of sections
  coffHeader.writeUInt32LE(Math.floor(Date.now()/1000), 4); // Timestamp
  coffHeader.writeUInt32LE(0, 8);         // Pointer to symbol table
  coffHeader.writeUInt32LE(0, 12);        // Number of symbols
  coffHeader.writeUInt16LE(224, 16);      // Size of optional header
  coffHeader.writeUInt16LE(0x102, 18);    // Characteristics

  // Optional header (224 bytes for PE32)
  const optionalHeader = Buffer.alloc(224);
  optionalHeader.writeUInt16LE(0x10b, 0); // Magic (PE32)
  optionalHeader.writeUInt8(1, 2);        // Major linker version
  optionalHeader.writeUInt8(0, 3);        // Minor linker version
  optionalHeader.writeUInt32LE(0x1000, 4); // Size of code
  optionalHeader.writeUInt32LE(0x1000, 8); // Size of initialized data
  optionalHeader.writeUInt32LE(0, 12);    // Size of uninitialized data
  optionalHeader.writeUInt32LE(0x1000, 16); // Entry point address
  optionalHeader.writeUInt32LE(0x1000, 20); // Base of code
  optionalHeader.writeUInt32LE(0x2000, 24); // Base of data
  optionalHeader.writeUInt32LE(0x400000, 28); // Image base
  optionalHeader.writeUInt32LE(0x1000, 32); // Section alignment
  optionalHeader.writeUInt32LE(0x200, 36); // File alignment

  // Section headers (40 bytes each)
  const section1 = Buffer.alloc(40);
  Buffer.from(".text\0\0\0").copy(section1, 0); // Section name
  section1.writeUInt32LE(0x1000, 8);     // Virtual size
  section1.writeUInt32LE(0x1000, 12);    // Virtual address
  section1.writeUInt32LE(0x200, 16);     // Size of raw data
  section1.writeUInt32LE(0x400, 20);     // Pointer to raw data
  section1.writeUInt32LE(0x20, 36);      // Characteristics (executable, readable)

  const section2 = Buffer.alloc(40);
  Buffer.from(".data\0\0\0").copy(section2, 0); // Section name
  section2.writeUInt32LE(0x1000, 8);     // Virtual size
  section2.writeUInt32LE(0x2000, 12);    // Virtual address
  section2.writeUInt32LE(0x200, 16);     // Size of raw data
  section2.writeUInt32LE(0x600, 20);     // Pointer to raw data
  section2.writeUInt32LE(0x40, 36);      // Characteristics (initialized data, readable, writable)

  // Pad to file alignment
  const padding1 = Buffer.alloc(0x400 - 64 - 4 - 20 - 224 - 80);
  
  // Section data (with some entropy)
  const textSection = Buffer.alloc(0x200);
  for (let i = 0; i < 0x200; i++) {
    textSection[i] = Math.floor(Math.random() * 256);
  }
  
  const dataSection = Buffer.alloc(0x200);
  // Add some strings that will be detected
  Buffer.from("kernel32.dll\0").copy(dataSection, 0);
  Buffer.from("user32.dll\0").copy(dataSection, 20);
  Buffer.from("http://malicious.example.com\0").copy(dataSection, 40);
  Buffer.from("192.168.1.100\0").copy(dataSection, 80);
  Buffer.from("test@malware.com\0").copy(dataSection, 100);

  // Combine all parts
  const peFile = Buffer.concat([
    dosHeader,
    peSignature,
    coffHeader,
    optionalHeader,
    section1,
    section2,
    padding1,
    textSection,
    dataSection
  ]);

  fs.writeFileSync(outputPath, peFile);
  console.log(`✅ Test PE file created: ${outputPath} (${peFile.length} bytes)`);
  
  return outputPath;
}

/**
 * Create test files of different types
 */
export function createTestFiles() {
  const testFiles = [];
  
  // 1. Generate PE file
  const peFile = generateTestPE("./test_sample.exe");
  testFiles.push({ path: peFile, type: "PE Executable", description: "Tests PE parsing, strings, entropy" });
  
  // 2. Create a DLL-like file
  const dllPath = "./test_sample.dll";
  const dllContent = fs.readFileSync(peFile);
  fs.writeFileSync(dllPath, dllContent);
  testFiles.push({ path: dllPath, type: "PE DLL", description: "Tests DLL-specific parsing" });
  
  // 3. Create a text file with suspicious strings
  const txtPath = "./suspicious.txt";
  const suspiciousContent = `
This file contains various IOCs for testing:

URLs:
http://malicious.example.com/payload.exe
https://c2server.badsite.net/api/beacon
ftp://evil.domain.org/upload

IP Addresses:
192.168.1.100
10.0.0.1
203.0.113.42

Email addresses:
admin@malware.com
c2@botnet.org

Domain names:
malicious.example.com
evil-site.net
botnet-c2.org

Registry keys:
HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run
HKCU\\Software\\Classes\\exefile\\shell\\open\\command

File paths:
C:\\Windows\\System32\\malware.exe
%TEMP%\\payload.dll
/usr/bin/backdoor

API calls:
CreateRemoteThread
VirtualAllocEx
WriteProcessMemory
SetWindowsHookEx
RegSetValueEx
  `;
  
  fs.writeFileSync(txtPath, suspiciousContent);
  testFiles.push({ path: txtPath, type: "Text File", description: "Tests string extraction and IOC detection" });
  
  // 4. Create a binary file with high entropy
  const binPath = "./high_entropy.bin";
  const entropyBuffer = Buffer.alloc(1024);
  for (let i = 0; i < 1024; i++) {
    entropyBuffer[i] = Math.floor(Math.random() * 256);
  }
  fs.writeFileSync(binPath, entropyBuffer);
  testFiles.push({ path: binPath, type: "High Entropy Binary", description: "Tests entropy calculation" });
  
  // 5. Create a low entropy file
  const lowEntropyPath = "./low_entropy.bin";
  const lowEntropyBuffer = Buffer.alloc(1024, 0x41); // All 'A's
  fs.writeFileSync(lowEntropyPath, lowEntropyBuffer);
  testFiles.push({ path: lowEntropyPath, type: "Low Entropy Binary", description: "Tests entropy calculation (should be low)" });
  
  return testFiles;
}

/**
 * Test your analysis pipeline with detailed logging
 */
export async function testAnalysisPipeline(filePath) {
  console.log(`\n🧪 Testing analysis pipeline for: ${filePath}`);
  console.log("=" .repeat(50));
  
  try {
    // Test 1: File existence and basic info
    const stats = fs.statSync(filePath);
    console.log(`📁 File size: ${stats.size} bytes`);
    console.log(`📅 Modified: ${stats.mtime}`);
    
    // Test 2: Import your modules and test each one
    console.log("\n🔍 Testing individual analysis modules:");
    
    // Test PE Parser
    try {
      const { parsePE } = await import("./analysis/static/peParser.js");
      const peResult = parsePE(filePath);
      console.log("✅ PE Parser:", peResult.error ? `❌ ${peResult.error}` : "✅ Success");
      if (!peResult.error) {
        console.log(`   - Machine: ${peResult.machine}`);
        console.log(`   - Entry Point: ${peResult.entryPoint}`);
        console.log(`   - Sections: ${peResult.sections?.length || 0}`);
      }
    } catch (err) {
      console.log(`❌ PE Parser import failed: ${err.message}`);
    }
    
    // Test String Extraction
    try {
      const { extractStrings } = await import("./analysis/static/strings.js");
      const stringResult = extractStrings(filePath);
      console.log("✅ String Extractor:", stringResult ? "✅ Success" : "❌ Failed");
      if (stringResult) {
        console.log(`   - Strings found: ${stringResult.strings?.length || 0}`);
        console.log(`   - IOCs found: ${stringResult.iocs?.length || 0}`);
      }
    } catch (err) {
      console.log(`❌ String Extractor import failed: ${err.message}`);
    }
    
    // Test Entropy Calculator
    try {
      const { calculateEntropy } = await import("./analysis/static/entropy.js");
      const buffer = fs.readFileSync(filePath);
      const entropy = calculateEntropy(buffer);
      console.log(`✅ Entropy Calculator: ${entropy.toFixed(2)}`);
    } catch (err) {
      console.log(`❌ Entropy Calculator failed: ${err.message}`);
    }
    
    // Test YARA Scanner
    try {
      const { runYara } = await import("./analysis/static/yaraScan.js");
      const yaraResult = runYara(filePath);
      console.log("✅ YARA Scanner:", yaraResult ? `Found ${yaraResult.length} matches` : "No matches");
    } catch (err) {
      console.log(`❌ YARA Scanner failed: ${err.message}`);
    }
    
  } catch (err) {
    console.error(`❌ Pipeline test failed: ${err.message}`);
  }
}

// Auto-run when this file is executed
(async function main() {
  console.log("🧪 Creating test files for MalViz analysis...");
  
  const testFiles = createTestFiles();
  
  console.log("\n📋 Created test files:");
  testFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.path}`);
    console.log(`   Type: ${file.type}`);
    console.log(`   Purpose: ${file.description}\n`);
  });
  
  // Test the first PE file
  if (testFiles.length > 0) {
    await testAnalysisPipeline(testFiles[0].path);
  }
  
  console.log("\n🎯 How to use these files:");
  console.log("1. Upload each file through your web interface");
  console.log("2. Check the analysis results in your database");
  console.log("3. Compare expected vs actual results");
  console.log("4. Use the testAnalysisPipeline() function to debug specific issues");
})();