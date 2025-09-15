import crypto from "crypto";
import { createReadStream } from "fs";

export const generateSHA256 = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");

    let stream;
    try {
      stream = createReadStream(filePath);
    } catch (err) {
      return reject(new Error(`Failed to open file: ${err.message}`));
    }

    stream.on("error", (err) => {
      reject(new Error(`Failed to read file: ${err.message}`));
    });

    stream.on("data", (chunk) => hash.update(chunk));

    stream.on("end", () => {
      try {
        const digest = hash.digest("hex");
        resolve(digest);
      } catch (err) {
        reject(new Error(`Hash finalization failed: ${err.message}`));
      }
    });
  });
};