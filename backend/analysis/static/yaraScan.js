import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

export function runYara(filePath, rulePath = "./rules/") {
  const isDev = process.env.NODE_ENV !== "production";
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return [];
  }

  if (!fs.existsSync(rulePath)) {
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
    }
  }

  let ruleFiles = [];
  if (fs.statSync(rulePath).isDirectory()) {
    ruleFiles = fs
      .readdirSync(rulePath)
      .filter(
        (f) => f.endsWith(".yar") || f.endsWith(".yara") || f.endsWith(".rule")
      )
      .map((f) => path.join(rulePath, f));
  } else {
    ruleFiles = [rulePath];
  }

  if (ruleFiles.length === 0) {
    console.warn(`No YARA rules found in ${rulePath}`);
    return [];
  }

  const yaraExecutables = [
    process.env.YARA_PATH,
    "yara",
    "yara64",
    "yara.exe",
    "yara64.exe",
  ].filter(Boolean);

  let yaraExe = null;
  for (const exe of yaraExecutables) {
    try {
      const testResult = spawnSync(exe, ["--version"], {
        shell: true,
        stdio: "pipe",
        timeout: 3000,
      });
      if (testResult.status === 0) {
        yaraExe = exe;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!yaraExe) {
    console.warn("YARA not installed or not in PATH. Skipping scan.");
    return [];
  }

  try {
    const args = ["-r", ...ruleFiles, `"${filePath}"`];
    const result = spawnSync(yaraExe, args, {
      encoding: "utf8",
      shell: true,
      timeout: 30000,
    });

    if (result.error) throw result.error;
    if (result.stderr) console.error("YARA stderr:", result.stderr.trim());

    const matches = (result.stdout || "")
      .split("\n")
      .map((line) => {
        const match = line.trim().split(/\s+/);
        return match[0];
      })
      .filter(Boolean)
      .filter((rule, index, arr) => arr.indexOf(rule) === index);

    return matches;
  } catch (err) {
    console.error("YARA scan failed:", err.message);
    return [];
  }
}