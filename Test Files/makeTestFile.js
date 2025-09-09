import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createBenchmarkFile() {
  const filePath = path.join(__dirname, "benchmark_test.dll");

  // Build a fake PE/DLL file with MZ header + suspicious strings
  const bufferParts = [
    // PE Header Magic "MZ"
    Buffer.from([0x4D, 0x5A]),

    // Fake DOS stub (padding)
    Buffer.alloc(58, 0),

    // Fake PE header offset at 0x3C (pointing to 0x80)
    Buffer.from([0x80, 0x00, 0x00, 0x00]),

    // Some suspicious strings to trigger IOC detection
    Buffer.from("http://evil-domain.com\n"),
    Buffer.from("192.168.1.100\n"),
    Buffer.from("cmd.exe && powershell\n"),
    Buffer.from("SuspiciousFunction\n"),
    Buffer.from("DROP TABLE users;\n"),

    // Random binary noise
    Buffer.from([0xde, 0xad, 0xbe, 0xef, 0xca, 0xfe, 0xba, 0xbe]),
  ];

  const fileBuffer = Buffer.concat(bufferParts);
  fs.writeFileSync(filePath, fileBuffer);

  console.log("✅ Benchmark test file created at:", filePath);
}

createBenchmarkFile();
