import crypto from "crypto";
import fs from "fs/promises";

export const generateSHA256 = async (filePath) => {
  try {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash("sha256").update(fileBuffer).digest("hex");
  } catch (error) {
    throw new Error(`Failed to generate hash: ${error.message}`);
  }
};