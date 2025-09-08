// import { spawnSync } from "child_process";

// export function runYara(filePath, rulePath = "./rules/") {
//   try {
//     const result = spawnSync("yara", ["-r", rulePath, filePath]);
//     if (result.error) throw result.error;

//     return result.stdout.toString().trim().split("\n").filter(Boolean);
//   } catch (err) {
//     console.error("YARA scan failed:", err);
//     return [];
//   }
// }

// import { spawnSync } from "child_process";
// import fs from "fs";

// export function runYara(filePath, rulePath = "./rules/") {
//   if (!fs.existsSync(filePath)) {
//     console.error("File not found:", filePath);
//     return [];
//   }

//   if (!fs.existsSync(rulePath)) {
//     console.error("YARA rules directory not found:", rulePath);
//     return [];
//   }

//   try {
//     const result = spawnSync("yara", ["-r", rulePath, filePath], { shell: true });

//     if (result.error) throw result.error;
//     if (result.stderr.length) console.error("YARA error:", result.stderr.toString());

//     const output = result.stdout.toString().trim().split("\n").filter(Boolean);
//     return output;
//   } catch (err) {
//     console.error("YARA scan failed:", err);
//     return [];
//   }
// }


// import { spawnSync } from "child_process";
// import fs from "fs";

// export function runYara(filePath, rulePath = "./rules/") {
//   if (!fs.existsSync(filePath) || !fs.existsSync(rulePath)) return [];

//   try {
//     const result = spawnSync("yara64", ["-r", rulePath, filePath], { shell: true });
//     if (result.error) throw result.error;
//     if (result.stderr.length) console.error("YARA error:", result.stderr.toString());

//     return result.stdout.toString().trim().split("\n").filter(Boolean);
//   } catch (err) {
//     console.error("YARA scan failed:", err);
//     return [];
//   }
// }

import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

export function runYara(filePath, rulePath = "./rules/") {
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) console.log(`Starting YARA scan for: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return [];
  }

  // Ensure rules exist
  if (!fs.existsSync(rulePath)) {
    console.log(`📁 Creating rules directory at ${rulePath}`);
    fs.mkdirSync(rulePath, { recursive: true });

    const basicRuleFile = path.join(rulePath, "basic.yar");
    if (!fs.existsSync(basicRuleFile)) {
      const basicRules = `
rule Windows_PE {
    strings: $mz = { 4D 5A }
    condition: $mz at 0
}
`;
      fs.writeFileSync(basicRuleFile, basicRules);
      console.log(`✅ Added basic YARA rule: ${basicRuleFile}`);
    }
  }

  // Collect rule files if directory given
  let ruleFiles = [];
  if (fs.statSync(rulePath).isDirectory()) {
    ruleFiles = fs.readdirSync(rulePath)
      .filter(f => f.endsWith(".yar") || f.endsWith(".yara") || f.endsWith(".rule"))
      .map(f => path.join(rulePath, f));
  } else {
    ruleFiles = [rulePath];
  }

  if (ruleFiles.length === 0) {
    console.warn(`⚠️ No YARA rules found in ${rulePath}`);
    return [];
  }

  // Choose YARA executable
  const yaraExecutables = [
    process.env.YARA_PATH, // ✅ allow override
    "yara", "yara64", "yara.exe", "yara64.exe"
  ].filter(Boolean);

  let yaraExe = null;
  for (const exe of yaraExecutables) {
    try {
      const testResult = spawnSync(exe, ["--version"], { shell: true, stdio: "pipe", timeout: 3000 });
      if (testResult.status === 0) {
        yaraExe = exe;
        if (isDev) console.log(`✅ Found YARA executable: ${exe}`);
        break;
      }
    } catch {
      continue;
    }
  }

  if (!yaraExe) {
    console.warn("⚠️ YARA not installed or not in PATH. Skipping scan.");
    return [];
  }

  // Run scan
  try {
    const args = ["-r", ...ruleFiles, filePath];
    if (isDev) console.log(`🔍 Running: ${yaraExe} ${args.join(" ")}`);

    const result = spawnSync(yaraExe, args, { encoding: "utf8", shell: true, timeout: 30000 });

    if (result.error) throw result.error;
    if (result.stderr) console.error("YARA stderr:", result.stderr.trim());

    const matches = (result.stdout || "")
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

    if (isDev) {
      console.log(matches.length ? `✅ Found ${matches.length} YARA matches` : "ℹ️ No YARA matches");
    }

    return matches;
  } catch (err) {
    console.error("❌ YARA scan failed:", err.message);
    return [];
  }
}
