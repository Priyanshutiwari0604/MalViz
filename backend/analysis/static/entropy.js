// import fs from "fs";

// export function calculateEntropy(filePath) {
//   const buffer = fs.readFileSync(filePath);
//   const freq = new Array(256).fill(0);

//   for (let byte of buffer) {
//     freq[byte]++;
//   }

//   let entropy = 0;
//   const size = buffer.length;
//   for (let f of freq) {
//     if (f > 0) {
//       const p = f / size;
//       entropy -= p * Math.log2(p);
//     }
//   }
//   return entropy;
// }

// import fs from "fs";

// /**
//  * Calculate Shannon entropy of a file.
//  * @param {string} filePath - Path to file
//  * @returns {Promise<number>} Entropy value (0–8 bits/byte)
//  */
// export async function calculateEntropy(filePath) {
//   return new Promise((resolve, reject) => {
//     const freq = new Array(256).fill(0);
//     let size = 0;

//     const stream = fs.createReadStream(filePath);

//     stream.on("data", (chunk) => {
//       size += chunk.length;
//       for (let byte of chunk) {
//         freq[byte]++;
//       }
//     });

//     stream.on("end", () => {
//       let entropy = 0;
//       for (let f of freq) {
//         if (f > 0) {
//           const p = f / size;
//           entropy -= p * Math.log2(p);
//         }
//       }
//       resolve(entropy);
//     });

//     stream.on("error", (err) => {
//       reject(new Error(`Entropy calculation failed: ${err.message}`));
//     });
//   });
// }


export function calculateEntropy(buffer) {
  const freq = new Array(256).fill(0);
  for (const byte of buffer) freq[byte]++;
  let entropy = 0;
  const len = buffer.length;
  for (const f of freq) {
    if (f === 0) continue;
    const p = f / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}
